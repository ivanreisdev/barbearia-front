import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { notifyError, notifyWarning } from './notificaçoes'

export default function useLogin() {
  const router = useRouter()
  const route = useRoute()
  const auth = useAuthStore()

  const email = ref('')
  const password = ref('')
  const telefone = ref('')
  const nome = ref('')
  const sobrenome = ref('')
  const password_confirmation = ref('')
  const codigoVinculacao = ref(String(route.query.codigo || ''))

  const tipoUsuario = ref('barbeiro')
  const isAdmin = ref(false)

  const nomeBarbearia = ref('')
  const ruaBarbearia = ref('')
  const numeroBarbearia = ref('')
  const bairroBarbearia = ref('')
  const ufBarbearia = ref('')
  const cidadeBarbearia = ref('')
  const complementoBarbearia = ref('')
  const ufsBrasil = [
    { label: 'AC - Acre', value: 'AC' },
    { label: 'AL - Alagoas', value: 'AL' },
    { label: 'AP - Amapa', value: 'AP' },
    { label: 'AM - Amazonas', value: 'AM' },
    { label: 'BA - Bahia', value: 'BA' },
    { label: 'CE - Ceara', value: 'CE' },
    { label: 'DF - Distrito Federal', value: 'DF' },
    { label: 'ES - Espirito Santo', value: 'ES' },
    { label: 'GO - Goias', value: 'GO' },
    { label: 'MA - Maranhao', value: 'MA' },
    { label: 'MT - Mato Grosso', value: 'MT' },
    { label: 'MS - Mato Grosso do Sul', value: 'MS' },
    { label: 'MG - Minas Gerais', value: 'MG' },
    { label: 'PA - Para', value: 'PA' },
    { label: 'PB - Paraiba', value: 'PB' },
    { label: 'PR - Parana', value: 'PR' },
    { label: 'PE - Pernambuco', value: 'PE' },
    { label: 'PI - Piaui', value: 'PI' },
    { label: 'RJ - Rio de Janeiro', value: 'RJ' },
    { label: 'RN - Rio Grande do Norte', value: 'RN' },
    { label: 'RS - Rio Grande do Sul', value: 'RS' },
    { label: 'RO - Rondonia', value: 'RO' },
    { label: 'RR - Roraima', value: 'RR' },
    { label: 'SC - Santa Catarina', value: 'SC' },
    { label: 'SP - Sao Paulo', value: 'SP' },
    { label: 'SE - Sergipe', value: 'SE' },
    { label: 'TO - Tocantins', value: 'TO' },
  ]

  const normalizarTelefone = (valor) => String(valor || '').replace(/\D/g, '')

  const doLogin = async () => {
    try {
      await auth.login(email.value, password.value)
      router.push('/dashboard')
    } catch (err) {
      notifyError(err.message || 'Não foi possível entrar.')
    }
  }

  watch(
    tipoUsuario,
    (novoTipo) => {
      isAdmin.value = novoTipo === 'admin'
    },
    { immediate: true }
  )

  watch(isAdmin, (novoValor) => {
    tipoUsuario.value = novoValor ? 'admin' : 'barbeiro'
  })

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
      const sobrenomeValue = String(sobrenome.value || '').trim()
      const emailValue = String(email.value || '').trim()
      const telefoneValue = normalizarTelefone(telefone.value)
      const passwordValue = String(password.value || '').trim()
      const codigoVinculacaoValue = String(codigoVinculacao.value || '').trim()
      const nomeBarbeariaValue = String(nomeBarbearia.value || '').trim()
      const ruaBarbeariaValue = String(ruaBarbearia.value || '').trim()
      const numeroBarbeariaValue = String(numeroBarbearia.value || '').trim()
      const bairroBarbeariaValue = String(bairroBarbearia.value || '').trim()
      const ufBarbeariaValue = String(ufBarbearia.value || '').trim()
      const cidadeBarbeariaValue = String(cidadeBarbearia.value || '').trim()
      const complementoBarbeariaValue = String(complementoBarbearia.value || '').trim()

      if (!nomeValue || !sobrenomeValue || !emailValue || !telefoneValue || !passwordValue) {
        notifyWarning('Preencha todos os campos obrigatórios.')
        return
      }

      if (telefoneValue.length < 10 || telefoneValue.length > 11) {
        notifyWarning('Informe um telefone válido.')
        return
      }

      if (!isAdmin.value && !codigoVinculacaoValue) {
        notifyWarning('Para barbeiro, o código de vinculação é obrigatório.')
        return
      }

      if (
        isAdmin.value &&
        (!nomeBarbeariaValue ||
          !ruaBarbeariaValue ||
          !numeroBarbeariaValue ||
          !bairroBarbeariaValue ||
          !ufBarbeariaValue ||
          !cidadeBarbeariaValue)
      ) {
        notifyWarning('Para admin, preencha nome da barbearia e endereço completo.')
        return
      }

      const payload = {
        nome: `${nomeValue} ${sobrenomeValue}`,
        primeiro_nome: nomeValue,
        sobrenome: sobrenomeValue,
        email: emailValue,
        telefone: telefoneValue,
        password: passwordValue,
        password_confirmation: passwordValue,
        role: isAdmin.value ? 'admin' : 'barbeiro',
      }

      if (!isAdmin.value && codigoVinculacaoValue) {
        payload.codigo_vinculacao = codigoVinculacaoValue
      }

      if (isAdmin.value) {
        payload.barbearia = {
          nome: nomeBarbeariaValue,
          endereco: {
            rua: ruaBarbeariaValue,
            numero: numeroBarbeariaValue,
            bairro: bairroBarbeariaValue,
            cidade: cidadeBarbeariaValue,
            uf: ufBarbeariaValue,
            estado: ufBarbeariaValue,
            complemento: complementoBarbeariaValue,
          },
        }
      }

      await auth.registrar(payload)
      router.push('/dashboard')
    } catch (err) {
      notifyError(err.message || 'Erro ao registrar usuário.')
    }
  }

  return {
    email,
    password,
    password_confirmation,
    telefone,
    nome,
    sobrenome,
    codigoVinculacao,
    tipoUsuario,
    isAdmin,
    nomeBarbearia,
    ruaBarbearia,
    numeroBarbearia,
    bairroBarbearia,
    ufBarbearia,
    ufsBrasil,
    cidadeBarbearia,
    complementoBarbearia,
    registrar,
    doLogin,
  }
}
