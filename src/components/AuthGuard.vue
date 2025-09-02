<template>
  <view v-if="hasPermission">
    <slot />
  </view>
  <view v-else-if="showNoPermission" class="no-permission p-8 text-center">
    <view class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <text class="text-3xl">🔒</text>
    </view>
    <text class="text-lg font-semibold text-gray-800 mb-2 block">权限不足</text>
    <text class="text-sm text-gray-600">您没有访问此功能的权限</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { UserRole } from '@/utils/supabase'

interface Props {
  roles?: UserRole[]
  requireAuth?: boolean
  showNoPermission?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  requireAuth: true,
  showNoPermission: true
})

const store = useStore()

const isAuthenticated = computed(() => store.getters.isAuthenticated)
const userRole = computed(() => store.getters.userRole)

const hasPermission = computed(() => {
  // 如果不需要认证，直接通过
  if (!props.requireAuth) {
    return true
  }

  // 如果需要认证但用户未登录，不通过
  if (!isAuthenticated.value) {
    return false
  }

  // 如果没有指定角色要求，只要登录就通过
  if (props.roles.length === 0) {
    return true
  }

  // 检查用户角色是否在允许的角色列表中
  return props.roles.includes(userRole.value)
})
</script>

<style scoped>
</style>
