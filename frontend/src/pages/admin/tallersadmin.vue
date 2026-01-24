<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter(); const API_URL = '/api/tallers'; const MAX_DESC = 300
const tallers = ref([])
const state = reactive({ dialog: false, dialogEdit: false, filter: 'Totes', form: {}, editIdx: -1 })

const initForm = () => ({ 
  titol: '', 
  descripcio: '', 
  durada: '', 
  places: '', 
  modalitat: '', 
  data: '', 
  ubicacio: '',
  capacitat_maxima: 0,
  places_disponibles: 0
})
state.form = initForm()

const apiCall = async (url, method = 'GET', body = null) => {
  try {
    const res = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : null })
    if (!res.ok) throw new Error(); return await res.json()
  } catch (e) { console.error(e); return null }
}

onMounted(async () => tallers.value = await apiCall(API_URL) || [])
const filtered = computed(() => state.filter === 'Totes' ? tallers.value : tallers.value.filter(t => t.modalitat === state.filter))

const guardar = async () => {
  if (state.form.descripcio.length > MAX_DESC) return
  const isEdit = state.dialogEdit
  const data = await apiCall(isEdit ? `${API_URL}/${state.form._id}` : API_URL, isEdit ? 'PUT' : 'POST', state.form)
  if (data) {
    isEdit ? tallers.value[state.editIdx] = data : tallers.value.push(data)
    state.dialog = state.dialogEdit = false; state.form = initForm()
  } else alert("Error al guardar")
}

const obrir = (t, i = -1) => { 
  state.form = { ...t }
  if (i >= 0) { 
    state.form.places = t.capacitat_maxima || t.places || ''
    state.editIdx = i
    state.dialogEdit = true 
  } else { 
    state.dialog = true 
  } 
}
const esborrar = async (id, i) => { if (confirm('Eliminar?')) await apiCall(`${API_URL}/${id}`, 'DELETE') && tallers.value.splice(i, 1) }

const getPlaces = (taller) => {
  return taller.places_disponibles ?? taller.capacitat_maxima ?? taller.places ?? 0
}
</script>

<template>
  <v-container class="admin-wrapper pa-10" fluid>
    <div class="d-flex justify-space-between align-start mb-6">
      <div class="d-flex align-center">
        <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.push('/admin/indexadmin')"/>
        <div><h1 class="text-h4 font-weight-bold" style="color: black;">Gestió de Tallers</h1><p class="text-grey-darken-1">Administra el catàleg oficial del programa ENGINY.</p></div>
      </div>
      <v-btn color="black" class="text-white mt-1" prepend-icon="mdi-plus" @click="obrir(initForm())">Afegir Taller</v-btn>
    </div>

    <v-row dense class="mb-6">
      <v-col cols="12" md="4">
        <v-select v-model="state.filter" :items="['Totes', 'Modalitat A', 'Modalitat B', 'Modalitat C']" label="Filtrar per Modalitat" variant="outlined" density="compact" color="black" class="filtre-superior" :menu-props="{ contentClass: 'custom-menu' }"/>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col v-for="(t, i) in filtered" :key="t._id" cols="12" sm="6" md="4">
        <v-card variant="flat" class="card-taller bg-white h-100 d-flex flex-column">
          <div class="header-black pa-3 d-flex justify-space-between align-center">
            <span class="text-white font-weight-bold text-caption">TALLER #{{ i + 1 }}</span>
            <v-chip size="x-small" variant="flat" color="white" class="text-black font-weight-bold">{{ t.modalitat }}</v-chip>
          </div>

          <v-card-text class="flex-grow-1 pa-5">
            <div class="font-weight-bold text-h6 text-black mb-1 line-clamp-1">{{ t.titol }}</div>
            <div class="d-flex align-center text-caption text-primary font-weight-bold mb-3">
              <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
              {{ t.ubicacio || 'Ubicació no definida' }}
            </div>
            
            <div class="text-body-2 text-grey-darken-1 mb-4">{{ t.descripcio }}</div>
            
            <v-divider class="mb-4"></v-divider>
            
            <v-row dense class="text-center">
              <v-col cols="4">
                <div class="text-overline text-grey-lighten-1" style="line-height: 1rem">DATA</div>
                <div class="text-caption font-weight-bold">{{ t.data }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-overline text-grey-lighten-1" style="line-height: 1rem">DURADA</div>
                <div class="text-caption font-weight-bold">{{ t.durada }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-overline text-grey-lighten-1" style="line-height: 1rem">PLACES</div>
                <div class="text-caption font-weight-bold">
                  {{ t.places_disponibles ?? t.capacitat_maxima ?? 0 }} / {{ t.capacitat_maxima ?? 0 }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="justify-end px-4 py-2 bg-grey-lighten-5">
            <v-btn variant="text" icon="mdi-pencil-outline" color="black" @click="obrir(t, i)"/>
            <v-btn variant="text" icon="mdi-trash-can-outline" color="red" @click="esborrar(t._id, i)"/>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" v-if="!filtered.length" class="text-center pa-10 text-grey-darken-1">
        No existeix cap taller de tipus <strong>{{ state.filter }}</strong>.
      </v-col>
    </v-row>

    <v-dialog v-model="state.dialog" max-width="600px" persistent>
      <v-card class="pa-6 rounded-lg bg-custom-dark">
        <v-card-title class="text-h5 font-weight-bold text-white">Nou Taller</v-card-title>
        <v-card-text>
          <v-text-field v-model="state.form.titol" label="Títol" variant="outlined" color="white" class="custom-input mb-2"/>
          <v-text-field v-model="state.form.ubicacio" label="Ubicació (Centre, Aula...)" variant="outlined" color="white" prepend-inner-icon="mdi-map-marker" class="custom-input mb-2"/>
          <v-textarea v-model="state.form.descripcio" label="Descripció" variant="outlined" color="white" class="custom-input mb-2" :counter="MAX_DESC" rows="3" no-resize/>
          <v-row>
            <v-col cols="12"><v-text-field v-model="state.form.data" label="Data del Taller" type="date" variant="outlined" color="white" class="custom-input"/></v-col> 
            <v-col cols="6"><v-text-field v-model="state.form.durada" label="Durada" variant="outlined" color="white" class="custom-input"/></v-col>
            <v-col cols="6"><v-text-field v-model="state.form.places" label="Places" type="number" variant="outlined" color="white" class="custom-input"/></v-col>
          </v-row>
          <v-select v-model="state.form.modalitat" :items="['Modalitat A', 'Modalitat B', 'Modalitat C']" label="Modalitat" variant="outlined" color="white" class="custom-input" :menu-props="{ contentClass: 'custom-menu' }"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn variant="text" color="white" @click="state.dialog = false">Cancel·lar</v-btn>
          <v-btn color="white" class="text-black px-6" variant="flat" @click="guardar">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="state.dialogEdit" max-width="600px" persistent>
      <v-card class="pa-6 rounded-lg bg-custom-dark">
        <v-card-title class="text-h5 font-weight-bold text-white d-flex align-center">
          <v-icon class="mr-2">mdi-pencil-box-outline</v-icon> Editar Taller
        </v-card-title>
        <v-card-text class="mt-4">
          <v-text-field v-model="state.form.titol" label="Títol" variant="outlined" color="white" class="custom-input mb-2"/>
          <v-text-field v-model="state.form.ubicacio" label="Ubicació" variant="outlined" color="white" prepend-inner-icon="mdi-map-marker" class="custom-input mb-2"/>
          <v-textarea v-model="state.form.descripcio" label="Descripció" variant="outlined" color="white" class="custom-input mb-2" :counter="MAX_DESC" rows="3" no-resize/>
          <v-row>
            <v-col cols="12"><v-text-field v-model="state.form.data" label="Data" type="date" variant="outlined" color="white" class="custom-input"/></v-col> 
            <v-col cols="6"><v-text-field v-model="state.form.durada" label="Durada" variant="outlined" color="white" class="custom-input"/></v-col>
            <v-col cols="6">
              <v-text-field 
                v-model="state.form.places" 
                label="Capacitat Total" 
                type="number" 
                variant="outlined" 
                color="white" 
                class="custom-input"
                hint="Canviar la capacitat no afecta les reserves ja fetes"
                persistent-hint
              />
            </v-col>
          </v-row>
          <v-select v-model="state.form.modalitat" :items="['Modalitat A', 'Modalitat B', 'Modalitat C']" label="Modalitat" variant="outlined" color="white" class="custom-input" :menu-props="{ contentClass: 'custom-menu' }"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn variant="text" color="white" @click="state.dialogEdit = false">Cancel·lar</v-btn>
          <v-btn color="white" class="text-black px-6 font-weight-bold" variant="flat" @click="guardar">GUARDAR CANVIS</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.admin-wrapper { min-height: 100vh; background-color: #f5f5f5; }
.header-black { background-color: black !important; }

.card-taller { 
  border: 1px solid rgba(0, 0, 0, 0.08) !important; 
  border-radius: 12px; 
  overflow: hidden;
  transition: all 0.3s ease;
}
.card-taller:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0,0,0,0.1) !important;
}

.bg-custom-dark { background-color: #1e1e1e !important; }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

:deep(.custom-input .v-field__input), :deep(.custom-input .v-select__selection-text) { color: white !important; }
:deep(.custom-input .v-label) { color: rgba(255, 255, 255, 0.9) !important; }
:deep(.custom-input .v-counter) { color: rgba(255, 255, 255, 0.6) !important; }
:deep(.custom-input .v-messages) { color: rgba(255, 255, 255, 0.7) !important; }
:deep(.filtre-superior .v-select__selection-text) { color: #333 !important; font-weight: 500; }
</style>