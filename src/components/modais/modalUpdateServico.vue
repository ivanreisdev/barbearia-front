<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" maximized persistent>
    <div class="modal-editar-cliente">


      <!-- HEADER FIXO -->
      <div class="header-agendamento header-cancelamento">
        <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md" @click="fechar" />

        <div class="header-content text-white">
          <div class="text-h5 text-weight-medium texto-secundario">Editar Serviço</div>
          <div class="text-caption opacity-8 texto-secundario">
            Você pode alterar os dados de seus Serviços
          </div>
        </div>
      </div>
      <!-- CORPO DO MODAL -->
      <div class="modal-body q-pt-xl">

        <div class="agendamento-info text-center q-gutter-xl">
          <div class="edita-form q-gutter-y-lg q-gutter-x-none">
            <q-input v-model="servicoEditavel.nome" label="Nome do cliente" outlined dense rounded
              :class="corInputErroNome">
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input v-model="servicoEditavel.duracao" label="Duração em (Min)" outlined dense rounded color="primary"
              :class="corInputErroDuracao">
              <template #prepend>
                <q-icon name="schedule" />
              </template>
            </q-input>

            <q-input v-model="servicoEditavel.preco" label="Valor Do Serviço" outlined dense rounded color="primary"
              mask="#,##" reverse-fill-mask :class="corInputErropreco">
              <template #prepend>
                <q-icon name="payments" />
              </template>
            </q-input>


          </div>
          <div class="q-mt-xl text-caption inter-semibold texto-secundario">
            Deslize para confirmar a Ediçáo
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
import { ref, computed, watch, reactive } from 'vue'
import { notifySuccess, notifyError } from '../../scripts/notificaçoes'
import 'src/css/agendamentos.css'


const props = defineProps({
  modelValue: Boolean,
  servico: Object
})

const servicoEditavel = ref({
  nome: '',
  duracao: '',
  preco: '',
  id: null
})

const errors = reactive({
  nome: '',
  duracao: '',
  preco: '',
})

const corInputErroNome = ref({
  style: '',
})

const corInputErroDuracao = ref({
  style: '',
})

const corInputErropreco = ref({
  style: '',
})

console.log(props.servico)
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
watch(
  () => props.servico,
  (novoServico) => {
    if (novoServico && Object.keys(novoServico).length) {
      servicoEditavel.value = {
        nome: novoServico.nome ?? '',
        duracao: novoServico.duracao ?? '',
        preco: novoServico.preco ?? '',
        id: novoServico.id ?? null,
      }
    }
  },
  { immediate: true, deep: true }
)

const endSwipe = () => {
  dragging = false

  if (swipeX.value >= maxSwipe) {
    confirmarEdicaoDoCliente()
  } else {
    swipeX.value = 0
  }

  document.removeEventListener('mousemove', moveSwipe)
  document.removeEventListener('mouseup', endSwipe)
  document.removeEventListener('touchmove', moveSwipe)
  document.removeEventListener('touchend', endSwipe)
}


const validarFormulario = () => {
  corInputErroNome.value = ''
  corInputErroDuracao.value = ''
  corInputErropreco.value = ''
  errors.nome = servicoEditavel.value.nome ? '' : 'Nome é obrigatório'
  errors.preco = servicoEditavel.value.preco ? '' : 'Preço é obrigatório'
  errors.duracao = servicoEditavel.value.duracao ? '' : 'Duração é obrigatório'

  if (errors.nome) {
    corInputErroNome.value = 'outlined-vermelho'
    return errors.nome
  }


  if (errors.duracao) {
    corInputErroDuracao.value = 'outlined-vermelho'
    return errors.duracao
  }

  if (errors.preco) {
    corInputErropreco.value = 'outlined-vermelho'
    return errors.preco
  }

  return ''
}


const confirmarEdicaoDoCliente = async () => {
  const erro = validarFormulario()

  if (erro) {
    notifyError(erro)
    swipeX.value = 0
    return
  }

  try {
    const response = await api.put(
      '/servicos/editarServico',
      {
        id: servicoEditavel.value.id,
        nome: servicoEditavel.value.nome,
        duracao_minutos: servicoEditavel.value.duracao,
        preco: String(servicoEditavel.value.preco).replace(',', '.')
      }
    )
    if (response.data.tipo == 'sucesso') {
      swipeX.value = 0
      fechar()
      emit('atualizado')
      notifySuccess(response.data.msg)
    } else {
      swipeX.value = 0
      notifyError('Erro ao editar o Serviço ')
    }
  } catch (e) {
    swipeX.value = 0
    console.error('Erro ao editar o Serviço:', e.response?.data || e)
    notifyError('Erro ao editar o Serviço')
  }

}
</script>

<style>
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
  background: linear-gradient(90deg, #3f3e3e, #464545);
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

.modal-editar-cliente {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #201a1a;
}

.header-agendamento {
  position: relative;

  background-image:
    linear-gradient(135deg, rgba(124, 120, 120, 0.534), rgba(119, 115, 115, 0.75)),
    url('../imgs/imagem3.jpg');

  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  width: 100%;
  min-height: 180px;
}

/* DESKTOP */
@media (min-width: 1024px) {
  .header-agendamento {
    background-size: cover;
    background-position: center 65%;
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
  color: #f5c7c7;
}

.bloqueio-form {
  margin-left: 10px;
}

@media (min-width: 1024px) {
  .bloqueio-form {
    max-width: 420px;
    margin: 0 auto;
    /* 👈 joga pro centro */
  }
}

.outlined-vermelho.q-field--outlined .q-field__control::before,
.outlined-vermelho.q-field--outlined .q-field__control::after {
  border-color: #f44336 !important;
}

@media (min-width: 1024px) {
  .edita-form {
    max-width: 420px;
    margin: 50px auto 0 auto;
    transform: translateX(20px);
    /* ajuste fino */
  }
}

@media (max-width: 599px) {
  .edita-form .q-field {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>