<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <view class="bg-white px-5 py-4 border-b border-gray-100">
      <text class="text-lg font-semibold text-gray-800">库存管理</text>
      <text class="text-sm text-gray-600 mt-1 block">查看和管理试剂库存信息</text>
    </view>

    <!-- 权限检查 -->
    <view v-if="!canManage" class="p-5">
      <van-empty description="您没有库存管理权限" />
    </view>

    <!-- 主要内容 -->
    <view v-else>
      <!-- 下拉刷新 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 搜索栏 -->
        <view class="search-bar bg-white p-5 border-b border-gray-100">
          <van-search
            v-model="searchValue"
            placeholder="搜索试剂名称、CAS号"
            background="#f8f9fa"
            shape="round"
            @search="onSearch"
          />
        </view>

        <!-- 筛选标签 -->
        <view class="filter-tabs flex gap-2 px-5 py-4 bg-white border-b border-gray-100">
          <view
            v-for="(tab, index) in filterTabs"
            :key="index"
            class="filter-tab px-4 py-2 border border-gray-200 rounded-full text-xs cursor-pointer transition-all"
            :class="{
              'bg-primary-500 text-white border-primary-500': activeTab === index,
              'hover:bg-gray-50': activeTab !== index
            }"
            @tap="setActiveTab(index)"
          >
            <text>{{ tab }}</text>
          </view>
        </view>

        <!-- 库存列表 -->
        <view class="inventory-list px-4 pt-4 pb-20">
          <view v-if="filteredInventory.length === 0 && !loading" class="text-center py-10">
            <van-empty description="暂无库存数据" />
          </view>

          <view
            v-for="item in filteredInventory"
            :key="item.id"
            class="inventory-item bg-white mb-3 p-4 rounded-2xl shadow-soft border-l-4"
            :class="item.isLowStock ? 'border-red-400' : 'border-primary-400'"
          >
            <view class="flex justify-between items-start">
              <view class="reagent-info flex-1">
                <view class="flex items-center mb-2">
                  <text class="reagent-name text-base font-semibold text-gray-800">{{ item.name }}</text>
                  <view v-if="item.isLowStock" class="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    低库存
                  </view>
                </view>
                <view class="reagent-details text-xs text-gray-600 leading-relaxed space-y-1">
                  <text class="block">批次号: {{ item.batch_number || '无' }}</text>
                  <text class="block">位置: {{ item.location }}</text>
                  <text class="block">过期时间: {{ item.expiryDate }}</text>
                  <text class="block">最低库存: {{ item.min_stock_level }}{{ item.unit }}</text>
                </view>
              </view>

              <view class="flex items-center ml-4">
                <!-- 库存数量 -->
                <view class="stock-info text-right mr-3">
                  <text
                    class="stock-number text-xl font-bold block"
                    :class="item.isLowStock ? 'text-red-500' : 'text-primary-500'"
                  >
                    {{ item.currentStock }}
                  </text>
                  <text class="stock-unit text-xs text-gray-600">{{ item.unit }}</text>
                </view>

                <!-- 操作按钮 -->
                <view class="flex flex-col gap-1">
                  <van-button size="mini" type="primary" @click="editInventory(item)"> 编辑 </van-button>
                  <van-button size="mini" type="danger" @click="deleteInventory(item)"> 删除 </van-button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </van-pull-refresh>
    </view>

    <!-- 浮动添加按钮 -->
    <view
      class="floating-add fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl shadow-strong"
      @tap="addInventory"
    >
      <text>+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '@/utils/supabase'

const store = useStore()
const user = store.state.user

// 权限检查
const canManage = computed(() => {
  return user && (user.role === 'teacher' || user.role === 'admin')
})

const searchValue = ref('')
const activeTab = ref(0)
const loading = ref(false)
const refreshing = ref(false)

const filterTabs = ['全部', '有机溶剂', '无机试剂', '生物试剂', '指示剂', '低库存']

// 库存数据
const inventoryList = ref([])

// 获取库存列表
const fetchInventory = async () => {
  if (!canManage.value) return

  try {
    loading.value = true

    const { data, error } = await supabase
      .from('inventory')
      .select(
        `
        *,
        reagent:reagents(id, name, cas_number, category, molecular_formula),
        laboratory:laboratories(id, name),
        created_by:users!inventory_created_by_fkey(id, name)
      `
      )
      .eq('laboratory_id', user.laboratory_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    inventoryList.value = (data || []).map((item) => ({
      ...item,
      isLowStock: item.quantity <= item.min_stock_level,
      currentStock: item.quantity,
      name: item.reagent?.name || '未知试剂',
      category: item.reagent?.category || '其他',
      expiryDate: item.expiry_date ? formatDate(item.expiry_date) : '无',
      specification: `${item.quantity}${item.unit}`,
      location: item.location || '未设置'
    }))
  } catch (error) {
    console.error('获取库存列表失败:', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await fetchInventory()
  refreshing.value = false
}

// 筛选后的库存列表
const filteredInventory = computed(() => {
  let filtered = inventoryList.value

  // 按分类筛选
  if (activeTab.value > 0) {
    const filterType = filterTabs[activeTab.value]
    if (filterType === '低库存') {
      filtered = filtered.filter((item) => item.isLowStock)
    } else {
      filtered = filtered.filter((item) => item.category === filterType)
    }
  }

  // 按搜索关键词筛选
  if (searchValue.value) {
    const keyword = searchValue.value.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        (item.reagent?.cas_number && item.reagent.cas_number.toLowerCase().includes(keyword))
    )
  }

  return filtered
})

const setActiveTab = (index: number) => {
  activeTab.value = index
}

const onSearch = (value: string) => {
  // 搜索功能已在 computed 中实现
}

const addInventory = () => {
  if (!canManage.value) {
    uni.showToast({
      title: '您没有管理权限',
      icon: 'error'
    })
    return
  }

  uni.navigateTo({
    url: '/pages/inventory/add'
  })
}

// 编辑库存
const editInventory = (item: any) => {
  if (!canManage.value) {
    uni.showToast({
      title: '您没有管理权限',
      icon: 'error'
    })
    return
  }

  uni.navigateTo({
    url: `/pages/inventory/edit?id=${item.id}`
  })
}

// 删除库存
const deleteInventory = async (item: any) => {
  if (!canManage.value) {
    uni.showToast({
      title: '您没有管理权限',
      icon: 'error'
    })
    return
  }

  uni.showModal({
    title: '确认删除',
    content: `确定要删除 ${item.name} 的库存记录吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const { error } = await supabase.from('inventory').delete().eq('id', item.id)

          if (error) throw error

          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })

          await fetchInventory()
        } catch (error) {
          console.error('删除失败:', error)
          uni.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
      }
    }
  })
}

// 工具函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  if (canManage.value) {
    fetchInventory()
  }
})
</script>

<style scoped>
.floating-add {
  transition: all 0.3s ease;
}

.floating-add:active {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}
</style>
