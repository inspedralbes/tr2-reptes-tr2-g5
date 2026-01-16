<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = '/api'
const router = useRouter()

// --- ESTATS DE DADES ---
const notifs = ref([])
const resum = ref([])
const snackbar = ref({ show: false, text: '', color: '' })

// Registrem quantes notificacions hi havia l'última vegada
const ultimCompteVist = ref(parseInt(localStorage.getItem('ultimCompteVist') || '0'))
const vistes = ref(false)

// --- UTILITATS ---
const nav = (r) => router.push(`/admin/${r}`)
const totalPendents = computed(() => notifs.value.length)

// --- LÒGICA NOTIFICACIONS (RESTAURADA) ---
const marcarComVistes = () => {
  vistes.value = true
  ultimCompteVist.value = notifs.value.length
  localStorage.setItem('ultimCompteVist', ultimCompteVist.value.toString())
}

const esborrarNotificacions = () => {
  notifs.value = []
  ultimCompteVist.value = 0
  localStorage.setItem('ultimCompteVist', '0')
}

onMounted(async () => {
  try {
    const [resPet, resTal] = await Promise.all([
      fetch(`${API_URL}/peticions/admin`), 
      fetch(`${API_URL}/tallers`)
    ])
    if (resPet.ok) {
      const data = await resPet.json()
      notifs.value = data.filter(p => p.estat === 'PENDENT').map(p => ({ 
        id: p._id, t: p.centreId?.nom || 'Centre', d: `Vol fer: ${p.tallerId?.titol}` 
      }))
      
      // Si el nombre de notificacions actuals és menor o igual al que ja vam veure, no mostrem el badge
      vistes.value = notifs.value.length <= ultimCompteVist.value
    }
    if (resTal.ok) resum.value = (await resTal.json()).slice(0, 5)
  } catch (e) { console.error("Error carregar dades", e) }
})
</script>

<template>
  <v-container class="admin-wrapper pa-10" fluid>
    <header class="mb-10 d-flex justify-space-between align-start">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2" style="color: black;">Panell de Control Administració</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Gestió integral de tallers, sol·licituds i seguiment de mètriques.</p>
      </div>

      <div class="d-flex align-center">
        <v-menu width="320" location="bottom end" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" class="mt-2" variant="text" @click="marcarComVistes">
              <v-badge 
                :model-value="notifs.length > ultimCompteVist" 
                :content="notifs.length - ultimCompteVist"
                color="red" 
                overlap
                offset-x="3" 
                offset-y="3"
                class="pulse-alert"
              >
                <v-icon size="30" color="black">mdi-bell-outline</v-icon>
              </v-badge>
            </v-btn>
          </template>

          <v-card class="border-consorci shadow-xl menu-notificacions">
            <v-card-title class="text-subtitle-2 font-weight-bold pa-4 bg-white text-black d-flex justify-space-between align-center">
              NOTIFICACIONS
              <v-btn variant="text" size="x-small" color="red" icon="mdi-trash-can-outline" @click="esborrarNotificacions" />
            </v-card-title>
            <v-divider/>
            
            <v-list class="pa-0 bg-white" max-height="400">
              <v-list-item v-for="n in notifs" :key="n.id" class="pa-4 item-notificacio" @click="nav('peticionsadmin')">
                <template v-slot:prepend>
                  <v-icon color="black" class="mr-3">mdi-school-outline</v-icon>
                </template>
                <div>
                  <div class="text-body-2 font-weight-bold text-black">{{ n.t }}</div>
                  <div class="text-caption text-grey-darken-3">{{ n.d }}</div>
                </div>
              </v-list-item>
              
              <v-list-item v-if="notifs.length === 0" class="pa-10 text-center">
                <v-list-item-title class="text-grey">No hi ha notificacions</v-list-item-title>
              </v-list-item>
            </v-list>
            
            <v-btn block variant="flat" color="black" class="text-white rounded-0 py-4" @click="nav('peticionsadmin')">
              VEURE TOTES LES PETICIONS
            </v-btn>
          </v-card>
        </v-menu>
      </div>
    </header>

    <v-row class="mb-4">
      <v-col 
        v-for="c in [
          {t:'Fases del Sistema', d:'Configurar el calendari i etapes.', i:'mdi-sync', r:'fasesadmin'},
          {t:'Convidar Centres', d:'Gestionar accessos i importació CSV.', i:'mdi-shield-account-outline', r:'convidaradmin'},
          {t:'Gestió de Tallers', d:'Modificar el catàleg i places.', i:'mdi-hammer-wrench', r:'tallersadmin'},
        ]" 
        :key="c.t" cols="12" md="4"
      >
        <v-card variant="outlined" class="pa-6 text-center h-100 admin-card bg-white" @click="nav(c.r)" hover>
          <v-icon size="40" color="black" class="mb-4">{{ c.i }}</v-icon>
          <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ c.t }}</h3>
          <p class="text-caption text-grey-darken-1">{{ c.d }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-10">
      <v-col 
        v-for="c in [
          {t:'Peticions i Assignació', d:`Motor d'assignació i checklists.`, i:'mdi-clipboard-list-outline', r:'peticionsadmin'},
          {t:'Gestió d\'Usuaris', d:'Administrar comptes i rols.', i:'mdi-account-group', r:'usuaris'},
          {t:'Informes i Mètriques', d:'Exportar PDF/CSV i gràfics.', i:'mdi-chart-bar', r:'informesadmin'},
        ]" 
        :key="c.t" cols="12" md="4"
      >
        <v-card variant="outlined" class="pa-6 text-center h-100 admin-card bg-white" @click="nav(c.r)" hover>
          <v-icon size="40" color="black" class="mb-4">{{ c.i }}</v-icon>
          <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ c.t }}</h3>
          <p class="text-caption text-grey-darken-1">{{ c.d }}</p>
        </v-card>
      </v-col>
    </v-row>

    <h2 class="text-h5 font-weight-bold mb-4" style="color: black;">Resum Global d'Activitat</h2>
    <v-row class="mb-10">
      <v-col cols="12" sm="4">
        <v-card theme="dark" color="black" class="pa-6 rounded-lg h-100 shadow-sm">
          <div class="text-overline mb-1" style="opacity: 0.7;">Total Tallers</div>
          <div class="text-h3 font-weight-bold">{{ resum.length }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card variant="outlined" color="black" class="pa-6 rounded-lg h-100">
          <div class="text-overline mb-1 text-grey-darken-1">Peticions Pendents</div>
          <div class="text-h3 font-weight-bold" :class="totalPendents > 0 ? 'text-red' : 'text-green'">
            {{ totalPendents }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <h2 class="text-h5 font-weight-bold mb-4" style="color: black;">Estat Actual dels Tallers</h2>
    <v-card variant="flat" class="border-consorci bg-white overflow-hidden">
      <div v-for="(t, i) in resum" :key="t._id" class="d-flex pa-5 align-center row-activity" :class="{ 'bg-row-alt': i % 2 === 0 }">
        <div class="text-subtitle-1 pr-8 font-weight-bold text-grey">{{ i + 1 }}</div>
        <div style="min-width: 280px;">
          <div class="font-weight-bold text-black">{{ t.titol }}</div>
          <div class="text-caption text-grey-darken-1">{{ t.modalitat }}</div>
        </div>
        <v-spacer />
        <div class="d-flex align-center ga-8 mr-6">
          <div class="text-right">
            <div class="text-caption font-weight-bold text-grey-darken-1">PLACES</div>
            <div class="text-body-1" :class="t.inscripcions?.length >= t.places ? 'text-red font-weight-bold' : 'text-black'">
              {{ t.inscripcions?.length || 0 }} / {{ t.places || 20 }}
            </div>
          </div>
          <v-chip size="small" :color="t.inscripcions?.length >= t.places ? 'error' : 'success'" label class="font-weight-bold px-4">
            {{ t.inscripcions?.length >= t.places ? 'PLE' : 'DISPONIBLE' }}
          </v-chip>
        </div>
        <v-btn variant="text" color="black" icon="mdi-chevron-right" @click="nav('tallersadmin')"/>
      </div>
      <div v-if="!resum.length" class="pa-10 text-center text-grey">No hi ha activitat recent.</div>
    </v-card>

  </v-container>
</template>

<style scoped>
@keyframes pulse-badge {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
  70% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
}

.pulse-alert :deep(.v-badge__badge) { animation: pulse-badge 2s infinite; }
.admin-wrapper { min-height: 100vh; background-color: white; }
.admin-card { border-color: rgba(0, 0, 0, 0.1) !important; transition: 0.3s; }
.admin-card:hover { border-color: black !important; background-color: #fcfcfc !important; }
.border-consorci { border: 1px solid #e0e0e0 !important; border-radius: 8px; }
.row-activity { border-bottom: 1px solid #f0f0f0; }
.bg-row-alt { background-color: #fafafa !important; }
.shadow-xl { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important; }
</style>