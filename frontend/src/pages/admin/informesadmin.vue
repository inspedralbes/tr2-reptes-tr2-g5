<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = '/api'

// --- ESTATS DE DADES ---
const resum = ref([])
const totalPendents = ref(0)
const loading = ref(true)

onMounted(async () => {
  try {
    const [resPet, resTal] = await Promise.all([
      fetch(`${API_URL}/peticions/admin`), 
      fetch(`${API_URL}/tallers`)
    ])
    
    if (resPet.ok) {
      const peticions = await resPet.json()
      totalPendents.value = peticions.filter(p => p.estat === 'PENDENT').length
    }
    
    if (resTal.ok) {
      resum.value = await resTal.json()
    }
  } catch (e) { 
    console.error("Error carregar dades d'informes", e) 
  } finally { 
    loading.value = false 
  }
})
</script>

<template>
  <v-container class="admin-wrapper pa-10" fluid>
    <div class="d-flex justify-space-between align-start mb-8">
      <div class="d-flex align-center">
        <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.push('/admin/indexadmin')"/>
        <div>
          <h1 class="text-h4 font-weight-bold mb-1" style="color: black;">Informes i Mètriques</h1>
          <p class="text-subtitle-1 text-grey-darken-1">Analitza el rendiment i l'ocupació del programa.</p>
        </div>
      </div>
      <div class="d-flex mt-2">
        <v-btn color="black" class="text-white mr-2" prepend-icon="mdi-file-pdf-box">PDF</v-btn>
        <v-btn color="black" class="text-white" prepend-icon="mdi-file-excel">CSV</v-btn>
      </div>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card theme="dark" color="black" class="pa-6 rounded-lg h-100 shadow-sm">
          <div class="text-overline mb-1" style="opacity: 0.7;">Total Tallers Actius</div>
          <div class="text-h3 font-weight-bold">{{ resum.length }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card variant="outlined" color="black" class="pa-6 rounded-lg h-100">
          <div class="text-overline mb-1 text-grey-darken-1">Peticions per Validar</div>
          <div class="text-h3 font-weight-bold" :class="totalPendents > 0 ? 'text-red' : 'text-green'">
            {{ totalPendents }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="12" md="4">
        <v-card variant="flat" color="grey-lighten-4" class="pa-6 rounded-lg h-100">
          <div class="text-overline mb-1 text-black" style="opacity: 0.7;">Centres amb Sol·licitud</div>
          <div class="text-h3 font-weight-bold">12</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" md="6">
        <v-card variant="flat" class="pa-6 border-consorci bg-white h-100">
          <h3 class="text-subtitle-1 font-weight-bold mb-6">Satisfacció General</h3>
          <div class="bg-grey-lighten-4 py-10 rounded d-flex align-end justify-center" style="height: 200px; gap: 10px;">
             <div style="width: 40px; height: 80%; background-color: black;"/>
             <div style="width: 40px; height: 60%; background-color: #666;"/>
             <div style="width: 40px; height: 90%; background-color: black;"/>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="flat" class="pa-6 border-consorci bg-white h-100">
          <h3 class="text-subtitle-1 font-weight-bold mb-6">Assistència Mitjana</h3>
          <div class="bg-grey-lighten-4 py-10 rounded d-flex flex-column align-center justify-center" style="height: 200px;">
            <span class="text-h2 font-weight-bold">94.2%</span>
            <v-icon size="40" class="mt-2" color="green">mdi-trending-up</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <h2 class="text-h5 font-weight-bold mb-4" style="color: black;">Estat Actual de les Places</h2>
    <v-card variant="flat" class="border-consorci bg-white overflow-hidden mb-10">
      <div v-if="loading" class="pa-10 text-center"><v-progress-circular indeterminate color="black"/></div>
      
      <div v-else v-for="(t, i) in resum" :key="t._id" class="d-flex pa-5 align-center row-activity" :class="{ 'bg-row-alt': i % 2 === 0 }">
        <div class="text-subtitle-1 pr-8 font-weight-bold text-grey">{{ i + 1 }}</div>
        <div style="min-width: 280px;">
          <div class="font-weight-bold text-black">{{ t.titol }}</div>
          <div class="text-caption text-grey-darken-1">{{ t.modalitat }}</div>
        </div>
        <v-spacer />
        <div class="d-flex align-center ga-8 mr-6">
          <div class="text-right">
            <div class="text-caption font-weight-bold text-grey-darken-1">PLACES OCUPADES</div>
            <div class="text-body-1" :class="t.inscripcions?.length >= t.places ? 'text-red font-weight-bold' : 'text-black'">
              {{ t.inscripcions?.length || 0 }} / {{ t.places || 20 }}
            </div>
          </div>
          <v-chip size="small" :color="t.inscripcions?.length >= t.places ? 'error' : 'success'" label class="font-weight-bold px-4">
            {{ t.inscripcions?.length >= t.places ? 'COMPLET' : 'DISPONIBLE' }}
          </v-chip>
        </div>
      </div>
      <div v-if="!resum.length && !loading" class="pa-10 text-center text-grey">No s'han trobat dades de tallers.</div>
    </v-card>
  </v-container>
</template>

<style scoped>
.admin-wrapper { min-height: 100vh; background-color: white; }
.border-consorci { border: 1px solid rgba(0, 0, 0, 0.1) !important; border-radius: 8px; }
.row-activity { border-bottom: 1px solid #f0f0f0; }
.bg-row-alt { background-color: #fafafa !important; }
</style>