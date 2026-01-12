<template>
  <v-app>
    <v-app-bar app color="white" elevation="1" height="90" class="px-4">
      <v-img src="/Logo.jpg" alt="Logo" max-height="70" max-width="320" contain />

      <v-spacer></v-spacer>

      <div class="d-none d-md-flex align-center">
        <!-- BOTÓN INICIO -->
        <v-btn to="/" variant="text" class="text-none font-weight-bold px-2 custom-blue">
            Inici
        </v-btn>
        <v-divider vertical inset class="mx-1" length="15"></v-divider>

        <!-- SI NO ESTÁ LOGIN: MOSTRAR LOG IN BUTTON -->
        <template v-if="!isLoggedIn">
            <v-btn to="/login" variant="text" class="text-none font-weight-bold px-2 custom-blue">
                <v-icon start size="small">mdi-login</v-icon>
                Log in
            </v-btn>
        </template>

        <!-- SI ESTÁ LOGIN: MOSTRAR PANEL Y LOGOUT -->
        <template v-else>
            <v-btn @click="goToDashboard" variant="text" class="text-none font-weight-bold px-2 custom-blue">
                <v-icon start size="small">mdi-view-dashboard</v-icon>
                El meu Espai
            </v-btn>
            <v-divider vertical inset class="mx-1" length="15"></v-divider>
            
            <v-btn @click="logout" variant="text" class="text-none font-weight-bold px-2 text-red">
                <v-icon start size="small">mdi-logout</v-icon>
                Sortir
            </v-btn>
        </template>
      </div>

      <v-btn icon="mdi-account-circle" to="/account" variant="text" class="ml-2 custom-blue"></v-btn>
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

const router = useRouter();
const route = useRoute();

const role = ref(null);

const checkSession = () => {
    role.value = localStorage.getItem('userRole');
};

onMounted(() => {
    checkSession();
});

// Re-check session on route change
watch(() => route.path, () => {
    checkSession();
});

const isLoggedIn = computed(() => !!role.value);

const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    role.value = null;
    router.push('/');
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
/* Definim el color personalitzat 3465a4 */
.custom-blue {
  color: #3465a4 !important;
}
</style>