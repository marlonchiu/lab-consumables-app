// 测试注册功能
import { createClient } from '@supabase/supabase-js'
import CryptoJS from 'crypto-js'

const supabaseUrl = 'https://mbbekqqqcizrpsjdzmhf.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYmVrcXFxY2l6cnBzamR6bWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTgyMTksImV4cCI6MjA3MjI5NDIxOX0.bTWYXzAhaQCClQS7mc93Gwx9_OmN-KfuXiR4PpeyBmo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// 密码哈希函数
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString()
}

// 生成用户ID (UUID格式)
function generateUserId() {
  // 生成UUID v4格式
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 测试获取实验室列表
async function testGetLaboratories() {
  console.log('🏢 测试获取实验室列表...')

  try {
    const { data, error } = await supabase
      .from('laboratories')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    console.log('✅ 获取实验室列表成功')
    console.log(`📊 找到 ${data.length} 个实验室:`)
    data.forEach((lab) => {
      console.log(`   - ${lab.name}: ${lab.description || '无描述'}`)
    })

    return data
  } catch (error) {
    console.error('❌ 获取实验室列表失败:', error.message)
    return []
  }
}

// 测试注册新用户
async function testRegisterUser() {
  console.log('\n👤 测试注册新用户...')

  // 先获取实验室列表
  const laboratories = await testGetLaboratories()
  if (laboratories.length === 0) {
    console.error('❌ 无法获取实验室列表，停止注册测试')
    return false
  }

  const testUser = {
    username: 'test_user_' + Date.now(),
    name: '测试用户',
    email: 'test@example.com',
    password: '123456',
    role: 'student',
    laboratory_id: laboratories[0].id, // 选择第一个实验室
    student_id: '2024001',
    phone: '13800138000'
  }

  try {
    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', testUser.username)
      .single()

    if (existingUser) {
      console.log('⚠️  用户名已存在，跳过注册测试')
      return true
    }

    // 生成用户ID和密码哈希
    const userId = generateUserId()
    const passwordHash = hashPassword(testUser.password)

    console.log(`📝 注册用户信息:`)
    console.log(`   - 用户名: ${testUser.username}`)
    console.log(`   - 姓名: ${testUser.name}`)
    console.log(`   - 邮箱: ${testUser.email}`)
    console.log(`   - 角色: ${testUser.role}`)
    console.log(`   - 实验室: ${laboratories[0].name}`)
    console.log(`   - 学号: ${testUser.student_id}`)

    // 创建用户记录
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        username: testUser.username,
        password_hash: passwordHash,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        laboratory_id: testUser.laboratory_id,
        student_id: testUser.student_id,
        phone: testUser.phone,
        is_active: true
      })
      .select(
        `
        *,
        laboratory:laboratories(id, name)
      `
      )
      .single()

    if (userError) throw userError

    console.log('✅ 用户注册成功')
    console.log(`📊 新用户信息:`)
    console.log(`   - ID: ${newUser.id}`)
    console.log(`   - 用户名: ${newUser.username}`)
    console.log(`   - 姓名: ${newUser.name}`)
    console.log(`   - 角色: ${newUser.role}`)
    console.log(`   - 实验室: ${newUser.laboratory?.name}`)

    return { success: true, user: newUser }
  } catch (error) {
    console.error('❌ 用户注册失败:', error.message)
    return { success: false, error: error.message }
  }
}

// 测试登录新注册的用户
async function testLoginNewUser(username, password) {
  console.log('\n🔐 测试登录新注册的用户...')

  try {
    // 查询用户
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(
        `
        *,
        laboratory:laboratories(id, name)
      `
      )
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      throw new Error('用户名或密码错误')
    }

    // 验证密码
    const passwordHash = hashPassword(password)
    if (userData.password_hash !== passwordHash) {
      throw new Error('用户名或密码错误')
    }

    console.log('✅ 登录成功')
    console.log(`📊 登录用户信息:`)
    console.log(`   - 用户名: ${userData.username}`)
    console.log(`   - 姓名: ${userData.name}`)
    console.log(`   - 角色: ${userData.role}`)
    console.log(`   - 实验室: ${userData.laboratory?.name}`)

    return { success: true, user: userData }
  } catch (error) {
    console.error('❌ 登录失败:', error.message)
    return { success: false, error: error.message }
  }
}

// 清理测试数据
async function cleanupTestData(username) {
  console.log('\n🧹 清理测试数据...')

  try {
    const { error } = await supabase.from('users').delete().eq('username', username)

    if (error) throw error

    console.log('✅ 测试数据清理成功')
    return true
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error.message)
    return false
  }
}

// 主测试函数
async function runRegisterTests() {
  console.log('🚀 开始测试注册功能...')
  console.log('='.repeat(60))

  let testUsername = null

  try {
    // 1. 测试获取实验室列表
    const laboratories = await testGetLaboratories()
    if (laboratories.length === 0) {
      console.log('\n❌ 无法获取实验室列表，测试终止')
      return
    }

    // 2. 测试用户注册
    const registerResult = await testRegisterUser()
    if (!registerResult.success) {
      console.log('\n❌ 用户注册失败，测试终止')
      return
    }

    testUsername = registerResult.user.username

    // 3. 测试登录新注册的用户
    const loginResult = await testLoginNewUser(testUsername, '123456')
    if (!loginResult.success) {
      console.log('\n❌ 登录测试失败')
    }

    // 显示测试总结
    console.log('\n📋 注册功能测试总结:')
    console.log('='.repeat(50))

    const testResults = [
      { name: '获取实验室列表', status: laboratories.length > 0 },
      { name: '用户注册', status: registerResult.success },
      { name: '用户登录', status: loginResult.success }
    ]

    testResults.forEach((test) => {
      const status = test.status ? '✅' : '❌'
      console.log(`${status} ${test.name}`)
    })

    const successCount = testResults.filter((t) => t.status).length
    console.log(`\n总计: ${successCount}/${testResults.length} 项测试通过`)

    if (successCount === testResults.length) {
      console.log('\n🎉 注册功能测试全部通过！')
      console.log('💡 前端注册页面应该可以正常工作')
    } else {
      console.log('\n⚠️  部分测试失败，需要检查相关功能')
    }
  } finally {
    // 清理测试数据
    if (testUsername) {
      await cleanupTestData(testUsername)
    }
  }
}

// 运行测试
runRegisterTests().catch(console.error)
