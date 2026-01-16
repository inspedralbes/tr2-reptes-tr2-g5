// stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const loading = ref(false);
  const error = ref('');
  const user = ref(null); // Aquí guardaremos los datos del usuario

  // Computed properties (como getters)
  const isAuthenticated = computed(() => user.value !== null);
  const userName = computed(() => user.value?.nom || '');
  const userEmail = computed(() => user.value?.email || '');
  const userRole = computed(() => user.value?.rol || '');

  // Función de login
const login = async (email, password) => {
    error.value = '';
    loading.value = true;

    if (!email || !password) {
      error.value = "Si us plau, omple tots els camps.";
      loading.value = false;
      return null;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la petició');
      }

      // 1. Intentar recuperar la foto persistente del localStorage (Truco local)
      const persistentFoto = localStorage.getItem(`userFoto_${data.usuari.email}`);
      
      // 2. Prioridad de la foto: 
      // Primero la del servidor, si no hay, la persistente, si no hay, vacía.
      const finalFoto = data.usuari.foto || persistentFoto || '';

      // 3. Guardar en el store de Pinia (Aseguramos que el objeto tenga la foto)
      user.value = {
        ...data.usuari,
        foto: finalFoto
      };

      // 4. Guardar en localStorage para que persista la sesión
      localStorage.setItem('userId', data.usuari.id || data.usuari._id);
      localStorage.setItem('userRole', data.usuari.rol);
      localStorage.setItem('userName', data.usuari.nom);
      localStorage.setItem('userEmail', data.usuari.email);
      localStorage.setItem('userFoto', finalFoto); // Guardamos la foto final (recuperada o nueva)

      return data.usuari;

    } catch (err) {
      error.value = err.message || "Error de connexió";
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Función de logout
  const logout = () => {
    user.value = null;
    error.value = '';
    localStorage.removeItem('userId'); // <--- AÑADIR ESTO
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFoto'); // AÑADIR ESTO
  };

  // Inicializar desde localStorage al cargar
  const initAuth = () => {
    const storedId = localStorage.getItem('userId'); // <--- AÑADIR ESTO
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    const storedFoto = localStorage.getItem('userFoto'); // <--- 1. AÑADIDO AQUÍ
    
    if (storedRole && storedName) {
      user.value = {
        id: storedId, // <--- AÑADIR ESTO
        rol: storedRole,
        nom: storedName,
        email: storedEmail,
        foto: storedFoto // <--- 2. AÑADIDO AQUÍ
      };
    }
  };

  // Inicializar al crear el store
  initAuth();

  return {
    // Estado
    loading,
    error,
    user,
    // Computed properties
    isAuthenticated,
    userName,
    userEmail,
    userRole,
    // Acciones
    login,
    logout
  };
});