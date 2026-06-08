<template>
  <div class="login-container confirm-page">
    <div class="background-overlay"></div>

    <div class="login-shell centered">
      <q-card class="login-card confirmation-card">
        <q-card-section class="q-pb-none text-center">
          <div class="confirmation-artwork">
            <img src="/imgs/email-validation-cart.png" alt="Verificação de email" />
          </div>
          <div class="form-title">Verifique seu email</div>
          <div class="form-subtitle">
            Um código foi enviado para <strong>{{ email }}</strong>.
            Insira-o abaixo para concluir o registro.
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="verification-code-wrapper" @click="focusCodeInput">
            <div class="verification-code-box" v-for="(digit, index) in codeCells" :key="index"
              :class="{ filled: !!digit }">
              <span>{{ digit }}</span>
            </div>
            <input ref="codeInputRef" type="text" inputmode="text" maxlength="6" autocomplete="one-time-code"
              class="verification-code-input" v-model="codigo" @input="onCodeInput" />
          </div>

          <router-link class="change-email-link q-mt-md text-center"
            :to="{ name: 'change-email', query: { user_id: userId, email } }">
            Deseja alterar seu e-mail?
            <span class="link-accent">clique aqui</span>
          </router-link>
        </q-card-section>

        <q-card-actions align="center" class="q-mt-sm">
          <q-btn label="Confirmar código" unelevated class="full-width text-bold confirm-code-btn"
            @click="confirmarCodigo" :loading="loading" :disable="loading || !codigo" />
        </q-card-actions>

        <q-card-section align="center" class="q-pt-none">
          <div v-if="!isBlocked">
            <q-btn flat no-caps class="link-accent" label="Reenviar código" @click="reenviarCodigo"
              :disable="loading || resendDisabled" />
          </div>
          <div v-else>
            <q-btn flat no-caps :disable="true" class="blocked-resend-btn">
              <q-icon name="schedule" size="18px" class="q-mr-sm" />
              Reenviar em {{ formattedBlockTimer }}
            </q-btn>
          </div>
        </q-card-section>
        <!-- blocked alert moved to modal -->

        <q-card-section class="text-center q-mt-md">
          <div class="form-link">
            Já tem conta?
            <router-link to="/login" class="link-accent">Entrar</router-link>
          </div>
        </q-card-section>

        <q-card-section class="text-center q-mt-md">
          <div class="footer-text">© 2026 JetBarber</div>
        </q-card-section>
      </q-card>

      <ModalBlockedInfo v-model="showBlockedModal" :timerText="formattedBlockTimer" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { notifyError, notifySuccess, notifyWarning } from '../scripts/notificaçoes'
import ModalBlockedInfo from 'components/modais/ModalBlockedInfo.vue'

export default {
  components: { ModalBlockedInfo },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const auth = useAuthStore()

    const codigo = ref('')
    const loading = ref(false)
    const blockSeconds = ref(0)
    const blockMessage = ref('')
    const timerId = ref(null)
    const showBlockedModal = ref(false)
    const userId = ref(route.query.user_id || '')
    const email = ref(route.query.email || '')

    const resendDisabled = computed(() => blockSeconds.value > 0)
    const isBlocked = computed(() => blockSeconds.value > 0)
    const formattedBlockTimer = computed(() => formatHHMMSS(blockSeconds.value))

    const codeInputRef = ref(null)

    // Show HH:MM:SS (hours may exceed 24 when days > 0)
    const formatHHMMSS = (seconds) => {
      const totalSeconds = Math.max(0, Number(seconds) || 0)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const secs = totalSeconds % 60

      return [String(hours).padStart(2, '0'), String(minutes).padStart(2, '0'), String(secs).padStart(2, '0')].join(':')
    }

    const clearBlockTimer = () => {
      if (timerId.value) {
        clearInterval(timerId.value)
        timerId.value = null
      }
    }

    const startBlockTimer = () => {
      clearBlockTimer()

      timerId.value = setInterval(() => {
        if (blockSeconds.value <= 0) {
          clearBlockTimer()
          blockMessage.value = ''
          blockSeconds.value = 0
          return
        }

        blockSeconds.value -= 1
      }, 1000)
    }

    const validateRoute = () => {
      if (!userId.value || !email.value) {
        notifyWarning('Informações de verificação não encontradas. Faça o registro novamente.')
        router.push('/register')
      }
    }

    const buildBlockMessage = (seconds) => {
      const parsed = Number(seconds) || 0

      if (parsed <= 0) {
        clearBlockTimer()
        blockMessage.value = ''
        blockSeconds.value = 0
        return
      }

      blockSeconds.value = parsed
      blockMessage.value = 'Usuário bloqueado temporariamente por excesso de reenvio diário.'
      showBlockedModal.value = true
      startBlockTimer()
    }

    const codeCells = computed(() => {
      const digits = codigo.value.slice(0, 6).split('')
      return Array.from({ length: 6 }, (_, index) => digits[index] || '')
    })

    const focusCodeInput = () => {
      if (codeInputRef.value) {
        codeInputRef.value.focus()
      }
    }

    const onCodeInput = (event) => {
      codigo.value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()
    }

    const confirmarCodigo = async () => {
      if (!codigo.value.trim()) {
        notifyWarning('Informe o código enviado por email.')
        return
      }

      loading.value = true
      blockMessage.value = ''

      try {
        await auth.verifyEmail(userId.value, codigo.value.trim())
        notifySuccess('Email confirmado com sucesso.')
        router.push('/dashboard')
      } catch (err) {
        const seconds = Number(err?.duracao || err?.raw?.response?.data?.duracao || 0)

        if (err.status === 429 && seconds > 0) {
          buildBlockMessage(seconds)
        }

        notifyError(err.message || 'Não foi possível confirmar o código.')
      } finally {
        loading.value = false
      }
    }

    const reenviarCodigo = async () => {
      loading.value = true
      blockMessage.value = ''

      try {
        await auth.resendOtp(userId.value, email.value)
        notifySuccess('Código reenviado com sucesso. Verifique seu email.')
      } catch (err) {
        const seconds = Number(err?.duracao || err?.raw?.response?.data?.duracao || 0)

        if (err.status === 429 && seconds > 0) {
          buildBlockMessage(seconds)
        }

        notifyError(err.message || 'Erro ao reenviar código.')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      validateRoute()
    })

    onBeforeUnmount(() => {
      clearBlockTimer()
    })

    return {
      codigo,
      loading,
      email,
      userId,
      blockMessage,
      resendDisabled,
      isBlocked,
      formattedBlockTimer,
      showBlockedModal,
      confirmarCodigo,
      reenviarCodigo,
      codeCells,
      focusCodeInput,
      onCodeInput,
    }
  }
}
</script>

<style src="../css/login.css"></style>
