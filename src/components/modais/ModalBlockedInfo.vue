<template>
  <q-dialog v-model="inner" persistent>
    <q-card class="blocked-modal-card">
      <q-card-section class="q-pa-md text-center">
        <div class="blocked-icon">
          <q-icon name="lock" size="36px" />
        </div>
        <div class="blocked-title">Reenvio temporariamente bloqueado</div>
        <div class="blocked-desc">
          Detectamos um número elevado de tentativas de Reenvio. Por motivos de segurança, o Reenvio de
          confirmação foram temporariamente suspensos.
        </div>
        <div class="blocked-timer-row q-mt-md">
          <q-icon name="schedule" />
          <div class="blocked-timer-text">Tente novamente em <span class="blocked-timer-value">{{ timerText
          }}</span>.</div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md">
        <q-btn unelevated color="grey-8" class="full-width" @click="close">ENTENDI</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  timerText: { type: String, default: '00:00:00:00' },
})

const emit = defineEmits(['update:modelValue', 'close'])

const inner = ref(props.modelValue)

watch(() => props.modelValue, (v) => {
  inner.value = v
})

watch(inner, (v) => {
  emit('update:modelValue', v)
})

function close() {
  inner.value = false
  emit('close')
}
</script>

<style scoped>
.blocked-modal-card {
  width: 420px;
  max-width: 92vw;
  border-radius: 14px;
  background: rgba(10, 10, 12, 0.98);
  border: 1px solid rgba(255, 166, 0, 0.18);
}

.blocked-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 166, 0, 0.14);
  color: #ffd89b;
}

.blocked-title {
  font-weight: 800;
  font-size: 1.02rem;
  color: #ffd89b;
  margin-bottom: 8px;
}

.blocked-desc {
  color: #ddd;
  font-size: 0.95rem;
  line-height: 1.6;
}

.blocked-timer-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.blocked-timer-text {
  color: #f3f3f3;
}

.blocked-timer-value {
  color: #ffc84a;
  font-weight: 800;
  margin-left: 6px
}
</style>
