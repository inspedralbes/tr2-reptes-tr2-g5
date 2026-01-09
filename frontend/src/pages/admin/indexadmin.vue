<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter(); 
const notifs = ref([]); 
const resum = ref([])

// Registramos cuántas notificaciones había la última vez que el admin hizo clic
const ultimCompteVist = ref(parseInt(localStorage.getItem('ultimCompteVist') || '0'))
const vistes = ref(false)

const nav = (r) => router.push(`/admin/${r}`)

// Funció per marcar com a vistes
const marcarComVistes = () => {
  vistes.value = true
  // Guardamos la cantidad actual para que el sistema sepa que ya hemos visto estas X notificaciones
  ultimCompteVist.value = notifs.value.length
  localStorage.setItem('ultimCompteVist', ultimCompteVist.value.toString())
}

onMounted(async () => {
  try {
    const [resPet, resTal] = await Promise.all([
      fetch('http://localhost:3000/api/peticions/admin'), 
      fetch('http://localhost:3000/api/tallers')
    ])
    
    if (resPet.ok) {
      const data = await resPet.json()
      // Obtenemos todas las pendientes
      const pendents = data.filter(p => p.estat === 'PENDENT').map(p => ({ 
        id: p._id, 
        t: p.centreId?.nom || 'Centre', 
        d: `Vol fer: ${p.tallerId?.titol}` 
      }))
      
      notifs.value = pendents

      // Si hay más notificaciones de las que guardamos en el localStorage, reseteamos la alerta
      if (notifs.value.length > ultimCompteVist.value) {
        vistes.value = false
      } else {
        vistes.value = true
      }
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
              :model-value="notifs.length > ultimCompteVist" 
              :content="notifs.length"
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
          <v-card-title class="text-subtitle-1 font-weight-bold pa-4 bg-white text-black d-flex justify-space-between align-center">
            Noves Peticions 
            <v-btn v-if="notifs.length > 0" variant="text" size="x-small" color="grey-darken-3" @click="marcarComVistes">
              MARCAR COM A VISTES
            </v-btn>
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
              <v-list-item-title class="text-grey">No hi ha notificacions noves</v-list-item-title>
            </v-list-item>
          </v-list>
          
          <v-btn block variant="flat" color="black" class="text-white rounded-0 py-4" @click="nav('peticionsadmin')">
            VEURE-LES TOTES
          </v-btn>
        </v-card>
      </v-menu>
    </header>

    <v-row class="mb-6">
      <v-col v-for="c in [{t:'Gestió de Tallers',d:'Modificar el catàleg i places.',i:'mdi-hammer-wrench',r:'tallersadmin'},{t:'Peticions i Assignació',d:`Motor d'assignació i checklists.`,i:'mdi-clipboard-list-outline',r:'peticionsadmin'},{t:'Informes i Mètriques',d:'Exportar PDF/CSV i gràfics.',i:'mdi-chart-bar',r:'informesadmin'}]" :key="c.t" cols="12" md="4">
        <v-card variant="outlined" class="pa-6 text-center h-100 admin-card bg-white" @click="nav(c.r)" hover>
          <v-icon size="48" color="black" class="mb-4">{{ c.i }}</v-icon>
          <h3 class="text-h6 font-weight-bold mb-3" style="color: black;">{{ c.t }}</h3>
          <p class="text-body-2 text-grey-darken-1">{{ c.d }}</p>
        </v-card>
      </v-col>
    </v-row>

    <h2 class="text-h5 font-weight-bold mb-4" style="color: black;">Resum Global d'Activitat</h2>
    <v-card variant="flat" class="border-consorci bg-white overflow-hidden">
      <div v-for="(t, i) in resum" :key="t._id" class="d-flex pa-4 align-center row-activity" :class="{ 'bg-row-alt': i % 2 === 0 }">
        <div class="text-subtitle-1 pr-8 font-weight-bold text-grey">{{ i + 1 }}</div>
        <div><div class="font-weight-bold text-black">{{ t.titol }}</div><div class="text-caption text-grey-darken-1">{{ t.modalitat }}</div></div>
        <v-spacer/><v-btn variant="text" color="black" icon="mdi-chevron-right" @click="nav('tallersadmin')"/>
      </div>
      <div v-if="!resum.length" class="pa-10 text-center text-grey">No hi ha activitat recent.</div>
    </v-card>
  </v-container>
</template>

<style scoped>
/* Animación de pulso para indicar que hay una alerta */
@keyframes pulse-badge {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
  70% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
}

.pulse-alert :deep(.v-badge__badge) {
  animation: pulse-badge 2s infinite;
}

.admin-wrapper { min-height: 100vh; background-color: white; }
.bg-white { background-color: white !important; }
.menu-notificacions { background-color: white !important; border: 1px solid rgba(0,0,0,0.1) !important; }
.item-notificacio { border-bottom: 1px solid #f0f0f0; transition: background 0.2s; }
.item-notificacio:hover { background-color: #f9f9f9 !important; }
.admin-card { border-color: rgba(0, 0, 0, 0.1) !important; transition: 0.3s; }
.admin-card:hover { border-color: black !important; background-color: #fcfcfc !important; }
.border-consorci { border: 1px solid #e0e0e0 !important; border-radius: 8px; }
.row-activity { border-bottom: 1px solid #f0f0f0; }
.bg-row-alt { background-color: #fafafa !important; }
.shadow-xl { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important; }
</style>