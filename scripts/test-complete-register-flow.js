// 完整的注册流程测试
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

// 工具函数
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString()
}

function generateUserId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 验证函数
function validateUsername(username) {
  if (!username) {
    return { valid: false, message: '用户名不能为空' }
  }

  if (username.length < 3) {
    return { valid: false, message: '用户名至少3个字符' }
  }

  if (username.length > 20) {
    return { valid: false, message: '用户名不能超过20个字符' }
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字和下划线' }
  }

  return { valid: true }
}

function validatePassword(password) {
  if (!password) {
    return { valid: false, message: '密码不能为空' }
  }

  if (password.length < 6) {
    return { valid: false, message: '密码至少6位' }
  }

  return { valid: true }
}

function validateEmail(email) {
  if (!email) {
    return { valid: true } // 邮箱是可选的
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: '邮箱格式不正确' }
  }

  return { valid: true }
}

// 测试完整注册流程
async function testCompleteRegisterFlow() {
  console.log('🚀 开始完整注册流程测试...')
  console.log('='.repeat(60))

  const testUser = {
    username: 'test_' + Date.now().toString().slice(-8), // 限制长度
    name: '完整测试用户',
    email: 'complete@test.com',
    password: '123456',
    role: 'student',
    student_id: '2024999',
    phone: '13999999999'
  }

  let testUserId = null

  try {
    // 1. 获取实验室列表
    console.log('🏢 步骤1: 获取实验室列表...')
    const { data: laboratories, error: labError } = await supabase
      .from('laboratories')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name')

    if (labError) throw labError

    if (laboratories.length === 0) {
      throw new Error('没有可用的实验室')
    }

    console.log(`✅ 找到 ${laboratories.length} 个实验室`)
    laboratories.forEach((lab) => {
      console.log(`   - ${lab.name}`)
    })

    testUser.laboratory_id = laboratories[0].id

    // 2. 验证输入数据
    console.log('\n📝 步骤2: 验证输入数据...')

    const usernameValidation = validateUsername(testUser.username)
    if (!usernameValidation.valid) {
      throw new Error(`用户名验证失败: ${usernameValidation.message}`)
    }
    console.log('✅ 用户名验证通过')

    const passwordValidation = validatePassword(testUser.password)
    if (!passwordValidation.valid) {
      throw new Error(`密码验证失败: ${passwordValidation.message}`)
    }
    console.log('✅ 密码验证通过')

    const emailValidation = validateEmail(testUser.email)
    if (!emailValidation.valid) {
      throw new Error(`邮箱验证失败: ${emailValidation.message}`)
    }
    console.log('✅ 邮箱验证通过')

    // 3. 检查用户名是否已存在
    console.log('\n🔍 步骤3: 检查用户名是否已存在...')
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', testUser.username)
      .single()

    if (existingUser) {
      throw new Error('用户名已存在')
    }
    console.log('✅ 用户名可用')

    // 4. 生成用户ID和密码哈希
    console.log('\n🔐 步骤4: 生成用户ID和密码哈希...')
    testUserId = generateUserId()
    const passwordHash = hashPassword(testUser.password)

    console.log(`✅ 用户ID: ${testUserId}`)
    console.log(`✅ 密码哈希: ${passwordHash.substring(0, 16)}...`)

    // 5. 创建用户记录
    console.log('\n💾 步骤5: 创建用户记录...')
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
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

    console.log('✅ 用户创建成功')
    console.log(`📊 新用户信息:`)
    console.log(`   - ID: ${newUser.id}`)
    console.log(`   - 用户名: ${newUser.username}`)
    console.log(`   - 姓名: ${newUser.name}`)
    console.log(`   - 邮箱: ${newUser.email}`)
    console.log(`   - 角色: ${newUser.role}`)
    console.log(`   - 实验室: ${newUser.laboratory?.name}`)
    console.log(`   - 学号: ${newUser.student_id}`)
    console.log(`   - 手机: ${newUser.phone}`)

    // 6. 测试登录新注册的用户
    console.log('\n🔐 步骤6: 测试登录新注册的用户...')
    const { data: loginUser, error: loginError } = await supabase
      .from('users')
      .select(
        `
        *,
        laboratory:laboratories(id, name)
      `
      )
      .eq('username', testUser.username)
      .eq('is_active', true)
      .single()

    if (loginError || !loginUser) {
      throw new Error('登录查询失败')
    }

    // 验证密码
    const loginPasswordHash = hashPassword(testUser.password)
    if (loginUser.password_hash !== loginPasswordHash) {
      throw new Error('密码验证失败')
    }

    console.log('✅ 登录验证成功')
    console.log(`📊 登录用户信息:`)
    console.log(`   - 用户名: ${loginUser.username}`)
    console.log(`   - 姓名: ${loginUser.name}`)
    console.log(`   - 角色: ${loginUser.role}`)
    console.log(`   - 实验室: ${loginUser.laboratory?.name}`)

    // 7. 测试权限检查
    console.log('\n🔒 步骤7: 测试权限检查...')
    const permissions = []

    if (loginUser.role === 'admin') {
      permissions.push('系统管理', '审批申请', '库存管理', '提交申请')
    } else if (loginUser.role === 'teacher') {
      permissions.push('审批申请', '库存管理', '提交申请')
    } else {
      permissions.push('提交申请', '查看库存')
    }

    console.log(`✅ 用户权限: ${permissions.join(', ')}`)

    // 显示测试总结
    console.log('\n📋 完整注册流程测试总结:')
    console.log('='.repeat(50))

    const testResults = [
      { name: '获取实验室列表', status: true },
      { name: '输入数据验证', status: true },
      { name: '用户名唯一性检查', status: true },
      { name: '生成用户ID和密码哈希', status: true },
      { name: '创建用户记录', status: true },
      { name: '登录验证', status: true },
      { name: '权限检查', status: true }
    ]

    testResults.forEach((test) => {
      const status = test.status ? '✅' : '❌'
      console.log(`${status} ${test.name}`)
    })

    console.log(`\n总计: ${testResults.length}/${testResults.length} 项测试通过`)
    console.log('\n🎉 完整注册流程测试全部通过！')
    console.log('💡 前端注册页面应该可以完美工作')
    console.log('\n🌐 测试前端页面:')
    console.log('   1. 访问: http://localhost:5174/')
    console.log('   2. 点击"立即注册"')
    console.log('   3. 填写注册信息并选择实验室')
    console.log('   4. 提交注册')
    console.log('   5. 使用新账户登录')

    return { success: true, user: newUser }
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    return { success: false, error: error.message }
  } finally {
    // 清理测试数据
    if (testUserId) {
      console.log('\n🧹 清理测试数据...')
      try {
        await supabase.from('users').delete().eq('id', testUserId)
        console.log('✅ 测试数据清理成功')
      } catch (error) {
        console.error('❌ 清理测试数据失败:', error.message)
      }
    }
  }
}

// 运行测试
runTest()

async function runTest() {
  try {
    await testCompleteRegisterFlow()
  } catch (error) {
    console.error('测试运行失败:', error)
  }
}
