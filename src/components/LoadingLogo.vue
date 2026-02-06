<template>
  <div class="loading-container">
    <img :src="loadingImg" alt="JetBarber" class="logo" />
    <div class="loading-dots" aria-label="Carregando">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script setup>
import loadingImg from 'assets/loadinggImg.png'
</script>

<style scoped>
.loading-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: translateY(-24px);
}

.logo {
  width: 280px;
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
