<template>
  <q-page class="q-pa-lg">

    <!-- Cabeçalho -->
    <div class="q-mb-xl">
      <div class="text-h5">Configurações da Barbearia</div>
      <div class="text-caption text-grey-5">
        Configure os dias e horários de funcionamento da barbearia
      </div>
    </div>

    <!-- Horários de funcionamento -->
    <div class="text-subtitle1 q-mb-md">
      Horário de Funcionamento
    </div>

    <q-card
      v-for="dia in diasSemana"
      :key="dia.key"
      class="q-mb-md"
      flat
      bordered
    >
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle2">
          {{ dia.label }}
        </div>

        <q-toggle
          v-model="dia.ativo"
          color="green"
          :label="dia.ativo ? 'Atendendo' : 'Não atendendo'"
        />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="dia.ativo" class="row q-col-gutter-md">
        <q-input
          filled
          type="time"
          v-model="dia.inicio"
          label="Início"
          class="col-12 col-md-3"
        />

        <q-input
          filled
          type="time"
          v-model="dia.almocoInicio"
          label="Almoço início"
          class="col-12 col-md-3"
        />

        <q-input
          filled
          type="time"
          v-model="dia.almocoFim"
          label="Almoço fim"
          class="col-12 col-md-3"
        />

        <q-input
          filled
          type="time"
          v-model="dia.fim"
          label="Fim"
          class="col-12 col-md-3"
        />
      </q-card-section>
    </q-card>

    <!-- Informações da barbearia -->
    <q-card class="q-mt-xl" flat bordered>
      <q-card-section>
        <div class="text-subtitle1">Informações da Barbearia</div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <q-input
          filled
          label="Nome da Barbearia"
          v-model="barbearia.nome"
          class="col-12 col-md-6"
        />

        <q-input
          filled
          label="Telefone"
          v-model="barbearia.telefone"
          class="col-12 col-md-6"
        />

        <q-input
          filled
          label="Endereço"
          v-model="barbearia.endereco"
          class="col-12"
        />
      </q-card-section>
    </q-card>

    <!-- Botão salvar -->
    <div class="row justify-end q-mt-xl">
      <q-btn
        color="primary"
        icon="save"
        label="Salvar Configurações"
        @click="salvarConfiguracoes"
      />
    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const diasSemana = ref([
  {
    key: 'domingo',
    label: 'Domingo',
    ativo: false,
    inicio: '09:00',
    almocoInicio: '12:00',
    almocoFim: '13:00',
    fim: '18:00'
  },
  {
    key: 'segunda',
    label: 'Segunda-feira',
    ativo: true,
    inicio: '09:00',
    almocoInicio: '12:00',
    almocoFim: '13:00',
    fim: '18:00'
  },
  {
    key: 'terca',
    label: 'Terça-feira',
    ativo: true,
    inicio: '09:00',
    almocoInicio: '12:00',
    almocoFim: '13:00',
    fim: '18:00'
  },
  {
    key: 'quarta',
    label: 'Quarta-feira',
    ativo: true,
    inicio: '09:00',
    almocoInicio: '12:00',
    almocoFim: '13:00',
    fim: '18:00'
  },
  {
    key: 'quinta',
    label: 'Quinta-feira',
    ativo: true,
    inicio: '09:00',
    almocoInicio: '12:00',
    almocoFim: '13:00',
    fim: '18:00'
  },
  {
    key: 'sexta',
    label: 'Sexta-feira',
    ativo: true,
    inicio: '09:00',
    almocoInicio: '12:00',
    almocoFim: '13:00',
    fim: '18:00'
  },
  {
    key: 'sabado',
    label: 'Sábado',
    ativo: false,
    inicio: '09:00',
    almocoInicio: '',
    almocoFim: '',
    fim: '14:00'
  }
])

const barbearia = ref({
  nome: '',
  telefone: '',
  endereco: ''
})

const salvarConfiguracoes = () => {
  console.log('Dias:', diasSemana.value)
  console.log('Barbearia:', barbearia.value)

  $q.notify({
    type: 'positive',
    message: 'Configurações salvas com sucesso!'
  })
}
</script>

<style scoped>
</style>
