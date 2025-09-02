// 修复用户的实验室关联
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mbbekqqqcizrpsjdzmhf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYmVrcXFxY2l6cnBzamR6bWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTgyMTksImV4cCI6MjA3MjI5NDIxOX0.bTWYXzAhaQCClQS7mc93Gwx9_OmN-KfuXiR4PpeyBmo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function fixUserLaboratory() {
  console.log('🔧 开始修复用户实验室关联...')
  console.log('=' .repeat(50))
  
  try {
    // 1. 获取所有实验室
    const { data: laboratories, error: labError } = await supabase
      .from('laboratories')
      .select('id, name')
      .eq('is_active', true)

    if (labError) throw labError

    console.log(`📋 找到 ${laboratories.length} 个实验室:`)
    laboratories.forEach(lab => {
      console.log(`   - ${lab.name} (${lab.id})`)
    })

    // 2. 获取没有实验室关联的用户
    const { data: usersWithoutLab, error: userError } = await supabase
      .from('users')
      .select('id, username, name, role, laboratory_id')
      .is('laboratory_id', null)

    if (userError) throw userError

    console.log(`\n👥 找到 ${usersWithoutLab.length} 个没有实验室关联的用户:`)
    usersWithoutLab.forEach(user => {
      console.log(`   - ${user.name} (${user.username}) - ${user.role}`)
    })

    if (usersWithoutLab.length === 0) {
      console.log('\n✅ 所有用户都已有实验室关联')
      return
    }

    // 3. 为用户分配实验室
    const defaultLab = laboratories[0] // 使用第一个实验室作为默认实验室

    console.log(`\n🏢 将用户分配到默认实验室: ${defaultLab.name}`)

    for (const user of usersWithoutLab) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ laboratory_id: defaultLab.id })
        .eq('id', user.id)

      if (updateError) {
        console.error(`❌ 更新用户 ${user.username} 失败:`, updateError.message)
      } else {
        console.log(`✅ 更新用户 ${user.username} 成功`)
      }
    }

    // 4. 验证修复结果
    const { data: updatedUsers, error: verifyError } = await supabase
      .from('users')
      .select(`
        id, username, name, role, laboratory_id,
        laboratory:laboratories(id, name)
      `)
      .in('username', ['admin', 'teacher', 'student'])

    if (verifyError) throw verifyError

    console.log('\n📊 修复后的用户信息:')
    updatedUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.username}): ${user.laboratory?.name || '无实验室'}`)
    })

    console.log('\n🎉 用户实验室关联修复完成！')

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message)
  }
}

// 运行修复
fixUserLaboratory().catch(console.error)
