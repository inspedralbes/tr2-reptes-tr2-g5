<template>
  <v-container fluid class="fill-height login-background pa-0">
    <v-row no-gutters class="fill-height justify-center align-center">
      <div class="background-overlay"></div>

      <v-col cols="12" sm="8" md="6" lg="4" class="z-index-form">
        <v-card class="elevation-12 rounded-xl pa-4">
          <v-card-text class="pa-8">
            <div class="text-center mb-8">
              <v-icon size="64" color="blue-darken-4" class="mb-4">mdi-account-circle</v-icon>
              <h2 class="text-h4 font-weight-bold text-blue-darken-4">
                Benvingut a ENGINY
              </h2>
              <p class="text-body-1 text-grey-darken-1 mt-2">
                Accedeix al teu espai de gestió
              </p>
            </div>

            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                label="Correu electrònic"
                type="email"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                prepend-inner-icon="mdi-email-outline"
                bg-color="grey-lighten-5"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Contrasenya"
                type="password"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                prepend-inner-icon="mdi-lock-outline"
                bg-color="grey-lighten-5"
              ></v-text-field>

              <v-alert v-if="error" type="error" variant="tonal" class="mb-6" density="compact">
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                block
                color="blue-darken-4"
                size="x-large"
                class="text-none font-weight-bold elevation-4 mt-4"
                :loading="loading"
                rounded="lg"
              >
                Iniciar Sessió
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter(); 
const loading = ref(false);
const error = ref('');
const email = ref('');
const password = ref('');

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  if (!email.value || !password.value) {
      error.value = "Si us plau, omple tots els camps.";
      loading.value = false;
      return;
  }

  try {
      // Recorda que fem servir rutes relatives pel PROXY de Vite
      const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value, password: password.value })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en la petició');

      localStorage.setItem('userRole', data.usuari.rol);
      localStorage.setItem('userName', data.usuari.nom);
      
      // Redirecció segons rol
      const routes = {
        admin: '/admin/indexadmin',
        centre: '/centre/indexcentre',
        professor: '/professor/iniciprofessor'
      };
      router.push(routes[data.usuari.rol] || '/');

  } catch (err) {
      error.value = err.message || "Error de connexió";
  } finally {
      loading.value = false;
  }
};
</script>

<style scoped>
.login-background {
  /* Pots canviar aquesta URL per una imatge de la teva carpeta assets */
  background-image: url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070');
  background-size: cover;
  background-position: center;
  position: relative;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(13, 71, 161, 0.4); /* Blau fosc semi-transparent */
  backdrop-filter: blur(4px); /* Efecte de desenfocament de fons */
}

.z-index-form {
  position: relative;
  z-index: 2;
}
:deep(.v-card) {
  /* CANVI: Fons blanc pur per a la targeta */
  background-color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>