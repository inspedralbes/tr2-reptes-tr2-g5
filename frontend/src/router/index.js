import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes' 
import { useAuthStore } from '@/stores/auth'

// CAMBIA ESTA LÍNEA: Asegúrate de que el nombre coincida con el nuevo nombre del archivo
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
// --- AQUÍ AÑADIMOS LA PROTECCIÓN (GUARDIA GLOBAL) ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 1. Definir páginas públicas (Añadimos la ruta del correo)
  const publicPages = ['/login', '/register', '/', '/confirmar-participacion']; 
  
  // Si la ruta actual NO está en la lista de públicas, requiere auth
  const authRequired = !publicPages.includes(to.path);

  // 2. Si intenta entrar a zona privada sin estar logueado -> Login
  if (authRequired && !authStore.isAuthenticated) {
    return next('/login');
  }

  // 3. Si ya está logueado e intenta ir al Login -> Redirigir a su panel
  if (to.path === '/login' && authStore.isAuthenticated) {
    const role = authStore.user?.rol;
    if (role === 'admin') return next('/admin/indexadmin');
    if (role === 'centre') return next('/centre/indexcentre');
    if (role === 'professor') return next('/professor/iniciprofessor');
    // Si no tiene rol claro, dejar pasar o ir a home
  }

  // 4. (Opcional) Protección extra por roles basada en la URL
  // Si intenta entrar en /admin y no es admin
  if (to.path.startsWith('/admin') && authStore.user?.rol !== 'admin') {
     // return next('/'); // Descomenta para expulsar a usuarios sin permisos
  }

  next();
});
// ----------------------------------------------------

// Tu código existente para el workaround de Vite
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