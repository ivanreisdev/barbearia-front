<template>
  <div class="login-container confirm-page">
    <div class="background-overlay"></div>

    <div class="login-shell centered">
      <q-card class="login-card confirmation-card">
        <q-card-section class="q-pt-none">
          <q-btn flat round icon="arrow_back" class="back-btn" @click="goBack" />
        </q-card-section>

        <q-card-section class="q-pb-none text-center">
          <div class="confirmation-artwork">
            <img src="/imgs/email-validation-cart.png" alt="Alterar email" />
          </div>
          <div class="form-title">Alterar E-mail</div>
          <div class="form-subtitle">
            Atualize para um novo endereço de e-mail válido e confirme novamente.
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input filled v-model="newEmail" label="Novo e-mail" type="email" class="compact-email-input input-dark"
            autofocus />

          <div class="swipe-update-wrapper">
            <SwipeConfirm :enabled="swipeEnabled" label="Deslize para atualizar" hint="confirmar alteração"
              icon="chevron_right" iconColor="white" @confirm="alterarEmail" />
          </div>

        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { notifyError, notifySuccess } from 'src/scripts/notificaçoes'
import SwipeConfirm from 'components/SwipeConfirm.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const newEmail = ref('')
const loading = ref(false)
const userId = ref(null)

const swipeEnabled = computed(() => !loading.value && validateEmail(newEmail.value))

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validateRoute = () => {
  userId.value = route.query.user_id || route.query.userId || null
  newEmail.value = route.query.email || ''

  if (!userId.value) {
    notifyError('Usuário inválido. Retornando para confirmação.')
    router.push({ path: '/verify-email' })
  }
}

const alterarEmail = async () => {
  if (!validateEmail(newEmail.value)) {
    notifyError('Informe um e-mail válido.')
    return
  }

  loading.value = true
  try {
    await auth.updateEmail(userId.value, newEmail.value)
    notifySuccess('E-mail atualizado com sucesso.')
    router.push({
      path: '/verify-email',
      query: { user_id: userId.value, email: newEmail.value },
    })
  } catch (err) {
    notifyError(err.message || 'Erro ao alterar o e-mail.')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({
    path: '/verify-email',
    query: { user_id: userId.value, email: newEmail.value || '' },
  })
}

onMounted(() => {
  validateRoute()
})
</script>

<style scoped>
.compact-email-input {
  margin-bottom: 0.4rem;
}

.swipe-update-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 0.2rem;
}

.swipe-update-wrapper .swipe-container {
  max-width: 320px;
  width: 100%;
}
</style>

<style src="../css/login.css"></style>
