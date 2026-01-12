<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter(); 
const resum = ref([]) // Aquí guardarem els tallers per al resum

// Funció de navegació
const nav = (ruta) => router.push(`/centre/${ruta}`)

// Carregar dades en entrar
onMounted(async () => {
  try {
    const resposta = await fetch('http://localhost:3000/api/tallers')
    if (resposta.ok) {
      const dades = await resposta.json()
      resum.value = dades.slice(0, 5) // Només mostrem els 5 primers
    }
  } catch (e) { 
    console.error("Error carregar dades", e) 
  }
})

// Configuració de les targetes del menú
const menuAccions = [
  { t: 'Nova Sol·licitud', d: 'Inscriure el centre a un taller.', i: 'mdi-hammer-wrench', r: 'formulariCentre' },
  { t: 'Estat Peticions', d: 'Veure l\'estat de les teves sol·licituds.', i: 'mdi-clipboard-list-outline', r: 'estatpeticions' },
  { t: 'Assignacions', d: 'Consultar tallers i horaris confirmats.', i: 'mdi-chart-bar', r: 'assignacions' }
]
</script>

<template>
  <v-container class="pa-10">
    <header class="mb-10">
      <h1 class="text-h4 font-weight-bold">Panell de Gestió del Centre</h1>
      <p class="text-grey-darken-1">Benvingut al programa ENGINY.</p>
    </header>

    <v-row class="mb-8">
      <v-col v-for="item in menuAccions" :key="item.t" cols="12" md="4">
        <v-card variant="outlined" class="pa-6 text-center h-100" @click="nav(item.r)" hover>
          <v-icon size="48" color="#3465a4" class="mb-4">{{ item.i }}</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">{{ item.t }}</h3>
          <p class="text-body-2 text-grey-darken-1">{{ item.d }}</p>
        </v-card>
      </v-col>
    </v-row>

    
  </v-container>
</template>

<style scoped>
/* Estil per a la vora de les llistes */
.v-list-item { border-bottom: 1px solid #f0f0f0; }
</style>