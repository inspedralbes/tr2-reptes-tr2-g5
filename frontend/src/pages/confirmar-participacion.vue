<template>
  <v-container fluid class="fill-height confirmation-background pa-0">
    <v-row no-gutters class="fill-height justify-center align-center">
      <div class="background-overlay"></div>
      <v-col cols="12" sm="10" md="8" lg="5" class="z-index-content">
        <v-card v-if="!dadesAcces" class="elevation-12 rounded-xl pa-4">
          <v-card-text class="pa-8">
            <div class="text-center mb-8">
              <v-icon size="64" color="blue-darken-4" class="mb-4">mdi-school-outline</v-icon>
              <h2 class="text-h4 font-weight-bold text-blue-darken-4">
                Projecte ENGINY
              </h2>
              <p class="text-body-1 text-grey-darken-2 mt-2">
                Completeu les dades per activar la participació del centre
              </p>
            </div>
            <v-form ref="formActivacio" v-model="formValid" @submit.prevent="processarActivacio">
              <div class="text-subtitle-1 font-weight-bold text-blue-darken-4 mb-4">
                Dades del coordinator/a:
              </div>
              <v-row>
                <v-col cols="12" md="6" class="py-1">
                  <v-text-field
                    v-model="dadesForm.nomCoordinador"
                    label="Nom complet"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    density="comfortable"
                    bg-color="grey-lighten-5"
                    class="custom-input"
                    required
                    :rules="[v => !!v || 'El nom és obligatori']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="py-1">
                  <v-text-field
                    v-model="dadesForm.emailCoordinador"
                    label="Email de contacte"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    density="comfortable"
                    bg-color="grey-lighten-5"
                    type="email"
                    class="custom-input"
                    required
                    :rules="[v => !!v || 'L\'email és obligatori']"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-checkbox
                v-model="dadesForm.esPrimeraVegada"
                color="blue-darken-4"
                hide-details
                class="mt-4 mb-8 custom-checkbox"
              >
                <template v-slot:label>
                  <span class="text-body-1 font-weight-bold text-black" style="line-height: 1.4; opacity: 1;">
                    És la primera vegada que el centre participa en el projecte?
                  </span>
                </template>
              </v-checkbox>
              <v-btn 
                type="submit"
                color="blue-darken-4" 
                block 
                size="x-large" 
                height="56"
                class="text-none font-weight-bold elevation-4 rounded-lg white--text"
                :loading="loading"
                :disabled="!formValid"
              >
                Confirmar Participació
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
        <v-card v-else class="elevation-12 rounded-xl pa-4">
          <v-card-text class="pa-8 text-center">
            <v-icon size="72" color="success" class="mb-6">mdi-check-circle-outline</v-icon>
            <h2 class="text-h4 font-weight-bold text-blue-darken-4 mb-2">
              Activació Correcta
            </h2>
            <p class="text-body-1 text-grey-darken-1 mb-8">
              La vostra participació ha estat confirmada. Guardeu les credencials d'accés:
            </p>
            <v-alert 
              type="info" 
              variant="tonal" 
              color="blue-darken-4" 
              class="text-left mb-8 rounded-lg"
              icon="mdi-shield-key-outline"
            >
              <div class="d-flex flex-column gap-2">
                <div>
                  <span class="font-weight-bold">Usuari:</span> 
                  <code class="ml-2 text-body-1">{{ dadesAcces.email }}</code>
                </div>
                <div>
                  <span class="font-weight-bold">Contrasenya:</span> 
                  <code class="ml-2 text-h6 font-weight-black text-blue-darken-4">
                    {{ dadesAcces.password }}
                  </code>
                </div>
              </div>
            </v-alert>
            <v-btn 
              color="blue-darken-4" 
              block 
              size="x-large"
              height="56"
              class="text-none font-weight-bold rounded-lg elevation-4 white--text"
              to="/login"
            >
              Anar al Login
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
const formValid = ref(false);
const dadesAcces = ref(null);
const dadesForm = ref({
  nomCoordinador: '',
  emailCoordinador: '',
  esPrimeraVegada: false
});

const processarActivacio = async () => {
  if (!formValid.value) return;
  loading.value = true;
  
  const token = route.query.token;

  try {
    const res = await fetch('/api/users/confirmar-participacion', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token,
        nomCoordinador: dadesForm.value.nomCoordinador,
        emailCoordinador: dadesForm.value.emailCoordinador,
        esPrimeraVegada: dadesForm.value.esPrimeraVegada
      })
    });
    const data = await res.json();

    if (res.ok) {
  localStorage.setItem('coordinadorNom', dadesForm.value.nomCoordinador);
  localStorage.setItem('coordinadorEmail', dadesForm.value.emailCoordinador);
  localStorage.setItem('userName', data.nom_centre || dadesForm.value.nom_centre); 
  dadesAcces.value = { 
    email: data.email, 
    password: data.password 
  };
    } else {
      alert(data.error || "L'enllaç d'invitació no és vàlid o ha caducat.");
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
  background-image: url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070');
  background-size: cover;
  background-position: center;
  position: relative;
}
.background-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(13, 71, 161, 0.4);
  backdrop-filter: blur(6px);
}
.z-index-content {
  position: relative;
  z-index: 2;
}
:deep(.v-card) {
  background-color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}
:deep(.custom-input .v-field__input) {
  color: #154ea3 !important;
  font-weight: 600 !important;
}
:deep(.custom-checkbox .v-selection-control__input i) {
  color: #0d47a1 !important; /* Blau fosc per a la icona */
  opacity: 1 !important;
}
:deep(.custom-checkbox .v-selection-control__input .mdi-checkbox-blank-outline) {
  color: #0d47a1 !important;
  opacity: 0.9 !important;
}
.white--text {
  color: white !important;
}
code {
  background-color: transparent;
  padding: 0;
  font-family: 'Roboto Mono', monospace;
}
</style>