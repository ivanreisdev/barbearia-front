import { defineStore } from 'pinia'
import { api } from 'boot/axios'

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  fallback

const attachApiErrorMeta = (error, fallback) => {
  const message = getApiErrorMessage(error, fallback)
  const apiError = new Error(message)

  apiError.duracao = error?.response?.data?.duracao
  apiError.status = error?.response?.status
  apiError.raw = error

  return apiError
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,

    // carrega o user do localStorage (se existir)
    user: localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user'))
      : null,
  }),

  actions: {
    setAuthData(token, user = null) {
      this.token = token
      localStorage.setItem('token', token)

      if (user) {
        this.user = user
        localStorage.setItem('user', JSON.stringify(user))
      }
    },

    async login(email, password) {
      try {
        const { data } = await api.post('/login', { email, password })

        this.token = data.token
        localStorage.setItem('token', data.token)

        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))

        return true
      } catch (error) {
        throw attachApiErrorMeta(error, 'Credenciais inválidas')
      }
    },

    async registrar(payload) {
      try {
        const { data } = await api.post('/register', payload)

        this.token = data.token
        localStorage.setItem('token', data.token)

        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))

        return true
      } catch (error) {
        throw attachApiErrorMeta(error, 'Erro ao registrar usuário')
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
