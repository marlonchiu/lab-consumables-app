// 测试新功能
import { createClient } from '@supabase/supabase-js'
import CryptoJS from 'crypto-js'

const supabaseUrl = 'https://mbbekqqqcizrpsjdzmhf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYmVrcXFxY2l6cnBzamR6bWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTgyMTksImV4cCI6MjA3MjI5NDIxOX0.bTWYXzAhaQCClQS7mc93Gwx9_OmN-KfuXiR4PpeyBmo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// 测试数据库连接
async function testDatabaseConnection() {
  console.log('🔗 测试数据库连接...')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) throw error

    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    return false
  }
}

// 测试获取试剂列表
async function testGetReagents() {
  console.log('\n🧪 测试获取试剂列表...')
  
  try {
    const { data, error } = await supabase
      .from('reagents')
      .select('id, name, cas_number, category')
      .eq('is_active', true)
      .limit(5)

    if (error) throw error

    console.log('✅ 获取试剂列表成功')
    console.log(`📊 找到 ${data.length} 种试剂:`)
    data.forEach(reagent => {
      console.log(`   - ${reagent.name} (${reagent.cas_number}) [${reagent.category}]`)
    })
    
    return data
  } catch (error) {
    console.error('❌ 获取试剂列表失败:', error.message)
    return []
  }
}

// 测试获取库存列表
async function testGetInventory() {
  console.log('\n📦 测试获取库存列表...')
  
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        reagent:reagents(id, name, cas_number),
        laboratory:laboratories(id, name)
      `)
      .limit(5)

    if (error) throw error

    console.log('✅ 获取库存列表成功')
    console.log(`📊 找到 ${data.length} 条库存记录:`)
    data.forEach(item => {
      console.log(`   - ${item.reagent?.name}: ${item.quantity}${item.unit} (${item.location})`)
    })
    
    return data
  } catch (error) {
    console.error('❌ 获取库存列表失败:', error.message)
    return []
  }
}

// 测试获取采购申请列表
async function testGetPurchaseRequests() {
  console.log('\n📋 测试获取采购申请列表...')
  
  try {
    const { data, error } = await supabase
      .from('purchase_requests')
      .select(`
        *,
        reagent:reagents(id, name),
        applicant:users!purchase_requests_applicant_id_fkey(id, name, role)
      `)
      .limit(5)

    if (error) throw error

    console.log('✅ 获取采购申请列表成功')
    console.log(`📊 找到 ${data.length} 条申请记录:`)
    data.forEach(request => {
      console.log(`   - ${request.reagent?.name}: ${request.quantity}${request.unit} (${request.status}) - ${request.applicant?.name}`)
    })
    
    return data
  } catch (error) {
    console.error('❌ 获取采购申请列表失败:', error.message)
    return []
  }
}

// 测试用户权限
async function testUserPermissions() {
  console.log('\n👥 测试用户权限...')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username, name, role, laboratory_id')
      .in('username', ['admin', 'teacher', 'student'])

    if (error) throw error

    console.log('✅ 获取用户信息成功')
    console.log('📊 用户权限信息:')
    data.forEach(user => {
      const permissions = []
      if (user.role === 'admin') {
        permissions.push('系统管理', '审批申请', '库存管理')
      } else if (user.role === 'teacher') {
        permissions.push('审批申请', '库存管理')
      } else {
        permissions.push('提交申请', '查看库存')
      }
      
      console.log(`   - ${user.name} (${user.username}): ${user.role} - ${permissions.join(', ')}`)
    })
    
    return data
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error.message)
    return []
  }
}

// 测试数据统计
async function testDataStatistics() {
  console.log('\n📈 测试数据统计...')
  
  try {
    const [
      { count: userCount },
      { count: reagentCount },
      { count: inventoryCount },
      { count: requestCount }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('reagents').select('*', { count: 'exact', head: true }),
      supabase.from('inventory').select('*', { count: 'exact', head: true }),
      supabase.from('purchase_requests').select('*', { count: 'exact', head: true })
    ])

    console.log('✅ 数据统计成功')
    console.log('📊 系统数据统计:')
    console.log(`   - 用户数量: ${userCount}`)
    console.log(`   - 试剂种类: ${reagentCount}`)
    console.log(`   - 库存记录: ${inventoryCount}`)
    console.log(`   - 采购申请: ${requestCount}`)
    
    return { userCount, reagentCount, inventoryCount, requestCount }
  } catch (error) {
    console.error('❌ 数据统计失败:', error.message)
    return null
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试新功能...')
  console.log('=' .repeat(60))
  
  const results = {
    connection: false,
    reagents: [],
    inventory: [],
    requests: [],
    users: [],
    statistics: null
  }
  
  // 测试数据库连接
  results.connection = await testDatabaseConnection()
  
  if (!results.connection) {
    console.log('\n❌ 数据库连接失败，停止测试')
    return results
  }
  
  // 测试各项功能
  results.reagents = await testGetReagents()
  results.inventory = await testGetInventory()
  results.requests = await testGetPurchaseRequests()
  results.users = await testUserPermissions()
  results.statistics = await testDataStatistics()
  
  // 显示测试总结
  console.log('\n📋 测试总结:')
  console.log('=' .repeat(50))
  
  const testResults = [
    { name: '数据库连接', status: results.connection },
    { name: '试剂列表', status: results.reagents.length > 0 },
    { name: '库存列表', status: results.inventory.length > 0 },
    { name: '采购申请', status: results.requests.length > 0 },
    { name: '用户权限', status: results.users.length > 0 },
    { name: '数据统计', status: results.statistics !== null }
  ]
  
  testResults.forEach(test => {
    const status = test.status ? '✅' : '❌'
    console.log(`${status} ${test.name}`)
  })
  
  const successCount = testResults.filter(t => t.status).length
  console.log(`\n总计: ${successCount}/${testResults.length} 项测试通过`)
  
  if (successCount === testResults.length) {
    console.log('\n🎉 所有功能测试通过！系统可以正常使用')
    console.log('💡 现在可以启动前端应用进行完整测试')
  } else {
    console.log('\n⚠️  部分功能存在问题，需要进一步调试')
  }
  
  return results
}

// 运行测试
runTests().catch(console.error)
