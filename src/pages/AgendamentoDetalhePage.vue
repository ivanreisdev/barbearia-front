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
      <div class="text-h6 text-weight-bold inter-semibold">
        {{ dataFormatada }}
      </div>
     <div class="text-caption text-grey-6 inter-semibold">
  {{ horarioFim }}
</div>

    </div>
  </div>

  <template v-if="agendamento">

    <!-- CONTEÚDO -->
    <div class="row q-col-gutter-xl q-mb-xl">

      <!-- COLUNA ESQUERDA -->
      <div class="col-12 col-md-7">

        <div class="q-mb-xl">
          <div class="text-caption text-grey-6 inter-semibold">CLIENTE</div>
          <div class="text-subtitle1 text-weight-bold inter-semibold">
            {{ agendamento.cliente?.nome || '—' }}
          </div>
          <div class="text-caption text-grey-6 inter-semibold">
            {{ agendamento.cliente?.celular || '—' }}
          </div>
        </div>

        <div class="q-mb-xl">
          <div class="text-caption text-grey-6 inter-semibold">SERVIÇO(S)</div>
          <div class="row q-gutter-sm q-mt-sm">
            <q-chip color="grey-3" text-color="dark" class="inter-semibold">
              {{ agendamento.servico.nome }}
            </q-chip>
          </div>
        </div>

        <div class="q-mb-xl">
          <div class="text-caption text-grey-6 inter-semibold">PRODUTO(S)</div>
          <q-btn round dense icon="add" disable class="q-mt-sm" />
        </div>


        <div class="q-mb-xl">
          <div class="text-caption text-grey-6 inter-semibold">TOTAL</div>
          <div class="text-h5 text-weight-bold inter-semibold">
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
const loading = ref(true)

const {
  buscarAgendamentoPorId,
  cancelarAgendamento,
  formatoMoeda,
  calcularHorarioFim
} = useAgendamentos()

/* =========================
 * CARREGAMENTO
 * ========================= */
onMounted(async () => {
  loading.value = true

  try {
    agendamento.value = await buscarAgendamentoPorId(route.params.id)
  } finally {
    loading.value = false
  }
})

/* =========================
 * RESPONSIVO
 * ========================= */
const containerClass = computed(() =>
  $q.screen.lt.md ? 'container-mobile' : 'container-desktop'
)

/* =========================
 * HORÁRIOS
 * ========================= */


const horarioFim = computed(() => {
  if (!agendamento.value) return '';

  // extrai horas e minutos da string "2026-01-13T09:00:00"
  const [horaStr, minStr] = agendamento.value.data_horario
    .split(' ')[1] // pega só "09:00:00"
    .split(':');   // separa ["09", "00", "00"]

  const inicioMinutos = parseInt(horaStr) * 60 + parseInt(minStr);

  // agora passa para a sua função do jeito que ela está
  return calcularHorarioFim(inicioMinutos, agendamento.value.servico.duracao_minutos);
});

console.log('horarioFim =', horarioFim.value);


/* =========================
 * DATA FORMATADA
 * ========================= */
const dataFormatada = computed(() => {
  if (!agendamento.value) return ''

  const d = new Date(agendamento.value.data_horario.replace(' ', 'T'))

  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})

/* =========================
 * AÇÃO
 * ========================= */
const cancelar = async () => {
  if (!agendamento.value?.id) return

  await cancelarAgendamento(agendamento.value.id)

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
.inter-semibold {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}
</style>
