<template>
  <div class="column items-center swipe-root">

    <div class="q-mt-xl text-caption inter-semibold">
      {{ label }}
    </div>

    <div class="row justify-center q-mt-md swipe-row">

      <div class="swipe-container" ref="swipeContainer">

        <!-- FILL -->
        <div class="swipe-fill" :style="{ width: fillPercent + '%' }"></div>

        <!-- TEXTO -->
        <span class="swipe-text">
          {{ hint }}
        </span>

        <!-- THUMB -->
        <div class="swipe-thumb" :class="{ disabled: !enabled }" :style="{ transform: `translateX(${swipeX}px)` }"
          @mousedown="enabled && startSwipe($event)" @touchstart="enabled && startSwipe($event)">
          <q-icon :name="icon" size="26px" :color="iconColor" />
        </div>

      </div>
    </div>

  </div>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount, defineExpose, nextTick } from 'vue'

defineProps({
  label: {
    type: String,
    default: 'Deslize para confirmar'
  },
  hint: {
    type: String,
    default: 'Deslize para a direita'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: 'chevron_right'
  },
  iconColor: {
    type: String,
    default: 'white'
  }
})


const emit = defineEmits(['confirm'])

const swipeX = ref(0)
const maxSwipe = ref(260)
const swipeContainer = ref(null)
const THUMB_SIZE = 44
const PADDING_X = 8
let startX = 0
let dragging = false

const fillPercent = computed(() =>
  Math.min((swipeX.value / maxSwipe.value) * 100, 100)
)

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
  const delta = clientX - startX

  swipeX.value = Math.max(0, Math.min(delta, maxSwipe.value))
}

const endSwipe = () => {
  dragging = false

  if (swipeX.value >= maxSwipe.value * 0.9) {
    swipeX.value = maxSwipe.value
    emit('confirm')
  } else {
    swipeX.value = 0
  }

  removeListeners()
}

const removeListeners = () => {
  document.removeEventListener('mousemove', moveSwipe)
  document.removeEventListener('mouseup', endSwipe)
  document.removeEventListener('touchmove', moveSwipe)
  document.removeEventListener('touchend', endSwipe)
}

const resetSwipe = () => {
  swipeX.value = 0
}

const updateMaxSwipe = () => {
  const el = swipeContainer.value
  if (!el) return
  const width = el.clientWidth || 0
  const newMax = Math.max(0, width - THUMB_SIZE - PADDING_X)
  maxSwipe.value = newMax > 0 ? newMax : 260
  swipeX.value = Math.min(swipeX.value, maxSwipe.value)
}

const onResize = () => {
  updateMaxSwipe()
}

defineExpose({
  resetSwipe
})

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => updateMaxSwipe())
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  removeListeners()
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.swipe-container {
  position: relative;
  width: 100%;
  min-width: 260px;
  max-width: 320px;
  height: 52px;
  background: #4b4f56;
  border-radius: 30px;
  overflow: hidden;
}

.swipe-root {
  width: 100%;
  align-items: center;
}

.swipe-row {
  width: 100%;
}

.swipe-fill {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #d32f2f, #ff5252);
  transition: width 0.1s;
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
  background: #7a7f87;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.swipe-thumb.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
