<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" maximized persistent>
    <div class="modal-exclusao-despesa">
      <!-- HEADER FIXO -->
      <div class="header-despesa header-cancelamento">
        <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md" @click="fechar" />

        <div class="header-content text-white">
          <div class="text-h5 text-weight-medium texto-titulo">Excluir Despesa</div>
          <div class="text-caption opacity-8 texto-secundario">
            Ao confirmar , essa Despesa será Excluida
          </div>
        </div>
      </div>

      <!-- CORPO DO MODAL -->
      <div class="modal-body">

        <div class="agendamento-info text-center q-gutter-md">
          <div class="inputs-wrap">
            <q-input outlined dense label="Título da Despesa" v-model="form.categoria" class="input-centered">
              <template #prepend>
                <q-icon name="receipt_long" />
              </template>
            </q-input>

            <q-input outlined dense label="Data de Pagamento" v-model="form.dataDisplay" class="input-centered"
              placeholder="dd/mm/aaaa" mask="##/##/####">
              <template #prepend>
                <q-icon name="calendar_today" />
              </template>
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="dataPopup" cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.dataDisplay" mask="DD/MM/YYYY" color="grey-9"
                      @update:model-value="() => dataPopup?.hide()" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input outlined dense label="Valor" v-model="form.valor" class="input-centered input-valor" type="text"
              inputmode="decimal" mask="###,##" reverse-fill-mask unmasked-value>
              <template #prepend>
                <q-icon name="payments" />
              </template>
            </q-input>

            <q-input outlined dense label="Descrição" v-model="form.titulo" class="input-centered input-descricao"
              type="textarea" autogrow>
              <template #prepend>
                <q-icon name="notes" />
              </template>
            </q-input>

          </div>

          <div class="q-mt-xl text-caption inter-semibold texto-secundario">
            Deslize para se livrar dessa Despesa
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
import { ref, computed, watch } from 'vue'
import { notifySuccess, notifyError } from '../../../scripts/notificaçoes'

const props = defineProps({
  modelValue: Boolean,
  despesaInfo: Object
})

const form = ref({
  titulo: '',
  valor: '',
  dataDisplay: '',
  categoria: '',
  descricao: ''
})

const dataPopup = ref(null)

const emit = defineEmits(['update:modelValue'])

const fechar = () => {
  emit('update:modelValue', false)
}

const formatarData = (data) => {
  if (!data) return ''

  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

const converterParaIso = (dataBr) => {
  if (!dataBr) return ''
  const [dia, mes, ano] = dataBr.split('/').map(Number)
  if (!dia || !mes || !ano) return ''
  const data = new Date(ano, mes - 1, dia)
  if (Number.isNaN(data.getTime())) return ''
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

const converterParaCentavos = (valor) => {
  if (!valor) return ''
  return Math.round(parseFloat(valor) * 100).toString()
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
    confirmarEdicao()
  } else {
    swipeX.value = 0
  }

  document.removeEventListener('mousemove', moveSwipe)
  document.removeEventListener('mouseup', endSwipe)
  document.removeEventListener('touchmove', moveSwipe)
  document.removeEventListener('touchend', endSwipe)
}

const confirmarEdicao = async () => {
  swipeX.value = 0

  try {
    const response = await api.put('/despesas/editarDespesa', {
      id: props.despesaInfo.id,
      descricao: form.value.titulo,
      categoria: form.value.categoria,
      valor: form.value.valor / 100,
      data: converterParaIso(form.value.dataDisplay),
      recorrente: false
    })

    if (response.data.tipo === 'sucesso') {
      fechar()
      emit('despesaEditada')
      notifySuccess('Despesa editada com sucesso!')
    } else {
      notifyError('Erro ao editar despesa')
    }
  } catch (e) {
    console.error('Erro ao editar despesa:', e.response?.data || e)
    notifyError('Erro ao editar despesa')
  }

}

watch(
  () => props.despesaInfo,
  (novaDespesa) => {
    if (novaDespesa) {
      form.value = {
        titulo: novaDespesa.titulo ?? '',
        valor: converterParaCentavos(novaDespesa.valor),
        dataDisplay: formatarData(novaDespesa.data),
        categoria: novaDespesa.categoria ?? '',
        descricao: novaDespesa.descricao ?? ''
      }
    }
  },
  { immediate: true }
)
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

.modal-exclusao-despesa {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #201a1a;
}

.header-despesa {
  position: relative;

  background-image:
    linear-gradient(135deg, rgba(90, 90, 90, 0.65), rgba(139, 110, 110, 0.75)),
    url('../imgs/despesa.jpg');

  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  width: 100%;
  min-height: 250px;
  border-bottom-left-radius: 50px;
  border-bottom-right-radius: 50px;
}

/* DESKTOP */
@media (min-width: 1024px) {
  .header-despesa {
    background-size: cover;
    background-position: center 75%;
  }
}

.motivo-bloqueio {
  font-size: 1.30rem;
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
  text-align: center;
  color: #ccc2c2;
  font: 0.80rem Inter, sans-serif;

}

.texto-titulo {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center;
  margin-top: 100px;
  color: #ccc2c2;
}

.inputs-wrap {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 68px;
  padding: 0 12px;
  box-sizing: border-box;
}

.input-centered {
  width: 100%;
  box-sizing: border-box;
}

.input-centered :deep(.q-field__control) {
  border-radius: 12px;
}

.input-centered :deep(.q-field__control:before),
.input-centered :deep(.q-field__control:after) {
  border-radius: 12px;
}

.input-descricao :deep(textarea) {
  min-height: 120px;
}

.input-valor :deep(input[type="number"]) {
  -moz-appearance: textfield;
}

.input-valor :deep(input[type="number"]::-webkit-outer-spin-button),
.input-valor :deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

@media (max-width: 600px) {
  .inputs-wrap {
    max-width: 330px;
    padding-left: 25px;
    padding-right: 8px;
  }

  .input-centered {
    font-size: 0.92rem;
  }

}
</style>
