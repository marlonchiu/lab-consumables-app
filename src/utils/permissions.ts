import { UserRole } from './supabase'

// 权限定义
export const PERMISSIONS = {
  // 库存管理权限
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',
  INVENTORY_ADD: 'inventory:add',
  INVENTORY_EDIT: 'inventory:edit',
  INVENTORY_DELETE: 'inventory:delete',

  // 申请权限
  REQUEST_CREATE: 'request:create',
  REQUEST_VIEW_OWN: 'request:view:own',
  REQUEST_VIEW_ALL: 'request:view:all',
  REQUEST_APPROVE: 'request:approve',

  // 审批权限
  APPROVAL_VIEW: 'approval:view',
  APPROVAL_PROCESS: 'approval:process',

  // 使用记录权限
  USAGE_CREATE: 'usage:create',
  USAGE_VIEW_OWN: 'usage:view:own',
  USAGE_VIEW_ALL: 'usage:view:all',

  // 用户管理权限
  USER_VIEW: 'user:view',
  USER_MANAGE: 'user:manage',

  // 系统管理权限
  SYSTEM_SETTINGS: 'system:settings',
  DATA_EXPORT: 'data:export',

  // 统计权限
  STATS_VIEW_OWN: 'stats:view:own',
  STATS_VIEW_LAB: 'stats:view:lab',
  STATS_VIEW_ALL: 'stats:view:all'
} as const

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.STUDENT]: [
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REQUEST_CREATE,
    PERMISSIONS.REQUEST_VIEW_OWN,
    PERMISSIONS.USAGE_CREATE,
    PERMISSIONS.USAGE_VIEW_OWN,
    PERMISSIONS.STATS_VIEW_OWN
  ],

  [UserRole.TEACHER]: [
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REQUEST_VIEW_ALL,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.APPROVAL_PROCESS,
    PERMISSIONS.REQUEST_APPROVE,
    PERMISSIONS.USAGE_VIEW_ALL,
    PERMISSIONS.STATS_VIEW_LAB
  ],

  [UserRole.ADMIN]: [
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.INVENTORY_ADD,
    PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.INVENTORY_DELETE,
    PERMISSIONS.REQUEST_VIEW_ALL,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.APPROVAL_PROCESS,
    PERMISSIONS.REQUEST_APPROVE,
    PERMISSIONS.USAGE_VIEW_ALL,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.STATS_VIEW_ALL
  ]
}

// 检查用户是否有指定权限
export function hasPermission(userRole: UserRole | undefined, permission: string): boolean {
  if (!userRole) return false
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

// 检查用户是否有任一权限
export function hasAnyPermission(userRole: UserRole | undefined, permissions: string[]): boolean {
  if (!userRole) return false
  return permissions.some(permission => hasPermission(userRole, permission))
}

// 检查用户是否有所有权限
export function hasAllPermissions(userRole: UserRole | undefined, permissions: string[]): boolean {
  if (!userRole) return false
  return permissions.every(permission => hasPermission(userRole, permission))
}

// 获取用户所有权限
export function getUserPermissions(userRole: UserRole | undefined): string[] {
  if (!userRole) return []
  return ROLE_PERMISSIONS[userRole] || []
}

// 页面访问权限配置
export const PAGE_PERMISSIONS = {
  '/pages/index/index': [], // 首页所有人都可以访问
  '/pages/purchase/index': [PERMISSIONS.REQUEST_CREATE],
  '/pages/approval/index': [PERMISSIONS.APPROVAL_VIEW],
  '/pages/inventory/index': [PERMISSIONS.INVENTORY_VIEW],
  '/pages/profile/index': [], // 个人中心所有人都可以访问
  '/pages/admin/users': [PERMISSIONS.USER_MANAGE],
  '/pages/admin/settings': [PERMISSIONS.SYSTEM_SETTINGS]
} as const

// 检查页面访问权限
export function canAccessPage(userRole: UserRole | undefined, pagePath: string): boolean {
  const requiredPermissions = PAGE_PERMISSIONS[pagePath as keyof typeof PAGE_PERMISSIONS]
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true // 没有权限要求的页面所有人都可以访问
  }
  return hasAnyPermission(userRole, requiredPermissions)
}

// 根据角色过滤菜单项
export function filterMenuByRole(userRole: UserRole | undefined) {
  const baseMenu = [
    { path: '/pages/index/index', name: '首页', icon: '🏠' },
    { path: '/pages/inventory/index', name: '库存', icon: '📦' },
    { path: '/pages/profile/index', name: '我的', icon: '👤' }
  ]

  const studentMenu = [
    ...baseMenu,
    { path: '/pages/purchase/index', name: '申请', icon: '📝' }
  ]

  const teacherMenu = [
    ...baseMenu,
    { path: '/pages/approval/index', name: '审批', icon: '✅' }
  ]

  const adminMenu = [
    ...baseMenu,
    { path: '/pages/purchase/index', name: '申请', icon: '📝' },
    { path: '/pages/approval/index', name: '审批', icon: '✅' },
    { path: '/pages/admin/users', name: '用户管理', icon: '👥' },
    { path: '/pages/admin/settings', name: '系统设置', icon: '⚙️' }
  ]

  switch (userRole) {
    case UserRole.STUDENT:
      return studentMenu
    case UserRole.TEACHER:
      return teacherMenu
    case UserRole.ADMIN:
      return adminMenu
    default:
      return baseMenu
  }
}
