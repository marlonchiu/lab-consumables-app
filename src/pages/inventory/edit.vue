<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <van-nav-bar title="编辑库存" left-text="返回" left-arrow @click-left="goBack" class="nav-bar" />

    <!-- 加载状态 -->
    <view v-if="loading" class="flex justify-center items-center py-20">
      <van-loading size="24px">加载中...</van-loading>
    </view>

    <!-- 编辑表单 -->
    <view v-else-if="inventoryData" class="form-container p-4">
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group inset class="mx-0">
          <!-- 试剂信息（只读） -->
          <van-field
            :value="inventoryData.reagent?.name || '未知试剂'"
            name="reagentName"
            label="试剂名称"
            readonly
            label-class="text-gray-700 font-medium"
            input-class="text-gray-800"
          />

          <van-field
            :value="inventoryData.reagent?.cas_number || '无'"
            name="casNumber"
            label="CAS号"
            readonly
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
            @click="onShowDatePicker"
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
            @click="onShowPurchaseDatePicker"
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
          <van-button type="primary" native-type="submit" block :loading="submitting" class="submit-btn">
            {{ submitting ? '保存中...' : '保存修改' }}
          </van-button>
        </view>
      </van-form>
    </view>

    <!-- 数据不存在 -->
    <view v-else class="p-5">
      <van-empty description="库存记录不存在" />
    </view>

    <!-- 单位选择弹窗 -->
    <van-popup v-model:show="showUnitPicker" position="bottom" round>
      <van-picker :columns="unitColumns" @confirm="onUnitConfirm" @cancel="showUnitPicker = false" title="选择单位" />
    </van-popup>

    <!-- 日期选择弹窗 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        :model-value="currentDate"
        title="选择过期日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 采购日期选择弹窗 -->
    <van-popup v-model:show="showPurchaseDatePicker" position="bottom" round>
      <van-date-picker
        :model-value="currentPurchaseDate"
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

// 获取URL参数
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const inventoryId = currentPage.options?.id

const loading = ref(true)
const submitting = ref(false)
const inventoryData = ref(null)

const form = ref({
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

const showUnitPicker = ref(false)
const showDatePicker = ref(false)
const showPurchaseDatePicker = ref(false)
const currentDate = ref([])
const currentPurchaseDate = ref([])

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

// 获取库存详情
const fetchInventoryDetail = async () => {
  if (!inventoryId) {
    uni.showToast({ title: '缺少库存ID', icon: 'error' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  try {
    loading.value = true

    const { data, error } = await supabase
      .from('inventory')
      .select(
        `
        *,
        reagent:reagents(id, name, cas_number, molecular_formula),
        laboratory:laboratories(id, name)
      `
      )
      .eq('id', inventoryId)
      .single()

    if (error) throw error

    if (!data) {
      throw new Error('库存记录不存在')
    }

    inventoryData.value = data
    console.log('🚀 ~ fetchInventoryDetail ~ data:', data)

    // 填充表单数据
    form.value = {
      batchNumber: data.batch_number || '',
      quantity: data.quantity?.toString() || '',
      unit: data.unit || 'g',
      expiryDate: data.expiry_date || '',
      purchaseDate: data.purchase_date || '',
      purchasePrice: data.purchase_price?.toString() || '',
      location: data.location || '',
      minStockLevel: data.min_stock_level?.toString() || '0',
      notes: data.notes || ''
    }

    // 设置日期选择器的初始值
    if (data.expiry_date) {
      const expiry_date = form.value.expiryDate
      const year = new Date(expiry_date).getFullYear()
      const month = new Date(expiry_date).getMonth() + 1
      const day = new Date(expiry_date).getDate()
      currentDate.value = [year, month, day]
    }
    if (data.purchase_date) {
      const expiry_date = form.value.purchaseDate
      const year = new Date(expiry_date).getFullYear()
      const month = new Date(expiry_date).getMonth() + 1
      const day = new Date(expiry_date).getDate()
      currentPurchaseDate.value = [year, month, day]
    }
  } catch (error) {
    console.error('获取库存详情失败:', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}

const onUnitConfirm = ({ selectedOptions }) => {
  form.value.unit = selectedOptions[0]?.value || 'g'
  showUnitPicker.value = false
}

const onShowDatePicker = () => {
  // const expiry_date = form.value.expiryDate
  // const year = new Date(expiry_date).getFullYear()
  // const month = new Date(expiry_date).getMonth() + 1
  // const day = new Date(expiry_date).getDate()
  // currentDate.value = [year, month, day]
  showDatePicker.value = true
}

const onDateConfirm = ({ selectedValues }) => {
  form.value.expiryDate = selectedValues.join('-')
  showDatePicker.value = false
}

const onShowPurchaseDatePicker = () => {
  // const purchase_date = form.value.purchaseDate
  // const year = new Date(purchase_date).getFullYear()
  // const month = new Date(purchase_date).getMonth() + 1
  // const day = new Date(purchase_date).getDate()
  // currentPurchaseDate.value = [year, month, day]
  showPurchaseDatePicker.value = true
}

const onPurchaseDateConfirm = ({ selectedValues }) => {
  form.value.purchaseDate = selectedValues.join('-')
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

  submitting.value = true

  try {
    const { error } = await supabase
      .from('inventory')
      .update({
        batch_number: form.value.batchNumber || null,
        quantity: parseFloat(form.value.quantity),
        unit: form.value.unit,
        expiry_date: form.value.expiryDate || null,
        purchase_date: form.value.purchaseDate || null,
        purchase_price: form.value.purchasePrice ? parseFloat(form.value.purchasePrice) : null,
        location: form.value.location,
        min_stock_level: parseFloat(form.value.minStockLevel || '0'),
        notes: form.value.notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryId)

    if (error) throw error

    uni.showToast({
      title: '修改成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('修改库存失败:', error)
    uni.showToast({
      title: '修改失败，请重试',
      icon: 'error'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchInventoryDetail()
})
</script>

<style scoped>
.submit-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}
</style>
