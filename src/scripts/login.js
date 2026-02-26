import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'

export default function useLogin() {

  const router = useRouter()
  const route = useRoute()
  const auth = useAuthStore()

  const email = ref('')
  const password = ref('')
  const telefone = ref('')
  const nome = ref('')
  const password_confirmation = ref('')
  const codigoVinculacao = ref(String(route.query.codigo || ''))

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

  watch(
    () => route.query.codigo,
    (novoCodigo) => {
      if (!isAdmin.value) {
        codigoVinculacao.value = String(novoCodigo || '')
      }
    }
  )

  const registrar = async () => {
    try {
      const nomeValue = String(nome.value || '').trim()
      const emailValue = String(email.value || '').trim()
      const telefoneValue = String(telefone.value || '').trim()
      const passwordValue = String(password.value || '').trim()
      const codigoVinculacaoValue = String(codigoVinculacao.value || '').trim()
      const nomeBarbeariaValue = String(nomeBarbearia.value || '').trim()
      const enderecoBarbeariaValue = String(enderecoBarbearia.value || '').trim()

      if (!nomeValue || !emailValue || !telefoneValue || !passwordValue) {
        alert('Preencha todos os campos obrigatorios.')
        return
      }

      if (!isAdmin.value && !codigoVinculacaoValue) {
        alert('Para barbeiro, o codigo de vinculacao e obrigatorio.')
        return
      }

      if (isAdmin.value && (!nomeBarbeariaValue || !enderecoBarbeariaValue)) {
        alert('Para admin, preencha nome e endereco da barbearia.')
        return
      }

      const payload = {
        nome: nomeValue,
        email: emailValue,
        telefone: telefoneValue,
        password: passwordValue,
        password_confirmation: passwordValue,
        role: isAdmin.value ? 'admin' : 'barbeiro'
      }

      if (!isAdmin.value && codigoVinculacaoValue) {
        payload.codigo_vinculacao = codigoVinculacaoValue
      }

      if (isAdmin.value) {
        payload.barbearia = {
          nome: nomeBarbeariaValue,
          endereco: enderecoBarbeariaValue
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
    codigoVinculacao,
    isAdmin,
    nomeBarbearia,
    enderecoBarbearia,
    registrar,
    doLogin,
  }
}
