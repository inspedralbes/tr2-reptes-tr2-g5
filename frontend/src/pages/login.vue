<template>
  <v-container fluid class="fill-height bg-white pa-0">
    <v-row justify="center" align="center" class="fill-height ma-0">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        
        <div class="text-center mb-8">
          <h1 class="text-h4 font-weight-bold text-black mb-2">
            Benvingut/da
          </h1>
          <p class="text-body-1 text-grey-darken-1">
            Àrea privada de gestió
          </p>
        </div>

        <div class="login-form-wrapper pa-4 pa-sm-8">
          
          <v-form @submit.prevent="handleSubmit">
            
            <div class="text-subtitle-2 text-black font-weight-bold mb-1">
              Usuari
            </div>
            <v-text-field
              v-model="email"
              placeholder="Introdueix el teu usuari"
              variant="outlined"
              color="#0d47a1"
              bg-color="grey-lighten-5"
              density="comfortable"
              hide-details="auto"
              class="mb-5 input-corporativo"
              rounded="0"
            ></v-text-field>

            <div class="text-subtitle-2 text-black font-weight-bold mb-1">
              Contrasenya
            </div>
            <v-text-field
              v-model="password"
              type="password"
              placeholder="••••••••"
              variant="outlined"
              color="#0d47a1"
              bg-color="grey-lighten-5"
              density="comfortable"
              hide-details="auto"
              class="mb-6 input-corporativo"
              rounded="0"
            ></v-text-field>

            <div class="d-flex align-center justify-space-between mb-6 flex-wrap">
              <v-checkbox
                v-model="rememberMe"
                label="Recorda'm"
                color="#0d47a1"
                density="compact"
                hide-details
                class="mr-2"
              ></v-checkbox>
              
              <a href="#" class="text-caption text-decoration-none text-grey-darken-1 hover-link">
                Has oblidat la contrasenya?
              </a>
            </div>

            <v-btn
              block
              color="#0d47a1"
              size="large"
              class="text-white font-weight-bold text-capitalize"
              height="50"
              flat
              rounded="0"
              type="submit"
              :loading="loading"
            >
              Iniciar sessió
            </v-btn>

            <div class="mt-6 text-center">
              <span class="text-body-2 text-grey-darken-1">
                No tens accés? 
                <a 
                  @click="toggleMode" 
                  class="font-weight-bold cursor-pointer text-decoration-none"
                  style="color: #0d47a1 !important;"
                >
                  Sol·licita l'alta
                </a>
              </span>
            </div>

          </v-form>

          <v-slide-y-transition>
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mt-4 rounded-0"
              density="compact"
              border="start"
              border-color="error"
            >
              {{ error }}
            </v-alert>
          </v-slide-y-transition>

          <v-slide-y-transition>
            <v-alert
              v-if="successMsg"
              type="success"
              variant="tonal"
              class="mt-4 rounded-0"
              density="compact"
              border="start"
              border-color="success"
            >
              {{ successMsg }}
            </v-alert>
          </v-slide-y-transition>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const error = ref('');
const successMsg = ref('');
const loading = ref(false);

const toggleMode = () => {
    alert("Contacta amb l'administrador del centre per sol·licitar l'accés.");
}

const handleSubmit = () => {
  error.value = '';
  successMsg.value = '';
  loading.value = true;

  setTimeout(() => {
    loading.value = false;
    
    if (!email.value || !password.value) {
        error.value = "Si us plau, omple tots els camps.";
        return;
    }
    successMsg.value = 'Accedint al sistema...';
  }, 1000);
};
</script>

<style scoped>
/* Fondo blanco puro */
.bg-white {
  background-color: #ffffff !important;
}

.login-form-wrapper {
  background-color: #ffffff;
  /* Borde muy suave para delimitar ligeramente */
  border: 1px solid #e0e0e0; 
  max-width: 100%;
}

/* Estilos de los inputs */
.input-corporativo :deep(.v-field__outline__start),
.input-corporativo :deep(.v-field__outline__end),
.input-corporativo :deep(.v-field__outline__notch) {
  border-color: #cccccc !important;
}

/* AL HACER FOCO: Se usa el color #0d47a1
   Esto asegura que lo único que destaque sea el color corporativo.
*/
.input-corporativo :deep(.v-field--focused .v-field__outline__start),
.input-corporativo :deep(.v-field--focused .v-field__outline__end),
.input-corporativo :deep(.v-field--focused .v-field__outline__notch) {
  border-color: #0d47a1 !important;
  border-width: 2px;
}

/* Enlaces con efecto hover al color corporativo */
.hover-link:hover {
  color: #0d47a1 !important;
  text-decoration: underline !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>