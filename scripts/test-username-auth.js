// 测试用户名+密码认证系统
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

// 密码加密函数（与前端保持一致）
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString()
  // return CryptoJS.SHA256(password + 'lab_reagent_salt').toString()
}

// 生成用户ID
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 测试用户数据
const testUsers = [
  {
    username: 'admin',
    password: '123456',
    email: 'admin@lab.com',
    name: '系统管理员',
    role: 'admin'
  },
  {
    username: 'teacher',
    password: '123456',
    email: 'teacher@lab.com',
    name: '张教授',
    role: 'teacher'
  },
  {
    username: 'student',
    password: '123456',
    email: 'student@lab.com',
    name: '张同学',
    role: 'student'
  }
]

// 测试注册功能
async function testRegister(userData) {
  console.log(`\n📝 测试注册用户: ${userData.username}`)

  try {
    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', userData.username)
      .single()

    if (existingUser) {
      console.log('⚠️  用户已存在，跳过注册')
      return { success: true, exists: true }
    }

    // 生成用户ID和密码哈希
    const userId = generateUserId()
    const passwordHash = hashPassword(userData.password)

    // 创建用户记录
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        username: userData.username,
        password_hash: passwordHash,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        is_active: true
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ 注册失败:', userError.message)
      return { success: false, error: userError.message }
    }

    console.log('✅ 注册成功:', newUser.username)
    return { success: true, user: newUser }
  } catch (error) {
    console.error('💥 注册过程中发生错误:', error.message)
    return { success: false, error: error.message }
  }
}

// 测试登录功能
async function testLogin(username, password) {
  console.log(`\n🔐 测试登录用户: ${username}`)

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
      console.error('❌ 用户不存在或已禁用')
      return { success: false, error: '用户名或密码错误' }
    }

    // 验证密码
    const passwordHash = hashPassword(password)
    if (userData.password_hash !== passwordHash) {
      console.error('❌ 密码错误')
      return { success: false, error: '用户名或密码错误' }
    }

    console.log('✅ 登录成功:', userData.name, `(${userData.role})`)
    return { success: true, user: userData }
  } catch (error) {
    console.error('💥 登录过程中发生错误:', error.message)
    return { success: false, error: error.message }
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始测试用户名+密码认证系统...')
  console.log('='.repeat(60))

  const results = []

  // 测试注册
  console.log('\n📋 测试注册功能:')
  for (const userData of testUsers) {
    const registerResult = await testRegister(userData)
    results.push({
      username: userData.username,
      register: registerResult.success,
      registerError: registerResult.error
    })

    // 等待一下避免请求过快
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // 测试登录
  console.log('\n📋 测试登录功能:')
  for (const userData of testUsers) {
    const loginResult = await testLogin(userData.username, userData.password)
    const userIndex = results.findIndex((r) => r.username === userData.username)
    if (userIndex >= 0) {
      results[userIndex].login = loginResult.success
      results[userIndex].loginError = loginResult.error
    }

    // 等待一下避免请求过快
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // 显示测试结果
  console.log('\n📊 测试结果汇总:')
  console.log('='.repeat(50))

  results.forEach((result) => {
    const registerStatus = result.register ? '✅' : '❌'
    const loginStatus = result.login ? '✅' : '❌'
    console.log(`${result.username}: 注册${registerStatus} 登录${loginStatus}`)

    if (!result.register && result.registerError) {
      console.log(`   注册错误: ${result.registerError}`)
    }
    if (!result.login && result.loginError) {
      console.log(`   登录错误: ${result.loginError}`)
    }
  })

  const successCount = results.filter((r) => r.register && r.login).length
  console.log(`\n总计: ${successCount}/${results.length} 个账户可以正常使用`)

  if (successCount === results.length) {
    console.log('\n🎉 用户名+密码认证系统工作正常！')
    console.log('💡 前端应用现在可以使用新的认证方式')
  } else {
    console.log('\n⚠️  部分功能存在问题，需要进一步调试')
  }
}

// 运行测试
runTests().catch(console.error)
