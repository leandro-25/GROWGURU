import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { logger } from '@/utils/logger';

const routes: Array<RouteRecordRaw> = [
  // Rota temporária para forçar atualização
  {
    path: '/tabs/refresh',
    redirect: '/tabs/home',
  },
  // Rota inicial - Tela de Splash
  {
    path: '/',
    component: () => import('@/views/SplashScreen.vue'),
  },
  // Rota para a tela de login após o splash
  {
    path: '/home',
    redirect: '/tabs/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('@/views/SignUp.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true },
  },

  // Rota de transações fora do layout de tabs
  {
    path: '/transaction',
    name: 'TransactionPage',
    component: () => import('@/views/TransactionPage.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/tabs/',
    component: () => import('@/components/TabsLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/tabs/home',
      },
      {
        path: 'home',
        name: 'HomePage',
        component: () => import('@/views/HomePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'estrategias',
        name: 'EstrategiasView',
        component: () => import('@/views/EstrategiasView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'carteira',
        name: 'CarteiraView',
        component: () => import('@/views/CarteiraView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  // Rotas fora do layout de tabs
  {
    path: '/estrategias/:id/ativos',
    name: 'AtivosEstrategia',
    component: () => import('@/views/AtivosEstrategiaView.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
  },
  // Rota para reset de senha com token
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    props: route => ({
      token: route.query.token || route.params.token || '',
    }),
  },
  // Rota alternativa para reset de senha com token como parâmetro de rota
  {
    path: '/reset-password/:token',
    name: 'ResetPasswordWithToken',
    component: () => import('@/views/ResetPassword.vue'),
    props: route => ({
      token: route.params.token || route.query.token || '',
    }),
  },

  // Redirecionamentos para compatibilidade com rotas antigas
  { path: '/home', redirect: '/tabs/home' },
  { path: '/estrategias', redirect: '/tabs/estrategias' },
  { path: '/carteira', redirect: '/tabs/carteira' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const authRoutes = ['/login', '/signup'];

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (authRoutes.includes(to.path) && token) {
    next('/tabs/home');
  } else {
    next();
  }
});

router.onError(error => {
  logger.error('Navigation error:', error);
  // Se houver erro, tente redirecionar para a home
  if (localStorage.getItem('token')) {
    router.push('/tabs/home');
  } else {
    router.push('/login');
  }
});

export default router;
