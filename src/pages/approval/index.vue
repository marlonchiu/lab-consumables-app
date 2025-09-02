<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <view class="bg-white px-5 py-4 border-b border-gray-100">
      <text class="text-lg font-semibold text-gray-800">审批中心</text>
      <text class="text-sm text-gray-600 mt-1 block">处理试剂采购申请审批</text>
    </view>

    <!-- 权限检查 -->
    <view v-if="!canApprove" class="p-5">
      <van-empty description="您没有审批权限" />
    </view>

    <!-- 主要内容 -->
    <view v-else>
      <!-- 下拉刷新 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 待审批标题 -->
        <view class="section-title p-5 pb-2">
          <text class="text-base font-semibold text-gray-800">待我审批 ({{ pendingList.length }})</text>
        </view>

        <!-- 待审批列表 -->
        <view class="px-4">
          <view v-if="pendingList.length === 0 && !loading" class="text-center py-10">
            <van-empty description="暂无待审批申请" />
          </view>

          <view
            v-for="item in pendingList"
            :key="item.id"
            class="list-item bg-white mb-3 p-5 rounded-2xl shadow-soft border-l-4 border-accent-400"
            @tap="viewDetail(item)"
          >
            <view class="item-header flex justify-between items-center mb-3">
              <text class="item-title text-base font-semibold text-gray-800">{{
                item.reagent?.name || '未知试剂'
              }}</text>
              <view class="status-badge bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-xs font-medium">
                待审批
              </view>
            </view>
            <view class="item-details text-sm text-gray-600 leading-relaxed mb-3">
              <text
                >申请人: {{ item.applicant?.name || '未知' }} | 数量: {{ item.quantity }}{{ item.unit }} | 预算: ¥{{
                  item.estimated_cost || '未填写'
                }}</text
              >
              <text class="block mt-1">用途: {{ item.reason || '未填写' }}</text>
            </view>
            <view class="item-meta flex justify-between text-xs text-gray-500">
              <text>申请时间: {{ formatDate(item.created_at) }}</text>
              <view class="flex items-center">
                <view class="w-2 h-2 rounded-full mr-1" :class="getUrgencyColor(item.urgency_level)"></view>
                <text>{{ getUrgencyText(item.urgency_level) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 已审批标题 -->
        <view class="section-title p-5 pb-2 pt-8">
          <text class="text-base font-semibold text-gray-800">最近已审批</text>
        </view>

        <!-- 已审批列表 -->
        <view class="px-4 pb-20">
          <view v-if="approvedList.length === 0 && !loading" class="text-center py-10">
            <van-empty description="暂无审批记录" />
          </view>

          <view
            v-for="item in approvedList"
            :key="item.id"
            class="list-item bg-white mb-3 p-5 rounded-2xl shadow-soft border-l-4"
            :class="item.status === 'approved' ? 'border-green-400' : 'border-red-400'"
          >
            <view class="item-header flex justify-between items-center mb-3">
              <text class="item-title text-base font-semibold text-gray-800">{{
                item.request?.reagent?.name || '未知试剂'
              }}</text>
              <view
                class="status-badge px-3 py-1 rounded-full text-xs font-medium"
                :class="item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ item.status === 'approved' ? '已批准' : '已拒绝' }}
              </view>
            </view>
            <view class="item-details text-sm text-gray-600 mb-3">
              <text
                >申请人: {{ item.request?.applicant?.name || '未知' }} | 数量: {{ item.request?.quantity
                }}{{ item.request?.unit }}</text
              >
              <text v-if="item.comments" class="block mt-1">审批意见: {{ item.comments }}</text>
            </view>
            <view class="item-meta flex justify-between text-xs text-gray-500">
              <text>审批时间: {{ formatDate(item.created_at) }}</text>
              <text>审批人: {{ item.approver?.name || '我' }}</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore" class="text-center py-4">
          <van-loading v-if="loadingMore" size="20px">加载中...</van-loading>
          <text v-else class="text-gray-500 text-sm" @tap="loadMore">点击加载更多</text>
        </view>
      </van-pull-refresh>
    </view>

    <!-- 审批详情弹窗 -->
    <van-popup v-model:show="showDetail" position="bottom" round :style="{ height: '80%' }">
      <view class="approval-detail p-5">
        <view class="detail-header flex justify-between items-center mb-5">
          <text class="text-lg font-semibold">审批详情</text>
          <van-icon name="cross" size="20" @click="showDetail = false" />
        </view>

        <view v-if="selectedItem" class="detail-content">
          <!-- 申请信息 -->
          <view class="info-section mb-5">
            <text class="section-title text-base font-semibold mb-3 block">申请信息</text>
            <view class="info-item mb-2">
              <text class="label">试剂名称：</text>
              <text class="value">{{ selectedItem.reagent?.name }}</text>
            </view>
            <view class="info-item mb-2">
              <text class="label">申请人：</text>
              <text class="value">{{ selectedItem.applicant?.name }}</text>
            </view>
            <view class="info-item mb-2">
              <text class="label">申请数量：</text>
              <text class="value">{{ selectedItem.quantity }}{{ selectedItem.unit }}</text>
            </view>
            <view class="info-item mb-2">
              <text class="label">预估费用：</text>
              <text class="value">¥{{ selectedItem.estimated_cost || '未填写' }}</text>
            </view>
            <view class="info-item mb-2">
              <text class="label">申请理由：</text>
              <text class="value">{{ selectedItem.reason }}</text>
            </view>
          </view>

          <!-- 审批操作 -->
          <view class="approval-actions">
            <text class="section-title text-base font-semibold mb-3 block">审批操作</text>

            <!-- 审批意见 -->
            <van-field
              v-model="approvalComment"
              type="textarea"
              placeholder="请输入审批意见（可选）"
              rows="3"
              maxlength="200"
              show-word-limit
              class="mb-4"
            />

            <!-- 操作按钮 -->
            <view class="flex gap-3">
              <van-button type="danger" block :loading="approving" @click="handleApproval('rejected')">
                拒绝
              </van-button>
              <van-button type="primary" block :loading="approving" @click="handleApproval('approved')">
                批准
              </van-button>
            </view>
          </view>
        </view>
      </view>
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '@/utils/supabase'

const store = useStore()
const user = store.state.user

// 权限检查
const canApprove = computed(() => {
  return user && (user.role === 'teacher' || user.role === 'admin')
})

// 状态管理
const loading = ref(false)
const refreshing = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const approving = ref(false)

// 列表数据
const pendingList = ref([])
const approvedList = ref([])
const currentPage = ref(1)
const pageSize = 10

// 弹窗状态
const showDetail = ref(false)
const selectedItem = ref(null)
const approvalComment = ref('')

// 获取待审批列表
const fetchPendingRequests = async (page = 1, isRefresh = false) => {
  if (!canApprove.value) return

  try {
    loading.value = true

    const { data, error } = await supabase
      .from('purchase_requests')
      .select(
        `
        *,
        reagent:reagents(id, name, cas_number),
        applicant:users!purchase_requests_applicant_id_fkey(id, name, role),
        laboratory:laboratories(id, name)
      `
      )
      .eq('status', 'pending')
      .eq('laboratory_id', user.laboratory_id) // 只显示本实验室的申请
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) throw error

    if (isRefresh || page === 1) {
      pendingList.value = data || []
    } else {
      pendingList.value.push(...(data || []))
    }

    hasMore.value = (data?.length || 0) === pageSize
  } catch (error) {
    console.error('获取待审批列表失败:', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 获取已审批列表
const fetchApprovedRequests = async () => {
  if (!canApprove.value) return

  try {
    const { data, error } = await supabase
      .from('approvals')
      .select(
        `
        *,
        request:purchase_requests(
          *,
          reagent:reagents(id, name),
          applicant:users!purchase_requests_applicant_id_fkey(id, name)
        ),
        approver:users!approvals_approver_id_fkey(id, name)
      `
      )
      .eq('approver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    approvedList.value = data || []
  } catch (error) {
    console.error('获取已审批列表失败:', error)
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  currentPage.value = 1
  await Promise.all([fetchPendingRequests(1, true), fetchApprovedRequests()])
  refreshing.value = false
}

// 加载更多
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  currentPage.value++
  await fetchPendingRequests(currentPage.value)
  loadingMore.value = false
}

// 查看详情
const viewDetail = (item: any) => {
  selectedItem.value = item
  approvalComment.value = ''
  showDetail.value = true
}

// 处理审批
const handleApproval = async (status: 'approved' | 'rejected') => {
  if (!selectedItem.value) return

  approving.value = true

  try {
    // 创建审批记录
    const { error: approvalError } = await supabase.from('approvals').insert({
      request_id: selectedItem.value.id,
      approver_id: user.id,
      status,
      comments: approvalComment.value || null,
      approved_quantity: status === 'approved' ? selectedItem.value.quantity : null,
      approved_cost: status === 'approved' ? selectedItem.value.estimated_cost : null
    })

    if (approvalError) throw approvalError

    // 更新申请状态
    const { error: updateError } = await supabase
      .from('purchase_requests')
      .update({ status })
      .eq('id', selectedItem.value.id)

    if (updateError) throw updateError

    uni.showToast({
      title: status === 'approved' ? '审批通过' : '审批拒绝',
      icon: 'success'
    })

    showDetail.value = false

    // 刷新列表
    await onRefresh()
  } catch (error) {
    console.error('审批失败:', error)
    uni.showToast({
      title: '审批失败，请重试',
      icon: 'error'
    })
  } finally {
    approving.value = false
  }
}

// 工具函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getUrgencyText = (level: string) => {
  const map = {
    low: '普通',
    normal: '一般',
    high: '紧急'
  }
  return map[level] || '普通'
}

const getUrgencyColor = (level: string) => {
  const map = {
    low: 'bg-gray-400',
    normal: 'bg-blue-400',
    high: 'bg-red-400'
  }
  return map[level] || 'bg-gray-400'
}

onMounted(() => {
  if (canApprove.value) {
    fetchPendingRequests()
    fetchApprovedRequests()
  }
})
</script>

<style scoped>
.list-item {
  transition: all 0.3s ease;
}

.list-item:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
