<template>
  <v-container class="admin-wrapper pa-6" fluid>
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.back()"/>
      <h1 class="text-h4 font-weight-bold ml-4 text-black">Gestió de Representants</h1>
    </div>
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="black" size="64" />
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
            <div class="text-caption text-uppercase font-weight-bold text-grey mb-2">Candidats disponibles:</div>
            <v-list class="pa-0">
              <v-list-item v-for="v in taller.candidats" :key="v.peticioId" class="px-0 py-3 border-bottom">
                <template v-slot:prepend>
                  <v-avatar color="grey-lighten-4" size="40">
                    <v-icon color="black">mdi-account-school</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold text-body-2">{{ v.nom }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ v.centre }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn 
                    :color="taller.representant_actual?.correu === v.correu ? 'success' : 'black'"
                    :variant="taller.representant_actual?.correu === v.correu ? 'elevated' : 'outlined'"
                    size="small"
                    class="rounded-lg font-weight-bold"
                    @click="assignar(taller._id, v)"
                  >
                    {{ taller.representant_actual?.correu === v.correu ? 'ESCOLLIT' : 'TRIA' }}
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="pill" elevation="24">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const voluntarisPerTaller = ref([])
const loading = ref(true)
const snackbar = ref({ show: false, text: '', color: '' })
const mostrarNotificacio = (text, color) => {
  snackbar.value = { show: true, text, color }
}

const carregarDades = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/peticions/voluntaris-representants')
    if (res.ok) {
      voluntarisPerTaller.value = await res.json()
    }
  } catch (error) {
    mostrarNotificacio("Error al carregar les dades", "red")
  } finally {
    loading.value = false
  }
}

const assignar = async (tallerId, v) => {
  try {
    const res = await fetch(`/api/tallers/${tallerId}/representant`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        representant_oficial: { 
          nom: v.nom, 
          correu: v.correu, 
          centre: v.centre 
        },
        peticioId: v.peticioId
      })
    })
    
    if (res.ok) {
      mostrarNotificacio(`Representant assignat: ${v.nom}`, "success")
      await carregarDades()
    }
  } catch (error) {
    mostrarNotificacio("Error al realitzar l'assignació", "red")
  }
}

onMounted(carregarDades)
</script>

<style scoped>
.admin-wrapper {
  background-color: #fafafa;
  min-height: 100vh;
}
.border-bottom {
  border-bottom: 1px solid #f0f0f0;
}
.border-bottom:last-child {
  border-bottom: none;
}
</style>