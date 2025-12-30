import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true } // علامة لتمييز صفحة الزوار
    },
    {
      path: '/survey/:slug',
      name: 'survey',
      component: () => import('../views/SurveyView.vue'),
      meta: { guest: true } // الاستطلاع متاح للجميع بدون تسجيل
    },
    {
      path: '/',
      // التوجيه الافتراضي للداشبورد مباشرة
      redirect: '/dashboard', 
      component: () => import('../components/Sidebar.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        // ... بقية المسارات كما هي ...
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
        }
      ]
    }
  ]
})

// الحارس (Navigation Guard) المصحح
router.beforeEach(async (to, from, next) => {
  // جلب الجلسة الحالية من السيرفر أو الكاش
  const { data: { session } } = await supabase.auth.getSession()

  // 1. إذا الصفحة تتطلب دخول والمستخدم غير مسجل -> وديه للوجن
  if (to.meta.requiresAuth && !session) {
    next('/login')
  } 
  // 2. إذا المستخدم مسجل ويحاول يفتح صفحة الوجن -> رجعه للداشبورد (UX أفضل)
  else if (to.meta.guest && session) {
    next('/')
  }
  // 3. كمل عادي
  else {
    next()
  }
})

export default router