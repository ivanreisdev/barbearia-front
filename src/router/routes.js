import { useAuthStore } from 'stores/auth'
import { getActivePinia } from 'pinia'

// Função para proteger rotas
const requireAuth = (to, from, next) => {
  const pinia = getActivePinia()
  const auth = useAuthStore(pinia)

  if (!auth.token) next('/login')
  else next()
}

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('pages/LoginPage.vue') },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue'), beforeEnter: requireAuth },
      { path: 'agendamentos', component: () => import('pages/AgendamentosPage.vue'), beforeEnter: requireAuth },
      { path: 'config/barbearia', component: () => import('pages/config/BarbeariaPage.vue'), beforeEnter: requireAuth }

    ]
  }
]

export default routes
