<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 用户信息头部 -->
    <view class="user-header bg-white p-8 text-center border-b border-gray-100">
      <view class="avatar w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
        👨‍🔬
      </view>
      <text class="user-name text-xl font-semibold mb-1 block">张博士</text>
      <text class="user-info text-sm text-gray-600">生物医学工程实验室 · 博士研究生</text>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-list mt-5">
      <view 
        v-for="item in menuItems" 
        :key="item.id"
        class="menu-item bg-white mb-3 mx-5 p-5 rounded-xl shadow-sm flex items-center"
        @tap="handleMenuTap(item)"
      >
        <view class="menu-icon text-xl mr-4">{{ item.icon }}</view>
        <view class="menu-content flex-1">
          <text class="menu-title text-base font-semibold mb-1 block">{{ item.title }}</text>
          <text class="menu-desc text-xs text-gray-600">{{ item.description }}</text>
        </view>
        <view v-if="item.badge" class="badge bg-red-500 text-white text-xs px-2 py-1 rounded-full mr-2">
          {{ item.badge }}
        </view>
        <text class="arrow text-primary-500">›</text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section p-5 mt-8">
      <van-button 
        block 
        round 
        plain 
        type="default"
        class="border-gray-300 text-gray-600"
        @click="logout"
      >
        退出登录
      </van-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 菜单项数据
const menuItems = ref([
  {
    id: 1,
    icon: '📋',
    title: '我的申请',
    description: '查看申请历史和状态',
    badge: null
  },
  {
    id: 2,
    icon: '📊',
    title: '使用统计',
    description: '查看试剂使用记录',
    badge: null
  },
  {
    id: 3,
    icon: '🔔',
    title: '消息中心',
    description: '审批通知和系统消息',
    badge: '3'
  },
  {
    id: 4,
    icon: '⚙️',
    title: '系统设置',
    description: '通知设置和账户管理',
    badge: null
  }
])

const handleMenuTap = (item: any) => {
  console.log('点击菜单:', item.title)
  
  switch (item.id) {
    case 1:
      uni.showToast({
        title: '我的申请功能',
        icon: 'none'
      })
      break
    case 2:
      uni.showToast({
        title: '使用统计功能',
        icon: 'none'
      })
      break
    case 3:
      uni.showToast({
        title: '消息中心功能',
        icon: 'none'
      })
      break
    case 4:
      uni.showToast({
        title: '系统设置功能',
        icon: 'none'
      })
      break
  }
}

const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '退出成功',
          icon: 'success'
        })
        // 这里可以添加退出登录的逻辑
      }
    }
  })
}
</script>

<style scoped>
.menu-item {
  transition: all 0.3s ease;
}

.menu-item:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.arrow {
  font-size: 18px;
  font-weight: bold;
}
</style>
