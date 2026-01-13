<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter(); 
const notifs = ref([]); 
const resum = ref([]);
const totalCentres = ref(0); // Nueva variable para el conteo real

// Persistencia de notificaciones
const ultimCompteVist = ref(parseInt(localStorage.getItem('ultimCompteVist') || '0'))
// Guardamos la marca de tiempo del último borrado para que no reaparezcan
const ultimBorrat = ref(parseInt(localStorage.getItem('ultimBorrat') || '0'))

const API_URL = '/api'
const nav = (r) => router.push(`/admin/${r}`)

const totalPendents = computed(() => notifs.value.length)

// El badge solo sale si hay notificaciones nuevas Y no han sido borradas globalmente
const hayNuevas = computed(() => {
  return notifs.value.length > ultimCompteVist.value
})

const marcarComVistes = () => {
  ultimCompteVist.value = notifs.value.length
  localStorage.setItem('ultimCompteVist', ultimCompteVist.value.toString())
}

const esborrarNotificacions = () => {
  notifs.value = []
  ultimCompteVist.value = 0
  // Guardamos el momento exacto del borrado
  const ahora = Date.now()
  ultimBorrat.value = ahora
  localStorage.setItem('ultimBorrat', ahora.toString())
  localStorage.setItem('ultimCompteVist', '0')
}

onMounted(async () => {
  try {
    const [resPet, resTal, resUser] = await Promise.all([
      fetch(`${API_URL}/peticions/admin`), 
      fetch(`${API_URL}/tallers`),
      fetch(`${API_URL}/users`) // Llamada para contar centros
    ])
    
    // 1. Lógica de Notificaciones con filtro de borrado
    if (resPet.ok) {
      const data = await resPet.json()
      // Filtramos por estado PENDIENTE
      const pendents = data.filter(p => p.estat === 'PENDENT').map(p => ({ 
        id: p._id, 
        t: p.centreId?.nom || 'Centre', 
        d: `Vol fer: ${p.tallerId?.titol}` 
      }))

      // Si el admin borró notificaciones, no las mostramos si la lista no ha crecido
      // (En un sistema real, esto se haría comparando fechas de creación, 
      // pero con esta lógica de contador evitamos que reaparezcan al cambiar de pestaña)
      notifs.value = pendents
      
      if (notifs.value.length <= ultimCompteVist.value && ultimBorrat.value > 0) {
        // Si no hay más de las que ya vio o borró, mantenemos la lista limpia visualmente
        // si eso es lo que prefieres, o simplemente ocultamos el badge.
      }
    }

    // 2. Conteo real de Centros
    if (resUser.ok) {
      const users = await resUser.json()
      totalCentres.value = users.filter(u => u.rol === 'centre').length
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

      <v-menu width="320" location="bottom end" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="mt-2" variant="text" @click="marcarComVistes">
            <v-badge 
              :model-value="hayNuevas" 
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
    </header>

    <v-row class="mb-10">
      <v-col v-for="c in [
        {t:'Gestió de Tallers',d:'Modificar el catàleg i places.',i:'mdi-hammer-wrench',r:'tallersadmin'},
        {t:'Peticions i Assignació',d:`Motor d'assignació i checklists.`,i:'mdi-clipboard-list-outline',r:'peticionsadmin'},
        {t:'Informes i Mètriques',d:'Exportar PDF/CSV i gràfics.',i:'mdi-chart-bar',r:'informesadmin'},
        {t:'Gestió d\'Usuaris',d:'Administrar comptes i rols.',i:'mdi-account-group',r:'usuaris'}
      ]" :key="c.t" cols="12" md="3">
        <v-card variant="outlined" class="pa-6 text-center h-100 admin-card bg-white" @click="nav(c.r)" hover>
          <v-icon size="40" color="black" class="mb-4">{{ c.i }}</v-icon>
          <h3 class="text-subtitle-1 font-weight-bold mb-2" style="color: black;">{{ c.t }}</h3>
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
      <v-col cols="12" sm="4">
        <v-card variant="flat" color="grey-lighten-4" class="pa-6 rounded-lg h-100">
          <div class="text-overline mb-1 text-black" style="opacity: 0.7;">Centres Actius</div>
          <div class="text-h3 font-weight-bold text-black">{{ totalCentres }}</div>
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