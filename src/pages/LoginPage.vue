<template>
  <div class="login-container">

    <!-- Camada escura -->
    <div class="background-overlay"></div>

    <q-card class="login-card q-pa-xl">
      <q-card-section class="text-center">
        <img
          src="/imgs/logoSemFundo.png"
          alt="JetBarber"
          class="login-logo"
        />

        <div class="app-title q-mt-md">
          JetBarber
        </div>

        <div class="app-subtitle">
          Estilo começa aqui
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          filled
          dark
          v-model="email"
          label="Email"
          class="q-mt-sm input-dark"
        />

        <q-input
          filled
          dark
          type="password"
          v-model="password"
          label="Senha"
          class="q-mt-md input-dark"
        />
      </q-card-section>

      <q-card-actions align="center" class="q-mt-sm">
        <q-btn
          label="Entrar"
          color="amber-8"
          class="full-width text-bold login-btn"
          @click="doLogin"
          unelevated
        />
      </q-card-actions>

      <q-card-section class="text-center q-mt-md">
        <div class="footer-text">
          © 2025 JetBarber
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
<script>
import useLogin from '../scripts/login.js'

export default {
  setup() {
    return useLogin()
  }
}
</script>

<style src="../css/login.css"></style>
