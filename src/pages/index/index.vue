<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 顶部横幅 -->
    <view
      class="home-banner bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-8 relative overflow-hidden"
    >
      <view class="absolute -top-12 -right-4 w-48 h-48 bg-white bg-opacity-10 rounded-full"></view>
      <view class="relative z-10">
        <text class="text-2xl font-semibold mb-2 block">你好，张博士</text>
        <text class="text-sm opacity-90">生物医学工程实验室 · 今日有3项待处理</text>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions grid grid-cols-2 gap-4 p-5 -mt-10 relative z-20">
      <view
        class="action-card bg-white rounded-2xl p-5 shadow-lg text-center"
        @tap="navigateTo('/pages/purchase/index')"
      >
        <text class="action-icon text-3xl mb-3 block">📝</text>
        <text class="action-title text-base font-semibold mb-1 block">采购申请</text>
        <text class="action-desc text-xs text-gray-600">提交新的试剂申请</text>
      </view>
      <view
        class="action-card bg-white rounded-2xl p-5 shadow-lg text-center"
        @tap="navigateTo('/pages/inventory/index')"
      >
        <text class="action-icon text-3xl mb-3 block">📦</text>
        <text class="action-title text-base font-semibold mb-1 block">库存查询</text>
        <text class="action-desc text-xs text-gray-600">查看库存状态</text>
      </view>
      <view
        class="action-card bg-white rounded-2xl p-5 shadow-lg text-center"
        @tap="navigateTo('/pages/approval/index')"
      >
        <text class="action-icon text-3xl mb-3 block">✅</text>
        <text class="action-title text-base font-semibold mb-1 block">审批中心</text>
        <text class="action-desc text-xs text-gray-600">处理待审事项</text>
      </view>
      <view class="action-card bg-white rounded-2xl p-5 shadow-lg text-center">
        <text class="action-icon text-3xl mb-3 block">📊</text>
        <text class="action-title text-base font-semibold mb-1 block">使用记录</text>
        <text class="action-desc text-xs text-gray-600">记录试剂使用</text>
      </view>
    </view>

    <!-- 预警横幅 -->
    <view
      class="alert-banner bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 mx-5 mb-3 rounded-lg flex items-center"
    >
      <text class="mr-2">⚠️</text>
      <text class="text-sm">3种试剂库存不足，5种试剂即将过期</text>
    </view>

    <!-- 统计数据 -->
    <view class="stats-section bg-white mx-5 mb-5 p-5 rounded-2xl shadow-sm">
      <text class="stats-title text-lg font-semibold mb-4 block">本月统计</text>
      <view class="stats-grid grid grid-cols-3 gap-4">
        <view class="stat-item text-center p-4 bg-blue-50 rounded-xl">
          <text class="stat-number text-2xl font-bold text-primary-500 block">12</text>
          <text class="stat-label text-xs text-gray-600 mt-1">采购申请</text>
        </view>
        <view class="stat-item text-center p-4 bg-blue-50 rounded-xl">
          <text class="stat-number text-2xl font-bold text-primary-500 block">89</text>
          <text class="stat-label text-xs text-gray-600 mt-1">库存种类</text>
        </view>
        <view class="stat-item text-center p-4 bg-blue-50 rounded-xl">
          <text class="stat-number text-2xl font-bold text-primary-500 block">156</text>
          <text class="stat-label text-xs text-gray-600 mt-1">使用记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}
</script>

<style scoped>
.action-card {
  transition: all 0.3s ease;
}

.action-card:active {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>
