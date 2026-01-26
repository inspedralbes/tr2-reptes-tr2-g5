import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const loading = ref(false);
  const error = ref('');
  const user = ref(null);
  const isAuthenticated = computed(() => user.value !== null);
  const userName = computed(() => user.value?.nom || '');
  const userEmail = computed(() => user.value?.email || '');
  const userRole = computed(() => user.value?.rol || '');

const login = async (email, password) => {
    error.value = '';
    loading.value = true;

    if (!email || !password) {
      error.value = "Si us plau, omple tots els camps.";
      loading.value = false;
      return null;
    }
    const BASE_URL = window.location.protocol === 'file:' 
      ? 'http://localhost:8088/api' 
      : '/api';

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la petició');
      }
      const persistentFoto = localStorage.getItem(`userFoto_${data.usuari.email}`);
      const finalFoto = data.usuari.foto || persistentFoto || '';

      user.value = {
        ...data.usuari,
        foto: finalFoto
      };

      localStorage.setItem('userId', data.usuari.id || data.usuari._id);
      localStorage.setItem('userRole', data.usuari.rol);
      localStorage.setItem('userName', data.usuari.nom);
      localStorage.setItem('userEmail', data.usuari.email);
      localStorage.setItem('userFoto', finalFoto); 

      return data.usuari;

    } catch (err) {
      error.value = err.message || "Error de connexió";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    error.value = '';
    localStorage.removeItem('userId'); 
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFoto'); 
  };

  const initAuth = () => {
    const storedId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    const storedFoto = localStorage.getItem('userFoto');
    
    if (storedRole && storedName) {
      user.value = {
        id: storedId,
        rol: storedRole,
        nom: storedName,
        email: storedEmail,
        foto: storedFoto
      };
    }
  };

  initAuth();

  return {
    loading,
    error,
    user,
    isAuthenticated,
    userName,
    userEmail,
    userRole,
    login,
    logout
  };
});