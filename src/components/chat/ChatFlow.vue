<template>
  <div class="chat-shell">
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
      <transition-group v-if="isReady" name="bubble" tag="div" class="chat-bubbles">
        <div v-for="msg in messages" :key="msg.id" class="bubble"
          :class="msg.role === 'assistant' ? 'bubble-assistant' : 'bubble-user'">
          <div class="bubble-text">{{ msg.text }}</div>
          <div class="bubble-time">{{ msg.time }}</div>
        </div>
      </transition-group>

      <div v-else class="loading-state">
        <div class="loading-card">
          <q-spinner color="amber-5" size="32px" />
          <div class="loading-title">Carregando barbearia...</div>
          <div class="loading-subtitle">Preparando o atendimento.</div>
        </div>
      </div>
    </section>

    <section class="chat-input" v-if="isReady">
      <div v-if="currentStep?.type === 'select' && currentStep?.key === 'barbeiro'" class="barbeiros-scroll">
        <q-card
          v-for="barbeiro in barbeirosCards"
          :key="barbeiro.value"
          class="barbeiro-card"
          :class="{ 'barbeiro-card--ativo': form.barbeiro === barbeiro.value }"
          flat
          bordered
          clickable
          v-ripple
          @click="selectOption(barbeiro)"
        >
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
        <q-card
          v-for="option in currentStep.options"
          :key="option.value"
          class="servico-card"
          :class="{ 'servico-card--ativo': form.servico === option.value }"
          flat
          bordered
          clickable
          v-ripple
          @click="selectOption(option)"
        >
          <div class="servico-card__nome">
            {{ option.label }}
          </div>
        </q-card>
      </div>

      <div v-else-if="currentStep?.type === 'select'" class="options-grid">
        <q-btn v-for="option in currentStep.options" :key="option.value" :label="option.label" no-caps
          class="option-btn" @click="selectOption(option)" />
      </div>

      <div v-else-if="currentStep?.type === 'final'" class="final-actions">
        <q-btn label="Confirmar agendamento" class="primary-action" no-caps unelevated @click="confirmarAgendamento" />
        <q-btn label="Editar respostas" class="secondary-action" flat no-caps @click="reiniciar" />
      </div>

      <div v-else class="input-row">
        <q-input v-model="inputValue" dense dark filled :type="currentStep?.inputType || 'text'"
          :placeholder="currentStep?.placeholder" class="chat-input-field" @keyup.enter="enviarResposta" />
        <q-btn label="Enviar" no-caps unelevated class="send-btn" @click="enviarResposta" />
      </div>

      <div v-if="inputError" class="input-error">{{ inputError }}</div>
    </section>
  </div>
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

const barbearia = ref({
  nome: 'Barbearia Modelo',
  barbeiros: [],
})

const form = reactive({
  nome: '',
  email: '',
  telefone: '',
  barbeiro: '',
  servico: '',
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
        value: nome,
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
        value: nome,
        fotoUrl: fotoBarbeiroUrl(item?.user?.foto || null),
      }
    })
    .filter(Boolean)

  if (mapped.length) return mapped
  return [{ label: 'Qualquer barbeiro', value: 'qualquer', fotoUrl: null }]
})

const steps = computed(() => [
  {
    key: 'nome',
    inputType: 'text',
    placeholder: 'Digite seu nome',
    validate: value => value.trim().length >= 2,
    error: 'Informe seu nome.',
    question: () =>
      `Ola, eu sou a assistente da ${barbeariaTitulo.value}. Qual e o seu nome?`,
  },
  {
    key: 'email',
    inputType: 'email',
    placeholder: 'Digite seu email',
    validate: value => /\S+@\S+\.\S+/.test(value),
    error: 'Informe um email valido.',
    question: () => `Prazer, ${form.nome}. Qual e o seu email?`,
  },
  {
    key: 'telefone',
    inputType: 'tel',
    placeholder: 'Digite seu telefone',
    validate: value => value.replace(/\D/g, '').length >= 10,
    error: 'Informe um telefone com DDD.',
    question: () => 'Qual telefone podemos usar no agendamento?',
  },
  {
    key: 'barbeiro',
    type: 'select',
    options: barbeirosOptions.value.length
      ? barbeirosOptions.value
      : [{ label: 'Qualquer barbeiro', value: 'qualquer' }],
    question: () => 'Com qual barbeiro voce quer ser atendido?',
  },
  {
    key: 'servico',
    type: 'select',
    options: [
      { label: 'Corte', value: 'Corte' },
      { label: 'Barba', value: 'Barba' },
      { label: 'Corte + Barba', value: 'Corte + Barba' },
      { label: 'Acabamento', value: 'Acabamento' },
    ],
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
    options: [
      { label: '09:00', value: '09:00' },
      { label: '10:30', value: '10:30' },
      { label: '14:00', value: '14:00' },
      { label: '16:30', value: '16:30' },
    ],
    question: () => 'Qual horario fica melhor?',
  },
  {
    key: 'final',
    type: 'final',
    question: () =>
      `Resumo: ${form.nome} - ${form.email} - ${form.telefone}. Barbeiro: ${form.barbeiro}. Servico: ${form.servico} em ${form.data} as ${form.horario}. Posso confirmar o agendamento?`,
  },
])

const currentStep = computed(() => steps.value[stepIndex.value])

const formatTime = date => {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
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
  pushMessage('assistant', steps.value[0].question())
}

const enviarResposta = () => {
  const step = currentStep.value
  if (!step || step.type === 'select' || step.type === 'final') return

  const value = inputValue.value.trim()
  if (step.validate && !step.validate(value)) {
    inputError.value = step.error || 'Resposta invalida.'
    return
  }

  inputError.value = ''
  form[step.key] = value
  pushMessage('user', value)
  inputValue.value = ''
  avancar()
}

const selectOption = option => {
  const step = currentStep.value
  if (!step || step.type !== 'select') return

  form[step.key] = option.value
  pushMessage('user', option.label)
  avancar()
}

const buscarBarbearia = async (id) => {
  if (!id) {
    return
  }

  try {
    const { data } = await api.get(`/barbearia/${id}`)

    if (data?.barbearia) {
      barbearia.value = { ...barbearia.value, ...data.barbearia }
    } else {
      barbearia.value = { ...barbearia.value, nome: `Barbearia ${id}` }
    }
  } catch (error) {
    console.error(error)
    barbearia.value = { ...barbearia.value, nome: `Barbearia ${id}` }
  }
}

const avancar = () => {
  stepIndex.value += 1
  const nextStep = steps.value[stepIndex.value]
  if (!nextStep) return
  pushMessage('assistant', nextStep.question())
}

const confirmarAgendamento = () => {
  pushMessage('user', 'Confirmar agendamento')
  pushMessage(
    'assistant',
    'Agendamento registrado. Em instantes voce recebera a confirmacao.'
  )
}

const reiniciar = () => {
  startFlow()
}

onMounted(async () => {
  await buscarBarbearia(route.params.id)
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
  font-family: 'Sora', 'Manrope', sans-serif;
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
  display: grid;
  grid-template-columns: minmax(0, 360px) auto;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.chat-input-field {
  max-width: 360px;
}

.chat-input-field :deep(.q-field__control) {
  border-radius: 14px;
}

.send-btn {
  background: linear-gradient(135deg, #a4a5a7, #bfc2c7);
  color: #0f172a;
  font-weight: 700;
  border-radius: 12px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
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
  min-width: 140px;
  max-width: 180px;
  height: 100px;
  flex: 0 0 auto;
  border-radius: 14px;
  padding: 12px 14px;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(103, 106, 112, 0.6);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.servico-card--ativo {
  border-color: rgba(226, 232, 240, 0.6);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2);
  transform: translateY(-1px);
}

.servico-card__nome {
  font-size: 0.85rem;
  font-weight: 600;
  color: #f8fafc;
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
}

.barbeiro-card--ativo {
  border-color: rgba(245, 158, 11, 0.8);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.15);
  transform: translateY(-1px);
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

.primary-action {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #052e16;
  font-weight: 700;
  border-radius: 14px;
}

.secondary-action {
  color: #e2e8f0;
}

.input-error {
  color: #fca5a5;
  font-size: 0.8rem;
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

.loading-state {
  height: 100%;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  display: grid;
  justify-items: center;
  gap: 10px;
  text-align: center;
  padding: 20px 26px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.7);
}

.loading-title {
  font-weight: 700;
}

.loading-subtitle {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
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
}

@media (min-width: 900px) {
  .input-row {
    grid-template-columns: minmax(0, 480px) auto;
  }

  .chat-input-field {
    max-width: 480px;
  }
}
</style>
