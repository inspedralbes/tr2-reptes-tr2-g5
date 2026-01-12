<template>
  <v-container fluid class="fill-height bg-grey-lighten-4 pa-0">
    <v-row no-gutters class="fill-height justify-center align-center">
      <v-col cols="12" sm="8" md="6" lg="4">
        
        <v-card class="elevation-4 rounded-lg">
          <v-card-text class="pa-8">
            
            <div class="text-center mb-6">
              <h2 class="text-h4 font-weight-bold text-blue-darken-4">
                Iniciar Sessió
              </h2>
              <p class="text-body-2 text-grey-darken-1 mt-2">
                Introdueix les teves credencials per accedir
              </p>
            </div>

            <v-form @submit.prevent="handleSubmit">
              
              <v-text-field
                v-model="email"
                label="Correu electrònic"
                placeholder="usuari@exemple.cat"
                type="email"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                prepend-inner-icon="mdi-email-outline"
                bg-color="white"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Contrasenya"
                type="password"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                prepend-inner-icon="mdi-lock-outline"
                bg-color="white"
              ></v-text-field>

              <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                block
                color="blue-darken-4"
                size="large"
                class="text-none font-weight-bold mb-4"
                :loading="loading"
              >
                Entrar
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

// Estados
const loading = ref(false);
const error = ref('');


// Datos del formulario
const email = ref('');
const password = ref('');

const handleSubmit = async () => {
  error.value = '';

  loading.value = true;

  // Validación simple
  if (!email.value || !password.value) {
      error.value = "Si us plau, omple tots els camps.";
      loading.value = false;
      return;
  }

  try {
      // Login
      const url = '/api/auth/login';
      
      const payload = { 
          email: email.value, 
          password: password.value 
      };
      
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error || 'Error en la petició');
      }

      // Login correcte
      localStorage.setItem('userRole', data.usuari.rol);
      localStorage.setItem('userId', data.usuari.id);
      
      if (data.usuari.rol === 'admin') {
          router.push('/admin/indexadmin'); 
      } else if (data.usuari.rol === 'centre') {
          router.push('/centre/indexcentre');
      } else if (data.usuari.rol === 'professor') {
          router.push('/professor/iniciprofessor');
      } else {
          router.push('/');
      }

  } catch (err) {
      console.error(err);
      error.value = err.message || "Error de connexió amb el servidor";
  } finally {
      loading.value = false;
  }
};
</script>