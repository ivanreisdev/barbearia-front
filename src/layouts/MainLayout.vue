<template>
  <q-layout view="hHh LpR fFf" :class="{ 'drawer-open': drawer }">

    <!-- DRAWER -->
    <q-drawer v-model="drawer" side="left" show-if-above class="drawer-bg text-white">
      <div class="drawer-header">
        <img src="/imgs/logoMenu2.png" alt="JetBarber" class="logo-menu" />
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

            <q-item v-if="isAdm" clickable v-ripple to="/config/barbearia" active-class="menu-active" @click="fecharDrawer">
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
// import { useQuasar } from 'quasar'

const drawer = ref(false)
const router = useRouter()
const auth = useAuthStore()
console.log('auth.user');
console.log(auth.user.tipo_usuario);
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


const isAdm = computed(() => {
  return auth.user?.tipo_usuario =='admin'
})


onMounted(() => {
  window.addEventListener('toggle-drawer', handleToggleDrawer)
})



onBeforeUnmount(() => {
  window.removeEventListener('toggle-drawer', handleToggleDrawer)
})
</script>

<style>
:root {
  --drawer-width: 302px;
}

.drawer-header {
  padding: 24px 18px 18px;
  font-family: 'Inter', sans-serif;
  background: transparent;
  /* border-bottom: 1px solid rgba(255, 255, 255, 0.14); */
}

.menu-active {
  background: transparent !important;
  border-left: 3px solid #d9e2f2;
  color: #f8fbff;
  box-shadow: inset 0 0 0 1px rgba(217, 226, 242, 0.12);
}

.drawer-bg {
  background: rgba(10, 14, 22, 0.18);
  width: var(--drawer-width);
  color: #eaf0fa;
  border-right: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
}

.drawer-bg .q-drawer__content {
  overflow-x: hidden;
}

.lista-acoes-menu {
  font-family: 'Inter', sans-serif;
  padding-top: 8px;
}

.title-menu {
  color: #edf2fc;
  text-align: center;
  font-size: 24px;
  letter-spacing: 0.4px;
}

.logo-menu {
  display: block;
  width: min(184px, 74%);
  height: auto;
  margin: 0 auto;
  object-fit: contain;
}

.subTitle-menu {
  text-align: center;
  color: #a5b0c2 !important;
  letter-spacing: 0.3px;
}

.drawer-bg .q-item {
  border-radius: 12px;
  margin: 4px 8px;
  min-height: 46px;
  padding-left: 8px;
  padding-right: 8px;
  color: #dce4f2;
  transition: background-color 0.2s ease, transform 0.2s ease;
  background: transparent;
}

.drawer-bg .q-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

.drawer-bg .q-item .q-icon {
  color: #c1cbdd;
}

.drawer-bg .q-item__section--avatar {
  min-width: 36px;
}

.drawer-bg .q-item__label--header {
  color: #7f8a9e !important;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 16px 14px 8px;
}

.drawer-bg .q-expansion-item {
  margin: 2px 8px 6px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
}

.drawer-bg .q-expansion-item__container > .q-item {
  margin: 0;
  border-radius: 0;
}

.drawer-bg .q-expansion-item .q-list {
  background: rgba(255, 255, 255, 0.03) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.drawer-bg .q-expansion-item .q-item {
  margin: 2px 8px;
}

.drawer-bg .q-expansion-item .q-item .q-icon {
  color: #b2bdd0;
}

.drawer-bg .text-grey-5,
.drawer-bg .text-grey-4,
.drawer-bg .text-grey-6 {
  color: inherit !important;
}

@media (min-width: 601px) {
  .drawer-bg .q-drawer__content,
  .drawer-bg .scroll,
  .drawer-bg .q-scrollarea__container {
    scrollbar-width: thin;
    scrollbar-color: rgba(178, 189, 208, 0.45) transparent;
  }

  .drawer-bg .q-drawer__content::-webkit-scrollbar,
  .drawer-bg .scroll::-webkit-scrollbar,
  .drawer-bg .q-scrollarea__container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .drawer-bg .q-drawer__content::-webkit-scrollbar-track,
  .drawer-bg .scroll::-webkit-scrollbar-track,
  .drawer-bg .q-scrollarea__container::-webkit-scrollbar-track {
    background: transparent;
  }

  .drawer-bg .q-drawer__content::-webkit-scrollbar-thumb,
  .drawer-bg .scroll::-webkit-scrollbar-thumb,
  .drawer-bg .q-scrollarea__container::-webkit-scrollbar-thumb {
    background: rgba(178, 189, 208, 0.35);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  .drawer-bg .q-drawer__content::-webkit-scrollbar-thumb:hover,
  .drawer-bg .scroll::-webkit-scrollbar-thumb:hover,
  .drawer-bg .q-scrollarea__container::-webkit-scrollbar-thumb:hover {
    background: rgba(198, 209, 228, 0.5);
    background-clip: content-box;
  }
}

@media (max-width: 1024px) {
  :root {
    --drawer-width: 286px;
  }
}

@media (max-width: 600px) {
  :root {
    --drawer-width: min(86vw, 320px);
  }

  .drawer-header {
    padding-top: 20px;
    padding-bottom: 14px;
  }

  .title-menu {
    font-size: 22px;
  }

  .drawer-bg .q-item {
    min-height: 44px;
  }
}

</style>
