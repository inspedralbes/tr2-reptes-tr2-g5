<template>
  <v-container fluid class="fill-height bg-grey-lighten-4 pa-0">
    <v-row no-gutters class="fill-height justify-center align-center">
      <v-col cols="12" sm="8" md="6" lg="4">
        
        <v-card class="elevation-4 rounded-lg">
          <v-card-text class="pa-8">
            
            <div class="text-center mb-6">
              <h2 class="text-h4 font-weight-bold text-blue-darken-4">
                {{ isRegister ? 'Crear Nou Usuari' : 'Iniciar Sessió' }}
              </h2>
              <p class="text-body-2 text-grey-darken-1 mt-2">
                {{ isRegister ? 'Omple les dades per registrar-te' : 'Introdueix les teves credencials' }}
              </p>
            </div>

            <v-form @submit.prevent="handleSubmit">
              
              <div v-if="isRegister">
                <v-text-field
                  v-model="nom"
                  label="Nom complet"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                  prepend-inner-icon="mdi-account"
                  bg-color="white"
                ></v-text-field>

                <v-select
                  v-model="rol"
                  :items="rolesDisponibles"
                  label="Rol d'usuari"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                  prepend-inner-icon="mdi-badge-account"
                  bg-color="white"
                ></v-select>
              </div>

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

              <v-alert v-if="successMsg" type="success" variant="tonal" class="mb-4" density="compact">
                {{ successMsg }}
              </v-alert>

              <v-btn
                type="submit"
                block
                color="blue-darken-4"
                size="large"
                class="text-none font-weight-bold mb-4"
                :loading="loading"
              >
                {{ isRegister ? 'Registrar-se' : 'Entrar' }}
              </v-btn>

              <div class="text-center">
                <span class="text-caption text-grey-darken-1">
                  {{ isRegister ? 'Ja tens compte?' : 'No tens compte?' }}
                </span>
                <a 
                  class="text-caption font-weight-bold text-blue-darken-4 ml-1 cursor-pointer"
                  style="cursor: pointer; text-decoration: underline;"
                  @click="toggleMode"
                >
                  {{ isRegister ? 'Inicia sessió' : 'Registra\'t ara' }}
                </a>
              </div>

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
const isRegister = ref(false); // Empieza en Login
const loading = ref(false);
const error = ref('');
const successMsg = ref('');

// Datos del formulario
const nom = ref('');
const email = ref('');
const password = ref('');
const rol = ref('centre'); // Valor por defecto
const rolesDisponibles = ['admin', 'centre', 'professor'];

// Cambiar entre Login y Registro
const toggleMode = () => {
  isRegister.value = !isRegister.value;
  error.value = '';
  successMsg.value = '';
};

const handleSubmit = async () => {
  error.value = '';
  successMsg.value = '';
  loading.value = true;

  // Validación simple
  if (!email.value || !password.value || (isRegister.value && !nom.value)) {
      error.value = "Si us plau, omple tots els camps.";
      loading.value = false;
      return;
  }

  try {
      // Determinar la URL (Login o Register)
      const endpoint = isRegister.value ? '/api/auth/register' : '/api/auth/login';
      const url = `http://localhost:3000${endpoint}`;
      
      const payload = { 
          email: email.value, 
          password: password.value 
      };
      
      // Si es registro, añadimos nombre y rol
      if (isRegister.value) {
          payload.nom = nom.value;
          payload.rol = rol.value;
      }

      // Hacemos la petición
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      // Leemos la respuesta
      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error || 'Error en la petició');
      }

      // LÓGICA DE ÉXITO
      if (isRegister.value) {
          // Si nos acabamos de registrar
          successMsg.value = 'Usuari creat correctament! Redirigint al login...';
          setTimeout(() => {
              toggleMode(); // Cambiamos a la vista de login
              password.value = ''; // Limpiamos password
          }, 1500);
      } else {
          // Si hemos hecho login
          localStorage.setItem('userRole', data.usuari.rol);
          localStorage.setItem('userId', data.usuari.id);
          
          successMsg.value = 'Login correcte. Accedint...';
          
          // Redirección según ROL
          setTimeout(() => {
              if (data.usuari.rol === 'admin') {
                  router.push('/admin/indexadmin'); 
              } else if (data.usuari.rol === 'centre') {
                  router.push('/centre/indexcentre');
              } else if (data.usuari.rol === 'professor') {
                  router.push('/professor/iniciprofessor');
              } else {
                  router.push('/');
              }
          }, 1000);
      }

  } catch (err) {
      console.error(err);
      error.value = err.message || "Error de connexió amb el servidor";
  } finally {
      loading.value = false;
  }
};
</script>