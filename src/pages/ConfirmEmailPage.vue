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
            <input ref="codeInputRef" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code"
              class="verification-code-input" v-model="codigo" @input="onCodeInput" />
          </div>

          <div v-if="blockMessage" class="rate-limit-box q-mt-md">
            <div class="rate-limit-title">Reenvio bloqueado</div>
            <div class="rate-limit-message">
              {{ blockMessage }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-mt-sm">
          <q-btn label="Confirmar código" unelevated class="full-width text-bold confirm-code-btn"
            @click="confirmarCodigo" :loading="loading" :disable="loading || !codigo" />
        </q-card-actions>

        <q-card-section align="center" class="q-pt-none">
          <q-btn flat no-caps class="link-accent" label="Reenviar código" @click="reenviarCodigo"
            :disable="loading || resendDisabled" />
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
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { notifyError, notifySuccess, notifyWarning } from '../scripts/notificaçoes'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const auth = useAuthStore()

    const codigo = ref('')
    const loading = ref(false)
    const blockSeconds = ref(0)
    const blockMessage = ref('')
    const userId = ref(route.query.user_id || '')
    const email = ref(route.query.email || '')
    const verificationExpiresAt = ref(route.query.verification_expires_at || '')
    const verificationExpiresIn = ref(Number(route.query.verification_expires_in || 0))

    const resendDisabled = computed(() => blockSeconds.value > 0)

    const expirationDuration = ref(0)
    const codeInputRef = ref(null)
    let expirationTimer = null

    const formatBlockDuration = (seconds) => {
      const totalSeconds = Math.max(0, Number(seconds) || 0)
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)

      return [
        String(days).padStart(2, '0'),
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
      ].join(':')
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
        blockMessage.value = ''
        blockSeconds.value = 0
        return
      }

      blockSeconds.value = parsed
      blockMessage.value = `Bloqueado. Tente novamente em ${formatBlockDuration(parsed)} (d:dias, h:horas, m:min).`
    }

    const updateExpiration = () => {
      if (verificationExpiresAt.value) {
        const expiresAt = new Date(verificationExpiresAt.value)
        expirationDuration.value = Math.max(0, Math.floor((expiresAt.getTime() - new Date().getTime()) / 1000))
      }
    }

    const formatDuration = (seconds) => {
      const total = Math.max(0, Number(seconds) || 0)
      const days = Math.floor(total / 86400)
      const hours = Math.floor((total % 86400) / 3600)
      const minutes = Math.floor((total % 3600) / 60)
      const secs = total % 60

      return [
        String(days).padStart(2, '0'),
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(secs).padStart(2, '0'),
      ].join(':')
    }

    const codeCells = computed(() => {
      const digits = codigo.value.replace(/\D/g, '').slice(0, 6).split('')
      return Array.from({ length: 6 }, (_, index) => digits[index] || '')
    })

    const focusCodeInput = () => {
      if (codeInputRef.value) {
        codeInputRef.value.focus()
      }
    }

    const onCodeInput = (event) => {
      codigo.value = event.target.value.replace(/\D/g, '').slice(0, 6)
    }

    const expirationLabel = computed(() => {
      if (expirationDuration.value <= 0) {
        return '00:00:00:00'
      }
      return formatDuration(expirationDuration.value)
    })

    const startExpirationTimer = () => {
      if (!verificationExpiresAt.value && verificationExpiresIn.value > 0) {
        expirationDuration.value = verificationExpiresIn.value
      }

      updateExpiration()

      if (expirationTimer) {
        clearInterval(expirationTimer)
      }

      expirationTimer = setInterval(() => {
        if (verificationExpiresAt.value) {
          updateExpiration()
        } else {
          expirationDuration.value = Math.max(0, expirationDuration.value - 1)
        }

        if (expirationDuration.value <= 0) {
          clearInterval(expirationTimer)
        }
      }, 1000)
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
      startExpirationTimer()
    })

    onBeforeUnmount(() => {
      if (expirationTimer) {
        clearInterval(expirationTimer)
      }
    })

    return {
      codigo,
      loading,
      email,
      blockMessage,
      resendDisabled,
      confirmarCodigo,
      reenviarCodigo,
      expirationLabel,
      codeCells,
      focusCodeInput,
      onCodeInput,
    }
  }
}
</script>

<style src="../css/login.css"></style>
