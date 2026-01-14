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
  const horariosAtendimento = ref([])


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
      console.log('Agendamentos carregados:', data)
    } catch (err) {
      console.error(err)
    }
  }
  

  const horariosDoDia = computed(() => {
  if (!horariosAtendimento.value.length) return []

  const diaSemana = getDiaSemanaBackend(dataSelecionada.value)

  const horarioDia = horariosAtendimento.value.find(
    (h) => h.dia_semana === diaSemana && h.ativo === 1
  )

  // Dia sem atendimento
  if (!horarioDia) return []

  const inicio = horaStringParaInt(horarioDia.inicio)
  const fim = horaStringParaInt(horarioDia.fim)

  const almocoInicio = horarioDia.almoco_inicio
    ? horaStringParaInt(horarioDia.almoco_inicio)
    : null

  const almocoFim = horarioDia.almoco_fim
    ? horaStringParaInt(horarioDia.almoco_fim)
    : null

  const slots = []

  for (let h = inicio; h < fim; h++) {
    // pula horário de almoço
    if (
      almocoInicio !== null &&
      almocoFim !== null &&
      h >= almocoInicio &&
      h < almocoFim
    ) {
      continue
    }

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


  const carregarHorariosAtendimento = async () => {
    const response = await api.get(
      '/horarios-atendimento/buscarHorariosAtendimentos'
    )
    horariosAtendimento.value = response.data
  }
  const horaStringParaInt = (hora) => {
    return Number(hora.split(':')[0])
  }

  const getDiaSemanaBackend = (date) => {
    const jsDay = new Date(date).getDay() // 0..6
    return jsDay === 0 ? 1 : jsDay + 1
  }

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
  carregarHorariosAtendimento()

 return {
  agendamentos,
  servicos,
  horariosAtendimento,
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
