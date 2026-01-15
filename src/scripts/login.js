import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

export default function useLogin() {

  const router = useRouter()
  const auth = useAuthStore()

  const email = ref('')
  const password = ref('')
  const telefone = ref('')
  const nome = ref('')
  const password_confirmation = ref('')

  // 🔑 Toggle Admin / Barbeiro
  const isAdmin = ref(false)

  // 🏪 Dados da barbearia (só admin)
  const nomeBarbearia = ref('')
  const enderecoBarbearia = ref('')

  const doLogin = async () => {
    try {
      await auth.login(email.value, password.value)
      router.push('/dashboard')
    } catch (err) {
      alert(err.message)
    }
  }

  const registrar = async () => {
    try {
      const payload = {
        nome: nome.value,
        email: email.value,
        telefone: telefone.value,
        password: password.value,
        password_confirmation: password.value,
        role: isAdmin.value ? 'admin' : 'barbeiro',
      }

      if (isAdmin.value) {
        payload.barbearia = {
          nome: nomeBarbearia.value,
          endereco: enderecoBarbearia.value,
        }
      }

      await auth.registrar(payload)
      router.push('/dashboard')
    } catch (err) {
      alert(err.message)
    }
  }



  return {
    email,
    password,
    password_confirmation,
    telefone,
    nome,
    isAdmin,
    nomeBarbearia,
    enderecoBarbearia,
    registrar,
    doLogin,
  }
}
