<template>
  <view class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部装饰 -->
    <view class="login-header bg-gradient-to-br from-primary-500 to-primary-600 h-64 relative overflow-hidden">
      <view class="absolute -top-8 -right-8 w-32 h-32 bg-white bg-opacity-10 rounded-full"></view>
      <view class="absolute -bottom-4 -left-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></view>
      <view class="flex flex-col items-center justify-center h-full text-white relative z-10">
        <view
          class="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm"
        >
          <text class="text-3xl">🧪</text>
        </view>
        <text class="text-2xl font-bold mb-2">实验室试剂管理</text>
        <text class="text-sm opacity-90">Laboratory Reagent Management</text>
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="flex-1 px-6 -mt-16 relative z-20">
      <view class="bg-white rounded-2xl shadow-soft p-6">
        <text class="text-xl font-semibold text-gray-800 mb-6 block text-center">登录账户</text>

        <van-form @submit="handleLogin">
          <van-cell-group inset>
            <van-field
              v-model="loginForm.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[
                { required: true, message: '请填写用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
              ]"
              left-icon="contact"
              label-class="text-gray-700 font-medium"
              input-class="text-gray-800"
            />
            <van-field
              v-model="loginForm.password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              type="password"
              :rules="[
                { required: true, message: '请填写密码' },
                { min: 6, message: '密码至少6位' }
              ]"
              left-icon="lock"
              label-class="text-gray-700 font-medium"
              input-class="text-gray-800"
            />
          </van-cell-group>

          <view class="mt-6">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              class="!bg-primary-500 !border-primary-500 hover:!bg-primary-600 !h-12 !text-base !font-semibold"
            >
              {{ loading ? '登录中...' : '登录' }}
            </van-button>
          </view>
        </van-form>

        <!-- 错误提示 -->
        <view v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <text class="text-red-700 text-sm">{{ error }}</text>
        </view>

        <!-- 注册链接 -->
        <view class="mt-6 text-center">
          <text class="text-gray-600 text-sm">还没有账户？</text>
          <text class="text-primary-500 text-sm ml-1" @tap="goToRegister">立即注册</text>
        </view>
      </view>

      <!-- 演示账户 -->
      <view class="mt-6 bg-white rounded-2xl shadow-soft p-4">
        <text class="text-base font-semibold text-gray-800 mb-3 block">演示账户</text>
        <text class="text-xs text-gray-600 mb-3 block">首次使用请先创建演示账户</text>
        <view class="space-y-2">
          <view class="demo-account p-3 bg-gray-50 rounded-lg" @tap="quickLogin('student')">
            <view class="flex justify-between items-center">
              <view>
                <text class="text-sm font-medium text-gray-700">学生账户</text>
                <text class="text-xs text-gray-600 block">student / 123456</text>
              </view>
            </view>
          </view>
          <view class="demo-account p-3 bg-gray-50 rounded-lg" @tap="quickLogin('teacher')">
            <view class="flex justify-between items-center">
              <view>
                <text class="text-sm font-medium text-gray-700">导师账户</text>
                <text class="text-xs text-gray-600 block">teacher / 123456</text>
              </view>
            </view>
          </view>
          <view class="demo-account p-3 bg-gray-50 rounded-lg" @tap="quickLogin('admin')">
            <view class="flex justify-between items-center">
              <view>
                <text class="text-sm font-medium text-gray-700">管理员账户</text>
                <text class="text-xs text-gray-600 block">admin / 123456</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 快速登录 -->
        <view class="mt-4 pt-4 border-t border-gray-200">
          <text class="text-sm font-medium text-gray-700 mb-2 block">已有账户快速登录</text>
          <view class="flex gap-2">
            <view class="quick-login-btn flex-1 p-2 bg-blue-50 rounded text-center" @tap="quickLogin('student')">
              <text class="text-xs text-blue-600">学生</text>
            </view>
            <view class="quick-login-btn flex-1 p-2 bg-green-50 rounded text-center" @tap="quickLogin('teacher')">
              <text class="text-xs text-green-600">导师</text>
            </view>
            <view class="quick-login-btn flex-1 p-2 bg-red-50 rounded text-center" @tap="quickLogin('admin')">
              <text class="text-xs text-red-600">管理员</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const loginForm = ref({
  username: '',
  password: ''
})

const loading = computed(() => store.getters.loading)
const error = computed(() => store.getters.error)

const handleLogin = async () => {
  const result = await store.dispatch('login', loginForm.value)

  if (result.success) {
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  } else {
    uni.showToast({
      title: result.error || '登录失败',
      icon: 'error'
    })
  }
}

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/index'
  })
}

// 演示账户数据
const demoAccounts = {
  student: {
    username: 'student',
    password: '123456',
    email: 'student@lab.com',
    name: '张同学',
    role: 'student' as const,
    laboratory_id: '550e8400-e29b-41d4-a716-446655440001',
    student_id: '2021001',
    phone: '13900139001'
  },
  teacher: {
    username: 'teacher',
    password: '123456',
    email: 'teacher@lab.com',
    name: '张教授',
    role: 'teacher' as const,
    laboratory_id: '550e8400-e29b-41d4-a716-446655440001',
    phone: '13800138001'
  },
  admin: {
    username: 'admin',
    password: '123456',
    email: 'admin@lab.com',
    name: '系统管理员',
    role: 'admin' as const,
    phone: '13700137001'
  }
}

// 创建演示账户
const createDemoAccount = async (type: string) => {
  const account = demoAccounts[type as keyof typeof demoAccounts]
  if (!account) return

  uni.showLoading({ title: '创建账户中...' })

  try {
    const result = await store.dispatch('register', account)
    uni.hideLoading()

    if (result.success) {
      uni.showToast({
        title: '账户创建成功',
        icon: 'success'
      })

      // 自动跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } else {
      // 如果创建失败，可能是账户已存在，尝试登录
      if (result.error?.includes('已存在')) {
        uni.showToast({
          title: '账户已存在，尝试登录',
          icon: 'none'
        })
        await quickLogin(type)
      } else {
        uni.showToast({
          title: '创建失败: ' + result.error,
          icon: 'error'
        })
      }
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '创建账户失败',
      icon: 'error'
    })
  }
}

// 快速登录
const quickLogin = async (type: string) => {
  const account = demoAccounts[type as keyof typeof demoAccounts]
  if (!account) return

  // 填入表单
  loginForm.value = {
    username: account.username,
    password: account.password
  }

  // 尝试登录
  const result = await store.dispatch('login', {
    username: account.username,
    password: account.password
  })

  if (result.success) {
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  } else {
    uni.showToast({
      title: '登录失败: ' + result.error,
      icon: 'error'
    })
  }
}
</script>

<style scoped>
.demo-account {
  transition: all 0.3s ease;
}

.demo-account:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(149, 43, 43, 0.15);
}
</style>
