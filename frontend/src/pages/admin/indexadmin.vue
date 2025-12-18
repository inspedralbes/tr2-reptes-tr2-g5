<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const teNotificacions = ref(false)
const llistaNotificacions = ref([])
const resumTallers = ref([])

const navegar = (ruta) => {
  router.push(`/admin/${ruta}`)
}

const marcarComLlegides = () => {
  teNotificacions.value = false
}

const fetchData = async () => {
  try {
    // PETICIONS - Ús de fetch en comptes de axios
    const resPeticions = await fetch('http://localhost:3000/api/peticions/admin')
    if (!resPeticions.ok) throw new Error('Error al carregar peticions')
    const peticionsData = await resPeticions.json()

    const pendents = peticionsData.filter(p => p.estat === 'PENDENT')
    llistaNotificacions.value = pendents.map(p => ({
      id: p._id,
      centre: p.centreId?.nom || 'Centre Educatiu',
      taller: p.tallerId?.titol || 'Taller Sol·licitat',
      temps: 'Nova petició'
    }))
    teNotificacions.value = llistaNotificacions.value.length > 0

    // TALLERS - Ús de fetch en comptes de axios
    const resTallers = await fetch('http://localhost:3000/api/tallers')
    if (!resTallers.ok) throw new Error('Error al carregar tallers')
    const tallersData = await resTallers.json()

    resumTallers.value = tallersData.slice(0, 5).map(t => ({
      id: t._id,
      titol: t.titol,
      estat: t.modalitat
    }))
  } catch (error) {
    console.error("Error en la càrrega de dades:", error)
  }
}

onMounted(fetchData)
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
          <v-btn icon v-bind="props" class="mt-2" variant="text">
            <v-badge :model-value="teNotificacions" dot color="red" offset-x="3" offset-y="3">
              <v-icon size="30" color="black">mdi-bell-outline</v-icon>
            </v-badge>
          </v-btn>
        </template>

        <v-card class="border-consorci shadow-xl menu-notificacions">
          <v-card-title class="text-subtitle-1 font-weight-bold pa-4 bg-white text-black d-flex justify-space-between align-center">
            Noves Peticions
            <v-btn v-if="teNotificacions" variant="text" size="x-small" color="grey-darken-3" @click="marcarComLlegides">Marcar com a vistes</v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-list class="pa-0 bg-white">
            <v-list-item v-for="noti in llistaNotificacions" :key="noti.id" class="pa-4 item-notificacio" @click="navegar('peticionsadmin')">
              <template v-slot:prepend><v-icon color="black" class="mr-3">mdi-school-outline</v-icon></template>
              <div>
                <div class="text-body-2 font-weight-bold text-black">{{ noti.centre }}</div>
                <div class="text-caption text-grey-darken-3">Vol fer el taller: <span class="font-weight-bold">{{ noti.taller }}</span></div>
              </div>
            </v-list-item>
          </v-list>
          <v-btn block variant="flat" color="black" class="text-white rounded-0 py-4" @click="navegar('peticionsadmin')">VEURE-LES TOTES</v-btn>
        </v-card>
      </v-menu>
    </header>

    <v-row class="mb-6">
      <v-col cols="12" md="4" v-for="card in [
        {t: 'Gestió de Tallers', d: 'Modificar el catàleg i places.', i: 'mdi-hammer-wrench', r: 'tallersadmin'},
        {t: 'Peticions i Assignació', d: 'Motor d\'assignació i checklists.', i: 'mdi-clipboard-list-outline', r: 'peticionsadmin'},
        {t: 'Informes i Mètriques', d: 'Exportar PDF/CSV i gràfics.', i: 'mdi-chart-bar', r: 'informesadmin'}
      ]" :key="card.t">
        <v-card variant="outlined" class="pa-6 text-center h-100 admin-card bg-white" @click="navegar(card.r)" hover>
          <v-icon size="48" color="black" class="mb-4">{{ card.i }}</v-icon>
          <h3 class="text-h6 font-weight-bold mb-3" style="color: black;">{{ card.t }}</h3>
          <p class="text-body-2 text-grey-darken-1">{{ card.d }}</p>
        </v-card>
      </v-col>
    </v-row>

    <section>
      <h2 class="text-h5 font-weight-bold mb-4" style="color: black;">Resum Global d'Activitat</h2>
      <v-card variant="flat" class="border-consorci bg-white overflow-hidden">
        <div v-for="(taller, index) in resumTallers" :key="taller.id" class="d-flex pa-4 align-center row-activity" :class="{ 'bg-row-alt': index % 2 === 0 }">
          <div class="text-subtitle-1 pr-8 font-weight-bold text-grey">{{ index + 1 }}</div>
          <div>
            <div class="font-weight-bold text-black">{{ taller.titol }}</div>
            <div class="text-caption text-grey-darken-1">{{ taller.estat }}</div>
          </div>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="black" icon="mdi-chevron-right" @click="navegar('tallersadmin')"></v-btn>
        </div>
        <div v-if="resumTallers.length === 0" class="pa-10 text-center text-grey">
          No hi ha activitat recent per mostrar.
        </div>
      </v-card>
    </section>
  </v-container>
</template>

<style scoped>
.admin-wrapper { min-height: 100vh; background-color: white; }
.bg-white { background-color: white !important; }
.text-black { color: black !important; }
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
