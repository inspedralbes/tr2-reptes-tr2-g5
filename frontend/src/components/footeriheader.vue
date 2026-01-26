<template>
  <v-app>
    <v-app-bar app color="white" elevation="1" height="90" class="px-4">
      <v-img src="/Logo.jpg" alt="Logo" max-height="70" max-width="320" contain />
      <v-spacer></v-spacer>
      <div class="d-none d-md-flex align-center">
        <v-btn to="/" variant="text" class="text-none font-weight-bold px-2 custom-blue">
            Inici
        </v-btn>
        <v-divider vertical inset class="mx-1" length="15"></v-divider>
        <template v-if="!isLoggedIn">
            <v-btn to="/login" variant="text" class="text-none font-weight-bold px-2 custom-blue">
                <v-icon start size="small">mdi-login</v-icon>
                Inicieu sessió
            </v-btn>
        </template>
        <template v-else>
            <v-divider vertical inset class="mx-1" length="15"></v-divider>
            <v-btn @click="logout" variant="text" class="text-none font-weight-bold px-2 text-red">
                <v-icon start size="small">mdi-logout</v-icon>
                Sortir
            </v-btn>
        </template>
      </div>
      <v-btn icon @click="handleProfileClick" class="ml-2">
        <v-avatar size="40" color="grey-lighten-3">
          <v-img v-if="authStore.user?.foto" :src="authStore.user.foto" cover></v-img>
          <v-icon v-else color="#3465a4">mdi-account-circle</v-icon>
        </v-avatar>
      </v-btn>      
      <v-app-bar-nav-icon class="d-md-none" />
    </v-app-bar>
    <v-main class="bg-grey-lighten-5">
      <slot />
    </v-main>
    <v-footer app color="white" class="pa-0 d-flex flex-column">
      <v-divider class="w-100"></v-divider>
      <div class="py-2 text-caption text-grey-darken-1 text-center w-100">
        &copy; {{ new Date().getFullYear() }} Consorci d'Educació de Barcelona.
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const role = ref(null);
const checkSession = () => {
    role.value = localStorage.getItem('userRole');
};

onMounted(() => {
    checkSession();
});

watch(() => route.path, () => {
    checkSession();
});

const isLoggedIn = computed(() => !!role.value);

const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFoto');
    authStore.logout();
    
    role.value = null;
    router.push('/');
};

const handleProfileClick = () => {
    const userId = localStorage.getItem('userId');
    
    if (isLoggedIn.value && userId) {
        router.push('/account');
    } else {
        router.push('/login');
    }
};

const goToDashboard = () => {
    if (role.value === 'admin') router.push('/admin/indexadmin');
    else if (role.value === 'centre') router.push('/centre/indexcentre');
    else if (role.value === 'professor') router.push('/professor/iniciprofessor');
};

const navLinks = [
  { title: 'Inici', to: '/' },
]

const loginOptions = [
  { text: 'Administració', icon: 'mdi-school', to: '/login' },
  { text: 'Professor', icon: 'mdi-briefcase-variant', to: '/login' },
  { text: 'Centre', icon: 'mdi-shield-account', to: '/login' },
]
</script>

<style scoped>
.custom-blue {
  color: #3465a4 !important;
}
</style>