<template>
  <v-container fluid class="fill-height confirmation-background pa-0">
    <v-row no-gutters class="fill-height justify-center align-center">
      <div class="background-overlay"></div>

      <v-col cols="12" sm="8" md="6" lg="4" class="z-index-content">
        <v-card v-if="!dadesAcces" class="elevation-12 rounded-xl pa-4">
          <v-card-text class="pa-8 text-center">
            <v-icon size="72" color="blue-darken-4" class="mb-6">mdi-school-outline</v-icon>
            
            <h1 class="text-h4 font-weight-bold text-blue-darken-4 mb-4">
              Projecte ENGINY
            </h1>
            
            <p class="text-subtitle-1 text-grey-darken-2 mb-8">
              Benvinguts al procés d'activació. Voleu confirmar la participació del vostre centre en el programa de tallers?
            </p>
            
            <v-btn 
              color="blue-darken-4" 
              block 
              size="x-large" 
              class="text-none font-weight-bold elevation-4 rounded-lg"
              :loading="loading" 
              @click="processarActivacio"
            >
              SÍ, VOLEM PARTICIPAR
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card v-else class="elevation-12 rounded-xl pa-4 border-success">
          <v-card-text class="pa-8 text-center">
            <v-icon size="72" color="success" class="mb-6">mdi-check-circle</v-icon>
            
            <h1 class="text-h4 font-weight-bold text-blue-darken-4 mb-4">
              Activació Correcta
            </h1>
            
            <p class="text-body-1 text-grey-darken-2 mb-6">
              La vostra participació ha estat confirmada. Guardeu aquestes credencials per accedir al vostre espai de gestió:
            </p>
            
            <v-alert type="info" variant="tonal" color="blue-darken-4" class="text-left mb-8 rounded-lg">
              <div class="mb-2">
                <v-icon size="small" class="mr-2">mdi-email-outline</v-icon>
                <strong>Usuari:</strong> {{ dadesAcces.email }}
              </div>
              <div>
                <v-icon size="small" class="mr-2">mdi-lock-open-variant-outline</v-icon>
                <strong>Contrasenya:</strong> <span class="text-h6 font-weight-bold ml-1">{{ dadesAcces.password }}</span>
              </div>
            </v-alert>

            <v-btn 
              color="blue-darken-4" 
              block 
              variant="flat" 
              size="large"
              class="text-none font-weight-bold rounded-lg"
              to="/login"
            >
              ANAR AL LOGIN
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(false);
const dadesAcces = ref(null);

const processarActivacio = async () => {
  loading.value = true;
  const token = route.query.token;

  try {
    const res = await fetch('/api/users/confirmar-participacion', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    if (res.ok) {
      dadesAcces.value = {
        email: data.email,
        password: data.password
      };
    } else {
      alert(data.error || "El token ha caducat o ja s'ha utilitzat.");
    }
  } catch (error) {
    alert("Error de connexió amb el servidor.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.confirmation-background {
  /* Usamos la misma imagen que tu login para coherencia */
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
  background: rgba(13, 71, 161, 0.4); /* Azul Generalitat */
  backdrop-filter: blur(4px);
}

.z-index-content {
  position: relative;
  z-index: 2;
}

:deep(.v-card) {
  background-color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Efecto suave para la contraseña */
.text-h6 {
  letter-spacing: 1px;
}
</style>