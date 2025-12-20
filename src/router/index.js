import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      redirect: '/stats',
      component: () => import('../components/Sidebar.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'stats',
          name: 'stats',
          component: () => import('../views/StatsView.vue')
        },
        {
          path: 'packages',
          name: 'packages',
          component: () => import('../views/PackagesView.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router

