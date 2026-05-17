
<template>
  <div class="chat-page">
    <Chat />
  </div>
</template>

<script setup>
import Chat from 'components/chat/ChatFlow.vue'
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  width: 100%;
  background:
    radial-gradient(820px 420px at 0% 0%, rgba(250, 204, 21, 0.15), transparent 55%),
    radial-gradient(820px 420px at 100% 0%, rgba(56, 189, 248, 0.18), transparent 55%),
    linear-gradient(180deg, #0a0f16 0%, #070b10 100%);
}
</style>
