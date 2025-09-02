// 测试库存管理功能
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mbbekqqqcizrpsjdzmhf.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYmVrcXFxY2l6cnBzamR6bWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTgyMTksImV4cCI6MjA3MjI5NDIxOX0.bTWYXzAhaQCClQS7mc93Gwx9_OmN-KfuXiR4PpeyBmo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// 生成UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 测试获取库存列表（分页）
async function testGetInventoryList() {
  console.log('📦 测试获取库存列表（分页）...')

  try {
    // 获取第一页
    const { data: page1, error: error1 } = await supabase
      .from('inventory')
      .select(
        `
        *,
        reagent:reagents(id, name, cas_number, category),
        laboratory:laboratories(id, name)
      `
      )
      .order('created_at', { ascending: false })
      .range(0, 9) // 前10条

    if (error1) throw error1

    console.log(`✅ 第一页获取成功，找到 ${page1.length} 条记录`)

    // 获取第二页
    const { data: page2, error: error2 } = await supabase
      .from('inventory')
      .select(
        `
        *,
        reagent:reagents(id, name, cas_number, category),
        laboratory:laboratories(id, name)
      `
      )
      .order('created_at', { ascending: false })
      .range(10, 19) // 第11-20条

    if (error2) throw error2

    console.log(`✅ 第二页获取成功，找到 ${page2.length} 条记录`)

    return { page1, page2 }
  } catch (error) {
    console.error('❌ 获取库存列表失败:', error.message)
    return null
  }
}

// 测试搜索功能
async function testSearchInventory() {
  console.log('\n🔍 测试库存搜索功能...')

  try {
    // 按试剂名称搜索
    const { data: nameResults, error: nameError } = await supabase
      .from('inventory')
      .select(
        `
        *,
        reagent:reagents(id, name, cas_number, category)
      `
      )
      .ilike('reagent.name', '%试剂%')
      .limit(5)

    if (nameError) throw nameError

    console.log(`✅ 按名称搜索成功，找到 ${nameResults.length} 条记录`)

    // 按位置搜索
    const { data: locationResults, error: locationError } = await supabase
      .from('inventory')
      .select(
        `
        *,
        reagent:reagents(id, name, cas_number)
      `
      )
      .ilike('location', '%冰箱%')
      .limit(5)

    if (locationError) throw locationError

    console.log(`✅ 按位置搜索成功，找到 ${locationResults.length} 条记录`)

    return { nameResults, locationResults }
  } catch (error) {
    console.error('❌ 搜索功能测试失败:', error.message)
    return null
  }
}

// 测试添加库存
async function testAddInventory() {
  console.log('\n➕ 测试添加库存功能...')

  try {
    // 先获取一个试剂和实验室
    const { data: reagents } = await supabase.from('reagents').select('id, name').eq('is_active', true).limit(1)

    const { data: labs } = await supabase.from('laboratories').select('id, name').eq('is_active', true).limit(1)

    if (!reagents?.length || !labs?.length) {
      throw new Error('缺少必要的试剂或实验室数据')
    }

    // 获取一个有效的用户ID
    const { data: users } = await supabase.from('users').select('id').limit(1)

    if (!users?.length) {
      throw new Error('缺少用户数据')
    }

    const testInventory = {
      id: generateUUID(),
      reagent_id: reagents[0].id,
      laboratory_id: labs[0].id,
      batch_number: 'TEST_' + Date.now(),
      quantity: 100,
      unit: 'g',
      expiry_date: '2025-12-31',
      purchase_date: '2024-01-01',
      purchase_price: 299.99,
      location: '测试位置-4°C冰箱',
      min_stock_level: 10,
      notes: '测试库存记录',
      created_by: users[0].id
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert(testInventory)
      .select(
        `
        *,
        reagent:reagents(id, name),
        laboratory:laboratories(id, name)
      `
      )
      .single()

    if (error) throw error

    console.log('✅ 添加库存成功')
    console.log(`📊 新库存信息:`)
    console.log(`   - 试剂: ${data.reagent?.name}`)
    console.log(`   - 批次: ${data.batch_number}`)
    console.log(`   - 数量: ${data.quantity}${data.unit}`)
    console.log(`   - 位置: ${data.location}`)

    return data
  } catch (error) {
    console.error('❌ 添加库存失败:', error.message)
    return null
  }
}

// 测试修改库存
async function testUpdateInventory(inventoryId) {
  console.log('\n✏️ 测试修改库存功能...')

  try {
    const updateData = {
      quantity: 80,
      location: '更新位置-常温试剂柜',
      min_stock_level: 15,
      notes: '测试库存记录 - 已更新',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', inventoryId)
      .select(
        `
        *,
        reagent:reagents(id, name)
      `
      )
      .single()

    if (error) throw error

    console.log('✅ 修改库存成功')
    console.log(`📊 更新后信息:`)
    console.log(`   - 数量: ${data.quantity}${data.unit}`)
    console.log(`   - 位置: ${data.location}`)
    console.log(`   - 最低库存: ${data.min_stock_level}`)

    return data
  } catch (error) {
    console.error('❌ 修改库存失败:', error.message)
    return null
  }
}

// 测试删除库存
async function testDeleteInventory(inventoryId) {
  console.log('\n🗑️ 测试删除库存功能...')

  try {
    const { error } = await supabase.from('inventory').delete().eq('id', inventoryId)

    if (error) throw error

    console.log('✅ 删除库存成功')

    // 验证删除
    const { data: checkData } = await supabase.from('inventory').select('id').eq('id', inventoryId).single()

    if (!checkData) {
      console.log('✅ 删除验证成功，记录已不存在')
      return true
    } else {
      console.log('❌ 删除验证失败，记录仍然存在')
      return false
    }
  } catch (error) {
    console.error('❌ 删除库存失败:', error.message)
    return false
  }
}

// 测试低库存警告
async function testLowStockWarning() {
  console.log('\n⚠️ 测试低库存警告功能...')

  try {
    // 获取所有库存数据，然后在客户端过滤
    const { data: allData, error } = await supabase
      .from('inventory')
      .select(
        `
        *,
        reagent:reagents(id, name)
      `
      )
      .limit(50)

    if (error) throw error

    // 在客户端过滤低库存
    const lowStockItems = allData.filter((item) => item.quantity <= (item.min_stock_level || 0))

    console.log(`✅ 低库存查询成功，找到 ${lowStockItems.length} 条低库存记录`)

    lowStockItems.slice(0, 5).forEach((item) => {
      console.log(
        `   ⚠️ ${item.reagent?.name}: ${item.quantity}${item.unit} (最低: ${item.min_stock_level}${item.unit})`
      )
    })

    return lowStockItems
  } catch (error) {
    console.error('❌ 低库存查询失败:', error.message)
    return null
  }
}

// 主测试函数
async function runInventoryTests() {
  console.log('🚀 开始库存管理功能测试...')
  console.log('='.repeat(60))

  const results = {
    list: null,
    search: null,
    add: null,
    update: null,
    delete: false,
    lowStock: null
  }

  let testInventoryId = null

  try {
    // 1. 测试获取库存列表
    results.list = await testGetInventoryList()

    // 2. 测试搜索功能
    results.search = await testSearchInventory()

    // 3. 测试添加库存
    results.add = await testAddInventory()
    if (results.add) {
      testInventoryId = results.add.id
    }

    // 4. 测试修改库存
    if (testInventoryId) {
      results.update = await testUpdateInventory(testInventoryId)
    }

    // 5. 测试删除库存
    if (testInventoryId) {
      results.delete = await testDeleteInventory(testInventoryId)
    }

    // 6. 测试低库存警告
    results.lowStock = await testLowStockWarning()

    // 显示测试总结
    console.log('\n📋 库存管理功能测试总结:')
    console.log('='.repeat(50))

    const testResults = [
      { name: '获取库存列表（分页）', status: results.list !== null },
      { name: '搜索功能', status: results.search !== null },
      { name: '添加库存', status: results.add !== null },
      { name: '修改库存', status: results.update !== null },
      { name: '删除库存', status: results.delete === true },
      { name: '低库存警告', status: results.lowStock !== null }
    ]

    testResults.forEach((test) => {
      const status = test.status ? '✅' : '❌'
      console.log(`${status} ${test.name}`)
    })

    const successCount = testResults.filter((t) => t.status).length
    console.log(`\n总计: ${successCount}/${testResults.length} 项测试通过`)

    if (successCount === testResults.length) {
      console.log('\n🎉 所有库存管理功能测试通过！')
      console.log('💡 前端库存页面应该可以完美工作')
      console.log('\n🌐 测试前端功能:')
      console.log('   1. 访问: http://localhost:5174/')
      console.log('   2. 使用 teacher 或 admin 账户登录')
      console.log('   3. 进入库存管理页面')
      console.log('   4. 测试搜索、添加、编辑、删除功能')
    } else {
      console.log('\n⚠️  部分功能存在问题，需要进一步调试')
    }
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message)
  }

  return results
}

// 运行测试
runInventoryTests().catch(console.error)
