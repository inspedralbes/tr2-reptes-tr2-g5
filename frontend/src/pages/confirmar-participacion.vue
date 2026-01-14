<template>
  <v-container class="fill-height justify-center bg-grey-lighten-4">
    <v-card v-if="!dadesAcces" width="450" class="pa-10 text-center" elevation="4">
      <v-icon size="80" color="black" class="mb-4">mdi-school-outline</v-icon>
      <h1 class="text-h4 font-weight-bold mb-4">Projecte ENGINY</h1>
      <p class="text-subtitle-1 mb-8">Voleu confirmar la participació del vostre centre en el programa de tallers?</p>
      
      <v-btn color="black" block size="x-large" :loading="loading" @click="processarActivacio">
        SÍ, VOLEM PARTICIPAR
      </v-btn>
    </v-card>

    <v-card v-else width="450" class="pa-10 text-center" elevation="4" border="success">
      <v-icon size="80" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
      <h1 class="text-h4 font-weight-bold mb-4">Benvinguts!</h1>
      <p class="mb-4">La vostra participació ha estat confirmada. Guardeu aquestes dades per entrar:</p>
      
      <v-alert type="info" variant="tonal" class="text-left mb-6">
        <div><strong>Usuari:</strong> {{ dadesAcces.email }}</div>
        <div><strong>Contrasenya:</strong> <span class="text-h6 font-weight-bold">{{ dadesAcces.password }}</span></div>
      </v-alert>

      <v-btn color="black" block variant="outlined" to="/login">
        ANAR AL LOGIN
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(false);
const dadesAcces = ref(null); // Aquí guardarem la resposta del servidor

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
      // AQUÍ EL CAMBIO: Asignamos el objeto 'data' directamente
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