import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

export default function useLogin() {
  const router = useRouter()
  const auth = useAuthStore()

  const email = ref('')
  const password = ref('')

  const doLogin = async () => {
    try {
      await auth.login(email.value, password.value)
      router.push('/dashboard')
    } catch (err) {
      alert(err.message)
    }
  }

  return {
    email,
    password,
    doLogin
  }
}
