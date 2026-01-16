import { useAuthStore } from 'stores/auth'
import { getActivePinia } from 'pinia'

const requireAuth = (to, from, next) => {
  const pinia = getActivePinia()
  const auth = useAuthStore(pinia)

  if (!auth.token) next('/login')
  else next()
}

const routes = [
  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },

  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue')
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth, // 🔥 PROTEGE TUDO
    children: [
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue')
      },
      {
        path: 'agendamentos',
        component: () => import('pages/AgendamentosPage.vue')
      },
      {
        path: 'agendamentos/:id',
        name: 'agendamento-detalhe',
        component: () => import('pages/AgendamentoDetalhePage.vue'),
        props: true
      },
      {
        path: 'config/barbearia',
        component: () => import('pages/config/BarbeariaPage.vue')
      }
    ]
  }
]

export default routes
