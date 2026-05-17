<template>
  <q-page class="q-pa-lg">

    <!-- Cabeçalho -->
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <div class="text-h6 q-ml-md">Editar Serviço</div>
    </div>

    <div class="text-caption text-grey-6 q-mb-sm">
      ATUALIZE SEU SERVIÇO
    </div>
    <q-card class="q-mb-xl novo-servico-card">
      <q-card-section>

        <div class="text-caption text-grey-6 q-mb-sm">
          NOME DO SERVIÇO
        </div>
        <q-input dense dark filled placeholder="EX: Corte Social" class="input-dark q-mb-md" v-model="form.nome" />

        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-6">
            <div class="text-caption text-grey-6 q-mb-sm">
              DURAÇÃO (min)
            </div>
            <q-input dense dark filled type="number" placeholder="Duração (min)" class="input-dark"
              v-model="form.duracao" />
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-6 q-mb-sm">
              PREÇO
            </div>
            <q-input dense dark filled prefix="R$" placeholder="0,00" class="input-dark" v-model="form.preco"
              mask="#,##" reverse-fill-mask />
          </div>
        </div>


        <!-- Botão -->
        <q-btn label="ATUALIZAR SERVIÇO" unelevated class="full-width btn-add-servico" size="lg" @click="atualizar" />

      </q-card-section>
    </q-card>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import 'src/css/servicos.css'
import { useRoute, useRouter } from 'vue-router'


const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const form = ref({
  id: null,
  nome: '',
  duracao: null,
  preco: ''
})

const servicoId = route.params.servicoId
console.log('Serviço ID:', servicoId)


const buscarServicoPorId = async () => {
  console.log(localStorage.getItem('user'));
  try {
    const { data } = await api.get(`/servicos/buscarServico/${servicoId}`)
    form.value.nome = data.nome
    form.value.duracao = data.duracao_minutos
    form.value.preco = String(data.preco).replace('.', ',')
    form.value.id = data.id
  } catch (error) {
    console.error('Erro ao buscar serviços', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar serviços'
    })
  }
}


const atualizar = async () => {
  try {
    await api.put('/servicos/editarServico', {
      nome: form.value.nome,
      duracao_minutos: form.value.duracao,
      preco: form.value.preco.replace(',', '.'),
      id: servicoId
    })

    $q.notify({
      type: 'positive',
      message: 'Serviço atualizado com sucesso!'
    })

    router.back()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar serviço'
    })
  }
}

onMounted(() => {
  buscarServicoPorId()
})
</script>
