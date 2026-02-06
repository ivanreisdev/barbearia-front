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
                <div class="text-caption text-grey-5">Agendamentos</div>
                <div class="text-h6 text-weight-bold stat-value">{{ stats.totalAgendamentos }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5">Serviços</div>
                <div class="text-h6 text-weight-bold stat-value">{{ stats.totalServicos }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5">Ticket Médio</div>
                <div class="text-h6 text-weight-bold stat-value">{{ stats.ticketMedio }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5">Última visita</div>
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
                <q-btn flat dense color="grey-4" label="Ver todos" class="ghost-btn" />
              </q-card-section>

              <q-separator dark class="separator-soft" />

              <q-list v-if="agendamentos.length > 0" separator dark>
                <q-item v-for="ag in agendamentos" :key="ag.id" class="item-dark item-hover">
                  <q-item-section avatar>
                    <q-avatar size="36px" color="grey-8" text-color="white">
                      <q-icon name="event" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ ag.data }} • {{ ag.hora }}</q-item-label>
                    <q-item-label caption class="text-grey-5">
                      {{ ag.barbeiro.nome }} · {{ ag.status }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-chip outline color="green-5" text-color="white" size="sm" class="price-chip">
                      {{ formatarPreco(ag.servico.preco) }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-grey text-center q-pa-md empty-state">
                Não há agendamentos
              </div>
            </q-card>
          </div>

          <!-- Serviços realizados -->
          <div class="col-12">
            <q-card flat bordered class="card-dark">
              <q-card-section class="row items-center justify-between section-header">
                <div>
                  <div class="text-subtitle1 text-weight-bold">Serviços Realizados</div>
                  <div class="text-caption text-grey-5">Últimos serviços executados</div>
                </div>
                <q-btn flat dense color="grey-4" label="Relatório" class="ghost-btn" />
              </q-card-section>

              <q-separator dark class="separator-soft" />

              <div v-if="servicos.length > 0" class="row q-col-gutter-md q-pa-md">
                <div v-for="srv in servicos" :key="srv.id" class="col-12 col-sm-6">
                  <q-card flat bordered class="card-dark card-service">
                    <q-card-section class="row items-center justify-between">
                      <div>
                        <div class="text-weight-bold">{{ srv.nome }}</div>
                        <div class="text-caption text-grey-5">{{ srv.data }} · {{ srv.hora }}</div>
                      </div>
                      <q-chip color="grey-9" text-color="white" size="sm" class="price-chip">
                        {{ srv.valor }}
                      </q-chip>
                    </q-card-section>
                  </q-card>
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
import { Loading } from 'quasar'
import LoadingLogo from 'components/LoadingLogo.vue'

const route = useRoute()

const clientes = ref({
  nome: '',
  email: '',
  celular: '',
})

const agendamentos = ref([])
const carregando = ref(true)


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

const servicos = computed(() => {
  return agendamentos.value.map(ag => ({
    id: ag.id,
    nome: ag.servico?.nome ?? 'Serviço',
    data: ag.data,
    hora: ag.hora, // já formatada
    profissional: ag.barbeiro?.name ?? '-',
    valor: formatarPreco(ag.servico?.preco ?? 0),
  }))
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

  const totalAgendamentos = ags.length

  // serviços realizados (normalmente = agendamentos)
  const totalServicos = ags.filter(ag => ag.status === 'agendado').length
  // se não tiver status, pode ser: ags.length

  // soma dos valores
  const totalFaturado = ags.reduce((total, ag) => {
    return total + Number(ag.servico?.preco ?? 0)
  }, 0)

  const ticketMedio =
    totalServicos > 0 ? totalFaturado / totalServicos : 0

  // última visita (data mais recente)
  const ultimaData = ags
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
}

:deep(.profile-avatar .q-avatar__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
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
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0 10px;
}

.price-chip {
  border-radius: 800px;
  letter-spacing: 0.2px;
  font-size: 0.9rem;
  padding: 2px 8px;
  line-height: 1.1;
  font-weight: 600;
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
</style>
