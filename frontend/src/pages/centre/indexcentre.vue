<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = 'http://localhost:3001/api'

const resum = ref([]) 
const faseActual = ref(0) 
const cargando = ref(true)

// Funciones de navegación
const irANovaSolicitud = () => router.push('/centre/formulariCentre')
const irAEstatPeticions = () => router.push('/centre/estatpeticions')
const irAAssignacions = () => router.push('/centre/assignacions')

onMounted(async () => {
    try {
        const resConfig = await fetch(`${API_URL}/config`)
        if (resConfig.ok) {
            const config = await resConfig.json()
            faseActual.value = config.faseActual
        }
        const respuesta = await fetch(`${API_URL}/tallers`)
        if (respuesta.ok) {
            const datos = await respuesta.json()
            resum.value = datos.slice(0, 5)
        }
    } catch (error) {
        console.error("Error carregant la configuració:", error)
    } finally {
        cargando.value = false
    }
})
</script>

<template>
  <v-container class="pa-10">
    <header class="mb-10">
      <h1 class="text-h4 font-weight-bold">Panell de Gestió del Centre</h1>
      <p class="text-grey-darken-1">Benvingut al programa ENGINY.</p>
      
      <v-chip v-if="!cargando" color="#3465a4" variant="flat" class="mt-2">
        Estat actual: {{ faseActual === 1 ? 'Inscripcions Obertes' : faseActual === 2 ? 'Validació de Sol·licituds' : 'Assignacions Publicades' }}
      </v-chip>
    </header>

    <v-row class="mb-8" v-if="!cargando">
      
      <v-col cols="12" md="4">
        <v-card 
          variant="outlined" 
          class="pa-6 text-center h-100 card-estil-unic" 
          :class="{ 'fase-bloquejada': faseActual !== 1 }"
          @click="faseActual === 1 && irANovaSolicitud()" 
          :hover="faseActual === 1"
        >
          <v-icon size="48" color="#3465a4" class="mb-4">mdi-hammer-wrench</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Nova Sol·licitud</h3>
          <p class="text-body-2 text-grey-darken-1">Inscriure el centre a un taller per a la nova edició.</p>
          <v-btn v-if="faseActual === 1" color="#3465a4" class="mt-4 text-white" variant="flat">Accedir</v-btn>
          <v-chip v-else size="small" variant="tonal" class="mt-4">No disponible</v-chip>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card 
          variant="outlined" 
          class="pa-6 text-center h-100 card-estil-unic" 
          :class="{ 'fase-bloquejada': faseActual === 0 || faseActual === 3 }"
          @click="(faseActual === 1 || faseActual === 2) && irAEstatPeticions()" 
          :hover="faseActual === 1 || faseActual === 2"
        >
          <v-icon size="48" color="#3465a4" class="mb-4">mdi-clipboard-list-outline</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Estat Peticions</h3>
          <p class="text-body-2 text-grey-darken-1">Consulta el procés de validació de les teves sol·licituds.</p>
          <v-btn v-if="faseActual === 1 || faseActual === 2" color="#3465a4" class="mt-4 text-white" variant="flat">Veure llista</v-btn>
          <v-chip v-else size="small" variant="tonal" class="mt-4">No disponible</v-chip>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card 
          variant="outlined" 
          class="pa-6 text-center h-100 card-estil-unic" 
          :class="{ 'fase-bloquejada': faseActual !== 3 }"
          @click="faseActual === 3 && irAAssignacions()" 
          :hover="faseActual === 3"
        >
          <v-icon size="48" color="#3465a4" class="mb-4">mdi-chart-bar</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Assignacions</h3>
          <p class="text-body-2 text-grey-darken-1">Consulta els tallers i horaris finalment adjudicats.</p>
          <v-btn v-if="faseActual === 3" color="#3465a4" class="mt-4 text-white" variant="flat">Veure resultats</v-btn>
          <v-chip v-else size="small" variant="tonal" class="mt-4">No disponible</v-chip>
        </v-card>
      </v-col>

    </v-row>

    <v-row v-else justify="center" class="pa-10">
      <v-progress-circular indeterminate color="#3465a4"></v-progress-circular>
    </v-row>
    
  </v-container>
</template>

<style scoped>
.card-estil-unic {
    border: 1px solid #3465a4 !important;
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.fase-bloquejada {
    opacity: 0.4;
    filter: grayscale(0.8); 
    background-color: #f5f5f5; 
    cursor: not-allowed !important;
    pointer-events: none; 
    border: 1px dashed #999 !important; 
}

.card-estil-unic:hover:not(.fase-bloquejada) {
    background-color: #f0f4fa;
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(52, 101, 164, 0.2) !important;
}
</style>