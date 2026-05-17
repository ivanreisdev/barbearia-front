<template>
  <q-page class="q-pa-lg">

    <!-- Cabeçalho -->
    <div class="row items-center q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        @click="$router.back()"
      />
      <div class="text-h6 q-ml-md">Novo Serviço</div>
    </div>

    <q-card flat bordered>
      <q-card-section class="q-gutter-md">

        <q-input
          filled
          v-model="form.nome"
          label="Nome do serviço"
          lazy-rules
          :rules="[val => !!val || 'Informe o nome']"
        />

        <q-input
          filled
          type="number"
          v-model.number="form.duracao"
          label="Duração (minutos)"
          min="1"
          lazy-rules
          :rules="[val => val > 0 || 'Informe a duração']"
        />

        <q-input
          filled
          prefix="R$"
          v-model="form.preco"
          label="Valor"
          mask="#,##"
          reverse-fill-mask
          lazy-rules
          :rules="[val => !!val || 'Informe o valor']"
        />

      </q-card-section>
    </q-card>

    <div class="row justify-end q-mt-lg">
      <q-btn
        flat
        label="Cancelar"
        color="grey"
        class="q-mr-sm"
        @click="$router.back()"
      />
      <q-btn
        color="primary"
        label="Salvar"
        icon="check"
        @click="salvar"
      />
    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useRoute, useRouter } from 'vue-router'


const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const form = ref({
  nome: '',
  duracao: null,
  preco: ''
})

const barbeariaId = route.params.barbeariaId
console.log('Barbearia ID:', barbeariaId)
const salvar = async () => {
  try {
    console.log('Salvando serviço:', form.value)
    await api.post('/servicos/criarNovoServico', {
      nome: form.value.nome,
      duracao_minutos: form.value.duracao,
      preco: form.value.preco.replace(',', '.'),
      barbearia_id: barbeariaId
    })

    $q.notify({
      type: 'positive',
      message: 'Serviço cadastrado com sucesso!'
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
</script>
