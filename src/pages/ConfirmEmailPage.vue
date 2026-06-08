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
          <div v-if="!confirmDisabled">
            <q-btn label="Confirmar código" unelevated class="full-width text-bold confirm-code-btn"
              @click="confirmarCodigo" :loading="loading" :disable="loading || !codigo" />
          </div>
          <div v-else class="full-width">
            <q-btn flat no-caps :disable="true" class="blocked-resend-btn full-width">
              <q-icon name="schedule" size="18px" class="q-mr-sm" />
              Confirmar em {{ formattedConfirmTimer }}
            </q-btn>
          </div>
        </q-card-actions>

        <q-card-section align="center" class="q-pt-none">
          <div v-if="!resendDisabled">
            <q-btn flat no-caps class="link-accent" label="Reenviar código" @click="reenviarCodigo"
              :disable="loading" />
          </div>
          <div v-else>
            <q-btn flat no-caps :disable="true" class="blocked-resend-btn">
              <q-icon name="schedule" size="18px" class="q-mr-sm" />
              Reenviar em {{ formattedResendTimer }}
            </q-btn>
          </div>
        </q-card-section>

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

      <ModalBlockedInfo v-model="showResendBlockedModal" :timerText="formattedResendTimer" />
      <ModalConfirmBlockedInfo v-model="showConfirmBlockedModal" :timerText="formattedConfirmTimer" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { notifyError, notifySuccess, notifyWarning } from '../scripts/notificaçoes'
import ModalBlockedInfo from 'components/modais/ModalBlockedInfo.vue'
import ModalConfirmBlockedInfo from 'components/modais/ModalConfirmBlockedInfo.vue'

export default {
  components: { ModalBlockedInfo, ModalConfirmBlockedInfo },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const auth = useAuthStore()

    const codigo = ref('')
    const loading = ref(false)
    const confirmBlockSeconds = ref(0)
    const resendBlockSeconds = ref(0)
    const confirmTimerId = ref(null)
    const resendTimerId = ref(null)
    const showResendBlockedModal = ref(false)
    const showConfirmBlockedModal = ref(false)
    const userId = ref(route.query.user_id || '')
    const email = ref(route.query.email || '')

    const resendDisabled = computed(() => resendBlockSeconds.value > 0)
    const confirmDisabled = computed(() => confirmBlockSeconds.value > 0)
    const formattedResendTimer = computed(() => formatHHMMSS(resendBlockSeconds.value))
    const formattedConfirmTimer = computed(() => formatHHMMSS(confirmBlockSeconds.value))

    const codeInputRef = ref(null)

    // Show HH:MM:SS (hours may exceed 24 when days > 0)
    const formatHHMMSS = (seconds) => {
      const totalSeconds = Math.max(0, Number(seconds) || 0)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const secs = totalSeconds % 60

      return [String(hours).padStart(2, '0'), String(minutes).padStart(2, '0'), String(secs).padStart(2, '0')].join(':')
    }

    const clearConfirmTimer = () => {
      if (confirmTimerId.value) {
        clearInterval(confirmTimerId.value)
        confirmTimerId.value = null
      }
    }

    const clearResendTimer = () => {
      if (resendTimerId.value) {
        clearInterval(resendTimerId.value)
        resendTimerId.value = null
      }
    }

    const startConfirmTimer = () => {
      clearConfirmTimer()

      confirmTimerId.value = setInterval(() => {
        if (confirmBlockSeconds.value <= 0) {
          clearConfirmTimer()
          confirmBlockSeconds.value = 0
          return
        }

        confirmBlockSeconds.value -= 1
      }, 1000)
    }

    const startResendTimer = () => {
      clearResendTimer()

      resendTimerId.value = setInterval(() => {
        if (resendBlockSeconds.value <= 0) {
          clearResendTimer()
          resendBlockSeconds.value = 0
          return
        }

        resendBlockSeconds.value -= 1
      }, 1000)
    }

    const validateRoute = () => {
      if (!userId.value || !email.value) {
        notifyWarning('Informações de verificação não encontradas. Faça o registro novamente.')
        router.push('/register')
      }
    }

    const parseSecondsFromError = (err) => {
      const raw = err?.duracao || err?.raw?.response?.data?.duracao || 0
      const fallbackText = err?.raw?.response?.data?.error || err?.message || ''
      const textSeconds = fallbackText.toString().match(/(\d+)\s*segundos/i)?.[1]

      return Number(raw || textSeconds || 0)
    }

    const buildConfirmBlock = (seconds) => {
      const parsed = Number(seconds) || 0

      if (parsed <= 0) {
        clearConfirmTimer()
        confirmBlockSeconds.value = 0
        return
      }

      confirmBlockSeconds.value = parsed
      showConfirmBlockedModal.value = true
      startConfirmTimer()
    }

    const buildResendBlock = (seconds) => {
      const parsed = Number(seconds) || 0

      if (parsed <= 0) {
        clearResendTimer()
        resendBlockSeconds.value = 0
        return
      }

      resendBlockSeconds.value = parsed
      showResendBlockedModal.value = true
      startResendTimer()
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
      try {
        await auth.verifyEmail(userId.value, codigo.value.trim())
        notifySuccess('Email confirmado com sucesso.')
        router.push('/dashboard')
      } catch (err) {
        const seconds = parseSecondsFromError(err)

        if (err.status === 429 && seconds > 0) {
          buildConfirmBlock(seconds)
        }

        notifyError(err.message || 'Não foi possível confirmar o código.')
      } finally {
        loading.value = false
      }
    }

    const reenviarCodigo = async () => {
      loading.value = true

      try {
        await auth.resendOtp(userId.value, email.value)
        notifySuccess('Código reenviado com sucesso. Verifique seu email.')
      } catch (err) {
        const seconds = parseSecondsFromError(err)

        if (err.status === 429 && seconds > 0) {
          buildResendBlock(seconds)
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
      clearConfirmTimer()
      clearResendTimer()
    })

    return {
      codigo,
      loading,
      email,
      userId,
      resendDisabled,
      confirmDisabled,
      formattedResendTimer,
      formattedConfirmTimer,
      showResendBlockedModal,
      showConfirmBlockedModal,
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
