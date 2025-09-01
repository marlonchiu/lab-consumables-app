<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <view class="bg-white px-5 py-4 border-b border-gray-100">
      <text class="text-lg font-semibold text-gray-800">审批中心</text>
      <text class="text-sm text-gray-600 mt-1 block">处理试剂采购申请审批</text>
    </view>

    <!-- 待审批标题 -->
    <view class="section-title p-5 pb-2">
      <text class="text-base font-semibold text-gray-800">待我审批 ({{ pendingList.length }})</text>
    </view>

    <!-- 待审批列表 -->
    <view class="px-4">
      <view
        v-for="item in pendingList"
        :key="item.id"
        class="list-item bg-white mb-3 p-5 rounded-2xl shadow-soft border-l-4 border-accent-400"
        @tap="viewDetail(item)"
      >
        <view class="item-header flex justify-between items-center mb-3">
          <text class="item-title text-base font-semibold text-gray-800">{{ item.reagentName }}</text>
          <view class="status-badge bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-xs font-medium">
            待审批
          </view>
        </view>
        <view class="item-details text-sm text-gray-600 leading-relaxed mb-3">
          <text>申请人: {{ item.applicant }} | 数量: {{ item.quantity }} | 预算: ¥{{ item.budget }}</text>
          <text class="block mt-1">用途: {{ item.purpose }}</text>
        </view>
        <view class="item-meta flex justify-between text-xs text-gray-500">
          <text>申请时间: {{ item.applyTime }}</text>
          <view class="flex items-center">
            <view
              class="w-2 h-2 rounded-full mr-1"
              :class="item.urgency === '紧急' ? 'bg-red-400' : 'bg-gray-400'"
            ></view>
            <text>{{ item.urgency }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 已审批标题 -->
    <view class="section-title p-5 pb-2 pt-8">
      <text class="text-base font-semibold text-gray-800">最近已审批</text>
    </view>

    <!-- 已审批列表 -->
    <view class="px-4 pb-20">
      <view
        v-for="item in approvedList"
        :key="item.id"
        class="list-item bg-white mb-3 p-5 rounded-2xl shadow-soft border-l-4 border-green-400 opacity-90"
      >
        <view class="item-header flex justify-between items-center mb-3">
          <text class="item-title text-base font-semibold text-gray-800">{{ item.reagentName }}</text>
          <view class="status-badge bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            已批准
          </view>
        </view>
        <view class="item-details text-sm text-gray-600 mb-3">
          <text>申请人: {{ item.applicant }} | 数量: {{ item.quantity }} | 预算: ¥{{ item.budget }}</text>
        </view>
        <view class="item-meta flex justify-between text-xs text-gray-500">
          <text>审批时间: {{ item.approvalTime }}</text>
          <text>审批人: 我</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 待审批列表
const pendingList = ref([
  {
    id: 1,
    reagentName: 'DMEM培养基',
    applicant: '李同学',
    quantity: '10瓶',
    budget: '1,200',
    purpose: '细胞培养实验用培养基',
    applyTime: '2025-08-29 14:30',
    urgency: '普通'
  },
  {
    id: 2,
    reagentName: 'Taq DNA聚合酶',
    applicant: '王同学',
    quantity: '2支',
    budget: '800',
    purpose: 'PCR扩增实验',
    applyTime: '2025-08-29 11:15',
    urgency: '紧急'
  },
  {
    id: 3,
    reagentName: '胰蛋白酶',
    applicant: '陈同学',
    quantity: '3瓶',
    budget: '450',
    purpose: '细胞消化传代',
    applyTime: '2025-08-29 09:20',
    urgency: '普通'
  }
])

// 已审批列表
const approvedList = ref([
  {
    id: 4,
    reagentName: 'FITC荧光染料',
    applicant: '赵同学',
    quantity: '1g',
    budget: '680',
    approvalTime: '2025-08-28 16:45'
  }
])

const viewDetail = (item: any) => {
  console.log('查看详情:', item)
  uni.showToast({
    title: '跳转到审批详情页',
    icon: 'none'
  })
}
</script>

<style scoped>
.list-item {
  transition: all 0.3s ease;
}

.list-item:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
