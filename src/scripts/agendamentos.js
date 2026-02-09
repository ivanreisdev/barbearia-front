import { ref, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, Notify } from 'quasar'
import { useRouter } from 'vue-router'


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
  const horariosBloqueadosDaAgenda = ref([])
  const modalAgendamento = ref(false)
  const agendamentoSelecionado = ref(null)
  const bloqueioSelecionado = ref(null)
  const intervalosLivres = ref([])
  const intervaloSelecionado = ref(null)


  const router = useRouter()


  const modalAberto = ref(false)
  const modalExclusaoBloqueioAberto = ref(false)

  const novoAgendamento = ref({
    cliente: '',
    email: '',
    telefone: '',
    servico: null,
    preco: 0,
    barbeiro: '',
  })

  // Bloqueio
  const formBloqueio = ref({
    data: null,
    hora_inicio: null,
    hora_fim: null,
    motivo: ''
  })

  const modalBloqueiaAgendamentos = ref(false)
  const swipeX = ref(0)
  const maxSwipe = 260
  let startX = 0
  let dragging = false

  const fillPercent = computed(() => {
    return Math.min((swipeX.value / maxSwipe) * 100, 100)
  })

  const startSwipe = (e) => {
    dragging = true
    startX = e.touches ? e.touches[0].clientX : e.clientX

    document.addEventListener('mousemove', moveSwipe)
    document.addEventListener('mouseup', endSwipe)
    document.addEventListener('touchmove', moveSwipe)
    document.addEventListener('touchend', endSwipe)
  }

  const abrirModalBloqueiaAgendamentos = () => {
    modalBloqueiaAgendamentos.value = true
    // buscarIntervalosLivres(toISODate(dataSelecionada.value))
  }

  const moveSwipe = (e) => {
    if (!dragging) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    let delta = clientX - startX

    swipeX.value = Math.max(0, Math.min(delta, maxSwipe))
  }

  const buscarIntervalosLivres = async (data) => {
    intervaloSelecionado.value = null
    intervalosLivres.value = []
    try {
      const response = await api.get(
        '/horarios-atendimento/buscarIntervalosDisponiveisDoDia',
        {
          params: { data }
        }
      )

      if (response.data.tipo === 'sucesso') {
        intervalosLivres.value = response.data.intervalos
        console.log('intervalosLivres.value')
        console.log(intervalosLivres.value)
      } else {
        intervalosLivres.value = []
      }
    } catch (e) {
      console.error('Erro ao buscar intervalos livres:', e)
      intervalosLivres.value = []
    }
  }


  const endSwipe = () => {
    dragging = false

    if (swipeX.value >= maxSwipe) {
      confirmarBloqueio()
    } else {
      swipeX.value = 0
    }

    document.removeEventListener('mousemove', moveSwipe)
    document.removeEventListener('mouseup', endSwipe)
    document.removeEventListener('touchmove', moveSwipe)
    document.removeEventListener('touchend', endSwipe)
  }

  const confirmarBloqueio = async () => {
    try {
      const response = await api.post(
        '/bloqueio-agendamentos/bloquearAgendamentosDoDia',
        {
          data: formBloqueio.value.data,
          hora_inicio: formBloqueio.value.hora_inicio,
          hora_fim: formBloqueio.value.hora_fim,
          motivo: formBloqueio.value.motivo,
        }
      )

      if (response.data.tipo === 'sucesso') {
        safeNotify({
          type: 'positive',
          message: 'Agendamentos bloqueados com sucesso!',
        })
        modalBloqueiaAgendamentos.value = false
        loadAgendamentos(),
          carregarHorariosBloqueadosDaAgenda()
        formBloqueio.value = '';
        intervaloSelecionado.value = null;
        intervalosLivres.value = [];
        swipeX.value = 0;
      } else {
        safeNotify({
          type: 'negative',
          message: response.data.msg,
        })
      }

    } catch (err) {
      console.error('Erro ao bloquear agendamentos:', err)

      safeNotify({
        type: 'negative',
        message: err.response?.data?.message || 'Erro ao bloquear agendamentos',
      })
    }
  }


  function calcularHorarioFim(dataHora, duracaoMinutos) {
    const inicio = new Date(dataHora)
    const fim = new Date(inicio.getTime() + duracaoMinutos * 60000)

    const h = String(fim.getHours()).padStart(2, '0')
    const m = String(fim.getMinutes()).padStart(2, '0')

    return `${h}:${m}`
  }

  function formatarHorarioInicio(dataHora) {
    const d = new Date(dataHora)
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  }


  // busca horários disponíveis no backend para serviço+data selecionados
  const buscarHorariosDisponiveis = async (servicoId, dataISO) => {
    horariosDisponiveis.value = []
    if (!servicoId || !dataISO) return

    try {
      const res = await api.get('/horarios-atendimento/buscarHorariosDisponiveis', {
        params: { servicoId, data: dataISO },
      })

      const raw = res.data?.horarios ?? []

      if (raw.length > 0) {
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

  const abriModalExclusaoBloqueio = async (ev) => {
    bloqueioSelecionado.value = ev
    modalExclusaoBloqueioAberto.value = true
  }

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
      const res = await api.get('/servicos/buscarServicosPorBarbeariaId')
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
  const buscarAgendamentoPorId = async (id) => {
    try {

      if (!id) return null

      const res = await api.get(`/agendamentos/buscarAgendamento/${id}`)

      return res.data || null
    } catch (err) {
      console.error('Erro ao buscar agendamento:', err)
      safeNotify({
        type: 'negative',
        message: 'Erro ao buscar agendamento'
      })
      return null
    }
  }

  const horariosPadrao = computed(() => {
    if (horariosDisponiveis.value && horariosDisponiveis.value.length) {
      return horariosDisponiveis.value
    }

    return [
      {
        label: 'Horários indisponíveis para essa data',
        value: null,
        disable: true
      }
    ]
  })

  const carregarHorariosAtendimento = async () => {
    const response = await api.get('/horarios-atendimento/buscarHorariosAtendimentos')
    horariosAtendimento.value = response.data
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

  const carregarHorariosBloqueadosDaAgenda = async () => {
    try {
      const dateIS = toISODate(dataSelecionada.value)
      const response = await api.get(
        '/bloqueio-agendamentos/buscarBloqueioDeAgenda',
        {
          params: {
            data: dateIS
          }
        }
      )
      horariosBloqueadosDaAgenda.value = response.data ?? []
      console.log('horariosBloqueadosDaAgenda.value')
      console.log(horariosBloqueadosDaAgenda.value)

    } catch (err) {
      console.error('Erro ao buscar bloqueios da agenda:', err)
    }
  }

  function datetimeParaMinutos(datetime) {
    const d = new Date(datetime)
    return d.getHours() * 60 + d.getMinutes()
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

  const horasDoDia = computed(() => {
    if (!horariosAtendimento.value.length || !dataSelecionada.value) return []

    const diaSemana = getDiaSemanaBackend(dataSelecionada.value)
    const dia = horariosAtendimento.value.find(
      h => h.dia_semana === diaSemana && h.ativo === 1
    )

    if (!dia) return []

    const inicio = horaParaMinutos(dia.inicio)
    const fim = horaParaMinutos(dia.fim)

    const horas = []

    // gera horários de início
    for (let m = inicio; m < fim; m += 60) {
      const h = String(Math.floor(m / 60)).padStart(2, '0')
      horas.push(`${h}:00`)
    }

    return horas
  })

  const eventosAgendamentos = computed(() => {
    console.log('agendamentos.value')

    console.log(agendamentos.value)
    return agendamentos.value.map(ag => {
      const inicioMin = datetimeParaMinutos(ag.data_horario)
      const duracao = ag.servico?.duracao_minutos ?? 0

      return {
        id: `ag-${ag.id}`,
        tipo: 'agendamento',
        inicioMinutos: inicioMin,
        duracao,
        inicio: ag.data_horario,
        servico: ag.servico,
        cliente: ag.cliente
      }
    })
  })

  const eventosAlmoco = computed(() => {
    const h = horarioDoDiaSelecionado.value
    if (!h || !h.almoco_inicio || !h.almoco_fim) return []

    const inicio = horaParaMinutos(h.almoco_inicio)
    const fim = horaParaMinutos(h.almoco_fim)

    return [{
      id: `almoco-${h.dia_semana}`,
      tipo: 'almoco',
      inicioMinutos: inicio,
      duracao: fim - inicio,
      hora_inicio: h.almoco_inicio,
      hora_fim: h.almoco_fim
    }]
  })

  const eventosBloqueios = computed(() => {
    return horariosBloqueadosDaAgenda.value.map((b, index) => {
      const inicio = horaParaMinutos(b.hora_inicio)
      const fim = horaParaMinutos(b.hora_fim)
      // const motivo = b.motivo

      return {
        id: `bloq-${index}`,
        tipo: 'bloqueio',
        inicioMinutos: inicio,
        duracao: fim - inicio,
        hora_inicio: b.hora_inicio,
        hora_fim: b.hora_fim,
        motivo: b.motivo,
        id_bloqueio: b.id,
      }
    })
  })
  const eventos = computed(() => {
    return [
      ...eventosBloqueios.value,
      ...eventosAlmoco.value,
      ...eventosAgendamentos.value
    ]
  })

  const diaSemanaSelecionado = computed(() => {
    if (!dataSelecionada.value) return null

    const diaJs = new Date(dataSelecionada.value).getDay() // 0–6
    return diaJs === 0 ? 1 : diaJs + 1
  })

  const horarioDoDiaSelecionado = computed(() => {
    if (!diaSemanaSelecionado.value) return null

    return horariosAtendimento.value.find(
      h => h.dia_semana === diaSemanaSelecionado.value && h.ativo === 1
    )
  })

  const horarioFinalExpediente = computed(() => {
    const h = horarioFuncionamentoDia.value
    if (!h || h.ativo === 0) {
      return
    }
    return formatarHora(h.fim)
  })

  const textoHorarioFuncionamento = computed(() => {
    const h = horarioFuncionamentoDia.value

    if (!h || h.ativo === 0) {
      return 'Barbearia fechada neste dia'
    }

    return `Horário de funcionamento ${formatarHora(h.inicio)} – ${formatarHora(h.fim)}`
  })

  const horarioFuncionamentoDia = computed(() => {
    if (!horariosAtendimento.value.length) return null

    return horariosAtendimento.value.find(
      h => h.dia_semana === diaSemanaSelecionado.value
    )
  })
  const GAP = 6

  function estiloEvento(evento) {
    if (!horasDoDia.value.length) return {}

    const inicioDia = horaParaMinutos(horasDoDia.value[0])

    const top =
      (evento.inicioMinutos - inicioDia) * PIXELS_PER_MINUTE

    const height =
      evento.duracao * PIXELS_PER_MINUTE - GAP

    return {
      top: `${top}px`,
      height: `${Math.max(height, 0)}px`
    }
  }

  const abrirModalAgendamento = (item) => {
    agendamentoSelecionado.value = item
    modalAgendamento.value = true
  }

  const cancelarAgendamento = (id = null) => {
    const payload = {
      agendamentoId: id !== null ? id : agendamentoSelecionado.value.ag.id
    }
    api.post('/agendamentos/cancelarAgendamento', payload)

      .then((res) => {
        if (res.data?.success) {
          safeNotify({
            type: 'positive',
            message: 'Agendamento cancelado com sucesso!',
          })
          modalAgendamento.value = false
          // loadAgendamentos() // atualiza a lista
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
  const PIXELS_PER_MINUTE = 4.5
  document.documentElement.style.setProperty('--ppm', PIXELS_PER_MINUTE)

  const irParaDetalheAgendamento = (id) => {
    const idLimpo = id.replace('ag-', '')
    router.push(`/agendamentos/${idLimpo}`)
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

  const opcoesIntervalos = computed(() =>
    intervalosLivres.value.map(intervalo => ({
      label: `${intervalo.inicio} às ${intervalo.fim}`,
      value: intervalo
    }))
  )

  const swipeHabilitado = computed(() => {
    return (
      intervaloSelecionado.value &&
      formBloqueio.value.hora_inicio &&
      formBloqueio.value.hora_fim &&
      !erroHoraInicio.value &&
      !erroHoraFim.value
    )
  })

  function toISODate(dt) {
    const d = new Date(dt)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const formatarHora = (hora) => {
    if (!hora) return ''
    return hora.slice(0, 5)
  }

  function calcularHorarioFimCancelamento(horaInicio, duracaoMinutos) {

    console.log('calcularHorarioFim chamado com:', horaInicio, duracaoMinutos)
    // agora recebe minutos desde meia-noite (ex: 9:45 -> 9*60 + 45 = 585)
    const inicioMinutos = horaInicio
    const fimMinutos = inicioMinutos + duracaoMinutos

    const hInicio = String(Math.floor(inicioMinutos / 60)).padStart(2, '0')
    const mInicio = String(inicioMinutos % 60).padStart(2, '0')

    const hFim = String(Math.floor(fimMinutos / 60)).padStart(2, '0')
    const mFim = String(fimMinutos % 60).padStart(2, '0')

    return `${hInicio}:${mInicio} - ${hFim}:${mFim}`
  }

  const FecharmodalBloqueiaAgendamentos = () => {
    modalBloqueiaAgendamentos.value = false;
    formBloqueio.value = '';
    intervaloSelecionado.value = null;
    intervalosLivres.value = [];
    swipeX.value = 0;
  }
  function horaParaMinutos(hora) {
    const [h, m] = hora.split(':').map(Number)
    return h * 60 + m
  }
  const horaDentroDoIntervalo = (hora) => {
    if (!hora || !intervaloSelecionado.value) return true

    const toMin = (h) => {
      const [hh, mm] = h.split(':').map(Number)
      return hh * 60 + mm
    }

    const inicio = toMin(intervaloSelecionado.value.inicio)
    const fim = toMin(intervaloSelecionado.value.fim)
    const valor = toMin(hora)

    return valor >= inicio && valor <= fim
  }

  const erroHoraInicio = computed(() => {
    return !horaDentroDoIntervalo(formBloqueio.value.hora_inicio)
  })

  const formatarCelular = (celular) =>{
    if (!celular) return ''

    const numero = celular.replace(/\D/g, '')

    if (numero.length === 11) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`
    }

    if (numero.length === 10) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`
    }

    return celular
  }

  const erroHoraFim = computed(() => {
    return !horaDentroDoIntervalo(formBloqueio.value.hora_fim)
  })

  const limitesHorario = computed(() => {
    if (!intervaloSelecionado.value) {
      return {
        min: null,
        max: null
      }
    }

    return {
      min: intervaloSelecionado.value.inicio,
      max: intervaloSelecionado.value.fim
    }
  })

  const abrirWhatsapp =  (celular) => {
    const numero = celular.replace(/\D/g, '') // remove () - espaços etc
    const url = `https://wa.me/55${numero}`
    window.open(url, '_blank')
  }


  const mensagemErro = 'O horário definido não bate com o intervalo selecionado'



  carregarHorariosAtendimento()
  loadAgendamentos(dataSelecionada.value)
  carregarHorariosBloqueadosDaAgenda()

  // Recarrega agendamentos quando a data selecionada muda
  watch(dataSelecionada, async (nova) => {
    agendamentos.value = []
    horariosBloqueadosDaAgenda.value = []

    try {
      await Promise.all([
        // carregarHorariosAtendimento(),
        loadAgendamentos(nova),
        carregarHorariosBloqueadosDaAgenda()
      ])
    } finally {
      console.log('carregamento bem sucedido')
    }
  })

  watch(
    () => intervaloSelecionado.value,
    (intervalo) => {
      if (intervalo) {
        formBloqueio.value.hora_inicio = intervalo.inicio
        formBloqueio.value.hora_fim = intervalo.fim
      }
    }
  )



  return {
    horariosPadrao,
    abrirModal,
    salvarAgendamento,
    novoAgendamento,
    modalAberto,
    servicos,
    horariosDisponiveis,
    processarAgendamentos,
    formatoMoeda,
    atualizarPreco,
    statusClass,
    statusColor,
    irParaDetalheAgendamento,
    agendamentoSelecionado,
    modalAgendamento,
    abrirModalAgendamento,
    cancelarAgendamento,
    buscarAgendamentoPorId,
    modalBloqueiaAgendamentos,
    fillPercent,
    startSwipe,
    formBloqueio,
    confirmarBloqueio,
    swipeX,
    horariosBloqueadosDaAgenda,
    eventos,
    horasDoDia,
    estiloEvento,
    calcularHorarioFim,
    formatarHorarioInicio,
    calcularHorarioFimCancelamento,
    formatarHora,
    textoHorarioFuncionamento,
    horarioFinalExpediente,
    abriModalExclusaoBloqueio,
    modalExclusaoBloqueioAberto,
    bloqueioSelecionado,
    carregarHorariosBloqueadosDaAgenda,
    abrirModalBloqueiaAgendamentos,
    buscarIntervalosLivres,
    opcoesIntervalos,
    intervaloSelecionado,
    mensagemErro,
    erroHoraFim,
    erroHoraInicio,
    limitesHorario,
    swipeHabilitado,
    FecharmodalBloqueiaAgendamentos,
    abrirWhatsapp,
    formatarCelular
  }
}
