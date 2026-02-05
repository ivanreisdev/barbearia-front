<template>
  <q-page class="q-pa-md detalhes-page">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" @click="$router.back()" />

        <div class="q-ml-md">
          <div class="text-h5 text-weight-bold">Detalhes do Cliente</div>
          <div class="text-caption text-grey-5">
            Visão geral de dados pessoais, histórico e serviços
          </div>
        </div>
      </div>

      <!-- <div class="row items-center q-gutter-sm">
        <q-btn outline color="grey-4" icon="mdi-pencil" label="Editar" class="btn-dark" />
        <q-btn color="green-6" icon="mdi-whatsapp" label="Contato" class="btn-dark" />
      </div> -->
    </div>

    <div class="row q-col-gutter-md">
      <!-- Coluna esquerda: perfil -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card-dark card-profile">
          <q-card-section class="row items-center no-wrap q-col-gutter-sm">
            <q-avatar size="64px" color="grey-8" text-color="white" class="profile-avatar">
              {{ clientes.nome?.charAt(0) || '?' }}
            </q-avatar>

            <div class="col">
              <div class="text-subtitle1 text-weight-bold ellipsis">
                {{ clientes.nome }}
              </div>
              <!-- <div class="text-caption text-grey-5">Cliente desde {{ cliente.desde }}</div> -->
            </div>
          </q-card-section>

          <q-separator dark />

          <q-card-section class="q-gutter-sm">
            <div class="row items-center">
              <q-icon name="mail" size="18px" class="text-grey-5 q-mr-sm" />
              <div class="text-body2 ellipsis">{{ clientes.email }}</div>
            </div>
            <div class="row items-center">
              <q-icon name="phone" size="18px" class="text-grey-5 q-mr-sm" />
              <div class="text-body2">{{ clientes.celular }}</div>
            </div>
            <!-- <div class="row items-center">
              <q-icon name="place" size="18px" class="text-grey-5 q-mr-sm" />
              <div class="text-body2 ellipsis">{{ cliente.endereco }}</div>
            </div> -->
          </q-card-section>

          <q-separator dark />

          <q-card-section class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5">Agendamentos</div>
                <div class="text-h6 text-weight-bold">{{ stats.totalAgendamentos }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5">Serviços</div>
                <div class="text-h6 text-weight-bold">{{ stats.totalServicos }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5">Ticket Médio</div>
                <div class="text-h6 text-weight-bold">{{ stats.ticketMedio }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card">
                <div class="text-caption text-grey-5">Última visita</div>
                <div class="text-h6 text-weight-bold">{{ stats.ultimaVisita }}</div>
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
              <q-card-section class="row items-center justify-between">
                <div>
                  <div class="text-subtitle1 text-weight-bold">Agendamentos</div>
                  <div class="text-caption text-grey-5">Histórico recente</div>
                </div>
                <q-btn flat dense color="grey-4" label="Ver todos" />
              </q-card-section>

              <q-separator dark />



              <q-list v-if="agendamentos.length > 0" separator dark>
                <q-item v-for="ag in agendamentos" :key="ag.id" class="item-dark">
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
                    <q-chip outline color="green-5" text-color="white" size="sm">
                      {{ formatarPreco(ag.servico.preco) }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-grey text-center q-pa-md">
                Não há agendamentos
              </div>
            </q-card>
          </div>


          <!-- Serviços realizados -->
          <div class="col-12">
            <q-card flat bordered class="card-dark">
              <q-card-section class="row items-center justify-between">
                <div>
                  <div class="text-subtitle1 text-weight-bold">Serviços Realizados</div>
                  <div class="text-caption text-grey-5">Últimos serviços executados</div>
                </div>
                <q-btn flat dense color="grey-4" label="Relatório" />
              </q-card-section>

              <q-separator dark />

              <div class="row q-col-gutter-md q-pa-md">
                <div v-for="srv in servicos" :key="srv.id" class="col-12 col-sm-6">
                  <q-card flat bordered class="card-dark card-service">
                    <q-card-section class="row items-center justify-between">
                      <div>
                        <div class="text-weight-bold">{{ srv.nome }}</div>
                        <div class="text-caption text-grey-5">{{ srv.data }} · {{ srv.hora }}</div>
                      </div>
                      <q-chip color="grey-9" text-color="white" size="sm">{{ srv.valor }}</q-chip>
                    </q-card-section>
                  </q-card>
                </div>
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

const route = useRoute()

const clientes = ref({
  nome: '',
  email: '',
  celular: '',
})

const agendamentos = ref([])


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

  await buscarClientes(route.params.id)

})


</script>

<style scoped>
.detalhes-page {
  color: #fff;
}

.card-dark {
  background: #121316;
  border-color: rgba(255, 255, 255, 0.08);
  border-radius: 18px;
}

.card-profile {
  position: sticky;
  top: 16px;
}

.profile-avatar {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.stat-card {
  background: #171a20;
  border-radius: 14px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.item-dark {
  border-color: rgba(255, 255, 255, 0.06);
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

@media (max-width: 1023px) {
  .card-profile {
    position: static;
  }
}
</style>
