<template>
  <div class="row items-center q-mb-md">

    <q-btn
      flat
      round
      dense
      icon="arrow_back"
      @click="voltar"
    />

    <div class="text-subtitle1 q-ml-sm">
      {{ titulo }}
    </div>

  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const titulo = computed(() => {
  return route.meta?.title || ''
})

function voltar () {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}
</script>
