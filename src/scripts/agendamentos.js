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
      if (
        typeof window !== 'undefined' &&
        window.Quasar &&
        window.Quasar.Notify &&
        typeof window.Quasar.Notify.create === 'function'
      ) {
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
      (h) => h.dia_semana === diaSemana && h.ativo === 1,
    )

    if (!horarioDia) return []

    const inicio = horaStringParaInt(horarioDia.inicio)
    const fim = horaStringParaInt(horarioDia.fim)

    const almocoInicio = horarioDia.almoco_inicio
      ? horaStringParaInt(horarioDia.almoco_inicio)
      : null

    const almocoFim = horarioDia.almoco_fim ? horaStringParaInt(horarioDia.almoco_fim) : null

    // intervalo usado para gerar slots (em minutos)
    // agora gera slots de 60 min (1 hora)
    const intervalo = 60
    // usa o intervalo definido acima
    let slots = gerarSlots(inicio, fim, intervalo)

    // ✅ 2. MARCA ALMOÇO
    slots.forEach((slot) => {
      const h = Math.floor(slot.inicioMinutos / 60)

      if (almocoInicio !== null && almocoFim !== null && h >= almocoInicio && h < almocoFim) {
        slot.tipo = 'almoco'
        slot.ocupado = true
      } else {
        slot.tipo = 'normal'
      }
    })

    // ✅ 3. APLICA AGENDAMENTOS (agendamentos podem começar dentro do slot)
    slots = aplicarAgendamentos(slots, agendamentos.value, intervalo)

    return slots
  })

  const carregarHorariosAtendimento = async () => {
    const response = await api.get('/horarios-atendimento/buscarHorariosAtendimentos')
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

  // mantenha apenas UMA declaração de alturaSlot (o 'intervalo' é declarado localmente onde usado)
  const alturaSlot = 200 // altura em pixels por intervalo — ajustar conforme CSS

  function aplicarAgendamentos(slots, agendamentos, intervalo = 60) {
    agendamentos.forEach((ag) => {
      const data = new Date(ag.data_horario)
      const inicio = data.getHours() * 60 + data.getMinutes()
      const fim = inicio + ag.servico.duracao_minutos

      // encontra o índice do slot que contém o início do agendamento
      const startIndex = slots.findIndex(
        (s) => inicio >= s.inicioMinutos && inicio < s.inicioMinutos + intervalo,
      )
      if (startIndex === -1) return // fora do período exibido

      // calcula quantos slots o agendamento precisa ocupar a partir do startIndex
      const span = Math.max(1, Math.ceil((fim - slots[startIndex].inicioMinutos) / intervalo))

      // marca ocupado nas slots afetadas
      for (let i = startIndex; i < Math.min(slots.length, startIndex + span); i++) {
        slots[i].ocupado = true
      }

      // adiciona o agendamento à lista do slot inicial (permite múltiplos por slot)
      if (!Array.isArray(slots[startIndex].agendamentos)) {
        slots[startIndex].agendamentos = []
      }
      slots[startIndex].agendamentos.push({
        ag,
        inicio,
        duracao: ag.servico.duracao_minutos,
      })
    })

    return slots
  }

  function gerarSlots(inicio = 9, fim = 18, intervalo = 60) {
    const slots = []
    let minutosTotais = inicio * 60

    const fimMinutos = fim * 60

    while (minutosTotais < fimMinutos) {
      const h = Math.floor(minutosTotais / 60)
      const m = minutosTotais % 60

      slots.push({
        hora: String(h).padStart(2, '0'),
        minuto: String(m).padStart(2, '0'),
        inicioMinutos: minutosTotais,
        ocupado: false,
        agendamento: null,
        agendamentos: [], // armazena múltiplos agendamentos que começam dentro deste slot
      })

      minutosTotais += intervalo
    }

    return slots
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
  function calcularHorarioFim(horaInicio, duracaoMinutos) {
    // agora recebe minutos desde meia-noite (ex: 9:45 -> 9*60 + 45 = 585)
    const inicioMinutos = horaInicio
    const fimMinutos = inicioMinutos + duracaoMinutos

    const hInicio = String(Math.floor(inicioMinutos / 60)).padStart(2, '0')
    const mInicio = String(inicioMinutos % 60).padStart(2, '0')

    const hFim = String(Math.floor(fimMinutos / 60)).padStart(2, '0')
    const mFim = String(fimMinutos % 60).padStart(2, '0')

    return `${hInicio}:${mInicio} - ${hFim}:${mFim}`
  }
  const colunasMax = 3 // quantos cards lado a lado você permite

const ESPACAMENTO = 6 // espaço entre cards (px)
const ALTURA_MINIMA = 70 // altura mínima de um card

const estiloCard = (item, slot) => {
  const topBase =
    ((item.inicio - slot.inicioMinutos) / 60) * alturaSlot

  const altura = Math.max(
    (item.duracao / 60) * alturaSlot,
    ALTURA_MINIMA
  )

  return {
    position: 'absolute',
    left: '8px',
    right: '8px',
    top: topBase + item.linha * (ALTURA_MINIMA + ESPACAMENTO) + 'px',
    height: altura + 'px',
    zIndex: 5,
  }
}


function processarAgendamentos(slot) {
  const linhas = []

  return slot.agendamentos.map((item) => {
    const inicio = item.inicio
    const fim = item.inicio + item.duracao

    let linhaIndex = 0

    // procura uma linha livre
    for (; linhaIndex < linhas.length; linhaIndex++) {
      const ultimoFimDaLinha = linhas[linhaIndex]
      if (inicio >= ultimoFimDaLinha) {
        break
      }
    }

    // se não achou, cria nova linha
    if (!linhas[linhaIndex]) {
      linhas[linhaIndex] = fim
    } else {
      linhas[linhaIndex] = fim
    }

    return {
      ...item,
      linha: linhaIndex
    }
  })
}
const horariosProcessados = computed(() => {
  return horariosDoDia.value.map(slot => {
    const ags = slot.agendamentos
      ? processarAgendamentos(slot)
      : []

    const totalLinhas = ags.length
      ? Math.max(...ags.map(a => a.linha)) + 1
      : 1

    return {
      ...slot,
      agendamentosProcessados: ags,
      alturaRow:
        totalLinhas * (ALTURA_MINIMA + ESPACAMENTO)
    }
  })
})




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
          message: 'Agendamento criado com sucesso!',
        })
        modalAberto.value = false
        await loadAgendamentos() // atualiza a lista
        console.log('Agendamento criado:', res.data.data) // log do objeto criado
      } else {
        safeNotify({
          type: 'negative',
          message: res.data?.message || 'Erro ao criar agendamento',
        })
      }
    } catch (err) {
      console.error('Erro ao criar agendamento:', err.response?.data || err)
      safeNotify({
        type: 'negative',
        message: 'Erro ao criar agendamento',
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
    alturaSlot,
    ALTURA_MINIMA,
    ESPACAMENTO,
    processarAgendamentos,
    colunasMax,
    estiloCard,
    abrirModal,
    loadAgendamentos,
    horariosDoDia,
    horariosProcessados,
    atualizarPreco,
    statusColor,
    statusClass,
    formatoMoeda,
    salvarAgendamento,
    calcularHorarioFim,
    aplicarAgendamentos,
    gerarSlots,
  }
}
