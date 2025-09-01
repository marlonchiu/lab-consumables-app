<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 搜索栏 -->
    <view class="search-bar bg-white p-5">
      <van-search
        v-model="searchValue"
        placeholder="🔍 搜索试剂名称、CAS号"
        background="#f8f9fa"
        shape="round"
        @search="onSearch"
      />
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs flex gap-2 px-5 pb-5 bg-white">
      <view 
        v-for="(tab, index) in filterTabs" 
        :key="index"
        class="filter-tab px-4 py-2 border border-gray-200 rounded-full text-xs cursor-pointer transition-all"
        :class="{ 'bg-primary-500 text-white border-primary-500': activeTab === index }"
        @tap="setActiveTab(index)"
      >
        <text>{{ tab }}</text>
      </view>
    </view>

    <!-- 库存列表 -->
    <view class="inventory-list px-5 pb-20">
      <view 
        v-for="item in filteredInventory" 
        :key="item.id"
        class="inventory-item bg-white mb-3 p-4 rounded-xl shadow-sm flex justify-between items-center"
      >
        <view class="reagent-info flex-1">
          <text class="reagent-name text-base font-semibold mb-1 block">{{ item.name }}</text>
          <view class="reagent-details text-xs text-gray-600 leading-relaxed">
            <text class="block">规格: {{ item.specification }}</text>
            <text class="block">位置: {{ item.location }}</text>
            <text class="block">过期时间: {{ item.expiryDate }}</text>
          </view>
        </view>
        <view class="stock-info text-right">
          <text 
            class="stock-number text-lg font-bold block"
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
      class="floating-add fixed bottom-24 right-8 w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
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
      filtered = filtered.filter(item => item.isLowStock)
    } else {
      filtered = filtered.filter(item => item.category === filterType)
    }
  }

  // 按搜索关键词筛选
  if (searchValue.value) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchValue.value.toLowerCase())
    )
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
