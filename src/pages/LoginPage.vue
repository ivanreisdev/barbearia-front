<template>
  <div class="login-container">
    <div class="background-overlay"></div>

    <div class="login-shell">
      <section class="brand-panel" aria-hidden="true"></section>

      <q-card class="login-card">
        <q-card-section class="q-pb-none">
          <div class="form-title">Entrar na sua conta</div>
          <div class="form-subtitle">Use seu email e senha para continuar</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input filled dark v-model="email" label="Email" class="input-dark" />

          <q-input
            filled
            dark
            type="password"
            v-model="password"
            label="Senha"
            class="q-mt-md input-dark"
          />

          <div v-if="rateLimitActive" class="rate-limit-box q-mt-md">
            <div class="rate-limit-title">Acesso temporariamente bloqueado</div>
            <div class="rate-limit-message">
              <div>{{ rateLimitMessage }}</div>
              <div class="rate-limit-countdown">{{ rateLimitCountdown }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-mt-sm">
          <q-btn
            v-if="!rateLimitActive"
            label="Entrar"
            class="full-width text-bold login-btn"
            @click="doLogin"
            unelevated
          />
        </q-card-actions>

        <q-card-section v-if="rateLimitActive" class="text-center q-pt-none">
          <q-btn
            flat
            no-caps
            color="white"
            class="rate-limit-action"
            label="Entrar com outro usuário"
            @click="trocarUsuario"
          />
        </q-card-section>

        <q-card-section class="text-center q-mt-sm">
          <div class="form-link">
            Não tem conta?
            <router-link to="/register" class="link-accent">Registre-se</router-link>
          </div>
        </q-card-section>

        <q-card-section class="text-center q-mt-md">
          <div class="footer-text">@ 2026 JetBarber</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script>
import useLogin from '../scripts/login.js'

export default {
  setup() {
    return useLogin()
  },
}
</script>

<style src="../css/login.css"></style>
