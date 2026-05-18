<template>
  <div class="login-container">
    <div class="background-overlay"></div>

    <div class="login-shell">
      <section class="brand-panel">
        <img src="/imgs/logoSemFundo.png" alt="JetBarber" class="login-logo" />
        <div class="app-title q-mt-md">JetBarber</div>
        <div class="app-subtitle">Estilo começa aqui</div>

        <ul class="brand-list q-mt-lg">
          <li>Agenda inteligente para sua barbearia</li>
          <li>Controle de clientes e horários</li>
          <li>Experiência premium em qualquer tela</li>
        </ul>
      </section>

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
