<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = '/api'
const router = useRouter()
const loading = ref(false)
const snackbar = ref({ show: false, text: '', color: '' })
const dadesInvitacio = ref([{ nom: '', email: '' }])
const invitacioError = ref('')
const fitxerCSV = ref(null)
const masivaLoading = ref(false)
const mostrarNotificacio = (text, color = 'black') => {
  snackbar.value = { show: true, text, color }
}

const afegirFila = () => dadesInvitacio.value.push({ nom: '', email: '' })
const eliminarFila = (index) => {
  if (dadesInvitacio.value.length > 1) dadesInvitacio.value.splice(index, 1)
}

const enviarInvitacions = async () => {
  const valid = dadesInvitacio.value.every(c => c.nom.trim() && c.email.trim())
  if (!valid) {
    invitacioError.value = "Tots els camps han d'estar emplenats."
    return
  }

  loading.value = true
  invitacioError.value = ''
  try {
    const res = await fetch(`${API_URL}/users/invite-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centres: dadesInvitacio.value })
    })

    if (res.ok) {
      mostrarNotificacio('Invitacions enviades correctament', 'success')
      dadesInvitacio.value = [{ nom: '', email: '' }]
    } else {
      invitacioError.value = "Error en enviar les invitacions."
    }
  } catch (e) {
    invitacioError.value = "Error de connexió."
  } finally {
    loading.value = false
  }
}

const processarCSV = async () => {
  if (!fitxerCSV.value) return
  masivaLoading.value = true
  const formData = new FormData()
  formData.append('file', fitxerCSV.value[0])

  try {
    const res = await fetch(`${API_URL}/users/import-csv`, { method: 'POST', body: formData })
    if (res.ok) {
      const result = await res.json()
      mostrarNotificacio(`S'han importat ${result.count} centres amb èxit`, 'success')
      fitxerCSV.value = null
    } else {
      mostrarNotificacio('Error en el format del fitxer CSV', 'error')
    }
  } catch (e) {
    mostrarNotificacio('Error de connexió', 'error')
  } finally {
    masivaLoading.value = false
  }
}
</script>

<template>
  <v-container class="pa-10">
    <div class="d-flex align-center mb-8">
      <v-btn 
        icon="mdi-arrow-left" 
        variant="text" 
        class="mr-2" 
        color="black" 
        @click="router.back()" 
      />
      <h1 class="text-h4 font-weight-bold text-black uppercase-ceb">Convidar Nous Centres</h1>
    </div>
    <v-row>
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-6 border-consorci bg-grey-lighten-5 h-100">
          <v-icon size="32" class="mb-4">mdi-file-upload-outline</v-icon>
          <h2 class="text-h6 font-weight-bold mb-2">Importació Massiva</h2>
          <p class="text-caption text-grey-darken-1 mb-6">Puja un fitxer .csv amb les columnes "nom" i "email" per convidar múltiples centres alhora.</p>
          
          <v-file-input
            v-model="fitxerCSV"
            label="Selecciona fitxer CSV"
            variant="solo"
            flat
            density="compact"
            prepend-icon=""
            prepend-inner-icon="mdi-attachment"
            accept=".csv"
            class="mb-4"
          ></v-file-input>

          <v-btn 
            block color="black" 
            :disabled="!fitxerCSV" 
            :loading="masivaLoading"
            @click="processarCSV"
          >Importar Centres</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card variant="outlined" class="pa-6 border-consorci bg-white">
          <h2 class="text-h6 font-weight-bold mb-6 d-flex align-center">
            <v-icon class="mr-2">mdi-email-plus-outline</v-icon> Invitació Manual
          </h2>
          <div v-for="(centre, index) in dadesInvitacio" :key="index" class="d-flex align-center ga-3 mb-4">
            <v-text-field v-model="centre.nom" label="Nom del Centre" variant="outlined" density="compact" hide-details color="black"></v-text-field>
            <v-text-field v-model="centre.email" label="Correu Electrònic" variant="outlined" density="compact" hide-details color="black"></v-text-field>
            <v-btn v-if="dadesInvitacio.length > 1" icon="mdi-close" variant="text" color="red" size="small" @click="eliminarFila(index)"></v-btn>
          </div>
          <v-btn variant="text" color="blue-darken-3" prepend-icon="mdi-plus" class="mt-2" @click="afegirFila">Afegir una altra fila</v-btn>
          <v-divider class="my-6"></v-divider>
          <v-alert v-if="invitacioError" type="error" variant="tonal" class="mb-4">{{ invitacioError }}</v-alert>
          <div class="d-flex justify-end">
            <v-btn color="black" size="large" class="px-10" :loading="loading" @click="enviarInvitacions">Enviar Invitacions</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">{{ snackbar.text }}</v-snackbar>
  </v-container>
</template>

<style scoped>
.border-consorci { border: 1px solid #e0e0e0 !important; border-radius: 12px; }
.dashboard-wrapper { background-color: #ffffff; }
.uppercase-ceb { text-transform: uppercase; letter-spacing: 2px; }
</style>