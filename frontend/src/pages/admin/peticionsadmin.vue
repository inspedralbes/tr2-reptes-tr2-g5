<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter(); const peticions = ref([])
const state = reactive({ filter: 'Tots els tallers', search: '', dialog: false, selected: null, profs: [], accepted: false })
const colors = { ASSIGNAT: 'white', PENDENT: 'orange-darken-2', REBUTJADA: 'red-darken-2', REVISANT: 'blue-lighten-3' }
const llistaProfessors = ['Joan Font', 'Marta Garcia', 'Pere Soler', 'Anna Vila', 'Marc Gual', 'Laura Mas']

const carregar = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/peticions/admin')
    peticions.value = (res.ok ? await res.json() : [])
    if (!peticions.value.length) throw new Error()
  } catch {
    peticions.value = [{ _id: 'test-99', centreId: { nom: 'Institut Prova' }, tallerId: { titol: 'Robòtica' }, estat: 'PENDENT', comentari: 'Mock data' }]
  }
}
onMounted(carregar)

const filtered = computed(() => peticions.value.filter(p => (state.filter === 'Tots els tallers' || p.tallerId?.titol === state.filter) && (p.centreId?.nom || '').toLowerCase().includes(state.search.toLowerCase())))

const obrir = (p) => { state.selected = p; state.profs = []; state.accepted = false; state.dialog = true }

const accio = async (tipus) => {
  if (tipus === 'REBUTJAR' && !confirm("Estàs segur que vols REBUTJAR aquesta petició?")) return
  if (tipus === 'ASSIGNAR' && state.profs.length !== 2) return alert("Atenció: Cal seleccionar exactament 2 professors referents.")
  
  if (state.selected._id.startsWith('test')) { alert(`Simulació: ${tipus}`); state.dialog = false; return }
  const url = tipus === 'REBUTJAR' ? `peticions/${state.selected._id}/estat` : 'assignacions'
  const body = tipus === 'REBUTJAR' ? { estat: 'REBUTJADA' } : { peticioId: state.selected._id, professorsIds: state.profs, dataTaller: new Date(), estat: 'ASSIGNAT' }
  
  try {
    await fetch(`http://localhost:3000/api/${url}`, { method: tipus === 'REBUTJAR' ? 'PATCH' : 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) })
    alert(tipus === 'REBUTJAR' ? "Petició rebutjada" : "Assignació realitzada"); state.dialog = false; carregar()
  } catch { alert("Error al servidor") }
}
</script>

<template>
  <v-container class="admin-wrapper pa-10" fluid>
    <div class="d-flex align-center mb-8">
      <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.push('/admin/indexadmin')"/>
      <h1 class="text-h4 font-weight-bold" style="color: black;">Gestió de Peticions</h1>
    </div>
    <v-row dense class="mb-6"><v-col cols="12" md="4"><v-text-field v-model="state.search" placeholder="Cerca per centre..." variant="outlined" density="compact" prepend-inner-icon="mdi-magnify" color="black"/></v-col></v-row>

    <v-card variant="flat" class="border-consorci bg-dark-table">
      <v-table class="bg-dark-table">
        <thead><tr class="header-black"><th class="text-white text-left">CENTRE EDUCATIU</th><th class="text-white text-center">TALLER</th><th class="text-white text-center">COMENTARI</th><th class="text-white text-center">ESTAT</th><th class="text-white text-center">GESTIÓ</th></tr></thead>
        <tbody>
          <tr v-for="p in filtered" :key="p._id">
            <td class="font-weight-bold text-white">{{ p.centreId?.nom }}</td><td class="text-center text-white">{{ p.tallerId?.titol }}</td>
            <td class="text-center">
              <v-tooltip v-if="p.comentari" location="top" max-width="300"><template v-slot:activator="{ props }"><v-btn icon v-bind="props" variant="text" color="white" size="small"><v-icon>mdi-message-outline</v-icon></v-btn></template><div class="pa-2">{{ p.comentari }}</div></v-tooltip>
              <span v-else class="text-grey">—</span>
            </td>
            <td class="text-center"><v-chip size="x-small" :color="colors[p.estat] || 'grey'" :class="p.estat === 'ASSIGNAT' ? 'text-black bg-white' : 'text-white'">{{ p.estat }}</v-chip></td>
            <td class="text-center"><v-btn icon="mdi-chevron-right" variant="text" color="white" @click="obrir(p)"/></td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="state.dialog" max-width="600" persistent>
      <v-card class="pa-5 rounded-lg bg-dark-dialog text-white">
        <v-card-title class="text-h5 font-weight-bold">Revisió de Petició</v-card-title>
        <v-card-text>
          <div class="mb-6"><p class="text-subtitle-1">Centre: <span class="text-blue-lighten-3 font-weight-bold">{{ state.selected?.centreId?.nom }}</span></p><p class="text-subtitle-1">Taller: <span class="white--text">{{ state.selected?.tallerId?.titol }}</span></p></div>
          <div v-if="!state.accepted" class="d-flex justify-center gap-4 mb-6">
            <v-btn color="red-darken-3" class="flex-grow-1 mr-2" prepend-icon="mdi-close-circle" @click="accio('REBUTJAR')">REBUTJAR TALLER</v-btn>
            <v-btn color="green-darken-3" class="flex-grow-1 ml-2" prepend-icon="mdi-check-circle" @click="state.accepted = true">ACCEPTAR TALLER</v-btn>
          </div>
          <v-expand-transition><div v-if="state.accepted">
            <v-divider class="mb-4 border-opacity-25" color="white"/>
            <p class="mb-4 text-body-2 text-green-lighten-4">✓ Taller acceptat. Ara assigna els 2 professors:</p>
            <v-select v-model="state.profs" :items="llistaProfessors" label="Selecciona 2 Professors" multiple chips closable-chips variant="outlined" color="white" theme="dark" persistent-hint :hint="`Seleccionats: ${state.profs.length} de 2`"/>
          </div></v-expand-transition>
        </v-card-text>
        <v-card-actions><v-btn variant="text" color="grey-lighten-1" @click="state.dialog = false">Tancar</v-btn><v-spacer/>
          <v-btn v-if="state.accepted" :disabled="state.profs.length !== 2" color="white" class="text-black px-8 font-weight-bold" @click="accio('ASSIGNAR')" variant="flat">CONFIRMAR</v-btn>
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