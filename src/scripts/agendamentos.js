import { ref, computed, watch } from 'vue'
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
  const horariosDisponiveis = ref([]) // opções vindas da rota de disponibilidade
  const horariosAtendimento = ref([])
  const modalAgendamento = ref(false)
const agendamentoSelecionado = ref(null)

  const modalAberto = ref(false)
  const novoAgendamento = ref({
    cliente: '',
    email: '',
    telefone: '',
    servico: null,
    preco: 0,
    barbeiro: '',
  })

  // busca horários disponíveis no backend para serviço+data selecionados
  const buscarHorariosDisponiveis = async (servicoId, dataISO) => {
    horariosDisponiveis.value = []
    if (!servicoId || !dataISO) return

    try {
      const res = await api.get('/horarios-atendimento/buscarHorariosDisponiveis', {
        params: { servicoId, data: dataISO },
      })

      // espera { horarios: ["09:00", ...] }
      const raw = res.data && (res.data.horarios || res.data)
      if (Array.isArray(raw)) {
        // mapeia para { label, value } esperado pelo q-select
        horariosDisponiveis.value = raw.map((h) => ({ label: h, value: h }))
      } else {
        horariosDisponiveis.value = []
      }

      console.log('Horários disponíveis:', horariosDisponiveis.value)
    } catch (err) {
      console.error('Erro ao buscar horários disponíveis:', err)
      safeNotify({ type: 'negative', message: 'Erro ao buscar horários disponíveis' })
      horariosDisponiveis.value = []
    }
  }

  // observa seleção de serviço/data no modal e chama a rota quando ambos existirem
  watch(
    [() => novoAgendamento.value.servico, () => novoAgendamento.value.data],
    ([servico, data]) => {
      if (servico && data) {
        // garante formato YYYY-MM-DD
        const dataISO = new Date(data).toISOString().split('T')[0]
        buscarHorariosDisponiveis(servico, dataISO)
      } else {
        horariosDisponiveis.value = []
      }
    },
  )

  const abrirModal = async (hora = null) => {
    // abre o modal; se hora for null => não pré-preenche data/hora (usuário deve escolher a data)
    modalAberto.value = true

    let dataFormatada = ''
    if (hora !== null && dataSelecionada?.value) {
      const data = new Date(dataSelecionada.value)
      dataFormatada = data.toISOString().split('T')[0]
    }

    novoAgendamento.value = {
      cliente: '',
      telefone: '',
      email: '',
      servico: null,
      preco: 0,
      barbeiro: '',
      data: dataFormatada, // se vazio, campo data permanece vazio e campo hora fica desabilitado no template
      hora: hora !== null ? `${String(hora).padStart(2, '0')}:00` : '',
      repetir: false,
    }

    try {
      const res = await api.get('/servicos/buscarServicos')
      servicos.value = res.data
      // limpa horários disponíveis ao abrir modal
      horariosDisponiveis.value = []
    } catch (err) {
      console.error('Erro ao carregar serviços:', err)
      safeNotify({ type: 'negative', message: 'Erro ao carregar serviços' })
    }
  }

  // carrega agendamentos, opcionalmente filtrando por data (YYYY-MM-DD or Date)
  const loadAgendamentos = async (dateParam = null) => {
    try {
      // determina data a ser enviada para a API (YYYY-MM-DD) — prioriza dateParam, senão dataSelecionada.value
      const dateISO = dateParam
        ? new Date(dateParam).toISOString().split('T')[0]
        : dataSelecionada?.value
          ? new Date(dataSelecionada.value).toISOString().split('T')[0]
          : null

      const params = {}
      if (dateISO) params.data = dateISO

      const res = await api.get('/agendamentos/buscarAgendamentos', { params })

      // a API pode retornar array direto ou { agendamentos: [...] }
      let payload = res.data
      if (payload && payload.agendamentos) payload = payload.agendamentos
      agendamentos.value = Array.isArray(payload) ? payload : []

      // garantia adicional: filtrar localmente por data se API não fizer
      if (dateISO && agendamentos.value.length) {
        agendamentos.value = agendamentos.value.filter((ag) => {
          const agDate = ag.data_horario
            ? new Date(ag.data_horario).toISOString().split('T')[0]
            : null
          return agDate === dateISO
        })
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err)
      safeNotify({ type: 'negative', message: 'Erro ao carregar agendamentos' })
      agendamentos.value = []
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
  const horariosPadrao = computed(() => {
    // se há horários vindos da API (modal: serviço+data selecionados), usa-os
    if (horariosDisponiveis.value && horariosDisponiveis.value.length) {
      return horariosDisponiveis.value
    }

    // fallback: gera horários padrão (30 em 30) como antes
    const horarios = []
    let hora = 8
    let minuto = 0

    while (hora < 18) {
      const hh = String(hora).padStart(2, '0')
      const mm = String(minuto).padStart(2, '0')

      horarios.push({
        label: `${hh}:${mm}`,
        value: `${hh}:${mm}`,
      })

      minuto += 30
      if (minuto === 60) {
        minuto = 0
        hora++
      }
    }

    return horarios
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
    // iso da data selecionada (ex: "2026-01-16")
    const selectedDateISO =
      dataSelecionada.value && dataSelecionada.value
        ? new Date(dataSelecionada.value).toISOString().split('T')[0]
        : null

    agendamentos.forEach((ag) => {
      // se não estiver na data selecionada, ignora
      const agDateISO = new Date(ag.data_horario).toISOString().split('T')[0]
      if (selectedDateISO && agDateISO !== selectedDateISO) return

      const data = new Date(ag.data_horario)
      const inicio = data.getHours() * 60 + data.getMinutes()
      const fim = inicio + (ag.servico?.duracao_minutos || 0)

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
        duracao: ag.servico?.duracao_minutos || 0,
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
    const topBase = ((item.inicio - slot.inicioMinutos) / 60) * alturaSlot

    const altura = Math.max((item.duracao / 60) * alturaSlot, ALTURA_MINIMA)

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
        linha: linhaIndex,
      }
    })
  }
  const horariosProcessados = computed(() => {
    return horariosDoDia.value.map((slot) => {
      const ags = slot.agendamentos ? processarAgendamentos(slot) : []

      const totalLinhas = ags.length ? Math.max(...ags.map((a) => a.linha)) + 1 : 1

      return {
        ...slot,
        agendamentosProcessados: ags,
        alturaRow: totalLinhas * (ALTURA_MINIMA + ESPACAMENTO),
      }
    })
  })
const abrirModalAgendamento = (item) => {
  agendamentoSelecionado.value = item
  modalAgendamento.value = true
}

const cancelarAgendamento = () => {
  const payload = {
    agendamentoId: agendamentoSelecionado.value.ag.id,
    }
    api.post('/agendamentos/cancelarAgendamento', payload)

    .then((res) => {
      if (res.data?.success) {
        safeNotify({
          type: 'positive',
          message: 'Agendamento cancelado com sucesso!',
        })
        modalAgendamento.value = false
        loadAgendamentos() // atualiza a lista
      } else {
        safeNotify({
          type: 'negative',
          message: res.data?.message || 'Erro ao cancelar agendamento',
        })
      }
    })
    .catch((err) => {
      console.error('Erro ao cancelar agendamento:', err.response?.data || err)
      safeNotify({
        type: 'negative',
        message: 'Erro ao cancelar agendamento',
      })
    }) 
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

  // Carrega inicialmente (usa a data selecionada atual se houver)
  loadAgendamentos(dataSelecionada?.value)
  carregarHorariosAtendimento()

  // Recarrega agendamentos quando a data selecionada muda
  watch(dataSelecionada, (nova) => {
    loadAgendamentos(nova)
  })

  // --------------------
  // Exporte o ref de horários disponíveis para uso no componente
  // --------------------
  return {
    horariosProcessados, // agora retorna o computed correto
    horariosPadrao,
    abrirModal,
    salvarAgendamento,
    novoAgendamento,
    modalAberto,
    servicos,
    horariosDisponiveis,
    estiloCard,
    processarAgendamentos,
    formatoMoeda,
    calcularHorarioFim,
    atualizarPreco,
    colunasMax,
    statusClass,
    statusColor,
    agendamentoSelecionado,
    modalAgendamento,
    abrirModalAgendamento,
    cancelarAgendamento,
  }
}
