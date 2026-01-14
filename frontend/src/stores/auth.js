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

      // Guardar toda la información del usuario en el store
      user.value = data.usuari;

      // También guardar en localStorage
      localStorage.setItem('userRole', data.usuari.rol);
      localStorage.setItem('userName', data.usuari.nom);
      localStorage.setItem('userEmail', data.usuari.email);

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
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  };

  // Inicializar desde localStorage al cargar
  const initAuth = () => {
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedRole && storedName) {
      user.value = {
        rol: storedRole,
        nom: storedName,
        email: storedEmail
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