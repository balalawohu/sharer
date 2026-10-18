import { createRouter, createWebHistory } from 'vue-router'
import Register from '../views/RegisterPage.vue'
import Login from '../views/LoginPage.vue'
import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录注册：独立全屏页面，不带导航布局
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: { title: '注册' }
    },
    // 主界面：使用带导航的布局
    {
      path: '/',
      component: MainLayout,
      redirect: '/plaza',
      children: [
        {
          path: 'plaza',
          name: 'Plaza',
          component: () => import('../views/HomePage.vue'),
          meta: { title: '资源广场' }
        },
        {
          path: 'mine',
          name: 'Mine',
          component: () => import('../views/MinePage.vue'),
          meta: { title: '我的资源' }
        },
        {
          path: 'search',
          name: 'Search',
          component: () => import('../views/SearchPage.vue'),
          meta: { title: '搜索结果' }
        },
        {
          path: 'resource/:id',
          name: 'ResourceDetail',
          component: () => import('../views/DetailPage.vue'),
          meta: { title: '资源详情' }
        },
        {
          path: 'rank',
          name: 'Rank',
          component: () => import('../views/RankPage.vue'),
          meta: { title: '排行榜' }
        },
        {
          path: 'help',
          name: 'Help',
          component: () => import('../views/HelpPage.vue'),
          meta: { title: '帮助中心' }
        },
        {
          path: 'notifications',
          name: 'Notifications',
          component: () => import('../views/NotificationsPage.vue'),
          meta: { title: '消息通知' }
        }
      ]
    }
  ],
})

// 全局后置守卫：设置页面标题
router.afterEach(to => {
  document.title = to.meta.title ? `${to.meta.title} - 趣分` : '趣分'
})

export default router
