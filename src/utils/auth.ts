import CryptoJS from 'crypto-js'

// 密码加密
export function hashPassword(password: string): string {
  // 使用 SHA-256 加密密码（与数据库格式匹配）
  return CryptoJS.SHA256(password).toString()
}

// 验证密码
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// 生成用户ID (UUID格式)
export function generateUserId(): string {
  // 生成UUID v4格式
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 验证用户名格式
export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (!username) {
    return { valid: false, message: '用户名不能为空' }
  }

  if (username.length < 3) {
    return { valid: false, message: '用户名至少3个字符' }
  }

  if (username.length > 20) {
    return { valid: false, message: '用户名不能超过20个字符' }
  }

  // 只允许字母、数字、下划线
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字和下划线' }
  }

  return { valid: true }
}

// 验证密码格式
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: '密码不能为空' }
  }

  if (password.length < 6) {
    return { valid: false, message: '密码至少6个字符' }
  }

  if (password.length > 50) {
    return { valid: false, message: '密码不能超过50个字符' }
  }

  return { valid: true }
}

// 验证邮箱格式
export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email) {
    return { valid: true } // 邮箱是可选的
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: '邮箱格式不正确' }
  }

  return { valid: true }
}

// 生成会话令牌
export function generateSessionToken(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 18)
}

// 会话存储键名
export const SESSION_KEYS = {
  USER: 'lab_user',
  TOKEN: 'lab_token',
  EXPIRES: 'lab_expires'
} as const

// 保存会话
export function saveSession(user: any, token: string, expiresIn: number = 24 * 60 * 60 * 1000) {
  const expires = Date.now() + expiresIn

  sessionStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user))
  sessionStorage.setItem(SESSION_KEYS.TOKEN, token)
  sessionStorage.setItem(SESSION_KEYS.EXPIRES, expires.toString())
}

// 获取会话
export function getSession(): { user: any; token: string; expires: number } | null {
  try {
    const userStr = sessionStorage.getItem(SESSION_KEYS.USER)
    const token = sessionStorage.getItem(SESSION_KEYS.TOKEN)
    const expiresStr = sessionStorage.getItem(SESSION_KEYS.EXPIRES)

    if (!userStr || !token || !expiresStr) {
      return null
    }

    const expires = parseInt(expiresStr)
    if (Date.now() > expires) {
      clearSession()
      return null
    }

    return {
      user: JSON.parse(userStr),
      token,
      expires
    }
  } catch {
    clearSession()
    return null
  }
}

// 清除会话
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEYS.USER)
  sessionStorage.removeItem(SESSION_KEYS.TOKEN)
  sessionStorage.removeItem(SESSION_KEYS.EXPIRES)
}

// 检查会话是否有效
export function isSessionValid(): boolean {
  const session = getSession()
  return session !== null
}
