<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <view class="bg-white px-5 py-4 border-b border-gray-100">
      <text class="text-lg font-semibold text-gray-800">库存管理</text>
      <text class="text-sm text-gray-600 mt-1 block">查看和管理试剂库存信息</text>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar bg-white p-5 border-b border-gray-100">
      <van-search
        v-model="searchValue"
        placeholder="🔍 搜索试剂名称、CAS号"
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
      <view
        v-for="item in filteredInventory"
        :key="item.id"
        class="inventory-item bg-white mb-3 p-4 rounded-2xl shadow-soft flex justify-between items-center border-l-4"
        :class="item.isLowStock ? 'border-red-400' : 'border-primary-400'"
      >
        <view class="reagent-info flex-1">
          <view class="flex items-center mb-2">
            <text class="reagent-name text-base font-semibold text-gray-800">{{ item.name }}</text>
            <view v-if="item.isLowStock" class="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
              低库存
            </view>
          </view>
          <view class="reagent-details text-xs text-gray-600 leading-relaxed space-y-1">
            <text class="block">规格: {{ item.specification }}</text>
            <text class="block">位置: {{ item.location }}</text>
            <text class="block">过期时间: {{ item.expiryDate }}</text>
          </view>
        </view>
        <view class="stock-info text-right ml-4">
          <text
            class="stock-number text-xl font-bold block"
            :class="item.isLowStock ? 'text-red-500' : 'text-primary-500'"
          >
            {{ item.currentStock }}
          </text>
          <text class="stock-unit text-xs text-gray-600">{{ item.unit }}</text>
        </view>
      </view>
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
import { ref, computed } from 'vue'

const searchValue = ref('')
const activeTab = ref(0)

const filterTabs = ['全部', '缓冲液', '酶类', '染料', '低库存']

// 库存数据
const inventoryList = ref([
  {
    id: 1,
    name: 'DMEM培养基',
    specification: '500ml/瓶',
    location: '4°C冰箱A-2层',
    expiryDate: '2025-12-15',
    currentStock: 15,
    unit: '瓶',
    category: '缓冲液',
    isLowStock: false
  },
  {
    id: 2,
    name: 'Taq聚合酶',
    specification: '500U/支',
    location: '-20°C冰箱B-1层',
    expiryDate: '2026-03-20',
    currentStock: 2,
    unit: '支',
    category: '酶类',
    isLowStock: true
  },
  {
    id: 3,
    name: 'PBS缓冲液',
    specification: '1L/瓶',
    location: '常温试剂柜C-3',
    expiryDate: '2025-10-30',
    currentStock: 8,
    unit: 'L',
    category: '缓冲液',
    isLowStock: false
  },
  {
    id: 4,
    name: 'FITC荧光染料',
    specification: '1mg/支',
    location: '-20°C避光保存',
    expiryDate: '2025-09-15',
    currentStock: 1,
    unit: 'mg',
    category: '染料',
    isLowStock: true
  },
  {
    id: 5,
    name: '胰蛋白酶',
    specification: '25mg/瓶',
    location: '-20°C冰箱A-3层',
    expiryDate: '2026-01-10',
    currentStock: 6,
    unit: '瓶',
    category: '酶类',
    isLowStock: false
  }
])

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
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchValue.value.toLowerCase()))
  }

  return filtered
})

const setActiveTab = (index: number) => {
  activeTab.value = index
}

const onSearch = (value: string) => {
  console.log('搜索:', value)
}

const addInventory = () => {
  uni.showToast({
    title: '添加库存功能',
    icon: 'none'
  })
}
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
