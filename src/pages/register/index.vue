<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <view class="bg-white px-5 py-4 border-b border-gray-100">
      <text class="text-lg font-semibold text-gray-800">注册账户</text>
      <text class="text-sm text-gray-600 mt-1 block">创建您的实验室管理账户</text>
    </view>

    <view class="p-6">
      <view class="bg-white rounded-2xl shadow-soft p-2">
        <van-form label-width="4em" @submit="handleRegister">
          <van-cell-group inset class="mx-0">
            <van-field
              v-model="registerForm.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名(3-20位字母数字下划线)"
              :rules="[
                { required: true, message: '请填写用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 20, message: '用户名不能超过20个字符' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
              ]"
              label-class="text-gray-700 font-medium"
              input-class="text-gray-800"
            />
            <van-field
              v-model="registerForm.name"
              name="name"
              label="姓名"
              placeholder="请输入真实姓名"
              :rules="[{ required: true, message: '请填写姓名' }]"
              label-class="text-gray-700 font-medium"
              input-class="text-gray-800"
            />
            <van-field
              v-model="registerForm.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱地址(可选)"
              type="email"
              :rules="[{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱格式' }]"
              label-class="text-gray-700 font-medium"
              input-class="text-gray-800"
            />
            <van-field
              v-model="registerForm.password"
              name="password"
              label="密码"
              placeholder="请输入密码(至少6位)"
              type="password"
              :rules="[
                { required: true, message: '请填写密码' },
                { min: 6, message: '密码至少6位' }
              ]"
              label-class="text-gray-700 font-medium"
              input-class="text-gray-800"
            />
            <van-field
              v-model="registerForm.confirmPassword"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              type="password"
              :rules="[
                { required: true, message: '请确认密码' },
                { validator: validatePassword, message: '两次密码不一致' }
              ]"
              label-class="text-gray-700 font-medium"
              input-class="text-gray-800"
            />
            <van-field name="role" label="角色" label-class="text-gray-700 font-medium">
              <template #input>
                <van-radio-group v-model="registerForm.role" direction="horizontal">
                  <van-radio name="student">学生</van-radio>
                  <van-radio name="teacher">导师</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field
              v-if="registerForm.role === 'student'"
              v-model="registerForm.student_id"
              name="student_id"
              label="学号"
              placeholder="请输入学号"
              :rules="[{ required: true, message: '请填写学号' }]"
              label-class="text-gray-700 font-medium"
              input-class="text-gray-800"
            />
            <!-- 实验室选择 -->
            <van-field
              v-model="registerForm.laboratoryName"
              name="laboratory"
              label="所属实验室"
              placeholder="请选择实验室"
              readonly
              is-link
              @click="showLaboratoryPicker = true"
              :rules="[{ required: true, message: '请选择所属实验室' }]"
              label-class="text-gray-700 font-medium"
              input-class="text-gray-800"
            />

            <van-field
              v-model="registerForm.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              type="tel"
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
              {{ loading ? '注册中...' : '注册' }}
            </van-button>
          </view>
        </van-form>

        <!-- 错误提示 -->
        <view v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <text class="text-red-700 text-sm">{{ error }}</text>
        </view>

        <!-- 登录链接 -->
        <view class="mt-6 text-center">
          <text class="text-gray-600 text-sm">已有账户？</text>
          <text class="text-primary-500 text-sm ml-1" @tap="goToLogin">立即登录</text>
        </view>
      </view>
    </view>

    <!-- 实验室选择弹窗 -->
    <van-popup v-model:show="showLaboratoryPicker" position="bottom" round>
      <van-picker
        :columns="laboratoryColumns"
        @confirm="onLaboratoryConfirm"
        @cancel="showLaboratoryPicker = false"
        title="选择实验室"
      />
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { UserRole, supabase } from '@/utils/supabase'

const store = useStore()

const registerForm = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student' as UserRole,
  student_id: '',
  phone: '',
  laboratory_id: '',
  laboratoryName: ''
})

const loading = computed(() => store.getters.loading)
const error = computed(() => store.getters.error)

// 实验室选择相关
const showLaboratoryPicker = ref(false)
const laboratories = ref<any[]>([])
const laboratoryColumns = ref<any[]>([])

interface Laboratory {
  id: string
  name: string
  description?: string
}

// 获取实验室列表
const fetchLaboratories = async () => {
  try {
    const { data, error } = await supabase
      .from('laboratories')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    laboratories.value = data || []
    laboratoryColumns.value =
      data?.map((lab) => ({
        text: lab.name,
        value: lab.id
      })) || []
  } catch (error) {
    console.error('获取实验室列表失败:', error)
    uni.showToast({
      title: '获取实验室列表失败',
      icon: 'error'
    })
  }
}

// 实验室选择确认
const onLaboratoryConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0]
  if (selected) {
    registerForm.value.laboratory_id = selected.value
    registerForm.value.laboratoryName = selected.text
  }
  showLaboratoryPicker.value = false
}

const validatePassword = () => {
  return registerForm.value.password === registerForm.value.confirmPassword
}

const handleRegister = async () => {
  if (!validatePassword()) {
    uni.showToast({
      title: '两次密码不一致',
      icon: 'error'
    })
    return
  }

  if (!registerForm.value.laboratory_id) {
    uni.showToast({
      title: '请选择所属实验室',
      icon: 'error'
    })
    return
  }

  const { confirmPassword, laboratoryName, ...userData } = registerForm.value
  const result = await store.dispatch('register', userData)

  if (result.success) {
    uni.showToast({
      title: '注册成功',
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
      title: result.error || '注册失败',
      icon: 'error'
    })
  }
}

const goToLogin = () => {
  uni.navigateBack()
}

// 页面加载时获取实验室列表
onMounted(() => {
  fetchLaboratories()
})
</script>

<style scoped></style>
