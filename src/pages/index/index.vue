<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 未登录状态 -->
    <view v-if="!isAuthenticated" class="min-h-screen flex flex-col items-center justify-center p-8">
      <view class="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
        <text class="text-3xl">🧪</text>
      </view>
      <text class="text-2xl font-bold text-gray-800 mb-2">实验室试剂管理</text>
      <text class="text-gray-600 mb-8 text-center">请登录以访问系统功能</text>
      <van-button type="primary" round block class="!bg-primary-500 !border-primary-500 !w-48" @click="goToLogin">
        立即登录
      </van-button>
    </view>

    <!-- 已登录状态 -->
    <view v-else>
      <!-- 顶部横幅 -->
      <view
        class="home-banner bg-gradient-to-br from-primary-500 to-primary-700 text-white p-8 relative overflow-hidden"
      >
        <view class="absolute -top-12 -right-4 w-48 h-48 bg-white bg-opacity-10 rounded-full"></view>
        <view class="relative z-10">
          <text class="text-2xl font-semibold mb-2 block">你好，{{ user?.name || '用户' }}</text>
          <text class="text-sm opacity-90"
            >{{ user?.laboratory?.name || '实验室' }} · {{ getRoleText(user?.role) }}</text
          >
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions grid grid-cols-2 gap-4 p-5 -mt-10 relative z-20">
      <view
        v-if="canCreateRequest"
        class="action-card bg-white rounded-2xl p-5 shadow-soft text-center hover:shadow-medium transition-all duration-300"
        @tap="navigateTo('/pages/purchase/index')"
      >
        <view
          class="action-icon w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center"
        >
          <text class="text-white text-xl">📝</text>
        </view>
        <text class="action-title text-base font-semibold mb-1 block text-gray-800">采购申请</text>
        <text class="action-desc text-xs text-gray-600">提交新的试剂申请</text>
      </view>
      <view
        class="action-card bg-white rounded-2xl p-5 shadow-soft text-center hover:shadow-medium transition-all duration-300"
        @tap="navigateTo('/pages/inventory/index')"
      >
        <view
          class="action-icon w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center"
        >
          <text class="text-white text-xl">📦</text>
        </view>
        <text class="action-title text-base font-semibold mb-1 block text-gray-800">库存查询</text>
        <text class="action-desc text-xs text-gray-600">查看库存状态</text>
      </view>
      <view
        v-if="canApprove"
        class="action-card bg-white rounded-2xl p-5 shadow-soft text-center hover:shadow-medium transition-all duration-300"
        @tap="navigateTo('/pages/approval/index')"
      >
        <view
          class="action-icon w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center"
        >
          <text class="text-white text-xl">✅</text>
        </view>
        <text class="action-title text-base font-semibold mb-1 block text-gray-800">审批中心</text>
        <text class="action-desc text-xs text-gray-600">处理待审事项</text>
      </view>
      <view
        class="action-card bg-white rounded-2xl p-5 shadow-soft text-center hover:shadow-medium transition-all duration-300"
      >
        <view
          class="action-icon w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center"
        >
          <text class="text-white text-xl">📊</text>
        </view>
        <text class="action-title text-base font-semibold mb-1 block text-gray-800">使用记录</text>
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
    <view class="stats-section bg-white mx-5 mb-5 p-5 rounded-2xl shadow-soft">
      <text class="stats-title text-lg font-semibold mb-4 block text-gray-800">本月统计</text>
      <view class="stats-grid grid grid-cols-3 gap-4">
        <view class="stat-item text-center p-4 bg-primary-50 rounded-xl border border-primary-100">
          <text class="stat-number text-2xl font-bold text-primary-500 block">12</text>
          <text class="stat-label text-xs text-gray-600 mt-1">采购申请</text>
        </view>
        <view class="stat-item text-center p-4 bg-primary-50 rounded-xl border border-primary-100">
          <text class="stat-number text-2xl font-bold text-primary-500 block">89</text>
          <text class="stat-label text-xs text-gray-600 mt-1">库存种类</text>
        </view>
        <view class="stat-item text-center p-4 bg-primary-50 rounded-xl border border-primary-100">
          <text class="stat-number text-2xl font-bold text-primary-500 block">156</text>
          <text class="stat-label text-xs text-gray-600 mt-1">使用记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { UserRole } from '@/utils/supabase'
import { hasPermission, PERMISSIONS } from '@/utils/permissions'

const store = useStore()

const isAuthenticated = computed(() => store.getters.isAuthenticated)
const user = computed(() => store.getters.user)
const userRole = computed(() => store.getters.userRole)

// 权限检查
const canCreateRequest = computed(() => hasPermission(userRole.value, PERMISSIONS.REQUEST_CREATE))

const canApprove = computed(() => hasPermission(userRole.value, PERMISSIONS.APPROVAL_VIEW))

const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

const getRoleText = (role?: UserRole) => {
  switch (role) {
    case UserRole.STUDENT:
      return '学生'
    case UserRole.TEACHER:
      return '导师'
    case UserRole.ADMIN:
      return '管理员'
    default:
      return '用户'
  }
}

onMounted(() => {
  // 检查认证状态
  store.dispatch('checkAuth')
})
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
