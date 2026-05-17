<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" maximized persistent>
    <div class="modal-cancelamento">


      <!-- HEADER FIXO -->
      <div class="header-agendamento header-cancelamento">
        <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md" @click="fechar" />

        <div class="header-content text-white">
          <div class="text-h5 text-weight-medium texto-secundario">Excluir Horario</div>
          <div class="text-caption opacity-8 texto-secundario">
            Ao confirmar , esse Horario Podera ser Preenchido Por
          </div>
          <div class="text-caption opacity-8 texto-secundario">
            agendamentos de seus Clientes
          </div>
        </div>
      </div>

      <!-- CORPO DO MODAL -->
      <div class="modal-body">

        <div class="agendamento-info text-center q-gutter-md">
          <div class="text-h8 text-grey-6 inter-semibold horario_bloqueio">
            {{ bloqueio.hora_inicio }}
            - {{ bloqueio.hora_fim }}
          </div>

          <div class="text-h5 text-weight-medium inter-semibold cliente-nome q-mt-md motivo-bloqueio">
            {{ bloqueio.motivo }}
          </div>

          <div class="q-mt-xl text-caption inter-semibold texto-secundario">
            Deslize para confirmar o cancelamento
          </div>

          <!-- SLIDER -->
          <div class="row justify-center q-mt-md">

            <div class="swipe-container">
              <!-- TRACK QUE PREENCHE -->
              <div class="swipe-fill" :style="{ width: fillPercent + '%' }"></div>

              <!-- TEXTO -->
              <span class="swipe-text ">
                Deslize para a direita
              </span>

              <!-- BOTÃO -->
              <div class="swipe-thumb" :style="{ transform: `translateX(${swipeX}px)` }" @mousedown="startSwipe"
                @touchstart="startSwipe">
                <q-icon name="chevron_right" size="26px" color="negative" />

              </div>
            </div>


          </div>

        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { api } from 'src/boot/axios';
import { ref, computed } from 'vue'
import { notifySuccess, notifyError } from '../../scripts/notificaçoes'

const { modelValue, bloqueio } = defineProps({
  modelValue: Boolean,
  bloqueio: Object
})

const emit = defineEmits(['update:modelValue'])

const fechar = () => {
  emit('update:modelValue', false)
}

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

const moveSwipe = (e) => {
  if (!dragging) return

  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  let delta = clientX - startX

  swipeX.value = Math.max(0, Math.min(delta, maxSwipe))
}

const endSwipe = () => {
  dragging = false

  if (swipeX.value >= maxSwipe) {
    confirmarExcluasoBloqueio()
  } else {
    swipeX.value = 0
  }

  document.removeEventListener('mousemove', moveSwipe)
  document.removeEventListener('mouseup', endSwipe)
  document.removeEventListener('touchmove', moveSwipe)
  document.removeEventListener('touchend', endSwipe)
}

const confirmarExcluasoBloqueio = async () => {
  try {
    const response = await api.post(
      '/bloqueio-agendamentos/ExcluirBloqueioAgendamentos',
      {
        id: bloqueio.id_bloqueio
      }
    )
    if (response.data.tipo == 'sucesso') {
      fechar()
      emit('excluido')
      notifySuccess('Agendamentos liberados para esse Horário!')
    } else {
      notifyError('Erro ao liberar agendamentos nesse Horário')
    }
  } catch (e) {
    console.error('Erro ao criar agendamento:', e.response?.data || e)
    notifyError('Erro ao liberar agendamentos nesse Horário')

  }
}
</script>



<style scoped>
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
  font-family: 'Inter', sans-serif;
  font-weight: 600;
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

.swipe-container {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 52px;
  background: #5c5a55;
  border-radius: 26px;
  overflow: hidden;
  user-select: none;
}

.swipe-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #d32f2f, #ff5252);
  border-radius: 26px;
  transition: width 0.1s linear;
}

.swipe-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  z-index: 1;
  pointer-events: none;
}

.swipe-thumb {
  position: absolute;
  left: 4px;
  top: 4px;
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-cancelamento {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #201a1a;
}

.header-agendamento {
  position: relative;

  background-image:
    linear-gradient(135deg, rgba(90, 90, 90, 0.65), rgba(139, 110, 110, 0.75)),
    url('../imgs/Barbearia-background.jpg');

  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  width: 100%;
  min-height: 180px;
}

/* DESKTOP */
@media (min-width: 1024px) {
  .header-agendamento {
    background-size: contain;
    background-position: center top;
  }
}

.motivo-bloqueio {
  font-size: 1.20rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}

.horario_bloqueio {
  padding: 30px;
  font-size: 1.55rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}

.texto-secundario {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}
</style>
