import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { useAuthStore } from 'stores/auth'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`
})

export default boot(({ app, router }) => {

  // 🔐 Adiciona token automaticamente
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  // 🔄 Refresh automático
  api.interceptors.response.use(
    response => response,
    async error => {

      const originalRequest = error.config

      if (!error.response) {
        return Promise.reject(error)
      }

      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes('/refresh')
      ) {

        originalRequest._retry = true

        try {
          const refreshResponse = await api.post('/refresh')

          const newToken = refreshResponse.data.token

          const auth = useAuthStore()
          auth.setAuthData(newToken)

          originalRequest.headers.Authorization = `Bearer ${newToken}`

          return api(originalRequest)

        } catch (refreshError) {

          const auth = useAuthStore()
          auth.logout()

          router.replace('/login')

          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }