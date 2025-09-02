import { createStore } from 'vuex'
import { supabase, UserRole } from '@/utils/supabase'
import {
  hashPassword,
  verifyPassword,
  generateUserId,
  validateUsername,
  validatePassword,
  validateEmail,
  generateSessionToken,
  saveSession,
  getSession,
  clearSession,
  isSessionValid
} from '@/utils/auth'

// 用户信息接口
export interface User {
  id: string
  username: string
  email?: string
  name: string
  role: UserRole
  laboratory_id?: string
  student_id?: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  last_login_at?: string
  laboratory?: {
    id: string
    name: string
  }
}

// Store 状态接口
export interface State {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  sessionToken: string | null
}

// 从 sessionStorage 获取用户信息
const getUserFromStorage = (): { user: User | null; token: string | null } => {
  const session = getSession()
  return {
    user: session?.user || null,
    token: session?.token || null
  }
}

// 保存用户信息到 sessionStorage
const saveUserToStorage = (user: User | null, token: string | null) => {
  if (user && token) {
    saveSession(user, token)
  } else {
    clearSession()
  }
}

export default createStore<State>({
  state: {
    user: getUserFromStorage().user,
    isAuthenticated: isSessionValid(),
    loading: false,
    error: null,
    sessionToken: getUserFromStorage().token
  },

  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.loading = loading
    },

    SET_ERROR(state, error: string | null) {
      state.error = error
    },

    SET_USER(state, { user, token }: { user: User; token: string }) {
      state.user = user
      state.isAuthenticated = true
      state.sessionToken = token
      saveUserToStorage(user, token)
    },

    CLEAR_USER(state) {
      state.user = null
      state.isAuthenticated = false
      state.sessionToken = null
      clearSession()
    }
  },

  actions: {
    // 登录
    async login({ commit }, { username, password }: { username: string; password: string }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        // 验证输入
        const usernameValidation = validateUsername(username)
        if (!usernameValidation.valid) {
          throw new Error(usernameValidation.message)
        }

        const passwordValidation = validatePassword(password)
        if (!passwordValidation.valid) {
          throw new Error(passwordValidation.message)
        }

        // 查询用户
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(
            `
            *,
            laboratory:laboratories(id, name)
          `
          )
          .eq('username', username)
          .eq('is_active', true)
          .single()

        if (userError || !userData) {
          throw new Error('用户名或密码错误')
        }

        // 验证密码
        const passwordHash = hashPassword(password)
        if (userData.password_hash !== passwordHash) {
          throw new Error('用户名或密码错误')
        }

        // 生成会话令牌
        const sessionToken = generateSessionToken()

        // 更新最后登录时间
        await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', userData.id)

        const user: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          laboratory_id: userData.laboratory_id,
          student_id: userData.student_id,
          phone: userData.phone,
          avatar_url: userData.avatar_url,
          is_active: userData.is_active,
          last_login_at: userData.last_login_at,
          laboratory: userData.laboratory
        }

        commit('SET_USER', { user, token: sessionToken })
        return { success: true, user }
      } catch (error: any) {
        commit('SET_ERROR', error.message || '登录失败')
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 注册
    async register(
      { commit },
      userData: {
        username: string
        password: string
        email?: string
        name: string
        role: UserRole
        laboratory_id?: string
        student_id?: string
        phone?: string
      }
    ) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        // 验证输入
        const usernameValidation = validateUsername(userData.username)
        if (!usernameValidation.valid) {
          throw new Error(usernameValidation.message)
        }

        const passwordValidation = validatePassword(userData.password)
        if (!passwordValidation.valid) {
          throw new Error(passwordValidation.message)
        }

        if (userData.email) {
          const emailValidation = validateEmail(userData.email)
          if (!emailValidation.valid) {
            throw new Error(emailValidation.message)
          }
        }

        // 检查用户名是否已存在
        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', userData.username)
          .single()

        if (existingUser) {
          throw new Error('用户名已存在')
        }

        // 生成用户ID和密码哈希
        const userId = generateUserId()
        const passwordHash = hashPassword(userData.password)

        // 创建用户记录
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            id: userId,
            username: userData.username,
            password_hash: passwordHash,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            laboratory_id: userData.laboratory_id,
            student_id: userData.student_id,
            phone: userData.phone,
            is_active: true
          })
          .select(
            `
            *,
            laboratory:laboratories(id, name)
          `
          )
          .single()

        if (userError) throw userError

        // 生成会话令牌
        const sessionToken = generateSessionToken()

        const user: User = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          laboratory_id: newUser.laboratory_id,
          student_id: newUser.student_id,
          phone: newUser.phone,
          avatar_url: newUser.avatar_url,
          is_active: newUser.is_active,
          laboratory: newUser.laboratory
        }

        commit('SET_USER', { user, token: sessionToken })
        return { success: true, user }
      } catch (error: any) {
        commit('SET_ERROR', error.message || '注册失败')
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 退出登录
    async logout({ commit }) {
      commit('SET_LOADING', true)

      try {
        commit('CLEAR_USER')
        return { success: true }
      } catch (error: any) {
        commit('SET_ERROR', error.message || '退出登录失败')
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 检查认证状态
    async checkAuth({ commit }) {
      const session = getSession()

      if (session && session.user) {
        // 验证会话是否有效
        if (Date.now() > session.expires) {
          commit('CLEAR_USER')
          return
        }

        // 从数据库获取最新用户信息
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select(
              `
              *,
              laboratory:laboratories(id, name)
            `
            )
            .eq('id', session.user.id)
            .eq('is_active', true)
            .single()

          if (!error && userData) {
            const user: User = {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              laboratory_id: userData.laboratory_id,
              student_id: userData.student_id,
              phone: userData.phone,
              avatar_url: userData.avatar_url,
              is_active: userData.is_active,
              last_login_at: userData.last_login_at,
              laboratory: userData.laboratory
            }
            commit('SET_USER', { user, token: session.token })
          } else {
            commit('CLEAR_USER')
          }
        } catch {
          commit('CLEAR_USER')
        }
      } else {
        commit('CLEAR_USER')
      }
    },

    // 提交采购申请
    async submitPurchaseRequest({ commit }, requestData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        const { data, error } = await supabase.from('purchase_requests').insert(requestData).select().single()

        if (error) throw error

        return { success: true, data }
      } catch (error: any) {
        commit('SET_ERROR', error.message || '提交申请失败')
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 获取采购申请列表
    async fetchPurchaseRequests({ commit }, { status, page = 1, pageSize = 10 }) {
      commit('SET_LOADING', true)

      try {
        let query = supabase
          .from('purchase_requests')
          .select(
            `
            *,
            reagent:reagents(id, name, cas_number),
            applicant:users!purchase_requests_applicant_id_fkey(id, name, role),
            laboratory:laboratories(id, name)
          `
          )
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1)

        if (status) {
          query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) throw error

        return { success: true, data: data || [] }
      } catch (error: any) {
        commit('SET_ERROR', error.message || '获取申请列表失败')
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 审批申请
    async approveRequest({ commit }, { requestId, status, comments, approverId }) {
      commit('SET_LOADING', true)

      try {
        // 创建审批记录
        const { error: approvalError } = await supabase.from('approvals').insert({
          request_id: requestId,
          approver_id: approverId,
          status,
          comments
        })

        if (approvalError) throw approvalError

        // 更新申请状态
        const { error: updateError } = await supabase.from('purchase_requests').update({ status }).eq('id', requestId)

        if (updateError) throw updateError

        return { success: true }
      } catch (error: any) {
        commit('SET_ERROR', error.message || '审批失败')
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 获取库存列表
    async fetchInventory({ commit }, { laboratoryId, page = 1, pageSize = 50 }) {
      commit('SET_LOADING', true)

      try {
        const { data, error } = await supabase
          .from('inventory')
          .select(
            `
            *,
            reagent:reagents(id, name, cas_number, category),
            laboratory:laboratories(id, name),
            created_by:users!inventory_created_by_fkey(id, name)
          `
          )
          .eq('laboratory_id', laboratoryId)
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1)

        if (error) throw error

        return { success: true, data: data || [] }
      } catch (error: any) {
        commit('SET_ERROR', error.message || '获取库存列表失败')
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },

  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    user: (state) => state.user,
    userRole: (state) => state.user?.role,
    isStudent: (state) => state.user?.role === UserRole.STUDENT,
    isTeacher: (state) => state.user?.role === UserRole.TEACHER,
    isAdmin: (state) => state.user?.role === UserRole.ADMIN,
    loading: (state) => state.loading,
    error: (state) => state.error
  }
})
