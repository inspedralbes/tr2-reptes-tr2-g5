<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const peticions = ref([])
const filtreTaller = ref('Tots els tallers')
const cercaCentre = ref('')
const dialogAssignar = ref(false)
const peticioSeleccionada = ref(null)
const professorsSeleccionats = ref([])

// Estado para controlar si el admin ha hecho clic en "Aceptar" dentro del diálogo
const peticioAcceptada = ref(false)

const llistaProfessors = ['Joan Font', 'Marta Garcia', 'Pere Soler', 'Anna Vila', 'Marc Gual', 'Laura Mas']

const carregarPeticions = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/peticions/admin')
    let dadesBackend = []
    
    if (res.ok) {
      dadesBackend = await res.json()
    }

    if (!dadesBackend || dadesBackend.length === 0) {
      peticions.value = [{
        _id: 'test-99',
        centreId: { nom: 'Institut de Prova ENGINY' },
        tallerId: { titol: 'Robòtica i IA' },
        estat: 'PENDENT',
        comentari: 'Aquest centre ha demanat que el taller sigui a la planta baixa.'
      }]
    } else {
      peticions.value = dadesBackend
    }
  } catch (e) {
    console.error("Error al carregar peticions:", e)
    peticions.value = [{
      _id: 'test-error',
      centreId: { nom: 'Centre de Prova (API Offline)' },
      tallerId: { titol: 'Taller de Disseny' },
      estat: 'PENDENT',
      comentari: 'Aquest és un comentari de prova.'
    }]
  }
}

onMounted(() => carregarPeticions())

const peticionsFiltrades = computed(() => {
  if (!peticions.value) return []
  return peticions.value.filter(p => {
    const centreNom = p.centreId?.nom || ''
    const tallerNom = p.tallerId?.titol || ''
    const coincideixTaller = filtreTaller.value === 'Tots els tallers' || tallerNom === filtreTaller.value
    const coincideixCentre = centreNom.toLowerCase().includes(cercaCentre.value.toLowerCase())
    return coincideixTaller && coincideixCentre
  })
})

const obrirAssignacio = (peticio) => {
  peticioSeleccionada.value = peticio
  professorsSeleccionats.value = []
  peticioAcceptada.value = false // Resetear al abrir
  dialogAssignar.value = true
}

// Nueva función para RECHAZAR directamente
const rebutjarPeticio = async () => {
  if (!confirm("Estàs segur que vols REBUTJAR aquesta petició?")) return

  try {
    // Simulación para test
    if (peticioSeleccionada.value._id.startsWith('test')) {
      alert("Petició rebutjada correctament (Simulació)");
      dialogAssignar.value = false;
      return;
    }

    const res = await fetch(`http://localhost:3000/api/peticions/${peticioSeleccionada.value._id}/estat`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estat: 'REBUTJADA' })
    })
    if (res.ok) {
      alert("Petició rebutjada")
      dialogAssignar.value = false
      carregarPeticions()
    }
  } catch (e) {
    alert("Error al rebutjar la petició")
  }
}

const confirmarAssignacio = async () => {
  if (professorsSeleccionats.value.length !== 2) {
    alert("Atenció: Cal seleccionar exactament 2 professors referents.")
    return
  }
  
  if (peticioSeleccionada.value._id.startsWith('test')) {
    alert("Assignació correcta i petició acceptada!");
    dialogAssignar.value = false;
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/assignacions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        peticioId: peticioSeleccionada.value._id,
        professorsIds: professorsSeleccionats.value,
        dataTaller: new Date(),
        estat: 'ASSIGNAT'
      })
    })
    if (!res.ok) throw new Error('Error en l\'assignació')
    alert("Assignació realitzada i petició acceptada")
    dialogAssignar.value = false
    carregarPeticions()
  } catch (e) {
    alert("Error al servidor")
  }
}

const getColorEstat = (estat) => {
  switch (estat) {
    case 'ASSIGNAT': return 'white'
    case 'PENDENT': return 'orange-darken-2'
    case 'REBUTJADA': return 'red-darken-2'
    case 'REVISANT': return 'blue-lighten-3'
    default: return 'grey'
  }
}
</script>

<template>
  <v-container class="admin-wrapper pa-10" fluid>
    <div class="d-flex align-center mb-8">
      <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.push('/admin/indexadmin')"></v-btn>
      <h1 class="text-h4 font-weight-bold" style="color: black;">Gestió de Peticions</h1>
    </div>

    <v-row class="mb-6" dense>
      <v-col cols="12" md="4">
        <v-text-field v-model="cercaCentre" placeholder="Cerca per centre..." variant="outlined" density="compact" prepend-inner-icon="mdi-magnify" color="black"></v-text-field>
      </v-col>
    </v-row>

    <v-card variant="flat" class="border-consorci bg-dark-table">
      <v-table class="bg-dark-table">
        <thead>
          <tr class="header-black">
            <th class="text-white text-left">CENTRE EDUCATIU</th>
            <th class="text-white text-center">TALLER</th>
            <th class="text-white text-center">COMENTARI</th> 
            <th class="text-white text-center">ESTAT</th>
            <th class="text-white text-center">GESTIÓ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in peticionsFiltrades" :key="p._id">
            <td class="font-weight-bold text-white">{{ p.centreId?.nom }}</td>
            <td class="text-center text-white">{{ p.tallerId?.titol }}</td>
            <td class="text-center">
              <v-tooltip v-if="p.comentari" location="top" max-width="300">
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props" variant="text" color="white" size="small"><v-icon>mdi-message-outline</v-icon></v-btn>
                </template>
                <div class="pa-2">{{ p.comentari }}</div>
              </v-tooltip>
              <span v-else class="text-grey">—</span>
            </td>
            <td class="text-center">
              <v-chip size="x-small" :color="getColorEstat(p.estat)" :class="p.estat === 'ASSIGNAT' ? 'text-black bg-white' : 'text-white'">
                {{ p.estat }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn icon="mdi-chevron-right" variant="text" color="white" @click="obrirAssignacio(p)"></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogAssignar" max-width="600" persistent>
      <v-card class="pa-5 rounded-lg bg-dark-dialog text-white">
        <v-card-title class="text-h5 font-weight-bold">Revisió de Petició</v-card-title>
        
        <v-card-text>
          <div class="mb-6">
            <p class="text-subtitle-1">Centre: <span class="text-blue-lighten-3 font-weight-bold">{{ peticioSeleccionada?.centreId?.nom }}</span></p>
            <p class="text-subtitle-1">Taller: <span class="white--text">{{ peticioSeleccionada?.tallerId?.titol }}</span></p>
          </div>

          <div v-if="!peticioAcceptada" class="d-flex justify-center gap-4 mb-6">
            <v-btn color="red-darken-3" class="flex-grow-1 mr-2" prepend-icon="mdi-close-circle" @click="rebutjarPeticio">
              REBUTJAR TALLER
            </v-btn>
            <v-btn color="green-darken-3" class="flex-grow-1 ml-2" prepend-icon="mdi-check-circle" @click="peticioAcceptada = true">
              ACCEPTAR TALLER
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-if="peticioAcceptada">
              <v-divider class="mb-4 border-opacity-25" color="white"></v-divider>
              <p class="mb-4 text-body-2 text-green-lighten-4">✓ Taller acceptat. Ara assigna els 2 professors:</p>
              <v-select 
                v-model="professorsSeleccionats" 
                :items="llistaProfessors" 
                label="Selecciona 2 Professors" 
                multiple chips closable-chips
                variant="outlined" color="white" theme="dark"
                persistent-hint :hint="`Seleccionats: ${professorsSeleccionats.length} de 2`"
              ></v-select>
            </div>
          </v-expand-transition>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="text" color="grey-lighten-1" @click="dialogAssignar = false">Tancar</v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            v-if="peticioAcceptada"
            :disabled="professorsSeleccionats.length !== 2"
            color="white" class="text-black px-8 font-weight-bold" 
            @click="confirmarAssignacio" variant="flat"
          >
            CONFIRMAR TALLER I PROFESSORS
          </v-btn>
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
.border-consorci { border: 1px solid rgba(0, 0, 0, 0.1) !important; border-radius: 8px; overflow: hidden; }
:deep(.v-table .v-table__wrapper > table > tbody > tr:hover) { background: transparent !important; }
</style>