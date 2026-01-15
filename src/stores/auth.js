import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,

    // carrega o user do localStorage (se existir)
    user: localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user'))
      : null
  }),

  actions: {
    async login(email, password) {
      try {
        const { data } = await api.post('/login', { email, password })

        // salva token
        this.token = data.token
        localStorage.setItem('token', data.token)

        // salva user
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))

        return true
      } catch {
        throw new Error('Credenciais inválidas')
      }
    },

     async registrar(payload) {
  try {
    const { data } = await api.post('/register', payload)

this.token = data.token
        localStorage.setItem('token', data.token)

        // salva user
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))

        return true
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || 'Erro ao registrar usuário'
    )
  }
},

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
