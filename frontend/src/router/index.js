import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes' 
import { useAuthStore } from '@/stores/auth'
import ConfirmarPage from '@/pages/confirmar-participacion.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...routes,
    {
      path: '/confirmar-participacion',
      name: 'ConfirmarParticipacion',
      component: ConfirmarPage
    }
  ],
})
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const publicPages = ['/login', '/register', '/', '/confirmar-participacion']; 
  const authRequired = !publicPages.includes(to.path);
  if (authRequired && !authStore.isAuthenticated) {
    return next('/login');
  }
  if (to.path === '/login' && authStore.isAuthenticated) {
    const role = authStore.user?.rol;
    if (role === 'admin') return next('/admin/indexadmin');
    if (role === 'centre') return next('/centre/indexcentre');
    if (role === 'professor') return next('/professor/iniciprofessor');
  }
  if (to.path.startsWith('/admin') && authStore.user?.rol !== 'admin') {
  }
  next();
});
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})
router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})
export default router