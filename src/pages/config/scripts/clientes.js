import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

export const useClientes = () => {
  const $q = useQuasar()
  const filtros = ref({
    nome: ''
  })

  const clientes = ref([])
  const clientesFiltrados = computed(() => {
    const termo = filtros.value.nome.trim().toLowerCase()
    if (!termo) return clientes.value
    return clientes.value.filter((cliente) => (cliente.nome || '').toLowerCase().includes(termo))
  })

  const buscarClientes = async () => {
    try {
      const { data } = await api.get('/clientes/buscarClientes')
      clientes.value = data.clientes

    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Erro ao carregar barbearia' })
    }
  }

  const novoCliente = () => {
    console.log('Novo cliente')
  }

  const verCliente = (cliente) => {
    console.log('Ver cliente', cliente)
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
    buscarClientes
  }
}
