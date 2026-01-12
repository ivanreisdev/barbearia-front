<template>
  <q-page padding>
    <!-- Cabeçalho -->
    <div class="row justify-between items-center q-mb-lg">
      <h4 :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Agendamentos do dia</h4>
    </div>

    <!-- Lista de Agendamentos por hora -->
    <div class="q-gutter-md">
      <q-card
        v-for="slot in horariosDoDia"
        :key="slot.hora"
        clickable
        :class="[
          slot.agendamento
            ? statusClass(slot.agendamento.status)
            : $q.dark.isActive
              ? 'bg-grey-10'
              : 'bg-grey-2',
          $q.dark.isActive ? 'text-white' : 'text-dark',
        ]"
        class="q-pa-md q-mb-md card-agendamento"
        style="position: relative"
      >
        <!-- Botão + para criar novo agendamento -->
        <q-btn
          v-if="!slot.agendamento"
          icon="add"
          round
          dense
          color="primary"
          size="sm"
          flat
          class="absolute-top-right q-mr-xs q-mt-xs"
          @click="abrirModal(slot.hora)"
        />

        <q-card-section>
          <div class="text-caption">{{ slot.hora }}:00</div>

          <template v-if="slot.agendamento">
            <div class="text-h6 q-mt-xs">
              <strong>{{ slot.agendamento.servico.nome }}</strong> -
              {{ formatoMoeda(slot.agendamento.servico.preco) }}
            </div>

            <div class="text-caption q-mt-xs">
              Cliente: {{ slot.agendamento.usuario.name }}<br />
              Barbeiro: {{ slot.agendamento.barbeiro.nome }}
            </div>
          </template>

          <template v-else>
            <div class="text-body2 q-mt-xs text-grey-5">Sem agendamento</div>
          </template>
        </q-card-section>

        <q-separator v-if="slot.agendamento" />

        <q-card-actions align="right" v-if="slot.agendamento">
          <q-chip :color="statusColor(slot.agendamento.status)" text-color="white" dense>
            {{ slot.agendamento.status }}
          </q-chip>
        </q-card-actions>
      </q-card>
    </div>

    <!-- Modal de novo agendamento -->
    <q-dialog v-model="modalAberto" maximized persistent>
      <div class="agendamento-wrapper">
        <!-- HEADER -->
        <div class="header-agendamento">
          <q-btn
            icon="arrow_back"
            flat
            round
            color="white"
            class="absolute-top-left q-ma-md"
            @click="modalAberto = false"
          />

          <div class="header-content">
            <div class="text-h5 text-weight-medium">Novo agendamento</div>
            <div class="text-caption opacity-8">
              Preencha todos os campos para realizar um novo agendamento.
            </div>
          </div>
        </div>

        <!-- CARD -->
        <q-card class="card-form">
          <q-card-section class="q-gutter-md">
            <q-input v-model="novoAgendamento.cliente" rounded filled label="Nome do cliente" />

            <q-input
              v-model="novoAgendamento.telefone"
              rounded
              filled
              label="Telefone"
              mask="(##) #####-####"
            />

            <q-select
              v-model="novoAgendamento.servico"
              :options="servicos"
              option-label="nome"
              option-value="id"
              emit-value
              map-options
              rounded
              filled
              label="Selecione um serviço"
              @update:model-value="atualizarPreco"
            />

            <q-input
              v-model="novoAgendamento.data"
              type="date"
              rounded
              filled
              label="Data"
              readonly
            />

            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-input v-model="novoAgendamento.hora" rounded filled label="Horário" readonly />
              </div>

              <div class="col-auto">
                <q-chip color="positive" text-color="white" class="q-mt-sm"> Livre </q-chip>
              </div>
            </div>

            <q-toggle
              v-model="novoAgendamento.repetir"
              label="Repetir este agendamento"
              color="primary"
            />
          </q-card-section>

          <!-- BOTÃO -->
          <q-card-actions class="q-pa-md">
            <q-btn
              label="AGENDAR"
              class="btn-agendar full-width"
              unelevated
              @click="salvarAgendamento"
            />
          </q-card-actions>
        </q-card>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Props do Dashboard
const props = defineProps({
  dataSelecionada: { type: Date, required: true },
})
const dataSelecionada = toRef(props, 'dataSelecionada')

const agendamentos = ref([])
const servicos = ref([]) // Serviços para o q-select

// Modal
const modalAberto = ref(false)
const novoAgendamento = ref({
  cliente: '',
  servico: null,
  preco: 0,
  barbeiro: '',
})

// Função para abrir modal
const abrirModal = async (hora) => {
  modalAberto.value = true

  const data = new Date(dataSelecionada.value)
  const dataFormatada = data.toISOString().split('T')[0]

  novoAgendamento.value = {
    cliente: '',
    telefone: '',
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
    $q.notify({ type: 'negative', message: 'Erro ao carregar serviços' })
  }
}

// Carregar agendamentos do dia
const loadAgendamentos = async () => {
  try {
    const { data } = await api.get('/agendamentos/buscarAgendamentos')
    agendamentos.value = data
  } catch (err) {
    console.error(err)
  }
}

// Computed: horários do dia das 8h às 18h
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

// Quando o serviço é selecionado, atualiza automaticamente o preço
const atualizarPreco = (servicoId) => {
  const selecionado = servicos.value.find((s) => s.id === servicoId)
  if (selecionado) {
    novoAgendamento.value.preco = selecionado.preco
  } else {
    novoAgendamento.value.preco = 0
  }
}

// Cores por status
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

// Classe de background por status
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

// Formatar moeda
const formatoMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

// Salvar novo agendamento
const salvarAgendamento = async () => {
  const dataHora = `${novoAgendamento.value.data} ${novoAgendamento.value.hora}:00`

  const payload = {
    usuario_id: novoAgendamento.value.cliente, // ajuste conforme seu backend
    servico_id: novoAgendamento.value.servico,
    barbeiro_id: novoAgendamento.value.barbeiro,
    data_horario: dataHora,
    status: 'agendado',
  }

  try {
    await api.post('/agendamentos/novo', payload)
    $q.notify({ type: 'positive', message: 'Agendamento criado!' })
    modalAberto.value = false
    await loadAgendamentos()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Erro ao criar agendamento' })
  }
}

// Inicialmente carrega agendamentos
loadAgendamentos()
</script>

<style scoped>
.card-agendamento {
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s;
}
.card-agendamento:hover {
  transform: translateY(-2px);
}
.absolute-top-right {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.card-agendamento {
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s;
}
.card-agendamento:hover {
  transform: translateY(-2px);
}
.absolute-top-right {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
.agendamento-wrapper {
  min-height: 100vh;
  background: radial-gradient(circle at top, #0d1b2a, #050b14);
}

.header-agendamento {
  height: 220px;
  background:
    linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),
    url('/img/barbearia-bg.jpg') center/cover;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.header-content {
  padding-top: 40px;
}

.card-form {
  max-width: 420px;
  margin: -60px auto 0;
  border-radius: 22px;
  background: #1e1e1e;
  color: white;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

.q-field--filled .q-field__control {
  background: #2a2a2a;
}

.btn-agendar {
  background: linear-gradient(135deg, #e38b5a, #d17442);
  color: white;
  height: 52px;
  border-radius: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}
</style>
