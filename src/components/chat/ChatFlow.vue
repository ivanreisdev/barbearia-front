<template>
  <div v-if="isReady" class="chat-shell">
    <header class="chat-header">
      <div class="brand">
        <div class="brand-avatar">
          <img v-if="barbeariaFotoUrl" :src="barbeariaFotoUrl" :alt="barbeariaTitulo" />
          <span v-else>JB</span>
        </div>
        <div class="brand-text">
          <div class="brand-title">{{ barbeariaTitulo }}</div>
          <div class="brand-subtitle">Assistente de agendamento</div>
        </div>
      </div>
    </header>

    <section class="chat-body" ref="bodyRef">
      <transition-group name="bubble" tag="div" class="chat-bubbles">
        <div v-for="msg in messages" :key="msg.id" class="bubble"
          :class="msg.role === 'assistant' ? 'bubble-assistant' : 'bubble-user'">
          <div class="bubble-text">{{ msg.text }}</div>
          <div class="bubble-time">{{ msg.time }}</div>
        </div>
      </transition-group>
    </section>

    <section class="chat-input" v-if="!agendamentoFinalizado">
      <div v-if="currentStep?.type === 'select' && currentStep?.key === 'barbeiro'" class="barbeiros-scroll">
        <q-card v-for="barbeiro in barbeirosCards" :key="barbeiro.value" class="barbeiro-card" :class="{
          'barbeiro-card--ativo': form.barbeiro_id === barbeiro.value,
          'barbeiro-card--indisponivel': !barbeiro.temServicos
        }" flat bordered clickable v-ripple @click="barbeiro.temServicos && selectOption(barbeiro)">
          <q-btn v-if="!barbeiro.temServicos" dense flat round size="sm" icon="info" class="barbeiro-card__info"
            @click.stop="modalBarbeiroSemServicos = true" />
          <div class="barbeiro-card__foto">
            <img v-if="barbeiro.fotoUrl" :src="barbeiro.fotoUrl" :alt="barbeiro.label" />
            <div v-else class="barbeiro-card__foto-fallback">
              <q-icon name="person" size="28px" />
            </div>
          </div>
          <div class="barbeiro-card__nome">
            {{ barbeiro.label }}
          </div>
        </q-card>
      </div>

      <div v-else-if="currentStep?.type === 'select' && currentStep?.key === 'servico'" class="servicos-scroll">
        <q-card v-for="option in currentStep.options" :key="option.value" class="servico-card"
          :class="{ 'servico-card--ativo': form.servicos_ids.includes(option.value) }" flat bordered clickable v-ripple
          @click="toggleServico(option)">
          <q-checkbox dense color="grey-4" class="servico-card__check"
            :model-value="form.servicos_ids.includes(option.value)" @update:model-value="toggleServico(option)"
            @click.stop />
          <div class="servico-card__nome">
            {{ option.label }}
          </div>
          <div v-if="option.precoFormatado" class="servico-card__preco">
            {{ option.precoFormatado }}
          </div>
        </q-card>
      </div>
      <div v-else-if="currentStep?.type === 'select' && currentStep?.key === 'horario'" class="horarios-area">
        <div v-if="horariosLoading" class="horarios-loading">
          <q-spinner color="amber-4" size="28px" />
          <span>Carregando horarios...</span>
        </div>
        <div v-else-if="horariosMensagem" class="horarios-empty">
          {{ horariosMensagem }}
        </div>
        <div v-else class="horarios-scroll">
          <q-card v-for="option in currentStep.options" :key="option.value" class="horario-card"
            :class="{ 'horario-card--ativo': form.horario === option.value }" flat bordered clickable v-ripple
            @click="selectOption(option)">
            <div class="horario-card__hora">{{ option.label }}</div>
          </q-card>
        </div>
      </div>
      <div v-if="currentStep?.type === 'select' && currentStep?.key === 'servico'" class="servicos-action">
        <q-btn label="Continuar" class="primary-action" no-caps unelevated :disable="!form.servicos_ids.length"
          @click="confirmarServicos" />
      </div>

      <div v-else-if="currentStep?.type === 'final'" class="final-actions">
        <div v-if="editMenuAberto" class="edit-menu">
          <div class="edit-title">Qual informacao deseja alterar?</div>
          <div class="edit-options">
            <q-btn v-for="option in editOptions" :key="option.key" :label="option.label" no-caps flat
              class="edit-option-btn" @click="iniciarEdicao(option.key)" />
          </div>
          <q-btn label="Cancelar" no-caps flat class="secondary-action" @click="cancelarEdicao" />
        </div>
        <template v-else>
          <q-btn label="Confirmar agendamento" class="primary-action" no-caps unelevated
            @click="confirmarAgendamento" />
          <q-btn label="Editar Informações" class="back-btn" flat no-caps @click="abrirEdicao" />
        </template>
      </div>

      <div v-else-if="currentStep?.type !== 'select'" class="input-row">
        <q-input :model-value="inputValue" dense dark filled :type="currentStep?.inputType || 'text'"
          :placeholder="currentStep?.placeholder" :maxlength="currentStep?.key === 'telefone' ? 15 : undefined"
          class="chat-input-field" @update:model-value="handleInputValue" @keyup.enter="enviarResposta" />
        <q-btn label="Enviar" no-caps unelevated class="send-btn send-btn--stack" @click="enviarResposta" />
      </div>

      <div v-if="stepIndex > 0 && currentStep?.key !== 'final'" class="back-action">
        <q-btn label="Voltar" no-caps flat class="back-btn" @click="voltar" />
      </div>
    </section>
  </div>

  <q-dialog v-model="modalBarbeariaNaoEncontrada" persistent>
    <q-card class="erro-card">
      <q-card-section class="erro-header">
        <div class="erro-icon">
          <span class="erro-icon-text">!</span>
        </div>
        <div>
          <div class="erro-title">Barbearia nao encontrada</div>
          <div class="erro-subtitle">Verifique o link e tente novamente.</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="modalBarbeariaSemServicos" persistent>
    <q-card class="erro-card">
      <q-card-section class="erro-header">
        <div class="erro-icon">
          <span class="erro-icon-text">!</span>
        </div>
        <div>
          <div class="erro-title">Barbearia sem servicos</div>
          <div class="erro-subtitle">A barbearia nao possui servicos cadastrados ainda.</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="modalBarbeiroSemServicos">
    <q-card class="erro-card">
      <q-card-section class="erro-header">
        <div class="erro-icon">
          <span class="erro-icon-text">!</span>
        </div>
        <div>
          <div class="erro-title">Barbeiro indisponivel</div>
          <div class="erro-subtitle">O barbeiro escolhido não possui servicos para realizar.</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'

const bodyRef = ref(null)
const messages = ref([])
const inputValue = ref('')
const inputError = ref('')
const stepIndex = ref(0)
const route = useRoute()
const isReady = ref(false)
const modalBarbeariaNaoEncontrada = ref(false)
const modalBarbeariaSemServicos = ref(false)
const modalBarbeiroSemServicos = ref(false)
const horariosLoading = ref(false)
const horariosMensagem = ref('')
const editMenuAberto = ref(false)
const editTarget = ref('')
const agendamentoFinalizado = ref(false)

const barbearia = ref({
  nome: 'Barbearia Modelo',
  barbeiros: [],
})

const servicos = ref([])
const horariosDisponiveis = ref([])

const form = reactive({
  nome: '',
  email: '',
  telefone: '',
  barbeiro: '',
  barbeiro_id: null,
  servicos: [],
  servicos_ids: [],
  data: '',
  horario: '',
})

const barbeariaTitulo = computed(() => barbearia.value.nome || 'Barbearia Modelo')
const barbeirosOptions = computed(() => {
  const list = barbearia.value.barbeiros || []
  return list
    .map(item => {
      const nome = item?.user?.name?.trim()
      if (!nome) return null
      return {
        label: nome,
        value: item?.id ?? nome,
        temServicos: Array.isArray(item?.servicos) && item.servicos.length > 0,
      }
    })
    .filter(Boolean)
})
const apiBaseUrl = import.meta.env.VITE_API_URL || ''
const fotoBarbeiroUrl = (foto) => {
  if (!foto) return null
  if (/^https?:\/\//i.test(foto)) return foto
  const caminho = String(foto).replace(/^\/+/, '')
  return `${apiBaseUrl}/storage/${caminho}`
}
const barbeariaFotoUrl = computed(() => {
  const foto = barbearia.value?.foto
  if (!foto) return null
  if (/^https?:\/\//i.test(foto)) return foto
  const caminho = String(foto).replace(/^\/+/, '')
  return `${apiBaseUrl}/storage/${caminho}`
})
const barbeirosCards = computed(() => {
  const list = barbearia.value.barbeiros || []
  const mapped = list
    .map(item => {
      const nome = item?.user?.name?.trim()
      if (!nome) return null
      return {
        label: nome,
        value: item?.id ?? nome,
        fotoUrl: fotoBarbeiroUrl(item?.user?.foto || null),
        temServicos: Array.isArray(item?.servicos) && item.servicos.length > 0,
      }
    })
    .filter(Boolean)

  if (mapped.length) return mapped
  return []
})

const servicosOptions = computed(() => {
  return (servicos.value || [])
    .map(item => ({
      label: item?.nome,
      value: item?.id ?? item?.nome,
      precoFormatado: formatarPreco(item?.preco),
    }))
    .filter(item => item.label)
})

const editOptions = computed(() => ([
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'barbeiro', label: 'Barbeiro' },
  { key: 'servico', label: 'Servicos' },
  { key: 'data', label: 'Data' },
  { key: 'horario', label: 'Horario' },
]))

const steps = computed(() => [
  {
    key: 'nome',
    inputType: 'text',
    placeholder: 'Digite seu nome',
    validate: value => {
      const texto = value.trim()
      if (texto.length < 2) return false
      return !/[^a-zA-ZÀ-ÿ\s]/.test(texto)
    },
    error: 'Desculpe, insira um nome valido e sem Caracteres Especiais ou Numeros (ex: Nome Sobrenome)',
    question: () =>
      `Ola, eu sou a assistente da ${barbeariaTitulo.value}. Qual e o seu nome?`,
  },
  {
    key: 'email',
    inputType: 'email',
    placeholder: 'Digite seu email',
    validate: value => /@.+\.com$/i.test(value.trim()),
    error: 'Desculpe, insira um email valido para continuar.',
    question: () => `Prazer, ${form.nome}. Qual e o seu email?`,
  },
  {
    key: 'telefone',
    inputType: 'tel',
    placeholder: 'Digite seu telefone',
    validate: value => {
      const digits = value.replace(/\D/g, '')
      return digits.length >= 10 && digits.length <= 11
    },
    error: 'Informe um telefone valido com DDD.',
    question: () => 'Qual telefone podemos usar no agendamento?',
  },
  {
    key: 'barbeiro',
    type: 'select',
    options: barbeirosOptions.value.length
      ? barbeirosOptions.value
      : [],
    question: () => 'Com qual Profissional você quer ser atendido?',
  },
  {
    key: 'servico',
    type: 'select',
    options: servicosOptions.value,
    question: () => 'Qual servico voce deseja?',
  },
  {
    key: 'data',
    inputType: 'date',
    placeholder: 'Selecione a data',
    validate: value => Boolean(value),
    error: 'Escolha uma data.',
    question: () => 'Perfeito. Qual data voce prefere?',
  },
  {
    key: 'horario',
    type: 'select',
    options: horariosDisponiveis.value.length
      ? horariosDisponiveis.value
      : [],
    question: () => 'Qual horario fica melhor?',
  },
  {
    key: 'final',
    type: 'final',
    question: () =>
      `Resumo do agendamento:\n` +
      `Nome: ${form.nome}\n` +
      `Email: ${form.email}\n` +
      `Telefone: ${form.telefone}\n` +
      `Barbeiro: ${form.barbeiro}\n` +
      `Servicos: ${form.servicos.join(', ')}\n` +
      `Data: ${formatarDataBR(form.data)}\n` +
      `Horario: ${form.horario}\n\n` +
      `Posso confirmar o agendamento?`,
  },
])

const currentStep = computed(() => steps.value[stepIndex.value])

const formatTime = date => {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatarPreco = (valor) => {
  if (valor === null || valor === undefined || valor === '') return null
  const numero = Number(String(valor).replace(',', '.'))
  if (Number.isNaN(numero)) return null
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numero)
}

const formatarDataBR = (valor) => {
  if (!valor) return ''
  const partes = String(valor).split('-')
  if (partes.length !== 3) return String(valor)
  const [ano, mes, dia] = partes
  if (!ano || !mes || !dia) return String(valor)
  return `${dia}/${mes}/${ano}`
}

const formatarTelefone = (valor) => {
  const digits = String(valor ?? '').replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  const ddd = digits.slice(0, 2)
  const resto = digits.slice(2)
  if (!resto) return `(${ddd}`
  if (resto.length <= 4) return `(${ddd}) ${resto}`
  if (resto.length <= 8) {
    return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`
  }
  return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`
}

const handleInputValue = (valor) => {
  if (currentStep.value?.key === 'telefone') {
    inputValue.value = formatarTelefone(valor)
    return
  }
  inputValue.value = valor
}

const clearStepKey = (key) => {
  if (!key) return
  if (key === 'barbeiro') {
    form.barbeiro = ''
    form.barbeiro_id = null
    servicos.value = []
    form.servicos = []
    form.servicos_ids = []
    form.data = ''
    form.horario = ''
    horariosDisponiveis.value = []
    horariosMensagem.value = ''
    return
  }
  if (key === 'servico') {
    form.servicos = []
    form.servicos_ids = []
    form.data = ''
    form.horario = ''
    horariosDisponiveis.value = []
    horariosMensagem.value = ''
    return
  }
  if (key === 'data') {
    form.data = ''
    form.horario = ''
    horariosDisponiveis.value = []
    horariosMensagem.value = ''
    return
  }
  if (key === 'horario') {
    form.horario = ''
    return
  }
  if (key in form) {
    form[key] = ''
  }
}

const resetAfterStep = (stepKey) => {
  const keys = steps.value.map(step => step.key)
  const fromIndex = keys.indexOf(stepKey)
  if (fromIndex < 0) return
  for (let i = fromIndex + 1; i < keys.length; i += 1) {
    clearStepKey(keys[i])
  }
}

const abrirEdicao = () => {
  editMenuAberto.value = true
  editTarget.value = ''
  inputError.value = ''
}

const cancelarEdicao = () => {
  editMenuAberto.value = false
  editTarget.value = ''
}

const iniciarEdicao = (key) => {
  const index = steps.value.findIndex(step => step.key === key)
  if (index < 0) return
  editMenuAberto.value = false
  editTarget.value = key
  stepIndex.value = index
  inputError.value = ''
  const step = steps.value[index]
  if (step?.type === 'select' || step?.type === 'final') {
    pushMessage('assistant', step.question())
    inputValue.value = ''
    return
  }
  inputValue.value = String(form[key] ?? '')
  pushMessage('assistant', step.question())
}

const voltar = () => {
  if (stepIndex.value === 0) return
  if (messages.value.length) messages.value.pop()
  if (messages.value.length && messages.value[messages.value.length - 1].role === 'user') {
    messages.value.pop()
  }
  stepIndex.value -= 1
  const step = steps.value[stepIndex.value]
  if (!editTarget.value) {
    resetAfterStep(step?.key)
  }
  inputError.value = ''
  if (!step || step.type === 'select' || step.type === 'final') {
    inputValue.value = ''
    return
  }
  inputValue.value = String(form[step.key] ?? '')
}

const pushMessage = (role, text) => {
  messages.value.push({
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
    time: formatTime(new Date()),
  })
  nextTick(() => scrollToBottom())
}

const scrollToBottom = () => {
  const el = bodyRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const startFlow = () => {
  stepIndex.value = 0
  messages.value = []
  inputValue.value = ''
  inputError.value = ''
  editMenuAberto.value = false
  editTarget.value = ''
  agendamentoFinalizado.value = false
  pushMessage('assistant', steps.value[0].question())
}

const enviarResposta = () => {
  const step = currentStep.value
  if (!step || step.type === 'select' || step.type === 'final') return

  const value = inputValue.value.trim()
  if (step.validate && !step.validate(value)) {
    inputError.value = step.error || 'Resposta invalida.'
    if (step.error) {
      pushMessage('assistant', step.error)
    }
    inputValue.value = ''
    return
  }

  inputError.value = ''
  form[step.key] = value
  pushMessage('user', value)
  inputValue.value = ''
  if (step.key === 'data' && !editTarget.value) {
    buscarHorariosDisponivceis(form.barbeiro_id, value, form.servicos_ids)
  }
  avancar()
}

const selectOption = option => {
  const step = currentStep.value
  if (!step || step.type !== 'select') return

  if (step.key === 'barbeiro') {
    if (!option.temServicos) {
      modalBarbeiroSemServicos.value = true
      return
    }
    form.barbeiro = option.label
    form.barbeiro_id = option.value
    const barber = (barbearia.value.barbeiros || []).find(
      item => item?.id === option.value
    )
    servicos.value = Array.isArray(barber?.servicos) ? barber.servicos : []
    pushMessage('user', option.label)
    avancar()
    return
  }

  form[step.key] = option.value
  pushMessage('user', option.label)
  avancar()
}

const toggleServico = (option) => {
  const ids = [...form.servicos_ids]
  const labels = [...form.servicos]
  const index = ids.indexOf(option.value)
  if (index >= 0) {
    ids.splice(index, 1)
    labels.splice(index, 1)
  } else {
    ids.push(option.value)
    labels.push(option.label)
  }
  form.servicos_ids = ids
  form.servicos = labels
}

const confirmarServicos = () => {
  if (!form.servicos.length) return
  pushMessage('user', form.servicos.join(', '))
  avancar()
}

const buscarHorariosDisponivceis = async (idBarbeiro, dataSelecionada, servicosSelecionados) => {
  if (!idBarbeiro || !dataSelecionada) return
  horariosLoading.value = true
  horariosMensagem.value = ''
  horariosDisponiveis.value = []

  try {
    const { data } = await api.get('/horarios-atendimento/buscarHorariosDisponivceisChat', {
      params: {
        idBarbeiro,
        dataSelecionada,
        servico: servicosSelecionados,
      },
    })

    if (Array.isArray(data?.horarios)) {
      horariosDisponiveis.value = data.horarios.map((item) => ({
        label: String(item),
        value: String(item),
      }))
      if (!horariosDisponiveis.value.length) {
        horariosMensagem.value = 'Nao ha horarios disponiveis para esse dia.'
      }
    } else {
      horariosDisponiveis.value = []
      horariosMensagem.value = 'Nao ha horarios disponiveis para esse dia.'
    }
  } catch (error) {
    console.error(error)
    horariosDisponiveis.value = []
    horariosMensagem.value = 'Nao foi possivel carregar os horarios.'
  } finally {
    horariosLoading.value = false
  }
}

// form.nome}\n` +
//       `Email: ${form.email}\n` +
//       `Telefone: ${form.telefone}\n` +
//       `Barbeiro: ${form.barbeiro}\n` +
//       `Servicos: ${form.servicos.join(', ')}\n` +
//       `Data: ${formatarDataBR(form.data)}\n` +
//       `Horario: ${form.horario}\n\n` +
//       `Posso confirmar o agendamento?`,

const SalvarAgendamento = async () => {
  try {
    const dataHorario = `${form.data} ${form.horario}:00`
    const payload = {
      nomeCliente: form.nome.trim(),
      emailCliente: form.email.trim(),
      telefoneCliente: form.telefone.replace(/\D/g, ''),
      servico_ids: form.servicos_ids,
      data_horario: dataHorario,
      status: 'agendado',
      barbeiro: form.barbeiro_id
    }
    const res = await api.post('/agendamentos/chat/criarNovoAgendamento', payload)
    if (res?.data?.tipo === 'sucesso') {
      const resumoFinal = [
        'Agendamento realizado com sucesso.',
        `Local: ${barbearia.value.nome}`,
        `Barbeiro: ${form.barbeiro}`,
        `Data: ${formatarDataBR(form.data)}`,
        `Horario: ${form.horario}`,
      ].join('\n')
      pushMessage('assistant', resumoFinal)
      agendamentoFinalizado.value = true
      return
    }
    pushMessage('assistant', 'Nao conseguimos agendar seu horario, tente novamente.')
  } catch (error) {
    console.error(error)
    pushMessage('assistant', 'Nao conseguimos agendar seu horario, tente novamente.')
  }
}

const buscarBarbearia = async (id) => {
  if (!id) {
    modalBarbeariaNaoEncontrada.value = true
    return false
  }

  try {
    const { data } = await api.get(`/barbearia/infoId${id}`)

    if (data?.barbearia) {
      barbearia.value = { ...barbearia.value, ...data.barbearia }
      const possuiServicos = (barbearia.value.barbeiros || []).some(
        item => Array.isArray(item?.servicos) && item.servicos.length
      )
      if (!possuiServicos) {
        modalBarbeariaSemServicos.value = true
        return false
      }
      return true
    } else {
      modalBarbeariaNaoEncontrada.value = true
      return false
    }
  } catch (error) {
    console.error(error)
    modalBarbeariaNaoEncontrada.value = true
    return false
  }
}

const avancar = () => {
  if (editTarget.value) {
    const finalIndex = steps.value.findIndex(step => step.key === 'final')
    editTarget.value = ''
    stepIndex.value = finalIndex >= 0 ? finalIndex : stepIndex.value
    const nextStep = steps.value[stepIndex.value]
    if (!nextStep) return
    pushMessage('assistant', nextStep.question())
    return
  }
  stepIndex.value += 1
  const nextStep = steps.value[stepIndex.value]
  if (!nextStep) return
  pushMessage('assistant', nextStep.question())
}

const confirmarAgendamento = () => {
  pushMessage('user', 'Confirmar agendamento')
  SalvarAgendamento()
}

onMounted(async () => {
  const ok = await buscarBarbearia(route.params.cod_agendamento)
  if (!ok) return
  isReady.value = true
  startFlow()
})
</script>

<style scoped>
.chat-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  color: #f8fafc;
  font-family: 'Inter', sans-serif;
  width: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  padding: 14px 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: 0.4px;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: #1f1300;
  overflow: hidden;
}

.brand-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-title {
  font-size: 1rem;
  font-weight: 700;
}

.brand-subtitle {
  font-size: 0.78rem;
  color: rgba(226, 232, 240, 0.7);
}

.header-chip {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #fef3c7;
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 4px 4px;
  max-height: 60vh;
}

.chat-bubbles {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  justify-content: flex-end;
}

.bubble {
  max-width: 76%;
  padding: 14px 16px;
  border-radius: 18px;
  position: relative;
  line-height: 1.4;
  font-size: 0.96rem;
}

.bubble-assistant {
  align-self: flex-start;
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-bottom-left-radius: 6px;
}

.bubble-user {
  align-self: flex-end;
  background: linear-gradient(135deg, rgba(189, 183, 183, 0.95), rgba(168, 166, 166, 0.95));
  color: #0f172a;
  border-bottom-right-radius: 6px;
}

.bubble-text {
  white-space: pre-wrap;
}

.bubble-time {
  margin-top: 6px;
  font-size: 0.7rem;
  opacity: 0.65;
}

.chat-input {
  /* background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.18); */
  border-radius: 18px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.chat-input-field {
  width: 100%;
  max-width: 360px;
  align-self: center;
}

.chat-input-field :deep(.q-field__control) {
  border-radius: 14px;
}

.send-btn {
  background: linear-gradient(135deg, #a4a5a7, #bfc2c7);
  color: #0f172a;
  font-weight: 700;
  border-radius: 12px;
  min-height: 40px;
  padding: 0 18px;
}

.servicos-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 2px 10px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.6) transparent;
}

.servicos-scroll::-webkit-scrollbar {
  height: 6px;
}

.servicos-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
  border-radius: 999px;
}

.servicos-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.servico-card {
  min-width: 160px;
  max-width: 200px;
  min-height: 110px;
  flex: 0 0 auto;
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background:
    radial-gradient(120px 80px at 80% -10%, rgba(252, 242, 219, 0.15), transparent 70%),
    linear-gradient(160deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.92));
  box-shadow: 0 10px 20px rgba(2, 6, 23, 0.35);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  gap: 8px;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.servico-card--ativo {
  border-color: rgba(245, 158, 11, 0.75);
  box-shadow: 0 14px 28px rgba(245, 158, 11, 0.18), 0 8px 16px rgba(15, 23, 42, 0.35);
  transform: translateY(-2px);
  background:
    radial-gradient(140px 90px at 85% -10%, rgba(226, 232, 240, 0.22), transparent 70%),
    linear-gradient(160deg, rgba(71, 85, 105, 0.88), rgba(51, 65, 85, 0.88));
}

.servico-card__nome {
  font-size: 0.98rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 0.2px;
}

.servico-card__preco {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: rgba(114, 113, 109, 0.92);
  text-transform: uppercase;
  margin-top: auto;
  align-self: flex-end;
}

.servico-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.servicos-action {
  display: flex;
  justify-content: center;
}

.servicos-action .primary-action {
  min-height: 40px;
  padding: 0 18px;
}

.horarios-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.horarios-loading,
.horarios-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 84px;
  border-radius: 14px;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  color: rgba(226, 232, 240, 0.85);
  background: rgba(15, 23, 42, 0.45);
  font-size: 0.9rem;
  text-align: center;
  padding: 12px;
}

.horarios-scroll {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.horario-card {
  min-width: 86px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(30, 41, 59, 0.7);
  color: #f8fafc;
  font-weight: 600;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.horario-card--ativo {
  border-color: rgba(34, 197, 94, 0.7);
  box-shadow: 0 10px 20px rgba(34, 197, 94, 0.18);
  transform: translateY(-1px);
}

.barbeiros-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 2px 10px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.6) transparent;
}

.barbeiros-scroll::-webkit-scrollbar {
  height: 6px;
}

.barbeiros-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
  border-radius: 999px;
}

.barbeiros-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.barbeiro-card {
  min-width: 120px;
  max-width: 140px;
  flex: 0 0 auto;
  border-radius: 16px;
  padding: 0;
  display: grid;
  justify-items: center;
  gap: 10px;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.6);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.barbeiro-card--ativo {
  border-color: rgba(245, 158, 11, 0.8);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.15);
  transform: translateY(-1px);
}

.barbeiro-card--indisponivel {
  opacity: 0.45;
  filter: grayscale(0.3);
  cursor: not-allowed;
}

.barbeiro-card__info {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  color: #f8fafc;
  background: rgba(15, 23, 42, 0.65);
}

.barbeiro-card__foto {
  width: 100%;
  height: 118px;
  border-radius: 16px 16px 10px 10px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.12);
}

.barbeiro-card__foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.barbeiro-card__foto-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #e2e8f0;
}

.barbeiro-card__nome {
  font-size: 0.8rem;
  font-weight: 600;
  color: #f8fafc;
  padding: 0 10px 12px;
}

.option-btn {
  border-radius: 14px;
  background: rgba(15, 118, 110, 0.2);
  color: #ccfbf1;
  border: 1px solid rgba(45, 212, 191, 0.35);
  font-weight: 600;
}

.final-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.edit-title {
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.85);
}

.edit-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.edit-option-btn {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  color: #e2e8f0;
  background: rgba(51, 60, 75, 0.9);
  font-weight: 700;
  min-height: 40px;
  padding: 0 18px;
}

.primary-action {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #052e16;
  font-weight: 700;
  border-radius: 14px;
}

.secondary-action {
  color: #e2e8f0;
}

.back-action {
  display: flex;
  justify-content: center;
}

.back-btn {
  color: rgba(226, 232, 240, 0.85);
  background: rgba(51, 60, 75, 0.9);
  border-radius: 12px;
  font-weight: 700;
  min-height: 40px;
  padding: 0 18px;
}

.erro-card {
  min-width: 320px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.98), rgba(17, 24, 39, 0.95));
  color: #f8fafc;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.35);
}

.erro-header {
  display: flex;
  gap: 14px;
  align-items: center;
  position: relative;
}

.erro-icon {
  position: relative;
  width: 0;
  height: 0;
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  border-bottom: 44px solid #f59e0b;
}

.erro-icon::after {
  content: '';
  position: absolute;
  left: -22px;
  top: 6px;
  width: 0;
  height: 0;
  border-left: 22px solid transparent;
  border-right: 22px solid transparent;
  border-bottom: 40px solid #f97316;
  z-index: -1;
}

.erro-icon-text {
  position: absolute;
  top: 12px;
  left: -4px;
  font-weight: 800;
  font-size: 1.2rem;
  color: #0f172a;
}

.erro-title {
  font-size: 1.05rem;
  font-weight: 700;
}

.erro-subtitle {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
}


.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.bubble-enter-to {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 600px) {
  .chat-shell {
    padding: 16px;
  }

  .chat-body {
    max-height: 50vh;
  }

  .bubble {
    max-width: 90%;
  }

  .input-row {
    grid-template-columns: 1fr;
  }

  .chat-input-field {
    max-width: 100%;
  }

  .send-btn,
  .back-btn,
  .edit-option-btn {
    width: 100%;
    justify-content: center;
  }

  .edit-options {
    width: 100%;
  }

  .servicos-action .primary-action {
    width: 100%;
  }
}

@media (min-width: 900px) {
  .input-row {
    align-items: center;
  }

  .chat-input-field {
    width: 100%;
    max-width: 480px;
  }

  .horarios-scroll {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    justify-items: center;
    gap: 6px;
    max-width: 560px;
    margin: 0 auto;
  }

  .back-btn {
    min-width: 220px;
  }

  .send-btn--stack {
    min-width: 220px;
  }
}
</style>
