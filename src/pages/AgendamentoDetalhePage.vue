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
  @click="modalCancelar = true"
/>



  </template>

  <!-- LOADING -->
  <div v-else class="text-grey text-center q-mt-xl">
    Carregando agendamento...
  </div>

 <q-dialog v-model="modalCancelar" maximized persistent>
  <div class="modal-cancelamento">

    <!-- HEADER FIXO -->
    <div class="header-agendamento header-cancelamento">
      <q-btn
        icon="arrow_back"
        flat
        round
        color="white"
        class="absolute-top-left q-ma-md"
        @click="modalCancelar = false"
      />

      <div class="header-content text-white">
        <div class="text-h5 text-weight-medium">Cancelamento</div>
        <div class="text-caption opacity-8">
          Você está prestes a cancelar este agendamento.
        </div>
      </div>
    </div>

    <!-- CORPO DO MODAL -->
    <div class="modal-body">

      <div class="agendamento-info text-center q-gutter-md">

        <div class="text-subtitle1 text-weight-medium">
          {{ dataFormatada }}
        </div>

        <div class="row items-center justify-center">
          <span class="text-h6 text-weight-bold">
            {{ horarioInicio }}
          </span>

          <span class="text-h6 text-weight-bold">
            {{ horarioFim }}
          </span>
        </div>

        <div class="text-h5 text-weight-medium inter-semibold cliente-nome q-mt-md">
          {{ agendamento?.cliente?.nome }}
        </div>

        <div class="text-h8 text-grey-6 inter-semibold">
          {{ agendamento?.servico?.nome }}
          - {{ formatoMoeda(agendamento?.servico?.preco) }}
        </div>

        <div class="q-mt-xl text-caption inter-semibold">
          Deslize para confirmar o cancelamento
        </div>

        <!-- SLIDER -->
        <div class="swipe-container">
  <div class="swipe-track">
    <div
      class="swipe-thumb"
      :style="{ transform: `translateX(${swipeX}px)` }"
      @mousedown="startSwipe"
      @touchstart="startSwipe"
    >
      <q-icon name="arrow_forward" size="24px" />
    </div>

    <span class="swipe-text">Deslize para direita</span>
  </div>
</div>


      </div>

    </div>
  </div>
</q-dialog>






</div>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '../css/agendamentos.css'
import { useQuasar } from 'quasar'
import { useAgendamentos } from 'src/scripts/agendamentos'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const agendamento = ref(null)
const loading = ref(true)
const modalCancelar = ref(false)

const swipeX = ref(0)
const maxSwipe = 260
let startX = 0
let dragging = false

const startSwipe = (e) => {
  dragging = true
  startX = e.touches ? e.touches[0].clientX : e.clientX

  document.addEventListener('mousemove', moveSwipe)
  document.addEventListener('mouseup', endSwipe)
  document.addEventListener('touchmove', moveSwipe)
  document.addEventListener('touchend', endSwipe)
}

const moveSwipe = (e) => {
  if (!dragging) return

  const currentX = e.touches ? e.touches[0].clientX : e.clientX
  const diff = currentX - startX

  swipeX.value = Math.max(0, Math.min(diff, maxSwipe))
}

const endSwipe = () => {
  dragging = false

  if (swipeX.value >= maxSwipe) {
    confirmarCancelamento()
  } else {
    swipeX.value = 0
  }

  document.removeEventListener('mousemove', moveSwipe)
  document.removeEventListener('mouseup', endSwipe)
  document.removeEventListener('touchmove', moveSwipe)
  document.removeEventListener('touchend', endSwipe)
}

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

const confirmarCancelamento = async () => {
  try {
    if (!agendamento.value?.id) return

    await cancelar(agendamento.value.id)

    modalCancelar.value = false

    router.replace('/agenda') // 👈 caminho seguro
  } catch (error) {
    console.error(error)
  }
}


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
.agendamento-info {
  font-family: 'Inter', sans-serif;
}
.header-cancelamento {
  background: linear-gradient(135deg, #ac012059, #da4d4d);
}
.cliente-nome {
  color: #e57373; /* vermelho claro */
}
.card-form {
  border-radius: 42px;
}

.modal-cancelamento {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #201a1a;
}

.header-agendamento {
  height: 250px;
  flex-shrink: 0;
  border-radius: 0 0 50px 50px ;
}

.header-cancelamento {
  background: linear-gradient(135deg, #c50327a8, #f56363);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}

.agendamento-info {
  width: 100%;
  max-width: 420px;
}

.cliente-nome {
  color: #e57373;
}

.swipe-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.swipe-track {
  position: relative;
  width: 320px;
  height: 56px;
  background: #5f6368;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.swipe-text {
  color: white;
  font-weight: 500;
  pointer-events: none;
}

.swipe-thumb {
  position: absolute;
  left: 4px;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

</style>
