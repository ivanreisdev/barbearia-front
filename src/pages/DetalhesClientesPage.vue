<template>
  <LoadingLogo v-if="carregando" class="loading-overlay" />

  <q-page v-else class="q-pa-md detalhes-page">
    <!-- Header -->
    <div class="row items-center q-mb-lg page-header no-wrap">
      <q-btn flat round icon="arrow_back" class="back-btn" @click="$router.back()" />

      <div class="q-ml-md column">
        <div class="text-h5 text-weight-bold title-gradient">
          Detalhes do Cliente
        </div>
        <div class="text-caption text-grey-5 subtitle-soft">
          Visão geral de dados pessoais, histórico e serviços
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Coluna esquerda: perfil -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card-dark card-profile">
          <q-card-section class="row items-center no-wrap q-col-gutter-sm">
            <q-avatar size="50px" color="grey-8" text-color="white" class="profile-avatar">
              {{ clientes.nome?.charAt(0) || '?' }}
            </q-avatar>

            <div class="col">
              <div class="text-subtitle1 text-weight-bold ellipsis profile-name">
                {{ clientes.nome }}
              </div>
              <!-- <div class="text-caption text-grey-5">Cliente desde {{ cliente.desde }}</div> -->
            </div>
          </q-card-section>

          <q-separator dark class="separator-soft" />

          <q-card-section class="q-gutter-sm">
            <div class="row items-center info-row">
              <q-icon name="mail" size="18px" class="text-grey-5 q-mr-sm" />
              <div class="text-body2 ellipsis">{{ clientes.email }}</div>
            </div>
            <div class="row items-center info-row">
              <q-icon name="phone" size="18px" class="text-grey-5 q-mr-sm" />
              <div class="text-body2">{{ clientes.celular }}</div>
            </div>
            <!-- <div class="row items-center">
              <q-icon name="place" size="18px" class="text-grey-5 q-mr-sm" />
              <div class="text-body2 ellipsis">{{ cliente.endereco }}</div>
            </div> -->
          </q-card-section>

          <q-separator dark class="separator-soft" />

          <q-card-section class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5 tituloDash">Agendamentos</div>
                <div class="text-h6 text-weight-bold stat-value">{{ stats.totalAgendamentos }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5 tituloDash">Serviços</div>
                <div class="text-h6 text-weight-bold stat-value">{{ stats.totalServicos }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5 tituloDash">Ticket Médio</div>
                <div class="text-h6 text-weight-bold stat-value">{{ stats.ticketMedio }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5 tituloDash">Última visita</div>
                <div class="text-h6 text-weight-bold stat-value">{{ stats.ultimaVisita }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Coluna direita: histórico -->
      <div class="col-12 col-md-8">
        <div class="row q-col-gutter-md">
          <!-- Agendamentos -->
          <div class="col-12">
            <q-card flat bordered class="card-dark">
              <q-card-section class="row items-center justify-between section-header">
                <div>
                  <div class="text-subtitle1 text-weight-bold texto-comun">Agendamentos</div>
                  <div class="text-caption text-grey-5">Histórico recente</div>
                </div>
                <q-btn
                  flat
                  dense
                  color="grey-4"
                  label="Ver todos"
                  class="ghost-btn"
                  :disable="!podeVerTodos"
                  @click="modalAgendamentos = true"
                />
              </q-card-section>

              <q-separator dark class="separator-soft" />

              <q-list v-if="agendamentosVisiveis.length > 0" separator dark>
                <q-item
                  v-for="ag in agendamentosVisiveis"
                  :key="ag.id"
                  class="item-dark item-hover"
                  :class="ag.status === 'cancelado' ? 'item-cancelado' : ''"
                >
                  <q-item-section avatar>
                    <q-avatar size="36px" color="grey-8" text-color="white">
                      <q-icon name="event" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium" :class="ag.status === 'cancelado' ? 'text-cancelado' : ''">
                      {{ ag.data }} • {{ ag.hora }}
                    </q-item-label>
                    <q-item-label caption class="text-grey-5" :class="ag.status === 'cancelado' ? 'text-cancelado' : ''">
                      {{ ag.servico.nome }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="price-text" :class="ag.status === 'cancelado' ? 'text-cancelado' : ''">
                      {{ formatarPreco(ag.servico.preco)  }}
                    </div>
                    <q-chip
                      v-if="ag.status === 'cancelado'"
                      dense
                      color="red-5"
                      text-color="white"
                      size="sm"
                      class="status-chip status-chip-cancelado"
                      icon="cancel"
                    >
                      Cancelado
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-grey text-center q-pa-md empty-state">
                Não há agendamentos
              </div>

              <q-dialog v-model="modalAgendamentos" maximized>
                <q-card flat bordered class="card-dark modal-fullscreen">
                  <q-card-section class="row items-center justify-between">
                    <div>
                      <div class="text-subtitle1 text-weight-bold texto-comun">Todos os agendamentos</div>
                      <div class="text-caption text-grey-5">Histórico completo</div>
                    </div>
                    <q-btn flat round icon="close" color="grey-4" @click="modalAgendamentos = false" />
                  </q-card-section>

                  <q-separator dark class="separator-soft" />

                  <q-card-section class="modal-toolbar q-pa-md">
                    <div class="toolbar-left">
                      <div class="text-caption text-grey-5">Filtrar a partir de</div>
                      <q-input
                        v-model="filtroDataInicio"
                        dense
                        outlined
                        color="grey-4"
                        class="input-dark input-date"
                        placeholder="dd/mm/aaaa"
                      >
                        <template #prepend>
                          <q-icon name="event" />
                        </template>
                        <template #append>
                          <q-icon name="keyboard_arrow_down" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date v-model="filtroDataInicio" mask="DD/MM/YYYY" color="grey-9" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="toolbar-center">
                      <div class="text-caption text-grey-5">Status</div>
                      <q-select
                        v-model="filtroStatus"
                        dense
                        outlined
                        color="grey-4"
                        class="input-dark input-status"
                        :options="['todos', 'agendado', 'cancelado']"
                      />
                    </div>
                    <div class="toolbar-right">
                      <q-btn
                        outline
                        color="grey-4"
                        label="Limpar"
                        class="ghost-btn btn-compact"
                        @click="limparFiltros"
                      />
                    </div>
                  </q-card-section>

                  <q-separator dark class="separator-soft" />

                  <q-card-section class="q-pa-none">
                    <q-list v-if="agendamentosFiltrados.length > 0" separator dark>
                      <q-item
                        v-for="ag in agendamentosFiltrados"
                        :key="ag.id"
                        class="item-dark item-hover"
                        :class="ag.status === 'cancelado' ? 'item-cancelado' : ''"
                      >
                        <q-item-section avatar>
                          <q-avatar size="36px" color="grey-8" text-color="white">
                            <q-icon name="event" />
                          </q-avatar>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label class="text-weight-medium" :class="ag.status === 'cancelado' ? 'text-cancelado' : ''">
                            {{ ag.data }} • {{ ag.hora }}
                          </q-item-label>
                          <q-item-label caption class="text-grey-5" :class="ag.status === 'cancelado' ? 'text-cancelado' : ''">
                            {{ ag.barbeiro.nome }} · {{ ag.status }}
                          </q-item-label>
                        </q-item-section>

                        <q-item-section side>
                          <q-chip outline color="green-5" text-color="white" size="sm" class="price-chip">
                            {{ formatarPreco(ag.servico.preco) }}
                          </q-chip>
                          <q-chip
                            v-if="ag.status === 'cancelado'"
                            dense
                            color="red-5"
                            text-color="white"
                            size="sm"
                            class="status-chip status-chip-cancelado"
                            icon="cancel"
                          >
                            Cancelado
                          </q-chip>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <div v-else class="text-grey text-center q-pa-md empty-state">
                      Não há agendamentos no período
                    </div>
                  </q-card-section>
                </q-card>
              </q-dialog>
            </q-card>
          </div>

          <!-- Top serviços -->
          <div class="col-12">
            <q-card flat bordered class="card-dark">
              <q-card-section class="row items-center justify-between section-header">
                <div>
                  <div class="text-subtitle1 text-weight-bold">Top Serviços Realizados</div>
                  <div class="text-caption text-grey-5">Ranking dos mais frequentes</div>
                </div>
              </q-card-section>

              <q-separator dark class="separator-soft" />

              <div v-if="topServicos.length > 0" class="podium-wrap q-pa-md">
                <div class="podium-grid">
                  <div class="podium-col" :class="podiumColClass(topServicos[1]?.nome)">
                    <div class="podium-card podium-2">
                      <div class="podium-rank">2</div>
                      <div class="podium-name">{{ topServicos[1]?.nome}}</div>
                      <div class="podium-count">{{ topServicos[1]?.quantidade ?? 0 }}x</div>
                    </div>
                  </div>
                  <div class="podium-col" :class="podiumColClass(topServicos[0]?.nome)">
                    <div class="podium-card podium-1">
                      <div class="podium-rank">1</div>
                      <div class="podium-name">{{ topServicos[0]?.nome}}</div>
                      <div class="podium-count">{{ topServicos[0]?.quantidade ?? 0 }}x</div>
                    </div>
                  </div>
                  <div class="podium-col" :class="podiumColClass(topServicos[2]?.nome)">
                    <div class="podium-card podium-3">
                      <div class="podium-rank">3</div>
                      <div class="podium-name">{{ topServicos[2]?.nome}}</div>
                      <div class="podium-count">{{ topServicos[2]?.quantidade ?? 0 }}x</div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-grey text-center q-pa-md empty-state">
                Não há Serviços realizados
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios';
import { ref, onMounted, computed } from 'vue'
import { notifyError } from '../scripts/notificaçoes'
import { useRoute } from 'vue-router'
import { Loading, useQuasar } from 'quasar'
import LoadingLogo from 'components/LoadingLogo.vue'

const route = useRoute()
const $q = useQuasar()

const clientes = ref({
  nome: '',
  email: '',
  celular: '',
})

const agendamentos = ref([])
const carregando = ref(true)
const modalAgendamentos = ref(false)
const filtroDataInicio = ref('')
const filtroStatus = ref('todos')


const buscarClientes = async (id) => {
  try {
    const response = await api.get(`/clientes/buscarClientePorId/`,
      {
        params: { id }
      }
    )
    const clienteResponse = response.data.clientes[0]
    clientes.value.nome = clienteResponse.nome
    clientes.value.email = clienteResponse.email
    clientes.value.celular = clienteResponse.celular

    agendamentos.value = formatarAgendamentos(clienteResponse.agendamentos || [])


  } catch (error) {
    console.error(error)
    notifyError('erro ao buscar Dados Do Cliente')
  }
}

const formatarPreco = (valor) => {
  if (!valor) return 'R$ 0,00'

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(valor))
}


const topServicos = computed(() => {
  const contagem = agendamentos.value
    .filter(ag => ag.status === 'agendado')
    .reduce((acc, ag) => {
    const nome = ag.servico?.nome ?? 'Serviço'
    acc[nome] = (acc[nome] || 0) + 1
    return acc
  }, {})

  return Object.entries(contagem)
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 3)
})

const podiumColClass = (nome) => {
  if (!nome) return ''
  const soUmaPalavra = !String(nome).trim().includes(' ')
  return soUmaPalavra ? 'podium-col-wide' : ''
}

const agendamentosOrdenados = computed(() => {
  return [...agendamentos.value].sort((a, b) => {
    const dataA = new Date(a.data_horario.replace(' ', 'T'))
    const dataB = new Date(b.data_horario.replace(' ', 'T'))
    return dataB - dataA
  })
})

const limiteAgendamentos = computed(() => {
  return $q.screen.lt.md ? 3 : 10
})

const agendamentosVisiveis = computed(() => {
  return agendamentosOrdenados.value.slice(0, limiteAgendamentos.value)
})

const podeVerTodos = computed(() => {
  return agendamentosOrdenados.value.length > limiteAgendamentos.value
})

const limparFiltros = () => {
  filtroDataInicio.value = ''
  filtroStatus.value = 'todos'
}

const parseDataFiltro = (dataStr) => {
  if (!dataStr) return null
  const [dia, mes, ano] = dataStr.split('/').map(Number)
  if (!dia || !mes || !ano) return null
  return new Date(ano, mes - 1, dia)
}

const agendamentosFiltrados = computed(() => {
  const inicio = parseDataFiltro(filtroDataInicio.value)
  const inicioNorm = inicio ? new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate(), 0, 0, 0) : null

  return agendamentosOrdenados.value.filter((ag) => {
    const dataAg = new Date(ag.data_horario.replace(' ', 'T'))
    if (inicioNorm && dataAg < inicioNorm) return false
    if (filtroStatus.value !== 'todos' && ag.status !== filtroStatus.value) return false
    return true
  })
})
const formatarAgendamentos = (agendamentosApi) => {
  return agendamentosApi.map(ag => {
    const dataObj = new Date(ag.data_horario.replace(' ', 'T'))

    return {
      ...ag,
      data: dataObj.toLocaleDateString('pt-BR'),
      hora: dataObj.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  })
}


const stats = computed(() => {
  const ags = agendamentos.value || []

  const agendamentosValidos = ags.filter(ag => ag.status !== 'cancelado')
  const totalAgendamentos = agendamentosValidos.length

  // serviços realizados (normalmente = agendamentos)
  const totalServicos = ags.filter(ag => ag.status === 'agendado').length
  // se não tiver status, pode ser: ags.length

  // soma dos valores (ignora cancelados)
  const totalFaturado = agendamentosValidos.reduce((total, ag) => {
    return total + Number(ag.servico?.preco ?? 0)
  }, 0)

  const ticketMedio =
    totalAgendamentos > 0 ? totalFaturado / totalAgendamentos : 0

  // última visita (data mais recente)
  const ultimaData = ags.filter(ag => ag.status === 'agendado')
    .map(ag => new Date(ag.data_horario.replace(' ', 'T')))
    .sort((a, b) => b - a)[0]

  return {
    totalAgendamentos,
    totalServicos,
    ticketMedio: formatarPreco(ticketMedio),
    ultimaVisita: ultimaData
      ? ultimaData.toLocaleDateString('pt-BR')
      : '-',
  }
})

onMounted(async () => {
  Loading.show({
    spinner: LoadingLogo,
    backgroundColor: '#0c0d10'
  })

  try {
    await buscarClientes(route.params.id)
  } finally {
    carregando.value = false
    Loading.hide()
  }
})


</script>

<style scoped>
.detalhes-page {
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
  background:
    radial-gradient(1200px 600px at 10% -20%, rgba(34, 197, 94, 0.12), transparent 60%),
    radial-gradient(900px 500px at 110% 10%, rgba(59, 130, 246, 0.10), transparent 55%),
    linear-gradient(180deg, #0f1115 0%, #0c0d10 100%);
  border-radius: 16px;
}

.card-dark {
  background: linear-gradient(180deg, #12151b 0%, #0f1116 100%);
  border-color: rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.card-profile {
  position: sticky;
  top: 16px;
}

.page-header {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.title-gradient {
  background: linear-gradient(90deg, #e5e7eb 0%, #9ca3af 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle-soft {
  letter-spacing: 0.2px;
}

.back-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.profile-avatar {
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.12),
    0 6px 16px rgba(0, 0, 0, 0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
}

:deep(.profile-avatar .q-avatar__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  width: 100%;
  height: 100%;
  transform: translate(-4px, -2px);
}

.stat-card {
  background: #151922;
  border-radius: 14px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.item-dark {
  border-color: rgba(255, 255, 255, 0.06);
}

.item-hover {
  transition: background 160ms ease, transform 160ms ease;
}

.item-hover:hover {
  background: rgba(255, 255, 255, 0.03);
  transform: translateX(2px);
}

.card-service {
  border-radius: 16px;
  transition: transform 160ms ease, border-color 160ms ease;
}

.card-service:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.18);
}

.podium-wrap {
  display: flex;
  justify-content: center;
}

.podium-grid {
  display: flex;
  gap: 14px;
  width: 100%;
  align-items: flex-end;
}

.podium-col {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  align-items: flex-end;
}

.podium-card {
  width: 100%;
  border-radius: 16px;
  padding: 14px 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: visible;
}

.podium-1 {
  min-height: 180px;
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.22), rgba(15, 17, 22, 0.95));
  border-color: rgba(251, 191, 36, 0.35);
}

.podium-2 {
  min-height: 150px;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.22), rgba(15, 17, 22, 0.95));
  border-color: rgba(148, 163, 184, 0.35);
}

.podium-3 {
  min-height: 130px;
  background: linear-gradient(180deg, rgba(202, 138, 4, 0.18), rgba(15, 17, 22, 0.95));
  border-color: rgba(202, 138, 4, 0.3);
}

.podium-1::after,
.podium-2::after,
.podium-3::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.22);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.podium-1::after {
  height: 34px;
}

.podium-2::after {
  height: 26px;
}

.podium-3::after {
  height: 20px;
}

.podium-rank {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.podium-name {
  margin-top: 10px;
  font-weight: 700;
  white-space: normal;
  word-break: break-word;
  line-height: 1.2;
}

.podium-count {
  margin-top: 6px;
  font-size: 0.95rem;
  color: #9ca3af;
}

@media (max-width: 599px) {
  .podium-wrap {
    padding: 10px;
  }
  .podium-grid {
    gap: 10px;
  }
  .podium-card {
    padding: 12px 4px;
  }
  .podium-rank {
    font-size: 1rem;
  }
  .podium-name {
    font-size: 0.8rem;
  }
  .podium-count {
    font-size: 0.72rem;
  }
  .podium-1,
  .podium-2,
  .podium-3 {
    min-height: 105px;
  }
  .podium-1 {
    min-height: 140px;
  }
  .podium-2 {
    min-height: 120px;
  }
  .podium-3 {
    min-height: 110px;
  }
}

.btn-dark {
  border-radius: 12px;
}

.section-header {
  padding-bottom: 8px;
}

.separator-soft {
  opacity: 0.6;
}

.info-row {
  padding: 4px 0;
}

.profile-name {
  letter-spacing: 0.2px;
}

.stat-value {
  color: #e5e7eb;
  text-align: center;
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0 10px;
}

.modal-fullscreen {
  min-width: 100%;
  min-height: 100%;
  border-radius: 0;
  overflow-x: hidden;
}

.modal-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  background: linear-gradient(180deg, rgba(18, 21, 27, 0.9), rgba(15, 17, 22, 0.9));
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: nowrap;
  overflow-x: hidden;
}

.toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 0;
  min-width: 0;
}

.toolbar-center {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 0;
  min-width: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.input-date {
  min-width: 0;
}

.input-status {
  min-width: 0;
}

.input-date,
.input-status {
  width: 100%;
}

.btn-compact {
  min-width: 84px;
  padding: 0 8px;
}

.input-dark :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.input-dark :deep(.q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.12);
}

.input-dark :deep(.q-field__append),
.input-dark :deep(.q-field__prepend) {
  color: rgba(255, 255, 255, 0.6);
}

.price-chip {
  border-radius: 800px;
  letter-spacing: 0.2px;
  font-size: 0.9rem;
  padding: 2px 8px;
  line-height: 1.1;
  font-weight: 600;
}

.price-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e5e7eb;
  letter-spacing: 0.2px;
}

.status-chip {
  margin-top: 6px;
}

.status-chip-cancelado {
  box-shadow: 0 6px 14px rgba(239, 68, 68, 0.28);
}

.item-cancelado {
  opacity: 0.65;
  background: rgba(239, 68, 68, 0.04);
}

.text-cancelado {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  text-decoration-color: rgba(239, 68, 68, 0.6);
}

.empty-state {
  opacity: 0.7;
}

@media (max-width: 1023px) {
  .card-profile {
    position: static;
  }
}

.texto-comun {
  font-family: 'Inter', sans-serif;
}
.tituloDash{
  text-align: center;
}
</style>
