<template>
  <div class="login-container">
    <!-- Camada escura -->
    <div class="background-overlay"></div>

    <q-card class="login-card q-pa-xl">
      <q-card-section class="text-center">
        <img src="/imgs/logoSemFundo.png" alt="JetBarber" class="login-logo" />

        <div class="app-title q-mt-md">JetBarber</div>

        <div class="app-subtitle">Estilo começa aqui</div>
      </q-card-section>

      <q-card-section>
        <q-input
          filled
          dark
          v-model="nome"
          label="Nome"
          autocomplete="given-name"
          class="q-mt-sm input-dark"
        />

        <q-input
          filled
          dark
          v-model="sobrenome"
          label="Sobrenome"
          autocomplete="family-name"
          class="q-mt-sm input-dark"
        />

        <q-input
          filled
          dark
          v-model="email"
          label="Email"
          type="email"
          autocomplete="email"
          class="q-mt-sm input-dark"
        />

        <q-input
          filled
          dark
          v-model="telefone"
          label="Telefone"
          type="tel"
          mask="(##) #####-####"
          autocomplete="tel"
          class="q-mt-sm input-dark"
        />

        <q-input
          filled
          dark
          type="password"
          v-model="password"
          label="Senha"
          autocomplete="new-password"
          class="q-mt-sm input-dark"
        />

        <q-btn-toggle
          v-model="tipoUsuario"
          spread
          no-caps
          unelevated
          toggle-color="green"
          color="grey-9"
          text-color="white"
          :options="[
            { label: 'Barbeiro', value: 'barbeiro' },
            { label: 'Admin', value: 'admin' },
          ]"
          class="q-mt-md user-type-toggle"
        />

        <q-input
          v-if="!isAdmin"
          filled
          dark
          v-model="codigoVinculacao"
          label="Codigo de vinculacao da barbearia"
          autocomplete="off"
          class="q-mt-sm input-dark"
        />

        <template v-if="isAdmin">
          <q-input
            filled
            dark
            v-model="nomeBarbearia"
            label="Nome da barbearia"
            autocomplete="organization"
            class="q-mt-sm input-dark"
          />

          <div class="row q-col-gutter-sm q-mt-none">
            <div class="col-12 col-sm-8">
              <q-input
                filled
                dark
                v-model="ruaBarbearia"
                label="Rua"
                autocomplete="address-line1"
                class="q-mt-sm input-dark"
              />
            </div>

            <div class="col-12 col-sm-4">
              <q-input
                filled
                dark
                v-model="numeroBarbearia"
                label="Numero"
                autocomplete="address-line2"
                class="q-mt-sm input-dark"
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mt-none">
            <div class="col-12 col-sm-6">
              <q-input
                filled
                dark
                v-model="bairroBarbearia"
                label="Bairro"
                autocomplete="address-level3"
                class="q-mt-sm input-dark"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-select
                filled
                dark
                v-model="ufBarbearia"
                :options="ufsBrasil"
                label="Estado / UF"
                emit-value
                map-options
                class="q-mt-sm input-dark"
              />
            </div>
          </div>

          <q-input
            filled
            dark
            v-model="cidadeBarbearia"
            label="Cidade"
            autocomplete="address-level2"
            class="q-mt-sm input-dark"
          />

          <q-input
            filled
            dark
            v-model="complementoBarbearia"
            label="Complemento"
            autocomplete="address-line3"
            class="q-mt-sm input-dark"
          />
        </template>
      </q-card-section>

      <q-card-actions align="center" class="q-mt-sm">
        <q-btn label="Registrar" color="amber-8" class="full-width text-bold login-btn" @click="registrar" unelevated />
      </q-card-actions>

      <q-card-section class="text-center q-mt-md">
        <div class="footer-text">© 2025 JetBarber</div>
      </q-card-section>
    </q-card>
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
