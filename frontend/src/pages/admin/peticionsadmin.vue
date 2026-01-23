<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const peticions = ref([])
const llistaTallers = ref([])

const state = reactive({
  filterStatus: 'ACTIVES', 
  subFilter: 'PENDENTS', 
  selectedTallerFilter: 'Tots els tallers', 
  searchInstitut: '',
  dialog: false,
  selected: null,
  selectedTaller: null,
  accepted: false,
  placesAssignades: null
})

const colors = {
  ASSIGNAT: 'teal-darken-1',
  PENDENT: 'orange-darken-2',
  REBUTJADA: 'red-darken-2',
}

const opcionesFiltroTallers = computed(() => {
  const nombres = llistaTallers.value.map(t => t.titol)
  return ['Tots els tallers', ...nombres]
})

const carregarDades = async () => {
  try {
    const [resP, resT] = await Promise.all([
      fetch('/api/peticions/admin'),
      fetch('/api/tallers')
    ])
    if (resP.ok) peticions.value = await resP.json()
    if (resT.ok) llistaTallers.value = await resT.json()
  } catch (error) { 
    console.error("Error carregar dades:", error) 
  }
}

onMounted(carregarDades)

const groupedData = computed(() => {
  let filteredList = peticions.value.filter(p => {
    const nomCentre = (p.centreId?.nom || p.nom_centre || '').toLowerCase()
    const nomTaller = p.taller_titol || p.tallerId?.titol || ''
    const coincideixInstitut = nomCentre.includes(state.searchInstitut.toLowerCase())
    const coincideixTaller = state.selectedTallerFilter === 'Tots els tallers' || nomTaller === state.selectedTallerFilter
    
    if (state.filterStatus === 'REBUTJADES') {
      return p.estat === 'REBUTJADA' && coincideixInstitut && coincideixTaller
    } else {
      if (p.estat === 'REBUTJADA') return false
      if (state.subFilter === 'PENDENTS') return p.estat === 'PENDENT' && coincideixInstitut && coincideixTaller
      if (state.subFilter === 'ASSIGNATS') return p.estat === 'ASSIGNAT' && coincideixInstitut && coincideixTaller
      return coincideixInstitut && coincideixTaller
    }
  })

  // ORDENACIÓ FIFO: El més antic primer
  filteredList.sort((a, b) => new Date(a.data_creacio) - new Date(b.data_creacio))

  const groups = {}
  filteredList.forEach(p => {
    const tNom = p.taller_titol || p.tallerId?.titol || 'Sense Taller'
    if (!groups[tNom]) groups[tNom] = []
    groups[tNom].push(p)
  })
  return groups
})

const obrir = (p) => {
  state.selected = p
  state.selectedTaller = null
  state.accepted = false
  state.placesAssignades = p.seleccio_tallers?.num_alumnes
  state.dialog = true
}

const accio = async (tipus) => {
  const url = `/api/peticions/${state.selected._id}/estat`
  let body = {}
  
  if (tipus === 'REBUTJAR') {
    body = { estat: 'REBUTJADA' }
  } else {
    body = { 
      estat: 'ASSIGNAT', 
      tallerIdDefinitiu: state.selectedTaller, 
      num_alumnes_final: state.placesAssignades 
    }
  }
    
  try {
    const res = await fetch(url, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    })
    
    if (res.ok) { 
      state.dialog = false
      carregarDades() 
      alert("Operació realitzada amb èxit")
    }
  } catch (e) { 
    console.error("Error:", e)
  }
}
</script>

<template>
  <v-container class="admin-wrapper pa-6" fluid>
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.push('/admin/indexadmin')"/>
      <h1 class="text-h4 font-weight-bold text-black">Gestió de Peticions</h1>
      <v-spacer />
    </div>

    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <label class="text-overline font-weight-bold text-black">Filtrar per Taller</label>
        <v-select v-model="state.selectedTallerFilter" :items="opcionesFiltroTallers" variant="outlined" density="comfortable" bg-color="white" hide-details rounded="lg" />
      </v-col>
      <v-col cols="12" md="4">
        <label class="text-overline font-weight-bold text-black">Cerca Institut</label>
        <v-text-field v-model="state.searchInstitut" placeholder="Escriu el centre..." variant="outlined" density="comfortable" prepend-inner-icon="mdi-school" bg-color="white" hide-details rounded="lg"/>
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-end justify-end pb-1">
        <v-btn-toggle v-model="state.filterStatus" mandatory variant="flat" class="custom-toggle border">
          <v-btn value="ACTIVES" class="px-6">ACTIVES</v-btn>
          <v-btn value="REBUTJADES" class="px-6">REBUTJADES</v-btn>
          <v-btn prepend-icon="mdi-account-star" @click="router.push('/admin/gestiorepresentants')">REPRESENTANTS</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <div v-if="state.filterStatus === 'ACTIVES'" class="mb-8 d-flex gap-2">
      <v-btn :variant="state.subFilter === 'PENDENTS' ? 'flat' : 'outlined'" color="orange-darken-3" rounded="pill" @click="state.subFilter = 'PENDENTS'">PENDENTS</v-btn>
      <v-btn :variant="state.subFilter === 'ASSIGNATS' ? 'flat' : 'outlined'" color="teal-darken-2" rounded="pill" @click="state.subFilter = 'ASSIGNATS'">ASSIGNATS</v-btn>
      <v-btn :variant="state.subFilter === 'TOTS' ? 'flat' : 'outlined'" color="black" rounded="pill" @click="state.subFilter = 'TOTS'">TOTS</v-btn>
    </div>

    <div v-for="(peticionsTaller, tallerNom) in groupedData" :key="tallerNom" class="mb-12">
      <h2 class="text-h5 font-weight-black mb-4 border-bottom pb-2 text-black">{{ tallerNom }}</h2>
      <v-row>
        <v-col v-for="p in peticionsTaller" :key="p._id" cols="12" sm="6" md="4">
          <v-card class="rounded-xl card-peticio" elevation="1" border>
            <v-card-text class="pa-5">
              <div class="d-flex justify-space-between align-center mb-4">
                <span class="text-subtitle-1 font-weight-bold text-truncate text-black">{{ p.nom_centre }}</span>
                <v-chip size="x-small" :color="colors[p.estat]" class="text-white font-weight-bold">{{ p.estat }}</v-chip>
              </div>

              <div class="text-body-2 font-weight-bold text-indigo-darken-4 mb-4">
                <v-icon size="small" class="mr-1">mdi-hammer-wrench</v-icon>
                {{ p.taller_titol || 'Pendent de carregar' }}
              </div>

              <div class="d-flex justify-space-between align-end">
                <div class="text-caption text-grey-darken-1">
                  <div><strong>Coordinador/a:</strong> {{ p.coordinador?.nom || 'No assignat' }}</div>
                  <div><strong>Referent:</strong> {{ p.referent_contacte?.nom }}</div>
                  <div class="mt-1 text-indigo-darken-3 font-weight-bold d-flex align-center">
                    <v-icon size="x-small" class="mr-1">mdi-clock-outline</v-icon>
                    {{ p.data_creacio ? new Date(p.data_creacio).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }) : 'Sense hora' }}
                  </div>
                </div>
                <v-btn icon="mdi-plus" variant="flat" color="black" size="small" class="text-white" @click="obrir(p)"></v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-dialog v-model="state.dialog" max-width="600">
      <v-card class="rounded-xl overflow-hidden" v-if="state.selected">
        <v-card-title class="pa-6 bg-black text-white">Detalls de la Sol·licitud</v-card-title>
        
        <v-card-text class="pa-6 bg-grey-lighten-4 text-black">
          <v-row dense>
            <v-col cols="12" class="mb-4">
              <v-card variant="flat" class="pa-4 rounded-lg border">
                <label class="text-overline text-grey-darken-1 d-block mb-1">Nivell d'Interès</label>
                <v-chip :color="state.selected.nivell_interes === 'Alt' ? 'red-darken-1' : 'amber-darken-3'" variant="flat" class="text-white font-weight-black">
                  {{ state.selected.nivell_interes }}
                </v-chip>
              </v-card>
            </v-col>

            <v-col cols="12">
              <label class="text-overline text-grey">TALLER SOL·LICITAT PEL CENTRE</label>
              <div class="text-h6 font-weight-black text-indigo-darken-4 mb-4">
                {{ state.selected.taller_titol || 'No especificat' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <label class="text-overline text-grey">INSTITUT</label>
              <div class="text-body-1 font-weight-bold">{{ state.selected.nom_centre }}</div>
              <div class="text-caption text-indigo-darken-2 mb-4">
                Rebuda: {{ state.selected.data_creacio ? new Date(state.selected.data_creacio).toLocaleString('ca-ES') : '--' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <label class="text-overline text-grey">ALUMNES</label>
              <div class="text-body-1 font-weight-bold mb-4">{{ state.selected.seleccio_tallers?.num_alumnes }} alumnes</div>
            </v-col>
            
            <v-col cols="12" md="6">
              <label class="text-overline text-grey">COORDINADOR/A GENERAL</label>
              <div class="text-body-2 font-weight-bold">{{ state.selected.coordinador?.nom || 'No indicat' }}</div>
              <div class="text-caption text-grey-darken-2">{{ state.selected.coordinador?.email }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <label class="text-overline text-grey">PROFESSOR/A REFERENT</label>
              <div class="text-body-2 font-weight-bold">{{ state.selected.referent_contacte?.nom }}</div>
              <div class="text-caption text-grey-darken-2">{{ state.selected.referent_contacte?.correu }}</div>
            </v-col>
          </v-row> 

          <v-divider class="my-6"></v-divider>
          
          <div v-if="state.selected.estat === 'PENDENT'">
            <div v-if="!state.accepted" class="d-flex gap-2">
              <v-btn color="red-darken-2" variant="tonal" class="flex-grow-1" @click="accio('REBUTJAR')" prepend-icon="mdi-close">REBUTJAR</v-btn>
              <v-btn color="green-darken-2" class="flex-grow-1 text-white" @click="state.accepted = true" prepend-icon="mdi-check">ACCEPTAR</v-btn>
            </div>
            <div v-else class="bg-white pa-4 rounded-lg border">
              <v-select 
                v-model="state.selectedTaller" 
                :items="llistaTallers" 
                item-title="titol" 
                item-value="_id" 
                label="Confirma taller definitiu" 
                variant="outlined"
              ></v-select>
              <v-btn block color="black" class="text-white mt-2" @click="accio('ASSIGNAR')">FINALITZAR ASSIGNACIÓ</v-btn>
              <v-btn block variant="text" size="small" @click="state.accepted = false">Enrere</v-btn>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4 bg-white border-top">
          <v-spacer/>
          <v-btn variant="text" @click="state.dialog = false">TANCAR</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.admin-wrapper { min-height: 100vh; background-color: #f5f5f5; }
.card-peticio { transition: all 0.2s; background: white; }
.card-peticio:hover { border-color: #000 !important; transform: translateY(-2px); }
.border-bottom { border-bottom: 2px solid #e0e0e0; }
.gap-2 { gap: 12px; }
.custom-toggle { height: 44px; border-radius: 8px !important; }
.v-btn--active { background-color: black !important; color: white !important; }
</style>