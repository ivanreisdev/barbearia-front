<template>
  <q-page padding>
    <h5>Agendamentos</h5>

    <q-btn label="Carregar agendamentos" color="primary" @click="load" />

    <q-list bordered class="q-mt-md">
      <q-item v-for="item in agendamentos" :key="item.id">
        <q-item-section>
          <q-item-label>{{ item.cliente }}</q-item-label>
          <q-item-label caption>{{ item.data }} - {{ item.hora }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'

const agendamentos = ref([])

const load = async () => {
  const { data } = await api.get('/agendamentos')
  agendamentos.value = data
}
</script>
