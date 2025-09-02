// 测试前端库存功能
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mbbekqqqcizrpsjdzmhf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYmVrcXFxY2l6cnBzamR6bWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTgyMTksImV4cCI6MjA3MjI5NDIxOX0.bTWYXzAhaQCClQS7mc93Gwx9_OmN-KfuXiR4PpeyBmo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// 模拟前端库存列表获取
async function testFrontendInventoryList() {
  console.log('📋 测试前端库存列表获取...')
  
  try {
    // 获取管理员用户信息
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('id, name, laboratory_id, role')
      .eq('role', 'admin')
      .single()

    if (userError) throw userError

    console.log(`✅ 获取用户信息成功: ${adminUser.name} (${adminUser.role})`)

    // 模拟前端获取库存列表的查询
    const pageSize = 20
    const page = 1

    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        reagent:reagents(id, name, cas_number, category, molecular_formula),
        laboratory:laboratories(id, name),
        created_by:users!inventory_created_by_fkey(id, name)
      `)
      .eq('laboratory_id', adminUser.laboratory_id)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) throw error

    // 模拟前端数据处理
    const processedData = (data || []).map((item) => ({
      ...item,
      isLowStock: item.quantity <= item.min_stock_level,
      currentStock: item.quantity,
      name: item.reagent?.name || '未知试剂',
      category: item.reagent?.category || '其他',
      expiryDate: item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('zh-CN') : '无',
      specification: `${item.quantity}${item.unit}`,
      location: item.location || '未设置'
    }))

    console.log(`✅ 库存列表获取成功，共 ${processedData.length} 条记录`)
    
    // 显示前几条记录
    processedData.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - ${item.currentStock}${item.unit} ${item.isLowStock ? '⚠️' : '✅'}`)
    })

    return processedData
  } catch (error) {
    console.error('❌ 前端库存列表获取失败:', error.message)
    return null
  }
}

// 模拟前端搜索功能
async function testFrontendSearch() {
  console.log('\n🔍 测试前端搜索功能...')
  
  try {
    // 获取所有库存数据
    const { data: allData, error } = await supabase
      .from('inventory')
      .select(`
        *,
        reagent:reagents(id, name, cas_number, category, molecular_formula)
      `)
      .limit(50)

    if (error) throw error

    // 模拟前端搜索逻辑
    const searchKeyword = '乙醇'
    const keyword = searchKeyword.toLowerCase()
    
    const searchResults = allData.filter(
      (item) =>
        (item.reagent?.name && item.reagent.name.toLowerCase().includes(keyword)) ||
        (item.reagent?.cas_number && item.reagent.cas_number.toLowerCase().includes(keyword)) ||
        (item.batch_number && item.batch_number.toLowerCase().includes(keyword)) ||
        (item.location && item.location.toLowerCase().includes(keyword)) ||
        (item.reagent?.molecular_formula && item.reagent.molecular_formula.toLowerCase().includes(keyword))
    )

    console.log(`✅ 搜索 "${searchKeyword}" 成功，找到 ${searchResults.length} 条结果`)
    
    searchResults.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.reagent?.name} - ${item.quantity}${item.unit}`)
    })

    return searchResults
  } catch (error) {
    console.error('❌ 前端搜索功能测试失败:', error.message)
    return null
  }
}

// 模拟前端添加库存
async function testFrontendAddInventory() {
  console.log('\n➕ 测试前端添加库存...')
  
  try {
    // 获取试剂列表（模拟前端试剂选择器）
    const { data: reagents, error: reagentError } = await supabase
      .from('reagents')
      .select('id, name, cas_number')
      .eq('is_active', true)
      .limit(5)

    if (reagentError) throw reagentError

    console.log(`✅ 获取试剂列表成功，共 ${reagents.length} 种试剂可选`)

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, laboratory_id')
      .eq('role', 'admin')
      .single()

    if (userError) throw userError

    // 模拟前端表单数据
    const formData = {
      reagentId: reagents[0].id,
      batchNumber: 'FRONTEND_TEST_' + Date.now(),
      quantity: '50.5',
      unit: 'mL',
      expiryDate: '2025-06-30',
      purchaseDate: '2024-01-15',
      purchasePrice: '199.99',
      location: '常温试剂柜C-3层',
      minStockLevel: '5',
      notes: '前端测试添加的库存'
    }

    // 模拟前端提交逻辑
    const { error } = await supabase
      .from('inventory')
      .insert({
        reagent_id: formData.reagentId,
        laboratory_id: user.laboratory_id,
        batch_number: formData.batchNumber || null,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        expiry_date: formData.expiryDate || null,
        purchase_date: formData.purchaseDate || null,
        purchase_price: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        location: formData.location,
        min_stock_level: parseFloat(formData.minStockLevel || '0'),
        notes: formData.notes || null,
        created_by: user.id
      })

    if (error) throw error

    console.log('✅ 前端添加库存成功')
    console.log(`📊 添加信息:`)
    console.log(`   - 试剂: ${reagents[0].name}`)
    console.log(`   - 批次: ${formData.batchNumber}`)
    console.log(`   - 数量: ${formData.quantity}${formData.unit}`)
    console.log(`   - 位置: ${formData.location}`)

    return formData.batchNumber
  } catch (error) {
    console.error('❌ 前端添加库存失败:', error.message)
    return null
  }
}

// 模拟前端编辑库存
async function testFrontendEditInventory(batchNumber) {
  console.log('\n✏️ 测试前端编辑库存...')
  
  try {
    // 查找刚添加的库存
    const { data: inventory, error: findError } = await supabase
      .from('inventory')
      .select('id, quantity, location, notes')
      .eq('batch_number', batchNumber)
      .single()

    if (findError) throw findError

    // 模拟前端编辑表单数据
    const updateData = {
      quantity: 35.5,
      location: '4°C冰箱B-2层',
      notes: '前端测试编辑的库存 - 已更新'
    }

    // 模拟前端更新逻辑
    const { error } = await supabase
      .from('inventory')
      .update({
        quantity: updateData.quantity,
        location: updateData.location,
        notes: updateData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventory.id)

    if (error) throw error

    console.log('✅ 前端编辑库存成功')
    console.log(`📊 更新信息:`)
    console.log(`   - 数量: ${inventory.quantity} → ${updateData.quantity}`)
    console.log(`   - 位置: ${inventory.location} → ${updateData.location}`)

    return inventory.id
  } catch (error) {
    console.error('❌ 前端编辑库存失败:', error.message)
    return null
  }
}

// 模拟前端删除库存
async function testFrontendDeleteInventory(inventoryId) {
  console.log('\n🗑️ 测试前端删除库存...')
  
  try {
    // 模拟前端删除逻辑
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', inventoryId)

    if (error) throw error

    console.log('✅ 前端删除库存成功')

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
    console.error('❌ 前端删除库存失败:', error.message)
    return false
  }
}

// 主测试函数
async function runFrontendTests() {
  console.log('🚀 开始前端库存功能测试...')
  console.log('=' .repeat(60))
  
  const results = {
    list: null,
    search: null,
    add: null,
    edit: null,
    delete: false
  }
  
  let testBatchNumber = null
  let testInventoryId = null
  
  try {
    // 1. 测试库存列表
    results.list = await testFrontendInventoryList()
    
    // 2. 测试搜索功能
    results.search = await testFrontendSearch()
    
    // 3. 测试添加库存
    testBatchNumber = await testFrontendAddInventory()
    results.add = testBatchNumber !== null
    
    // 4. 测试编辑库存
    if (testBatchNumber) {
      testInventoryId = await testFrontendEditInventory(testBatchNumber)
      results.edit = testInventoryId !== null
    }
    
    // 5. 测试删除库存
    if (testInventoryId) {
      results.delete = await testFrontendDeleteInventory(testInventoryId)
    }
    
    // 显示测试总结
    console.log('\n📋 前端库存功能测试总结:')
    console.log('=' .repeat(50))
    
    const testResults = [
      { name: '库存列表获取', status: results.list !== null },
      { name: '搜索功能', status: results.search !== null },
      { name: '添加库存', status: results.add === true },
      { name: '编辑库存', status: results.edit === true },
      { name: '删除库存', status: results.delete === true }
    ]
    
    testResults.forEach(test => {
      const status = test.status ? '✅' : '❌'
      console.log(`${status} ${test.name}`)
    })
    
    const successCount = testResults.filter(t => t.status).length
    console.log(`\n总计: ${successCount}/${testResults.length} 项测试通过`)
    
    if (successCount === testResults.length) {
      console.log('\n🎉 所有前端功能测试通过！')
      console.log('💡 前端页面应该可以正常工作')
      console.log('\n🌐 现在可以测试前端页面:')
      console.log('   1. 访问: http://localhost:5174/')
      console.log('   2. 使用 admin 账户登录 (用户名: admin, 密码: 123456)')
      console.log('   3. 进入库存管理页面')
      console.log('   4. 测试添加、编辑、删除、搜索功能')
    } else {
      console.log('\n⚠️  部分功能存在问题，需要进一步调试')
    }
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message)
  }
  
  return results
}

// 运行测试
runFrontendTests().catch(console.error)
