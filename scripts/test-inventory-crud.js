// 测试库存CRUD功能
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mbbekqqqcizrpsjdzmhf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYmVrcXFxY2l6cnBzamR6bWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTgyMTksImV4cCI6MjA3MjI5NDIxOX0.bTWYXzAhaQCClQS7mc93Gwx9_OmN-KfuXiR4PpeyBmo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// 生成UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 测试数据库连接
async function testConnection() {
  console.log('🔗 测试数据库连接...')
  try {
    const { data, error } = await supabase
      .from('inventory')
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

// 获取测试数据
async function getTestData() {
  console.log('📋 获取测试数据...')
  try {
    // 获取试剂
    const { data: reagents, error: reagentError } = await supabase
      .from('reagents')
      .select('id, name, cas_number')
      .eq('is_active', true)
      .limit(1)

    if (reagentError) throw reagentError

    // 获取实验室
    const { data: labs, error: labError } = await supabase
      .from('laboratories')
      .select('id, name')
      .eq('is_active', true)
      .limit(1)

    if (labError) throw labError

    // 获取用户
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, laboratory_id')
      .eq('role', 'admin')
      .limit(1)

    if (userError) throw userError

    if (!reagents?.length || !labs?.length || !users?.length) {
      throw new Error('缺少必要的测试数据')
    }

    console.log('✅ 测试数据获取成功')
    console.log(`   - 试剂: ${reagents[0].name}`)
    console.log(`   - 实验室: ${labs[0].name}`)
    console.log(`   - 用户: ${users[0].name}`)

    return {
      reagent: reagents[0],
      laboratory: labs[0],
      user: users[0]
    }
  } catch (error) {
    console.error('❌ 获取测试数据失败:', error.message)
    return null
  }
}

// 测试创建库存 (CREATE)
async function testCreateInventory(testData) {
  console.log('\n➕ 测试创建库存 (CREATE)...')
  
  try {
    const inventoryData = {
      id: generateUUID(),
      reagent_id: testData.reagent.id,
      laboratory_id: testData.laboratory.id,
      batch_number: 'BATCH_' + Date.now(),
      quantity: 100.5,
      unit: 'g',
      expiry_date: '2025-12-31',
      purchase_date: '2024-01-01',
      purchase_price: 299.99,
      location: '4°C冰箱A-1层',
      min_stock_level: 10,
      notes: '测试库存记录',
      created_by: testData.user.id
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select(`
        *,
        reagent:reagents(id, name, cas_number),
        laboratory:laboratories(id, name),
        created_by:users!inventory_created_by_fkey(id, name)
      `)
      .single()

    if (error) throw error

    console.log('✅ 创建库存成功')
    console.log(`📊 库存信息:`)
    console.log(`   - ID: ${data.id}`)
    console.log(`   - 试剂: ${data.reagent?.name}`)
    console.log(`   - 批次: ${data.batch_number}`)
    console.log(`   - 数量: ${data.quantity}${data.unit}`)
    console.log(`   - 位置: ${data.location}`)
    console.log(`   - 创建者: ${data.created_by?.name}`)

    return data
  } catch (error) {
    console.error('❌ 创建库存失败:', error.message)
    return null
  }
}

// 测试读取库存 (READ)
async function testReadInventory(inventoryId, testData) {
  console.log('\n📖 测试读取库存 (READ)...')
  
  try {
    // 读取单个库存
    const { data: singleData, error: singleError } = await supabase
      .from('inventory')
      .select(`
        *,
        reagent:reagents(id, name, cas_number, category),
        laboratory:laboratories(id, name),
        created_by:users!inventory_created_by_fkey(id, name)
      `)
      .eq('id', inventoryId)
      .single()

    if (singleError) throw singleError

    console.log('✅ 读取单个库存成功')
    console.log(`   - 试剂: ${singleData.reagent?.name}`)
    console.log(`   - 数量: ${singleData.quantity}${singleData.unit}`)

    // 读取库存列表（分页）
    const { data: listData, error: listError } = await supabase
      .from('inventory')
      .select(`
        *,
        reagent:reagents(id, name, cas_number, category),
        laboratory:laboratories(id, name)
      `)
      .eq('laboratory_id', testData.laboratory.id)
      .order('created_at', { ascending: false })
      .range(0, 9)

    if (listError) throw listError

    console.log(`✅ 读取库存列表成功，共 ${listData.length} 条记录`)

    return { single: singleData, list: listData }
  } catch (error) {
    console.error('❌ 读取库存失败:', error.message)
    return null
  }
}

// 测试更新库存 (UPDATE)
async function testUpdateInventory(inventoryId) {
  console.log('\n✏️ 测试更新库存 (UPDATE)...')
  
  try {
    const updateData = {
      quantity: 75.5,
      location: '常温试剂柜B-2层',
      min_stock_level: 15,
      notes: '测试库存记录 - 已更新',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', inventoryId)
      .select(`
        *,
        reagent:reagents(id, name),
        laboratory:laboratories(id, name)
      `)
      .single()

    if (error) throw error

    console.log('✅ 更新库存成功')
    console.log(`📊 更新后信息:`)
    console.log(`   - 数量: ${data.quantity}${data.unit}`)
    console.log(`   - 位置: ${data.location}`)
    console.log(`   - 最低库存: ${data.min_stock_level}`)
    console.log(`   - 备注: ${data.notes}`)

    return data
  } catch (error) {
    console.error('❌ 更新库存失败:', error.message)
    return null
  }
}

// 测试删除库存 (DELETE)
async function testDeleteInventory(inventoryId) {
  console.log('\n🗑️ 测试删除库存 (DELETE)...')
  
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', inventoryId)

    if (error) throw error

    console.log('✅ 删除库存成功')

    // 验证删除
    const { data: checkData } = await supabase
      .from('inventory')
      .select('id')
      .eq('id', inventoryId)
      .single()

    if (!checkData) {
      console.log('✅ 删除验证成功，记录已不存在')
      return true
    } else {
      console.log('❌ 删除验证失败，记录仍然存在')
      return false
    }
  } catch (error) {
    if (error.message.includes('No rows found')) {
      console.log('✅ 删除验证成功，记录已不存在')
      return true
    }
    console.error('❌ 删除库存失败:', error.message)
    return false
  }
}

// 主测试函数
async function runCRUDTests() {
  console.log('🚀 开始库存CRUD功能测试...')
  console.log('=' .repeat(60))
  
  const results = {
    connection: false,
    testData: null,
    create: null,
    read: null,
    update: null,
    delete: false
  }
  
  let testInventoryId = null
  
  try {
    // 1. 测试数据库连接
    results.connection = await testConnection()
    if (!results.connection) {
      console.log('\n❌ 数据库连接失败，停止测试')
      return results
    }
    
    // 2. 获取测试数据
    results.testData = await getTestData()
    if (!results.testData) {
      console.log('\n❌ 获取测试数据失败，停止测试')
      return results
    }
    
    // 3. 测试创建 (CREATE)
    results.create = await testCreateInventory(results.testData)
    if (results.create) {
      testInventoryId = results.create.id
    }
    
    // 4. 测试读取 (READ)
    if (testInventoryId) {
      results.read = await testReadInventory(testInventoryId, results.testData)
    }
    
    // 5. 测试更新 (UPDATE)
    if (testInventoryId) {
      results.update = await testUpdateInventory(testInventoryId)
    }
    
    // 6. 测试删除 (DELETE)
    if (testInventoryId) {
      results.delete = await testDeleteInventory(testInventoryId)
    }
    
    // 显示测试总结
    console.log('\n📋 库存CRUD功能测试总结:')
    console.log('=' .repeat(50))
    
    const testResults = [
      { name: '数据库连接', status: results.connection },
      { name: '获取测试数据', status: results.testData !== null },
      { name: '创建库存 (CREATE)', status: results.create !== null },
      { name: '读取库存 (READ)', status: results.read !== null },
      { name: '更新库存 (UPDATE)', status: results.update !== null },
      { name: '删除库存 (DELETE)', status: results.delete === true }
    ]
    
    testResults.forEach(test => {
      const status = test.status ? '✅' : '❌'
      console.log(`${status} ${test.name}`)
    })
    
    const successCount = testResults.filter(t => t.status).length
    console.log(`\n总计: ${successCount}/${testResults.length} 项测试通过`)
    
    if (successCount === testResults.length) {
      console.log('\n🎉 所有CRUD功能测试通过！')
      console.log('💡 数据库层面功能正常，可以检查前端页面')
    } else {
      console.log('\n⚠️  部分功能存在问题，需要进一步调试')
    }
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message)
  }
  
  return results
}

// 运行测试
runCRUDTests().catch(console.error)
