<template>
  <q-page class="q-pa-lg">

    <!-- Cabeçalho -->
    <q-dialog v-model="modalCancelar" maximized persistent>
      <div class="modal-cancelamento">

        <!-- HEADER FIXO -->
        <div class="header-agendamento header-cancelamento">
          <q-btn icon="arrow_back" flat round color="white" class="absolute-top-left q-ma-md"
            @click="modalCancelar = false" />

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
              {{  }}
            </div>

            <div class="row items-center justify-center">
              <span class="text-h6 text-weight-bold">
                {{  }}
              </span>

              <span class="text-h6 text-weight-bold">
                {{  }}
              </span>
            </div>

            <div class="text-h5 text-weight-medium inter-semibold cliente-nome q-mt-md">
              {{  }}
            </div>

            <div class="text-h8 text-grey-6 inter-semibold">
              {{  }}
              - {{  }}
            </div>

            <div class="q-mt-xl text-caption inter-semibold">
              Deslize para confirmar o cancelamento
            </div>

            <!-- SLIDER -->
            <div class="row justify-center q-mt-md">

              <div class="swipe-container">
                <!-- TRACK QUE PREENCHE -->
                <div class="swipe-fill" :style="{ width: fillPercent + '%' }"></div>

                <!-- TEXTO -->
                <span class="swipe-text">
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


  </q-page>
</template>

<script setup>
// import { ref } from 'vue'
// import { useQuasar } from 'quasar'
// import { api } from 'boot/axios'
import 'src/css/servicos.css'
// import { useRoute } from 'vue-router'


// const $q = useQuasar()
// const route = useRoute()
// const router = useRouter()

// const form = ref({
//   id: null,
//   nome: '',
//   duracao: null,
//   preco: ''
// })

// const servicoId = route.params.servicoId
// console.log('Serviço ID:', servicoId)


// const buscarServicoPorId = async () => {
//   console.log(localStorage.getItem('user'));
//   try {
//     const { data } = await api.get(`/servicos/buscarServico/${servicoId}`)
//     form.value.nome = data.nome
//     form.value.duracao = data.duracao_minutos
//     form.value.preco = String(data.preco).replace('.', ',')
//     form.value.id = data.id
//   } catch (error) {
//     console.error('Erro ao buscar serviços', error)
//     $q.notify({
//       type: 'negative',
//       message: 'Erro ao carregar serviços'
//     })
//   }
// }


// const atualizar = async () => {
//   try {
//     await api.put('/servicos/editarServico', {
//       nome: form.value.nome,
//       duracao_minutos: form.value.duracao,
//       preco: form.value.preco.replace(',', '.'),
//       id: servicoId
//     })

//     $q.notify({
//       type: 'positive',
//       message: 'Serviço atualizado com sucesso!'
//     })

//     router.back()
//   } catch (error) {
//     console.error(error)
//     $q.notify({
//       type: 'negative',
//       message: 'Erro ao salvar serviço'
//     })
//   }
// }

// onMounted(() => {
//   buscarServicoPorId()
// })
</script>
