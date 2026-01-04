import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../supabase'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHashHistory('/admin/'),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true }
    },
    {
      path: '/',
      redirect: '/dashboard',
      component: () => import('../components/Sidebar.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: '/survey/employee/:id',
          name: 'employee-survey',
          component: () => import('../views/EmployeeSurveyView.vue')
        },
        {
          path: 'stats',
          name: 'stats',
          component: () => import('../views/StatsView.vue')
        },
        {
          path: 'packages',
          name: 'packages',
          component: () => import('../views/PackagesView.vue')
        },
        {
          path: 'agencies',
          name: 'agencies',
          component: () => import('../views/AgenciesView.vue')
        },
        {
          path: 'questions',
          name: 'questions',
          component: () => import('../views/QuestionsView.vue')
        },
        {
          path: 'survey-stats',
          name: 'survey-stats',
          component: () => import('../views/SurveyStatsView.vue')
        },
        {
          path: 'responses',
          name: 'responses',
          component: () => import('../views/ResponsesView.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    next('/login')
  } else if (to.meta.guest && session) {
    next('/')
  } else {
    next()
  }
})

export default router
