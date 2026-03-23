import { useAuthStore } from 'stores/auth'
import { getActivePinia } from 'pinia'

const requireAuth = (to, from, next) => {
  const pinia = getActivePinia()
  const auth = useAuthStore(pinia)

  const token = auth.token || localStorage.getItem('token')

  if (!token) {
    next('/login')
  } else {
    next()
  }
}

const routes = [
  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    beforeEnter: (to, from, next) => {
      const pinia = getActivePinia()
      const auth = useAuthStore(pinia)

      if (auth.token) next('/dashboard')
      else next()
    }
  },

  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue')
  },

  {
    path: '/chat/:cod_agendamento',
    name: 'chat-publico',
    component: () => import('pages/ChatPage.vue')
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
        path: 'despesas',
        component: () => import('pages/DespesasPage.vue')
      },

      {
        path: 'financeiro',
        component: () => import('pages/FinanceiroPage.vue')
      },

      {
        path: 'clientes',
        component: () => import('pages/ClientesPage.vue')
      },
      {
        path: 'agendamentos/:id',
        name: 'agendamento-detalhe',
        component: () => import('pages/AgendamentoDetalhePage.vue'),
        props: true
      },

      {
        path: 'clientes/:id',
        name: 'clientes-detalhe',
        component: () => import('pages/DetalhesClientesPage.vue'),
        props: true
      },
      {
        path: 'config/barbearia',
        component: () => import('pages/config/BarbeariaPage.vue')
      },
      {
        path: 'config/servicos',
        name: 'servicos-page',
        component: () => import('pages/config/ServicosPage.vue')
      },
      {
        path: 'config/usuario',
        name: 'usuario-page',
        component: () => import('pages/config/UsuarioPage.vue')
      },
      {
        path: 'servicosCreate/:barbeariaId',
        name: 'servicos-create',
        component: () => import('pages/ServicosCreatePage.vue')
      },

      //links
      {
        path: 'meu-link-contratacao',
        name: 'link-contratacao-page',
        component: () => import('pages/links/linkContratacaoPage.vue')
      },
      // {
      //   path: 'servicosUpdate/:servicoId',
      //   name: 'servicos-update',
      //   component: () => import('pages/ServicosUpdatePage.vue'),
      //   props: true
      // },
      // {
      //   path: 'servicosDelete/:servicoId',
      //   name: 'servicos-delete',
      //   component: () => import('pages/ServicosDeletePage.vue'),
      //   props: true
      // }
    ]
  }
]

export default routes
