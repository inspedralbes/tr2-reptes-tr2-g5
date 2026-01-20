<template>
  <v-container class="admin-wrapper pa-6" fluid>
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.back()"/>
      <h1 class="text-h4 font-weight-bold ml-4 text-black">Representants Generals</h1>
    </div>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="black" size="64" />
      </v-col>
    </v-row>

    <v-row v-else-if="voluntarisPerTaller.length === 0">
      <v-col cols="12">
        <v-alert type="info" variant="tonal" text="Encara no hi ha voluntaris registrats a les peticions." />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="taller in voluntarisPerTaller" :key="taller._id" cols="12" md="6" lg="4">
        <v-card class="rounded-xl h-100" elevation="1" border>
          <v-card-item class="bg-black text-white">
            <v-card-title class="text-subtitle-1 font-weight-black">
              {{ taller.taller_titol }}
            </v-card-title>
          </v-card-item>

          <v-card-text class="pa-4">
            <div class="text-overline mb-2 text-grey-darken-1">Candidats voluntaris:</div>
            
            <v-list class="pa-0">
              <v-list-item 
                v-for="v in taller.candidats" 
                :key="v.correu" 
                class="px-0 border-bottom mb-2"
              >
                <div class="d-flex justify-space-between align-center w-100">
                  <div>
                    <div class="font-weight-bold">{{ v.nom }}</div>
                    <div class="text-caption">{{ v.centre }}</div>
                  </div>
              <v-btn 
  size="small" 
  :color="taller.representant_actual ? 'grey' : 'black'" 
  rounded="pill" 
  class="text-white px-4"
  :disabled="!!taller.representant_actual"
  @click="assignar(taller._id, v)"
>
  {{ taller.representant_actual ? 'ASSIGNAT' : 'TRIA' }}
</v-btn>
                </div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const voluntarisPerTaller = ref([])
const snackbar = reactive({ show: false, text: '', color: '' })

// 1. Carregar voluntaris des del Backend (la ruta que ja has creat)
const carregarVoluntaris = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/peticions/voluntaris-representants')
    if (res.ok) {
      voluntarisPerTaller.value = await res.json()
    }
  } catch (error) {
    mostrarNotificacio("Error al carregar dades", "red")
  } finally {
    loading.value = false
  }
}

// 2. Assignar el representant (crida al PUT de tallers)
const assignar = async (tallerId, v) => {
  try {
    const res = await fetch(`/api/tallers/${tallerId}/representant`, { // Usant la ruta que hem creat
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        representant_oficial: { nom: v.nom, correu: v.correu, centre: v.centre } 
      })
    })
    
    if (res.ok) {
      mostrarNotificacio(`Representant assignat: ${v.nom}`, "success")
      
      // ACTUALITZACIÓ INSTANTÀNIA: Troba el taller a la llista local i posa-li el representant
      const taller = voluntarisPerTaller.value.find(t => t._id === tallerId)
      if (taller) {
        taller.representant_actual = { nom: v.nom, correu: v.correu }
      }
    }
  } catch (error) {
    mostrarNotificacio("Error de connexió", "error")
  }
}

const mostrarNotificacio = (text, color) => {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

onMounted(carregarVoluntaris)
</script>

<style scoped>
.admin-wrapper { min-height: 100vh; background-color: #f5f5f5; }
.border-bottom { border-bottom: 1px solid #eee; padding-bottom: 8px; }
</style>