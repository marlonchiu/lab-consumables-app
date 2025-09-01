<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <view class="bg-white px-5 py-4 border-b border-gray-100">
      <text class="text-lg font-semibold text-gray-800">采购申请</text>
      <text class="text-sm text-gray-600 mt-1 block">请填写完整的试剂采购信息</text>
    </view>

    <view class="bg-white mt-3 mx-4 rounded-2xl shadow-soft overflow-hidden">
      <!-- 表单内容 -->
      <van-form @submit="onSubmit">
        <van-cell-group>
          <van-field
            v-model="formData.reagentName"
            name="reagentName"
            label="试剂名称"
            placeholder="请输入试剂名称"
            :rules="[{ required: true, message: '请填写试剂名称' }]"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />
          <van-field
            v-model="formData.casNumber"
            name="casNumber"
            label="CAS号"
            placeholder="请输入CAS号"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />
          <van-field
            v-model="formData.specification"
            name="specification"
            label="规格型号"
            placeholder="请输入规格型号"
            :rules="[{ required: true, message: '请填写规格型号' }]"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />
          <van-field
            v-model="formData.quantity"
            name="quantity"
            label="申请数量"
            placeholder="请输入数量"
            type="number"
            :rules="[{ required: true, message: '请填写申请数量' }]"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />
          <van-field
            v-model="formData.unitPrice"
            name="unitPrice"
            label="预估单价(元)"
            placeholder="请输入预估单价"
            type="number"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />
          <van-field
            v-model="formData.purpose"
            name="purpose"
            label="使用目的"
            type="textarea"
            placeholder="请详细说明使用目的和实验方案"
            :rules="[{ required: true, message: '请填写使用目的' }]"
            rows="4"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />
          <van-field name="urgency" label="紧急程度" label-class="text-gray-700 font-medium">
            <template #input>
              <van-picker v-model="formData.urgency" :columns="urgencyOptions" @confirm="onUrgencyConfirm" />
            </template>
          </van-field>
        </van-cell-group>
      </van-form>
    </view>

    <!-- 提交按钮 -->
    <view class="p-5">
      <van-button
        round
        block
        type="primary"
        @click="onSubmit"
        class="!bg-primary-500 !border-primary-500 hover:!bg-primary-600 !h-12 !text-base !font-semibold"
      >
        提交申请
      </van-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const formData = reactive({
  reagentName: '',
  casNumber: '',
  specification: '',
  quantity: '',
  unitPrice: '',
  purpose: '',
  urgency: '普通'
})

const urgencyOptions = ['普通', '紧急', '非常紧急']

const onUrgencyConfirm = (value: string) => {
  formData.urgency = value
}

const onSubmit = (values: any) => {
  console.log('提交申请:', values)
  uni.showToast({
    title: '申请提交成功',
    icon: 'success'
  })

  // 提交成功后返回首页
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/index/index'
    })
  }, 1500)
}
</script>

<style scoped></style>
