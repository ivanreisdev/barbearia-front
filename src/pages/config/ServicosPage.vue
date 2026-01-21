<!-- Cabeçalho -->
<template>
  <q-page class="q-pa-lg bg-dark">

    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
    </div>

    <div class="text-h6 text-white q-mb-xs text-center">
      Serviços
    </div>

    <div class="text-caption text-grey-5 q-mb-lg text-center">
      Cadastre e edite os serviços fornecidos pela empresa
    </div>

    <!-- INSERIR NOVO SERVIÇO -->
    <div class="text-caption text-grey-6 q-mb-sm">
      INSERIR UM NOVO SERVIÇO
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
        <q-btn label="ADICIONAR À LISTA" unelevated class="full-width btn-add-servico" size="lg" @click="salvar" />

      </q-card-section>
    </q-card>


    <!-- LISTA DE SERVIÇOS -->
    <!-- HEADER LISTA -->
    <!-- <div class="row items-center q-mb-md"> -->
    <div class="text-caption text-grey-6 q-mb-sm">
      LISTA DE SERVIÇOS
    </div>
    <!-- </div> -->

    <q-list class="servicos-list">

      <q-item v-for="servico in servicos" :key="servico.id" clickable class="servico-card q-mb-sm">

        <!-- Ícone -->
        <q-item-section avatar>
          <div class="icon-wrapper">
            <q-icon name="content_cut" size="20px" color="orange-4" />
          </div>
        </q-item-section>

        <!-- Infos -->
        <q-item-section>
          <q-item-label class="servico-nome">
            {{ servico.nome }}
          </q-item-label>

          <div class="row items-center q-gutter-sm servico-info">
            <span>{{ servico.duracao }}</span>
            <span>•</span>
            <span>{{ servico.preco }}</span>
          </div>
        </q-item-section>

        <!-- Ações -->
        <q-item-section side>
          <div class="row items-center q-gutter-xs">
            <q-btn flat round dense icon="edit" color="grey-5" class="iconeEdiçao"
              @click.stop="editarServico(servico)" />
            <q-btn flat round dense icon="delete" color="grey-5" class="iconeDelete"
              @click.stop="excluirServico(servico)" />
          </div>
        </q-item-section>

      </q-item>

    </q-list>

    <!-- Botão salvar -->
    <q-btn class="full-width q-mt-xl btn-salvar-servicos" label="Salvar serviços" unelevated size="lg" />

  </q-page>
</template>



<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import 'src/css/servicos.css'
import { useRouter } from 'vue-router'
// import { useRouter } from 'vue-router'
const router = useRouter()
const $q = useQuasar()
// const router = useRouter()

const servicos = ref([
  {
    id: null,
    nome: '',
    preco: '',
    duracao: ''
  }
])

const buscarServicos = async () => {
  console.log(localStorage.getItem('user'));
  try {
    const { data } = await api.get('/servicos/buscarServicosPorBarbeariaId')

    servicos.value = data.map(item => ({
      id: item.id,
      nome: item.nome,
      preco: `R$ ${Number(item.preco).toFixed(2).replace('.', ',')}`,
      duracao: `${item.duracao_minutos} min`
    }))
  } catch (error) {
    console.error('Erro ao buscar serviços', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar serviços'
    })
  }
}
const form = ref({
  nome: '',
  duracao: null,
  preco: ''
})

const editarServico = (servico) => {
  // Lógica para editar o serviço
  router.push({
    name: 'servicos-update',
    params: {
      servicoId: servico.id
    }
  })

}

const excluirServico = async (servico) => {
  try {
    await api.delete(`/servicos/excluirServico/${servico.id}`)

    $q.notify({
      type: 'positive',
      message: 'Serviço excluído com sucesso!'
    })

    buscarServicos()
  } catch (error) {
    console.error('Erro ao excluir serviço', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir serviço'
    })
  }
}
const salvar = async () => {
  try {
    console.log('Salvando serviço:', form.value)
    await api.post('/servicos/criarNovoServico', {
      nome: form.value.nome,
      duracao_minutos: form.value.duracao,
      preco: form.value.preco.replace(',', '.'),
      // barbearia_id: barbeariaId
    })

    $q.notify({
      type: 'positive',
      message: 'Serviço cadastrado com sucesso!'
    })
    form.value.nome = ''
    form.value.duracao = null
    form.value.preco = ''

    buscarServicos()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar serviço'
    })
  }
}
onMounted(() => {
  buscarServicos()
})
</script>
<!-- <style scoped>

</style> -->