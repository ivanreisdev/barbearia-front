import { ref, computed, onMounted } from 'vue'
import { useQuasar, Loading } from 'quasar'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'
import LoadingLogo from 'components/LoadingLogo.vue'

export const useClientes = () => {
  const $q = useQuasar()
  const filtros = ref({
    nome: ''
  })

  const modalEditarClienteAberto = ref(false)
  const modalNovoClienteAberto = ref(false)
  const modalExcluirClienteAberto = ref(false)


  const carregando = ref(true)

  const clientes = ref([])
  const clienteSelecionado = ref(null)
  const clientesFiltrados = computed(() => {
    const termo = filtros.value.nome.trim().toLowerCase()
    if (!termo) return clientes.value
    return clientes.value.filter((cliente) => (cliente.nome || '').toLowerCase().includes(termo))
  })

  const abriModalEditarCliente = async (cliente) => {
    clienteSelecionado.value = cliente
    modalEditarClienteAberto.value = true
  }

  const abriModalNovoCliente = async () => {
    modalNovoClienteAberto.value = true
  }

  const abriModalExcluirCliente = async (cliente) => {
    clienteSelecionado.value = cliente
    modalExcluirClienteAberto.value = true
  }

  const buscarClientes = async () => {
    try {
      const { data } = await api.get('/clientes/buscarClientes')
      clientes.value = data.clientes
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Erro ao carregar barbearia' })
    }
  }

  const router = useRouter()

  const verCliente = (cliente) => {
    router.push(`/clientes/${cliente.id}`)
  }

  const abrirWhatsapp = (celular) => {
    const numero = celular.replace(/\D/g, '')
    window.open(`https://wa.me/55${numero}`, '_blank')
  }

  const formatarCelular = (celular) => {
    if (!celular) return '—'
    const n = celular.replace(/\D/g, '')
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  }

  onMounted(async () => {
    Loading.show({
      spinner: LoadingLogo,
      backgroundColor: '#0c0d10'
    })
    try {
      await Promise.all([
        buscarClientes()
      ])
    } finally {
      carregando.value = false
      Loading.hide()
    }
  })

  return {
    clientes,
    clientesFiltrados,
    formatarCelular,
    abrirWhatsapp,
    verCliente,
    abriModalExcluirCliente,
    filtros,
    buscarClientes,
    modalEditarClienteAberto,
    abriModalEditarCliente,
    clienteSelecionado,
    LoadingLogo,
    carregando,
    modalNovoClienteAberto,
    abriModalNovoCliente,
    modalExcluirClienteAberto
  }
}
