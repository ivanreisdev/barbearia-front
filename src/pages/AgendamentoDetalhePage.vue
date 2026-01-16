<template>
  <q-page class="q-pa-lg">

<!-- CONTAINER RESPONSIVO -->
<div :class="containerClass">

  <!-- HEADER -->
  <div class="row items-center q-mb-xl">
    <q-btn
      flat
      round
      icon="arrow_back"
      @click="$router.back()"
    />

    <div class="q-ml-md">
      <div class="text-h6 text-weight-bold">
        {{ dataFormatada }}
      </div>
      <div class="text-caption text-grey-6">
        {{ horarioInicio }} às {{ horarioFim }}
      </div>
    </div>
  </div>

  <template v-if="agendamento">

    <!-- CONTEÚDO -->
    <div class="row q-col-gutter-xl q-mb-xl">

      <!-- COLUNA ESQUERDA -->
      <div class="col-12 col-md-7">

        <div class="q-mb-xl">
          <div class="text-caption text-grey-6">CLIENTE</div>
          <div class="text-subtitle1 text-weight-bold">
            {{ agendamento.cliente?.nome || '—' }}
          </div>
          <div class="text-caption text-grey-6">
            {{ agendamento.cliente?.celular || '—' }}
          </div>
        </div>

        <div class="q-mb-xl">
          <div class="text-caption text-grey-6">SERVIÇO(S)</div>
          <div class="row q-gutter-sm q-mt-sm">
            <q-chip color="grey-3" text-color="dark">
              {{ agendamento.servico.nome }}
            </q-chip>
          </div>
        </div>

        <div class="q-mb-xl">
          <div class="text-caption text-grey-6">PRODUTO(S)</div>
          <q-btn round dense icon="add" disable class="q-mt-sm" />
        </div>


        <div class="q-mb-xl">
          <div class="text-caption text-grey-6">TOTAL</div>
          <div class="text-h5 text-weight-bold">
            {{ formatoMoeda(agendamento.servico.preco) }}
          </div>
        </div>

      </div>

      <!-- COLUNA DIREITA -->



    </div>

    <!-- DIVISOR -->
    <div class="ticket-divider q-my-xl" />

    <!-- AÇÃO SEMPRE EMBAIXO -->
    <q-btn
      outline
      color="dark"
      class="full-width"
      label="Cancelar agendamento"
      @click="cancelar"
    />

  </template>

  <!-- LOADING -->
  <div v-else class="text-grey text-center q-mt-xl">
    Carregando agendamento...
  </div>

</div>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAgendamentos } from 'src/scripts/agendamentos'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const agendamento = ref(null)

const {
  buscarAgendamentoPorId,
  cancelarAgendamento,
  formatoMoeda,
  calcularHorarioFim
} = useAgendamentos()

onMounted(async () => {
  agendamento.value = await buscarAgendamentoPorId(route.params.id)
})

const containerClass = computed(() =>
  $q.screen.lt.md ? 'container-mobile' : 'container-desktop'
)

const horarioInicio = computed(() => {
  if (!agendamento.value) return ''
  const d = new Date(agendamento.value.data_horario)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})

const horarioFim = computed(() => {
  if (!agendamento.value) return ''
  return calcularHorarioFim(
    agendamento.value.data_horario,
    agendamento.value.servico.duracao_minutos
  )
})

const dataFormatada = computed(() => {
  if (!agendamento.value) return ''
  const d = new Date(agendamento.value.data_horario)
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})

const cancelar = async () => {
  await cancelarAgendamento(agendamento.value)
  router.back()
}
</script>

<style scoped>
.container-mobile {
  max-width: 420px;
  margin: 0 auto;
}

.container-desktop {
  max-width: 1100px;
  margin: 0 auto;
}

.ticket-divider {
  height: 2px;
  background: repeating-linear-gradient(
    to right,
    #333,
    #333 8px,
    transparent 8px,
    transparent 16px
  );
  border-radius: 2px;
}
</style>
