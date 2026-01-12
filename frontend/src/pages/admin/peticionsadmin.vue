<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const peticions = ref([])

const state = reactive({
  filterStatus: 'ACTIVES', // Filtro principal: ACTIVES o REBUTJADES
  subFilter: 'TOTS', // Sub-filtro: TOTS, PENDENTS, ASSIGNATS
  search: '',
  dialog: false,
  selected: null,
  prof: null,
  accepted: false,
  tab: 0
})

const colors = {
  ASSIGNAT: 'teal-darken-1',
  PENDENT: 'orange-darken-2',
  REBUTJADA: 'red-darken-2',
  REVISANT: 'blue-lighten-3'
}

// CORRECCIÓN: Lista reactiva para cargar profesores reales del backend
const llistaProfessors = ref([])

const carregarProfessors = async () => {
  try {
    const res = await fetch('/api/users')
    if (res.ok) {
      const usuaris = await res.json()
      // Filtramos solo los que son profesores y guardamos sus nombres
      llistaProfessors.value = usuaris
        .filter(u => u.rol === 'professor')
        .map(u => u.nom)
    }
  } catch (error) {
    console.error("Error carregant professors:", error)
  }
}

const carregar = async () => {
  try {
    // Usamos ruta relativa para que funcione el proxy de Vite configurado al 3001
    const res = await fetch('/api/peticions/admin')
    if (res.ok) {
      peticions.value = await res.json()
    }
  } catch (error) {
    console.error("Error carregant:", error)
  }
}

onMounted(() => {
  carregar()
  carregarProfessors()
})

// Lógica de filtrado mejorada
const filtered = computed(() => {
  return peticions.value.filter(p => {
    const nomCentre = (p.centreId?.nom || p.nom_centre || '').toLowerCase()
    const coincideixCerca = nomCentre.includes(state.search.toLowerCase())
    // 1. Filtro por bloque principal
    if (state.filterStatus === 'REBUTJADES') {
      return p.estat === 'REBUTJADA' && coincideixCerca
    } else {
      // Estamos en ACTIVES
      if (p.estat === 'REBUTJADA') return false
      // 2. Sub-filtro de gestión
      if (state.subFilter === 'PENDENTS') return p.estat === 'PENDENT' && coincideixCerca
      if (state.subFilter === 'ASSIGNATS') return p.estat === 'ASSIGNAT' && coincideixCerca
      return coincideixCerca
    }
  })
})

const obrir = (p) => {
  state.selected = p
  state.prof = null
  state.accepted = false
  state.tab = 0
  state.dialog = true
}

const accio = async (tipus) => {
  if (tipus === 'REBUTJAR' && !confirm("Estàs segur?")) return
  if (tipus === 'ASSIGNAR' && !state.prof) return alert("Selecciona un professor.")

  // SEMPRE fem servir la ruta de peticions per actualitzar l'estat i el professor
  const url = `/api/peticions/${state.selected._id}/estat`
  
  const body = tipus === 'REBUTJAR' 
    ? { estat: 'REBUTJADA' } 
    : { estat: 'ASSIGNAT', professorId: state.prof } // Enviem el nom del professor aquí

  try {
    const res = await fetch(url, {
      method: 'PATCH', // Sempre PATCH per a l'estat
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    })

    if (res.ok) {
      state.dialog = false
      state.accepted = false
      state.prof = null
      await carregar() // Això refrescarà la taula de l'admin
    }
  } catch (error) {
    console.error("Error connectant amb el backend:", error)
  }
}
</script>

<template>
  <v-container class="admin-wrapper pa-10" fluid>
    <div class="d-flex align-center mb-8">
      <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.push('/admin/indexadmin')"/>
      <h1 class="text-h4 font-weight-bold" style="color: black;">Gestió de Peticions</h1>
    </div>

    <v-row dense class="mb-4 align-center">
      <v-col cols="12" md="5">
        <v-text-field v-model="state.search" placeholder="Cerca per centre educativo..." variant="outlined" density="comfortable" prepend-inner-icon="mdi-magnify" color="black" hide-details class="bg-white rounded"/>
      </v-col>
      <v-col cols="12" md="7" class="d-flex justify-md-end">
        <v-btn-toggle v-model="state.filterStatus" mandatory divided variant="flat" class="custom-toggle">
          <v-btn value="ACTIVES" :class="state.filterStatus === 'ACTIVES' ? 'active-blue' : 'inactive-grey'" prepend-icon="mdi-check-circle-outline">PETICIONS ACTIVES</v-btn>
          <v-btn value="REBUTJADES" :class="state.filterStatus === 'REBUTJADES' ? 'active-red' : 'inactive-grey'" prepend-icon="mdi-close-octagon-outline">REBUTJADES</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <v-row v-if="state.filterStatus === 'ACTIVES'" class="mb-6">
      <v-col cols="12" class="d-flex gap-2">
        <v-btn size="small" rounded="pill" :variant="state.subFilter === 'TOTS' ? 'flat' : 'outlined'" :color="state.subFilter === 'TOTS' ? 'black' : 'grey-darken-1'" @click="state.subFilter = 'TOTS'" class="mr-2">Totes ({{ peticions.filter(p => p.estat !== 'REBUTJADA').length }})</v-btn>
        <v-btn size="small" rounded="pill" :variant="state.subFilter === 'PENDENTS' ? 'flat' : 'outlined'" :color="state.subFilter === 'PENDENTS' ? 'orange-darken-3' : 'grey-darken-1'" @click="state.subFilter = 'PENDENTS'" prepend-icon="mdi-clock-outline" class="mr-2">Per Acceptar ({{ peticions.filter(p => p.estat === 'PENDENT').length }})</v-btn>
        <v-btn size="small" rounded="pill" :variant="state.subFilter === 'ASSIGNATS' ? 'flat' : 'outlined'" :color="state.subFilter === 'ASSIGNATS' ? 'teal-darken-2' : 'grey-darken-1'" @click="state.subFilter = 'ASSIGNATS'" prepend-icon="mdi-check-all">Ja Assignades ({{ peticions.filter(p => p.estat === 'ASSIGNAT').length }})</v-btn>
      </v-col>
    </v-row>

    <v-card variant="flat" class="border-consorci bg-dark-table">
      <v-table class="bg-dark-table">
        <thead>
          <tr class="header-black">
            <th class="text-white text-left">CENTRE EDUCATIU</th>
            <th class="text-white text-center">TALLER</th>
            <th class="text-white text-center">RESPONSABLE</th> 
            <th class="text-white text-center">COMENTARI</th>
            <th class="text-white text-center">ESTAT</th>
            <th class="text-white text-center">GESTIÓ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtered" :key="p._id" :class="{'opacity-50': p.estat === 'ASSIGNAT'}">
            <td class="font-weight-bold text-white">{{ p.nom_centre || p.centreId?.nom }}</td>
            <td class="text-center text-white">
              <div class="font-weight-bold">{{ p.tallerId?.titol || 'Pendent' }}</div>
              <v-chip v-if="p.tallerId?.modalitat" size="x-small" variant="outlined" color="blue-lighten-3" class="mt-1">{{ p.tallerId.modalitat }}</v-chip>
            </td>
            <td class="text-center">
              <div v-if="p.estat === 'ASSIGNAT'" class="d-flex flex-column align-center">
                <v-chip size="small" variant="tonal" color="blue-lighten-4" prepend-icon="mdi-account-check">{{ p.professorId }}</v-chip>
              </div>
              <v-icon v-else color="grey-darken-3" size="small">mdi-account-minus-outline</v-icon>
            </td>
            <td class="text-center">
              <v-tooltip v-if="p.comentaris" location="top" maxWidth="350" transition="scale-transition" content-class="custom-tooltip-content">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" color="blue-lighten-1" size="x-large" class="comment-icon-no-glow">mdi-comment-text-multiple</v-icon>
                </template>
                <div class="pa-3 custom-tooltip-box">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="small" color="blue-lighten-1" class="mr-2">mdi-message-outline</v-icon>
                    <span class="text-subtitle-2 font-weight-bold text-blue-lighten-1 text-uppercase">Observacions del centre</span>
                  </div>
                  <v-divider color="white" class="mb-2 opacity-25"></v-divider>
                  <p class="text-body-2 text-white mb-0">{{ p.comentaris }}</p>
                </div>
              </v-tooltip>
              <v-icon v-else color="grey-darken-3" size="small">mdi-minus</v-icon>
            </td>
            <td class="text-center">
              <v-chip size="x-small" :color="colors[p.estat] || 'grey'" class="text-white font-weight-bold" variant="flat">{{ p.estat }}</v-chip>
            </td>
            <td class="text-center">
              <v-btn icon="mdi-eye" variant="text" color="white" @click="obrir(p)"/>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="state.dialog" max-width="700" persistent>
      <v-card class="rounded-lg bg-dark-dialog text-white overflow-hidden">
        <v-tabs v-model="state.tab" bg-color="black" color="blue-lighten-1" align-tabs="start">
          <v-tab :value="0">DETALLS</v-tab>
          <v-tab :value="1">COMENTARIS <v-badge v-if="state.selected?.comentaris" color="blue-lighten-1" dot class="ml-2"></v-badge></v-tab>
        </v-tabs>

        <v-window v-model="state.tab">
          <v-window-item :value="0">
            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="info-item mb-4"><span class="text-grey-lighten-1 text-overline">CENTRE</span><p class="text-blue-lighten-3 font-weight-bold">{{ state.selected?.nom_centre }}</p></div>
                  <div class="info-item mb-4"><span class="text-grey-lighten-1 text-overline">COORDINADOR/A</span><p>{{ state.selected?.nom_coordinador || 'No indicat' }}</p></div>
                  <div class="info-item"><span class="text-grey-lighten-1 text-overline">Nº ALUMNES</span><p>{{ state.selected?.seleccio_tallers?.num_alumnes }} alumnes</p></div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item mb-4"><span class="text-grey-lighten-1 text-overline">TALLER SOL·LICITAT</span><p class="white--text font-weight-bold">{{ state.selected?.tallerId?.titol || 'Pendent' }}</p>
                    <v-chip v-if="state.selected?.tallerId?.modalitat" size="x-small" color="blue-lighten-1" variant="flat" class="mt-1">{{ state.selected.tallerId.modalitat }}</v-chip>
                  </div>
                  <div class="info-item mb-4"><span class="text-grey-lighten-1 text-overline">PROFESSOR/A REFERENT</span><p>{{ state.selected?.referent_contacte?.nom }}</p></div>
                  <div class="info-item"><span class="text-grey-lighten-1 text-overline">CORREU DE CONTACTE</span><p class="text-blue-lighten-4">{{ state.selected?.referent_contacte?.correu }}</p></div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-window-item>

          <v-window-item :value="1">
            <v-card-text class="pa-6">
              <div class="comments-container">
                <div class="d-flex align-center mb-4"><v-icon color="blue-lighten-1" class="mr-2">mdi-message-text-outline</v-icon><span class="text-h6 font-weight-bold text-blue-lighten-1">Observacions del Centre</span></div>
                <div v-if="state.selected?.comentaris" class="comment-bubble-large"><p class="text-body-1 comment-text">{{ state.selected?.comentaris }}</p></div>
                <v-alert v-else type="info" variant="tonal" color="blue-lighten-1" class="mt-2">El centre no ha afegit comentaris per a aquesta petició.</v-alert>
              </div>
            </v-card-text>
          </v-window-item>
        </v-window>

        <v-divider class="border-opacity-25" color="white"/>

        <v-card-text class="pa-6 bg-black-darken-1">
          <div v-if="state.selected?.estat !== 'REBUTJADA' && state.selected?.estat !== 'ASSIGNAT'">
            <div v-if="!state.accepted" class="d-flex justify-center gap-4">
              <v-btn color="red-darken-3" class="flex-grow-1 mr-2" variant="flat" prepend-icon="mdi-close-circle" @click="accio('REBUTJAR')">REBUTJAR</v-btn>
              <v-btn color="green-darken-3" class="flex-grow-1 ml-2" variant="flat" prepend-icon="mdi-check-circle" @click="state.accepted = true">ACCEPTAR I ASSIGNAR</v-btn>
            </div>
            <v-expand-transition>
              <div v-if="state.accepted">
                <v-select v-model="state.prof" :items="llistaProfessors" label="Assignar Professor Responsable" variant="outlined" color="blue-lighten-1" theme="dark" density="comfortable" class="mt-2"/>
              </div>
            </v-expand-transition>
          </div>
          <v-alert v-else-if="state.selected?.estat === 'ASSIGNAT'" type="success" variant="tonal" density="compact" prepend-icon="mdi-check-bold">Aquesta petició ja està assignada i tancada.</v-alert>
          <v-alert v-else type="error" variant="tonal" density="compact">Petició Rebutjada</v-alert>
        </v-card-text>

        <v-card-actions class="pa-4 bg-dark-dialog">
          <v-btn variant="text" color="grey-lighten-1" @click="state.dialog = false">Tancar</v-btn>
          <v-spacer/>
          <v-btn v-if="state.accepted" :disabled="!state.prof" color="blue-lighten-1" class="text-white px-8 font-weight-bold" @click="accio('ASSIGNAR')" variant="flat">CONFIRMAR</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.admin-wrapper { min-height: 100vh; background-color: #f5f5f5; }
.header-black { background-color: #121212 !important; }
.bg-dark-table { background-color: #1e1e1e !important; }
.bg-dark-dialog { background-color: #212121 !important; border: 1px solid #444; }
.bg-black-darken-1 { background-color: #181818 !important; }
.border-consorci { border: 1px solid rgba(0, 0, 0, 0.1) !important; border-radius: 8px; overflow: hidden; }
.opacity-50 { opacity: 0.6; }
.info-item p { margin-bottom: 0; font-size: 1.1rem; line-height: 1.2; }
.text-overline { font-size: 0.65rem !important; letter-spacing: 1px !important; }
.custom-toggle { border-radius: 12px; height: 50px; }
.active-blue { background-color: #1565C0 !important; color: white !important; }
.active-red { background-color: #C62828 !important; color: white !important; }
.inactive-grey { background-color: #eeeeee !important; color: #616161 !important; }
.comment-icon-no-glow { cursor: pointer; transition: transform 0.2s ease; }
.comment-icon-no-glow:hover { transform: scale(1.2); }
:deep(.custom-tooltip-content) { background-color: transparent !important; box-shadow: none !important; opacity: 1 !important; }
.custom-tooltip-box { background-color: #000000 !important; border: 1px solid #444; border-radius: 8px; line-height: 1.5; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
.comments-container { min-height: 200px; }
.comment-bubble-large { background-color: rgba(30, 144, 255, 0.1); border-left: 4px solid #42A5F5; padding: 24px; border-radius: 4px 16px 16px 4px; }
.comment-text { color: #e0e0e0; line-height: 1.8; font-style: italic; font-size: 1.1rem !important; }
</style>