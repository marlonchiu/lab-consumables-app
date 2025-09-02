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
          <!-- 试剂选择 -->
          <van-field
            v-model="formData.reagentName"
            name="reagentName"
            label="试剂名称"
            placeholder="请选择试剂"
            :rules="[{ required: true, message: '请选择试剂' }]"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
            is-link
            readonly
            @click="showReagentPicker = true"
          />

          <!-- CAS号（自动填充） -->
          <van-field
            v-model="formData.casNumber"
            name="casNumber"
            label="CAS号"
            placeholder="选择试剂后自动填充"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
            readonly
          />

          <!-- 申请数量 -->
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

          <!-- 单位选择 -->
          <van-field
            v-model="formData.unit"
            name="unit"
            label="单位"
            placeholder="请选择单位"
            :rules="[{ required: true, message: '请选择单位' }]"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
            is-link
            readonly
            @click="showUnitPicker = true"
          />

          <!-- 预估单价 -->
          <van-field
            v-model="formData.unitPrice"
            name="unitPrice"
            label="预估单价(元)"
            placeholder="请输入预估单价"
            type="number"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 使用目的 -->
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

          <!-- 紧急程度 -->
          <van-field
            v-model="formData.urgency"
            name="urgency"
            label="紧急程度"
            label-class="text-gray-700 font-medium"
            is-link
            readonly
            placeholder="点击选择紧急程度"
            @click="showPicker = true"
          />

          <!-- 供应商偏好 -->
          <van-field
            v-model="formData.supplierPreference"
            name="supplierPreference"
            label="供应商偏好"
            placeholder="请输入偏好的供应商（可选）"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 备注 -->
          <van-field
            v-model="formData.notes"
            name="notes"
            label="备注"
            type="textarea"
            placeholder="其他说明（可选）"
            rows="2"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />
        </van-cell-group>
      </van-form>
    </view>

    <!-- 提交按钮 -->
    <view class="p-5">
      <van-button
        round
        block
        type="primary"
        :loading="loading"
        @click="onSubmit"
        class="!bg-primary-500 !border-primary-500 hover:!bg-primary-600 !h-12 !text-base !font-semibold"
      >
        {{ loading ? '提交中...' : '提交申请' }}
      </van-button>
    </view>

    <!-- 试剂选择弹窗 -->
    <van-popup v-model:show="showReagentPicker" destroy-on-close position="bottom">
      <van-picker
        :columns="reagentOptions"
        :columns-field-names="reagentFieldName"
        @confirm="onReagentConfirm"
        @cancel="showReagentPicker = false"
        title="选择试剂"
      />
    </van-popup>

    <!-- 单位选择弹窗 -->
    <van-popup v-model:show="showUnitPicker" destroy-on-close position="bottom">
      <van-picker
        :columns="unitOptions"
        :columns-field-names="unitFieldName"
        @confirm="onUnitConfirm"
        @cancel="showUnitPicker = false"
        title="选择单位"
      />
    </van-popup>

    <!-- 紧急程度选择弹窗 -->
    <van-popup v-model:show="showPicker" destroy-on-close position="bottom">
      <van-picker
        :model-value="pickerValue"
        :columns="urgencyOptions"
        :columns-field-names="urgencyFieldName"
        @confirm="onUrgencyConfirm"
        @cancel="showPicker = false"
        title="选择紧急程度"
      />
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '@/utils/supabase'

const store = useStore()
const user = store.state.user

const formData = reactive({
  reagentId: '',
  reagentName: '',
  casNumber: '',
  specification: '',
  quantity: '',
  unit: 'g',
  unitPrice: '',
  purpose: '',
  urgency: 'normal',
  supplierPreference: '',
  notes: ''
})

const loading = ref(false)
const showPicker = ref(false)
const showReagentPicker = ref(false)
const showUnitPicker = ref(false)
const pickerValue = ref(['normal'])

// 试剂列表
const reagents = ref([])
const reagentOptions = ref([])

// 紧急程度选项
const urgencyOptions = [
  { key: 'low', name: '普通' },
  { key: 'normal', name: '一般' },
  { key: 'high', name: '紧急' }
]

// 单位选项
const unitOptions = [
  { key: 'g', name: '克(g)' },
  { key: 'kg', name: '千克(kg)' },
  { key: 'mL', name: '毫升(mL)' },
  { key: 'L', name: '升(L)' },
  { key: 'mg', name: '毫克(mg)' },
  { key: 'μg', name: '微克(μg)' },
  { key: 'mol', name: '摩尔(mol)' },
  { key: 'mmol', name: '毫摩尔(mmol)' }
]

const urgencyFieldName = { text: 'name', value: 'key' }
const reagentFieldName = { text: 'name', value: 'id' }
const unitFieldName = { text: 'name', value: 'key' }

// 获取试剂列表
const fetchReagents = async () => {
  try {
    const { data, error } = await supabase
      .from('reagents')
      .select('id, name, cas_number, molecular_formula')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    reagents.value = data || []
    reagentOptions.value =
      data?.map((reagent) => ({
        id: reagent.id,
        name: `${reagent.name} (${reagent.cas_number || 'N/A'})`
      })) || []
  } catch (error) {
    console.error('获取试剂列表失败:', error)
    uni.showToast({
      title: '获取试剂列表失败',
      icon: 'error'
    })
  }
}

const onUrgencyConfirm = ({ selectedValues, selectedOptions }) => {
  formData.urgency = selectedOptions[0]?.key || 'normal'
  pickerValue.value = selectedValues
  showPicker.value = false
}

const onReagentConfirm = ({ selectedValues, selectedOptions }) => {
  const selectedReagent = selectedOptions[0]
  if (selectedReagent) {
    formData.reagentId = selectedReagent.id
    formData.reagentName = selectedReagent.name

    // 自动填充CAS号
    const reagent = reagents.value.find((r) => r.id === selectedReagent.id)
    if (reagent) {
      formData.casNumber = reagent.cas_number || ''
    }
  }
  showReagentPicker.value = false
}

const onUnitConfirm = ({ selectedValues, selectedOptions }) => {
  formData.unit = selectedOptions[0]?.key || 'g'
  showUnitPicker.value = false
}

const onSubmit = async (values: any) => {
  if (!user) {
    uni.showToast({
      title: '请先登录',
      icon: 'error'
    })
    return
  }

  if (!formData.reagentId) {
    uni.showToast({
      title: '请选择试剂',
      icon: 'error'
    })
    return
  }

  loading.value = true

  try {
    // 计算预估费用
    const estimatedCost = formData.unitPrice ? parseFloat(formData.quantity) * parseFloat(formData.unitPrice) : null

    const { data, error } = await supabase
      .from('purchase_requests')
      .insert({
        reagent_id: formData.reagentId,
        applicant_id: user.id,
        laboratory_id: user.laboratory_id,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        urgency_level: formData.urgency,
        reason: formData.purpose,
        estimated_cost: estimatedCost,
        supplier_preference: formData.supplierPreference || null,
        notes: formData.notes || null,
        status: 'pending'
      })
      .select()

    if (error) throw error

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
  } catch (error) {
    console.error('提交申请失败:', error)
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReagents()
})
</script>

<style scoped></style>
