<template>
  <div class="loading-container">
    <img
      v-show="logoReady"
      :src="loadingImg"
      alt="JetBarber"
      class="logo"
      loading="eager"
      decoding="async"
    />
    <div class="loading-dots" aria-label="Carregando">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script setup>
import loadingImg from 'assets/loadinggImg.png'
import { ref, onMounted } from 'vue'

const logoReady = ref(false)

onMounted(() => {
  const img = new Image()
  img.src = loadingImg
  img.onload = () => {
    logoReady.value = true
  }
  img.onerror = () => {
    logoReady.value = true
  }
})
</script>

<style scoped>
.loading-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: translateY(-24px);
  overflow: hidden;
}

.logo {
  width: 280px;
  max-width: 80vw;
}

.loading-dots {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #999;
  animation: bounce 0.9s ease-in-out infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-6px); opacity: 1; }
}
</style>
