<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" maximized persistent>
    <div class="modal-editar-cliente">


      <!-- HEADER FIXO -->
      <div class="header-agendamento header-cancelamento">
        <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md" @click="fechar" />

        <div class="header-content text-white">
          <div class="text-h5 text-weight-medium texto-secundario">Editar Cliente</div>
          <div class="text-caption opacity-8 texto-secundario">
            Você pode alterar os dados de seus clientes
          </div>
        </div>
      </div>
      <!-- CORPO DO MODAL -->
      <div class="modal-body q-pt-xl">

        <div class="agendamento-info text-center q-gutter-xl">
          <div class="edita-form q-gutter-y-lg q-gutter-x-none">
            <q-input v-model="clienteEditavel.nome" label="Nome do cliente" outlined dense rounded
              :class="corInputErroNome">
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input v-model="clienteEditavel.email" label="Email do cliente" outlined dense rounded color="primary"
              :class="corInputErroEmail">
              <template #prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input v-model="celularFormatado" label="Contato do cliente" outlined dense rounded color="primary"
              :class="corInputErroCelular">
              <template #prepend>
                <q-icon name="phone" />
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
import { notifySuccess, notifyError } from '../../../scripts/notificaçoes'
import 'src/css/agendamentos.css'


const props = defineProps({
  modelValue: Boolean,
  cliente: Object
})

const clienteEditavel = ref({
  nome: '',
  email: '',
  celular: '',
  id: null
})

const errors = reactive({
  nome: '',
  email: '',
  celular: '',
})

const corInputErroNome = ref({
  style: '',
})

const corInputErroEmail = ref({
  style: '',
})

const corInputErroCelular = ref({
  style: '',
})

console.log(props.cliente)
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
  () => props.cliente,
  (novoCliente) => {
    if (novoCliente && Object.keys(novoCliente).length) {
      clienteEditavel.value = {
        nome: novoCliente.nome ?? '',
        email: novoCliente.email ?? '',
        celular: novoCliente.celular ?? '',
        id: novoCliente.id ?? null,
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

const formatarCelular = (celular) => {
  if (!celular) return '—'
  const n = celular.replace(/\D/g, '')
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
}

const celularFormatado = computed({
  get() {
    return formatarCelular(clienteEditavel.value.celular)
  },
  set(valor) {
    // remove tudo que não for número antes de salvar
    clienteEditavel.value.celular = valor.replace(/\D/g, '')
  }
})

const validarFormulario = () => {
  corInputErroNome.value = ''
  corInputErroEmail.value = ''
  corInputErroCelular.value = ''
  errors.nome = clienteEditavel.value.nome ? '' : 'Nome é obrigatório'

  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteEditavel.value.email)
    ? ''
    : 'Email inválido'

  const tamanho = clienteEditavel.value.celular?.length || 0

  errors.celular =
    tamanho >= 10 && tamanho <= 11
      ? ''
      : 'Número de Celular inválido'


  if (errors.nome) {
    corInputErroNome.value = 'outlined-vermelho'
    return errors.nome
  }


  if (errors.email) {
    corInputErroEmail.value = 'outlined-vermelho'
    return errors.email
  }

  if (errors.celular) {
    corInputErroCelular.value = 'outlined-vermelho'
    return errors.celular
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
  swipeX.value = 0
  try {
    const response = await api.post(
      '/clientes/editarCliente',
      {
        id: clienteEditavel.value.id,
        nome: clienteEditavel.value.nome,
        email: clienteEditavel.value.email,
        celular: clienteEditavel.value.celular,
      }
    )
    if (response.data.tipo == 'sucesso') {
      fechar()
      emit('atualizado')
      notifySuccess(response.data.msg)
    } else {
      notifyError('Erro ao editar o Cliente ')
    }
  } catch (e) {
    console.error('Erro ao editar o Cliente:', e.response?.data || e)
    notifyError('Erro ao editar o Cliente')

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

.modal-editar-cliente {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #201a1a;
}

.header-agendamento {
  position: relative;

  background-image:
    linear-gradient(135deg, rgba(138, 137, 137, 0.534), rgba(61, 61, 61, 0.75)),
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