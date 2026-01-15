<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Variables para datos y control de fase
const resum = ref([]) 
const faseActual = ref(0) // 1: Inscripció, 2: Validació, 3: Assignació
const cargando = ref(true)

// Funciones de navegación con comprobación de seguridad
function irANovaSolicitud() {
  if (faseActual.value === 1) router.push('/centre/formulariCentre')
}

function irAEstatPeticions() {
  if (faseActual.value >= 1) router.push('/centre/estatpeticions')
}

function irAAssignacions() {
  if (faseActual.value === 3) router.push('/centre/assignacions')
}

onMounted(async () => {
    try {
        // 1. Consultar la fase activa del sistema
        const resConfig = await fetch('http://localhost:3001/api/config')
        if (resConfig.ok) {
            const config = await resConfig.json()
            faseActual.value = config.faseActual
        }

        // 2. Traer el resumen de talleres (tu lógica original)
        const respuesta = await fetch('http://localhost:3001/api/tallers')
        if (respuesta.ok) {
            const datos = await respuesta.json()
            resum.value = datos.slice(0, 5)
        }
    } catch (error) {
        console.error("Error cargando la configuración o talleres:", error)
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
        Fase Actual: {{ faseActual === 1 ? 'Inscripcions Obertes' : faseActual === 2 ? 'Revisió de Sol·licituds' : 'Assignacions Publicades' }}
      </v-chip>
    </header>

    <v-row class="mb-8" v-if="!cargando">
      
      <v-col cols="12" md="4">
        <v-card 
          variant="outlined" 
          class="pa-6 text-center h-100" 
          :disabled="faseActual !== 1"
          :class="{ 'opacidad-desactivado': faseActual !== 1 }"
          @click="irANovaSolicitud()" 
          hover
        >
          <v-icon size="48" :color="faseActual === 1 ? '#3465a4' : 'grey'" class="mb-4">mdi-hammer-wrench</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Nova Sol·licitud</h3>
          <p class="text-body-2" :class="faseActual === 1 ? 'text-grey-darken-1' : 'text-error'">
            {{ faseActual === 1 ? 'Inscriure el centre a un taller.' : 'El termini d\'inscripció ha finalitzat.' }}
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card 
          variant="outlined" 
          class="pa-6 text-center h-100" 
          :disabled="faseActual < 1"
          @click="irAEstatPeticions()" 
          hover
        >
          <v-icon size="48" color="#3465a4" class="mb-4">mdi-clipboard-list-outline</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Estat Peticions</h3>
          <p class="text-body-2 text-grey-darken-1">Veure l'estat de les teves sol·licituds.</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card 
          variant="outlined" 
          class="pa-6 text-center h-100" 
          :disabled="faseActual !== 3"
          :class="{ 'opacidad-desactivado': faseActual !== 3 }"
          @click="irAAssignacions()" 
          hover
        >
          <v-icon size="48" :color="faseActual === 3 ? '#3465a4' : 'grey'" class="mb-4">mdi-chart-bar</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Assignacions</h3>
          <p class="text-body-2" :class="faseActual === 3 ? 'text-grey-darken-1' : 'text-grey-lighten-1'">
            {{ faseActual === 3 ? 'Consultar tallers i horaris confirmats.' : 'Disponible en finalitzar les assignacions.' }}
          </p>
        </v-card>
      </v-col>

    </v-row>

    <v-row v-else justify="center" class="pa-10">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>
    
  </v-container>
</template>

<style scoped>
.v-list-item { 
    border-bottom: 1px solid #f0f0f0; 
}

/* Clase para dar aspecto de "bloqueado" pero visible */
.opacidad-desactivado {
    opacity: 0.6;
    background-color: #f9f9f9;
    cursor: not-allowed !important;
}
</style>