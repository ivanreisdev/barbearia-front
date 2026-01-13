import { ref, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, Notify } from 'quasar'

export function useAgendamentos(dataSelecionada) {
  const $q = useQuasar()

  const safeNotify = (opts) => {
    try {
      if (typeof Notify !== 'undefined' && typeof Notify.create === 'function') {
        Notify.create(opts)
        return
      }

      if ($q && typeof $q.notify === 'function') {
        $q.notify(opts)
        return
      }

      // fallback to window Quasar Notify if available
      if (typeof window !== 'undefined' && window.Quasar && window.Quasar.Notify && typeof window.Quasar.Notify.create === 'function') {
        window.Quasar.Notify.create(opts)
        return
      }

      console.log('Notify fallback:', opts)
    } catch (e) {
      console.error('safeNotify error:', e)
    }
  }

  const agendamentos = ref([])
  const servicos = ref([])

  const modalAberto = ref(false)
  const novoAgendamento = ref({
    cliente: '',
    email: '',
    telefone: '',
    servico: null,
    preco: 0,
    barbeiro: '',
  })

  const abrirModal = async (hora) => {
    modalAberto.value = true

    const data = new Date(dataSelecionada.value)
    const dataFormatada = data.toISOString().split('T')[0]

    novoAgendamento.value = {
      cliente: '',
      telefone: '',
      email: '',
      servico: null,
      preco: 0,
      barbeiro: '',
      data: dataFormatada,
      hora: `${hora.toString().padStart(2, '0')}:00`,
      repetir: false,
    }

    try {
      const { data } = await api.get('/servicos/buscarServicos')
      servicos.value = data
    } catch (err) {
      console.error(err)
      safeNotify({ type: 'negative', message: 'Erro ao carregar serviços' })
    }
  }

  const loadAgendamentos = async () => {
    try {
      const { data } = await api.get('/agendamentos/buscarAgendamentos')
      agendamentos.value = data
    } catch (err) {
      console.error(err)
    }
  }

  const horariosDoDia = computed(() => {
    const slots = []
    for (let h = 8; h <= 18; h++) {
      const agendamento = agendamentos.value.find((item) => {
        const itemDate = new Date(item.data_horario)
        return (
          itemDate.getHours() === h &&
          itemDate.toDateString() === new Date(dataSelecionada.value).toDateString()
        )
      })
      slots.push({ hora: h, agendamento })
    }
    return slots
  })

  const atualizarPreco = (servicoId) => {
    const selecionado = servicos.value.find((s) => s.id === servicoId)
    if (selecionado) {
      novoAgendamento.value.preco = selecionado.preco
    } else {
      novoAgendamento.value.preco = 0
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case 'concluido':
        return 'green'
      case 'agendado':
        return 'blue'
      case 'cancelado':
        return 'red'
      default:
        return 'grey'
    }
  }

  const statusClass = (status) => {
    switch (status) {
      case 'concluido':
        return $q.dark.isActive ? 'bg-green-8' : 'bg-green-2'
      case 'agendado':
        return $q.dark.isActive ? 'bg-blue-8' : 'bg-blue-2'
      case 'cancelado':
        return $q.dark.isActive ? 'bg-red-8' : 'bg-red-2'
      default:
        return $q.dark.isActive ? 'bg-grey-10' : 'bg-grey-2'
    }
  }

  const formatoMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

  const salvarAgendamento = async () => {
  const dataHora = `${novoAgendamento.value.data} ${novoAgendamento.value.hora}:00`

  const payload = {
    nomeCliente: novoAgendamento.value.cliente,
    emailCliente: novoAgendamento.value.email,
    telefoneCliente: novoAgendamento.value.telefone,
    servico_id: novoAgendamento.value.servico,
    data_horario: dataHora,
    status: 'agendado',
  }

  try {
    const res = await api.post('/agendamentos/criarNovoAgendamento', payload)

    // res.data = { success: true, data: {...} }
    if (res.data?.success) {
        safeNotify({ 
          type: 'positive', 
          message: 'Agendamento criado com sucesso!' 
        })
      modalAberto.value = false
      await loadAgendamentos() // atualiza a lista
      console.log('Agendamento criado:', res.data.data) // log do objeto criado
    } else {
        safeNotify({ 
          type: 'negative', 
          message: res.data?.message || 'Erro ao criar agendamento' 
        })
    }
  } catch (err) {
    console.error('Erro ao criar agendamento:', err.response?.data || err)
      safeNotify({ 
        type: 'negative', 
        message: 'Erro ao criar agendamento' 
      })
  }
}


  // Carrega inicialmente
  loadAgendamentos()

  return {
    agendamentos,
    servicos,
    modalAberto,
    novoAgendamento,
    abrirModal,
    loadAgendamentos,
    horariosDoDia,
    atualizarPreco,
    statusColor,
    statusClass,
    formatoMoeda,
    salvarAgendamento,
  }
}
