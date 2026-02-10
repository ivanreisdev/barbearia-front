<template>
  <q-layout view="hHh LpR fFf" :class="{ 'drawer-open': drawer }">

    <!-- DRAWER -->
    <q-drawer v-model="drawer" side="left" show-if-above class="drawer-bg text-white">
      <div class="drawer-header">
        <div class="text-h6 text-weight-bold title-menu">JetBarber</div>
        <div class="text-caption text-grey-5 subTitle-menu">
          Gestão da Barbearia
        </div>
      </div>

      <q-list padding class="lista-acoes-menu">

        <!-- PRINCIPAL -->
        <q-item-label header class="text-grey-6">
          PRINCIPAL
        </q-item-label>

        <q-item clickable v-ripple to="/dashboard" active-class="menu-active" @click="fecharDrawer">
          <q-item-section avatar>
            <q-icon name="dashboard" size="20px" />
          </q-item-section>
          <q-item-section class="text-weight-medium">
            Dashboard
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/agendamentos" active-class="menu-active" @click="fecharDrawer">
          <q-item-section avatar>
            <q-icon name="event" size="20px" />
          </q-item-section>
          <q-item-section class="text-weight-medium">
            Agendamentos
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/clientes" active-class="menu-active" @click="fecharDrawer">
          <q-item-section avatar>
            <q-icon name="group" size="20px" />
          </q-item-section>
          <q-item-section class="text-weight-medium">
            Clientes
          </q-item-section>
        </q-item>

        <q-item-label header class="text-grey-6">
          FINANCEIRO
        </q-item-label>

        <q-item clickable v-ripple to="/financeiro" active-class="menu-active" @click="fecharDrawer">
          <q-item-section avatar>
            <q-icon name="attach_money" size="20px" />
          </q-item-section>
          <q-item-section class="text-weight-medium">
            Faturamento
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/despesas" active-class="menu-active" @click="fecharDrawer">
          <q-item-section avatar>
            <q-icon name="receipt_long" size="20px" />
          </q-item-section>
          <q-item-section class="text-weight-medium">
            Despesas
          </q-item-section>
        </q-item>

        <!-- CONFIGURAÇÕES -->
        <q-item-label header class="text-grey-6 q-mt-md">
          CONFIGURAÇÕES
        </q-item-label>

        <q-expansion-item icon="settings" label="Configurações" expand-separator header-class="text-grey-4">
          <q-list class="bg-grey-9 q-pl-sm">

            <q-item clickable v-ripple to="/config/usuario" active-class="menu-active" @click="fecharDrawer">
              <q-item-section avatar>
                <q-icon name="person" size="18px" />
              </q-item-section>
              <q-item-section>Usuário</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/config/barbearia" active-class="menu-active" @click="fecharDrawer">
              <q-item-section avatar>
                <q-icon name="content_cut" size="18px" />
              </q-item-section>
              <q-item-section>Minha Barbearia</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/config/servicos" active-class="menu-active" @click="fecharDrawer">
              <q-item-section avatar>
                <q-icon name="build" size="18px" />
              </q-item-section>
              <q-item-section>Serviços</q-item-section>
            </q-item>

          </q-list>
        </q-expansion-item>

        <!-- OUTROS -->
        <q-item clickable v-ripple to="/meu-link" active-class="menu-active" @click="fecharDrawer">
          <q-item-section avatar>
            <q-icon name="link" size="20px" />
          </q-item-section>
          <q-item-section class="text-weight-medium">
            Meu link de agendamento
          </q-item-section>
        </q-item>

        <!-- <q-item clickable v-ripple @click="avaliarApp">
          <q-item-section avatar>
            <q-icon name="star_rate" size="20px" />
          </q-item-section>
          <q-item-section class="text-weight-medium">
            Avaliar App
          </q-item-section>
        </q-item> -->

        <!-- LOGOUT -->
        <q-item clickable v-ripple @click="logout" class="text-grey-5">
          <q-item-section avatar>
            <q-icon name="logout" size="20px" />
          </q-item-section>
          <q-item-section>
            Sair
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <!-- CONTEÚDO -->
    <q-page-container>
      <q-page class="q-pa-md column">
        <router-view />

        <div class="q-mt-xl text-center text-caption text-grey-5">
          Versão JetBarber Beta
        </div>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
// import { useQuasar } from 'quasar'

const drawer = ref(false)
const router = useRouter()
const auth = useAuthStore()
// const $q = useQuasar()

// function avaliarApp() {
//   window.open('https://google.com', '_blank')
// }

function logout() {
  auth.logout()
  router.push('/login')
}

function fecharDrawer() {
  drawer.value = false
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
:root {
  --drawer-width: 300px;
}

.drawer-header {
  padding: 20px 16px;
  font-family: 'Inter', sans-serif;

}

.menu-active {
  background: rgba(255, 255, 255, 0.08);
  border-left: 3px solid #fff;
}

.drawer-bg {
  background-color: #121212;
  width: var(--drawer-width);
}

.lista-acoes-menu {
  font-family: 'Inter', sans-serif;
}
.title-menu{
  color:#aeafb1;
  text-align: center;
  font-size: 25px;
  
}
.subTitle-menu{
  text-align: center;
}

</style>
