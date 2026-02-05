import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'


export const useClientes = () => {
  const $q = useQuasar()
  const filtros = ref({
    nome: ''
  })

  const modalEditarClienteAberto = ref(false)


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


  const novoCliente = () => {
    console.log('Novo cliente')
  }

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
    try {
      await Promise.all([
        buscarClientes(),
      ])
    } finally {
      console.log('123')
    }
  })

  return {
    clientes,
    clientesFiltrados,
    formatarCelular,
    abrirWhatsapp,
    verCliente,
    novoCliente,
    filtros,
    buscarClientes,
    modalEditarClienteAberto,
    abriModalEditarCliente,
    clienteSelecionado
  }
}
