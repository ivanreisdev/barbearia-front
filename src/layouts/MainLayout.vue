<template>
  <q-layout view="hHh lpR fFf">

    <!-- HEADER REMOVIDO -->

    <!-- DRAWER -->
    <q-drawer v-model="drawer" side="left" bordered class="bg-grey-10 text-white">
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
        <q-expansion-item icon="settings" label="Configurações" switch-toggle-side>
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

        <q-separator />

        <!-- LOGOUT -->
        <q-item clickable v-ripple @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Sair</q-item-section>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useRouter } from 'vue-router'

const drawer = ref(true)
const auth = useAuthStore()
const router = useRouter()

function avaliarApp() {
  window.open("https://google.com", "_blank")
}

function logout() {
  auth.logout()
  router.push('/login')
}

function handleToggleDrawer() {
  drawer.value = !drawer.value
}

onMounted(() => {
  window.addEventListener('toggle-drawer', handleToggleDrawer)
})

onBeforeUnmount(() => {
  window.removeEventListener('toggle-drawer', handleToggleDrawer)
})
</script>


<style>
.bg-dark {
  background-color: #111 !important;
}

.no-divider {
  box-shadow: none !important;
  border-bottom: 0 !important;
}
</style>
