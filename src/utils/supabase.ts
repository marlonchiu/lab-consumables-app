import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 创建 Supabase 客户端，禁用 Auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  LABORATORIES: 'laboratories',
  REAGENTS: 'reagents',
  PURCHASE_REQUESTS: 'purchase_requests',
  APPROVALS: 'approvals',
  INVENTORY: 'inventory',
  USAGE_RECORDS: 'usage_records'
} as const

// 用户角色枚举
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

// 申请状态枚举
export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PURCHASED = 'purchased'
}

// 审批动作枚举
export enum ApprovalAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  RETURN = 'return'
}

// 库存状态枚举
export enum InventoryStatus {
  NORMAL = 'normal',
  EXPIRED = 'expired',
  LOW = 'low'
}
