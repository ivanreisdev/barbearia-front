<template>
  <q-layout view="hHh lpR fFf">

    <!-- HEADER -->
    <q-header elevated class="bg-dark">
      <q-toolbar>

        <!-- botão de menu -->
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="drawer = !drawer"
        />

<q-toolbar-title>
  Olá, {{ auth.user?.name || 'Usuário' }}
</q-toolbar-title>

        <!-- botão de alternar tema -->
        <q-btn
          flat
          dense
          round
          :icon="isDark ? 'dark_mode' : 'light_mode'"
          @click="toggleTheme"
          class="q-mr-sm"
        />

        <!-- logout -->
        <q-btn
          flat
          dense
          round
          icon="logout"
          @click="logout"
          v-if="auth.token"
        />
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer
      v-model="drawer"
      side="left"
      bordered
      class="bg-grey-10 text-white"
    >
      <q-list padding>

        <!-- DASHBOARD -->
        <q-item clickable v-ripple to="/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <!-- AGENDAMENTOS -->
        <q-item clickable v-ripple to="/agendamentos">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>Agendamentos</q-item-section>
        </q-item>

        <!-- CLIENTES -->
        <q-item clickable v-ripple to="/clientes">
          <q-item-section avatar>
            <q-icon name="group" />
          </q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>

        <!-- FATURAMENTO -->
        <q-item clickable v-ripple to="/financeiro">
          <q-item-section avatar>
            <q-icon name="attach_money" />
          </q-item-section>
          <q-item-section>Faturamento</q-item-section>
        </q-item>

        <!-- CONFIGURAÇÕES -->
        <q-expansion-item
          icon="settings"
          label="Configurações"
          switch-toggle-side
        >
          <q-list class="bg-grey-9">

            <q-item clickable v-ripple to="/config/usuario">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Usuário</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/config/barbearia">
              <q-item-section avatar>
                <q-icon name="content_cut" />
              </q-item-section>
              <q-item-section>Minha Barbearia</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/config/servicos">
              <q-item-section avatar>
                <q-icon name="build" />
              </q-item-section>
              <q-item-section>Serviços</q-item-section>
            </q-item>

          </q-list>
        </q-expansion-item>

        <!-- MEU LINK -->
        <q-item clickable v-ripple to="/meu-link">
          <q-item-section avatar>
            <q-icon name="link" />
          </q-item-section>
          <q-item-section>Meu link de agendamento</q-item-section>
        </q-item>

        <!-- AVALIAR APP -->
        <q-item clickable v-ripple @click="avaliarApp">
          <q-item-section avatar>
            <q-icon name="star_rate" />
          </q-item-section>
          <q-item-section>Avaliar App</q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <!-- CONTEÚDO DAS PÁGINAS -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'stores/auth'   // <-- aqui você IMPORTA o auth store
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const drawer = ref(true)
const auth = useAuthStore()    // <-- aqui você USA o store (auth.user, auth.token, etc.)

const router = useRouter()
const $q = useQuasar()

// Tema atual do Quasar
const isDark = ref($q.dark.isActive)

function toggleTheme() {
  $q.dark.toggle()
  isDark.value = $q.dark.isActive
}

function logout() {
  auth.logout()
  router.push('/login')
}

function avaliarApp() {
  window.open("https://google.com", "_blank")
}
</script>


<style>
.bg-dark {
  background-color: #111 !important;
}
</style>
