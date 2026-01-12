<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Variables para guardar datos
const resum = ref([]) 

// Funciones para ir a las diferentes paginas
function irANovaSolicitud() {
  console.log("Yendo a formulario...")
  router.push('/centre/formulariCentre')
}

function irAEstatPeticions() {
  console.log("Yendo a estado peticiones...")
  router.push('/centre/estatpeticions')
}

function irAAssignacions() {
  console.log("Yendo a assignaciones...")
  router.push('/centre/assignacions')
}

// Cuando se carga la pagina traemos los datos del servidor
onMounted(async () => {
    console.log("Cargando la pagina de centro...")
    try {
        // Hacemos el fetch
        const respuesta = await fetch('http://localhost:3000/api/tallers')
        
        // Comprobamos si ha ido bien
        if (respuesta.ok) {
            const datos = await respuesta.json()
            console.log("Datos recibidos:", datos)
            
            // Guardamos solo los 5 primeros
            resum.value = datos.slice(0, 5)
        }
    } catch (error) {
        // Si falla mostramos error
        console.error("Ha habido un error cargando:", error)
    }
})

</script>

<template>
  <v-container class="pa-10">
    <header class="mb-10">
      <h1 class="text-h4 font-weight-bold">Panell de Gestió del Centre</h1>
      <p class="text-grey-darken-1">Benvingut al programa ENGINY.</p>
    </header>

    <v-row class="mb-8">
      
      <!-- Primera tarjeta: Nova Sol·licitud -->
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-6 text-center h-100" @click="irANovaSolicitud()" hover>
          <v-icon size="48" color="#3465a4" class="mb-4">mdi-hammer-wrench</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Nova Sol·licitud</h3>
          <p class="text-body-2 text-grey-darken-1">Inscriure el centre a un taller.</p>
        </v-card>
      </v-col>

      <!-- Segunda tarjeta: Estat Peticions -->
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-6 text-center h-100" @click="irAEstatPeticions()" hover>
          <v-icon size="48" color="#3465a4" class="mb-4">mdi-clipboard-list-outline</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Estat Peticions</h3>
          <p class="text-body-2 text-grey-darken-1">Veure l'estat de les teves sol·licituds.</p>
        </v-card>
      </v-col>

      <!-- Tercera tarjeta: Assignacions -->
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-6 text-center h-100" @click="irAAssignacions()" hover>
          <v-icon size="48" color="#3465a4" class="mb-4">mdi-chart-bar</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Assignacions</h3>
          <p class="text-body-2 text-grey-darken-1">Consultar tallers i horaris confirmats.</p>
        </v-card>
      </v-col>

    </v-row>
    
  </v-container>
</template>

<style scoped>
/* Estilo para los bordes */
.v-list-item { 
    border-bottom: 1px solid #f0f0f0; 
}
</style>