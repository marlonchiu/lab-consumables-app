<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <van-nav-bar
      title="添加库存"
      left-text="返回"
      left-arrow
      @click-left="goBack"
      class="nav-bar"
    />

    <!-- 添加表单 -->
    <view class="form-container p-5">
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group inset>
          <!-- 试剂选择 -->
          <van-field
            v-model="form.reagentName"
            name="reagent"
            label="试剂名称"
            placeholder="请选择试剂"
            readonly
            is-link
            @click="showReagentPicker = true"
            :rules="[{ required: true, message: '请选择试剂' }]"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 批次号 -->
          <van-field
            v-model="form.batchNumber"
            name="batchNumber"
            label="批次号"
            placeholder="请输入批次号"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 数量 -->
          <van-field
            v-model="form.quantity"
            name="quantity"
            label="数量"
            placeholder="请输入数量"
            type="number"
            :rules="[
              { required: true, message: '请填写数量' },
              { pattern: /^[0-9]+(\.[0-9]+)?$/, message: '请输入有效数字' }
            ]"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 单位 -->
          <van-field
            v-model="form.unit"
            name="unit"
            label="单位"
            placeholder="请选择单位"
            readonly
            is-link
            @click="showUnitPicker = true"
            :rules="[{ required: true, message: '请选择单位' }]"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 过期日期 -->
          <van-field
            v-model="form.expiryDate"
            name="expiryDate"
            label="过期日期"
            placeholder="请选择过期日期"
            readonly
            is-link
            @click="showDatePicker = true"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 采购日期 -->
          <van-field
            v-model="form.purchaseDate"
            name="purchaseDate"
            label="采购日期"
            placeholder="请选择采购日期"
            readonly
            is-link
            @click="showPurchaseDatePicker = true"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 采购价格 -->
          <van-field
            v-model="form.purchasePrice"
            name="purchasePrice"
            label="采购价格"
            placeholder="请输入采购价格（元）"
            type="number"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 存放位置 -->
          <van-field
            v-model="form.location"
            name="location"
            label="存放位置"
            placeholder="请输入存放位置"
            :rules="[{ required: true, message: '请填写存放位置' }]"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 最低库存 -->
          <van-field
            v-model="form.minStockLevel"
            name="minStockLevel"
            label="最低库存"
            placeholder="请输入最低库存警戒值"
            type="number"
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <!-- 备注 -->
          <van-field
            v-model="form.notes"
            name="notes"
            label="备注"
            placeholder="其他说明（可选）"
            type="textarea"
            rows="2"
            maxlength="200"
            show-word-limit
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />
        </van-cell-group>

        <!-- 提交按钮 -->
        <view class="submit-container mt-5">
          <van-button
            type="primary"
            native-type="submit"
            block
            :loading="submitting"
            class="submit-btn"
          >
            {{ submitting ? '添加中...' : '添加库存' }}
          </van-button>
        </view>
      </van-form>
    </view>

    <!-- 试剂选择弹窗 -->
    <van-popup v-model:show="showReagentPicker" position="bottom" round>
      <van-picker
        :columns="reagentColumns"
        @confirm="onReagentConfirm"
        @cancel="showReagentPicker = false"
        title="选择试剂"
      />
    </van-popup>

    <!-- 单位选择弹窗 -->
    <van-popup v-model:show="showUnitPicker" position="bottom" round>
      <van-picker
        :columns="unitColumns"
        @confirm="onUnitConfirm"
        @cancel="showUnitPicker = false"
        title="选择单位"
      />
    </van-popup>

    <!-- 日期选择弹窗 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择过期日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 采购日期选择弹窗 -->
    <van-popup v-model:show="showPurchaseDatePicker" position="bottom" round>
      <van-datetime-picker
        v-model="currentPurchaseDate"
        type="date"
        title="选择采购日期"
        @confirm="onPurchaseDateConfirm"
        @cancel="showPurchaseDatePicker = false"
      />
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '@/utils/supabase'

const store = useStore()
const user = store.state.user

const form = ref({
  reagentId: '',
  reagentName: '',
  batchNumber: '',
  quantity: '',
  unit: 'g',
  expiryDate: '',
  purchaseDate: '',
  purchasePrice: '',
  location: '',
  minStockLevel: '0',
  notes: ''
})

const submitting = ref(false)
const showReagentPicker = ref(false)
const showUnitPicker = ref(false)
const showDatePicker = ref(false)
const showPurchaseDatePicker = ref(false)
const currentDate = ref(new Date())
const currentPurchaseDate = ref(new Date())

// 试剂列表
const reagents = ref([])
const reagentColumns = ref([])

// 单位选项
const unitColumns = [
  { text: '克(g)', value: 'g' },
  { text: '千克(kg)', value: 'kg' },
  { text: '毫升(mL)', value: 'mL' },
  { text: '升(L)', value: 'L' },
  { text: '毫克(mg)', value: 'mg' },
  { text: '微克(μg)', value: 'μg' },
  { text: '摩尔(mol)', value: 'mol' },
  { text: '毫摩尔(mmol)', value: 'mmol' }
]

// 获取试剂列表
const fetchReagents = async () => {
  try {
    const { data, error } = await supabase
      .from('reagents')
      .select('id, name, cas_number')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    reagents.value = data || []
    reagentColumns.value = data?.map(reagent => ({
      text: `${reagent.name} (${reagent.cas_number || 'N/A'})`,
      value: reagent.id
    })) || []
  } catch (error) {
    console.error('获取试剂列表失败:', error)
  }
}

const goBack = () => {
  uni.navigateBack()
}

const onReagentConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0]
  if (selected) {
    form.value.reagentId = selected.value
    form.value.reagentName = selected.text
  }
  showReagentPicker.value = false
}

const onUnitConfirm = ({ selectedOptions }) => {
  form.value.unit = selectedOptions[0]?.value || 'g'
  showUnitPicker.value = false
}

const onDateConfirm = () => {
  form.value.expiryDate = currentDate.value.toISOString().split('T')[0]
  showDatePicker.value = false
}

const onPurchaseDateConfirm = () => {
  form.value.purchaseDate = currentPurchaseDate.value.toISOString().split('T')[0]
  showPurchaseDatePicker.value = false
}

const handleSubmit = async () => {
  if (!user) {
    uni.showToast({
      title: '请先登录',
      icon: 'error'
    })
    return
  }

  if (!form.value.reagentId) {
    uni.showToast({
      title: '请选择试剂',
      icon: 'error'
    })
    return
  }

  submitting.value = true

  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        reagent_id: form.value.reagentId,
        laboratory_id: user.laboratory_id,
        batch_number: form.value.batchNumber || null,
        quantity: parseFloat(form.value.quantity),
        unit: form.value.unit,
        expiry_date: form.value.expiryDate || null,
        purchase_date: form.value.purchaseDate || null,
        purchase_price: form.value.purchasePrice ? parseFloat(form.value.purchasePrice) : null,
        location: form.value.location,
        min_stock_level: parseFloat(form.value.minStockLevel || '0'),
        notes: form.value.notes || null,
        created_by: user.id
      })
      .select()

    if (error) throw error

    uni.showToast({
      title: '添加成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)

  } catch (error) {
    console.error('添加库存失败:', error)
    uni.showToast({
      title: '添加失败，请重试',
      icon: 'error'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchReagents()
})
</script>

<style scoped>
.submit-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}
</style>
