<template>
    <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" maximized persistent>
        <div class="modal-cancelamento">


            <!-- HEADER FIXO -->
            <div class="header-agendamento header-cancelamento">
                <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md" @click="fechar" />

                <div class="header-content text-white">
                    <div class="text-h5 text-weight-medium texto-secundario">Novo Cliente</div>
                    <div class="text-caption opacity-8 texto-secundario">
                        Adicione um novo cliente para gerenciar seus agendamentos e informações de contato
                    </div>
                </div>
            </div>

            <!-- CORPO DO MODAL -->
            <div class="modal-body">

                <div class="agendamento-info text-center q-gutter-md">
                    <div class="inputs-wrap">
                        <q-input outlined dense label="Nome do Cliente" v-model="form.nome" class="input-centered">
                            <template #prepend>
                                <q-icon name="person" />
                            </template>
                        </q-input>

                        <q-input outlined dense label="Email do Cliente" v-model="form.email" class="input-centered">
                            <template #prepend>
                                <q-icon name="email" />
                            </template>
                        </q-input>

                        <q-input outlined dense label="Celular do Cliente" v-model="form.celular"
                            class="input-centered" mask="(##) #####-####" fill-mask>
                            <template #prepend>
                                <q-icon name="phone" />
                            </template>
                        </q-input>
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
                            <div class="swipe-thumb" :style="{ transform: `translateX(${swipeX}px)` }"
                                @mousedown="startSwipe" @touchstart="startSwipe">
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
import { notifySuccess, notifyError } from '../../../scripts/notificaçoes'

const emit = defineEmits(['update:modelValue'])

const fechar = () => {
    emit('update:modelValue', false)
}

const form = ref({
    nome: '',
    email: '',
    celular: '',
})

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
        criarNovoCliente()
    } else {
        swipeX.value = 0
    }

    document.removeEventListener('mousemove', moveSwipe)
    document.removeEventListener('mouseup', endSwipe)
    document.removeEventListener('touchmove', moveSwipe)
    document.removeEventListener('touchend', endSwipe)
}
const aplicarValidacoes = () => {
    if (!form.value.nome || form.value.nome.trim().length < 1) {
        notifyError('O nome do cliente é obrigatório.')
        return false
    }

    if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        notifyError('O email fornecido não é válido.')
        return false
    }

    if (form.value.celular) {
        const celularNumeros = form.value.celular.replace(/\D/g, '')
        if (celularNumeros.length < 10) {
            notifyError('O número de celular fornecido não é válido.')
            return false
        }
    }

    return true
}

const criarNovoCliente = async () => {
    
    if(!aplicarValidacoes()){
        return
    }

    try {
        const celularNumeros = (form.value.celular || '').replace(/\D/g, '')
        const response = await api.post(
            '/clientes/criarNovoCliente',
            {
                nome: form.value.nome,
                email: form.value.email,
                celular: celularNumeros,
            }
        )
        if (response.data.tipo == 'sucesso') {
            swipeX.value = 0
            form.value = {
                nome: '',
                email: '',
                celular: '',
            }
            fechar()
            emit('clienteCriado')
            notifySuccess(response.data.msg)
        } else {
            swipeX.value = 0
            notifyError(response.data.msg || 'Erro ao criar o Cliente')
        }
    } catch (e) {
        swipeX.value = 0
        console.error('Erro ao criar o Cliente:', e.response?.data || e)
        notifyError(e.response?.data?.message || 'Erro ao criar o Cliente')
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
    background: linear-gradient(135deg,
            rgba(46, 204, 113, 0.85),
            rgba(39, 174, 96, 0.9));
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

.header-agendamento {
    position: relative;

    background-image:
        linear-gradient(135deg, rgba(168, 156, 156, 0.65), rgba(133, 138, 125, 0.75)),
        url('../imgs/novoCliente.webp');

    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    width: 100%;
    min-height: 180px;
}

@media (min-width: 1024px) {
    .header-agendamento {
        background-size: cover;
        background-position: center 20%;
    }
}

/* DESKTOP */
/* @media (min-width: 1024px) {
    .header-agendamento {
        background-size: contain;
        background-position: center top;
    }
} */

.texto-secundario {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
}
</style>
