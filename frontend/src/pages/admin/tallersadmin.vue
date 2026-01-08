<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter(); const API_URL = 'http://localhost:3000/api/tallers'; const MAX_DESC = 300
const tallers = ref([])
const state = reactive({ dialog: false, dialogEdit: false, filter: 'Totes', form: {}, editIdx: -1 })
const initForm = () => ({ titol: '', descripcio: '', durada: '', places: '', modalitat: '' })
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
  const data = await apiCall(state.dialogEdit ? `${API_URL}/${state.form._id}` : API_URL, state.dialogEdit ? 'PUT' : 'POST', state.form)
  if (data) {
    state.dialogEdit ? tallers.value[state.editIdx] = data : tallers.value.push(data)
    state.dialog = state.dialogEdit = false; state.form = initForm()
  } else alert("Error al guardar")
}

const obrir = (t, i = -1) => { state.form = { ...t }; if (i >= 0) { state.editIdx = i; state.dialogEdit = true } else state.dialog = true }
const esborrar = async (id, i) => { if (confirm('Eliminar?')) await apiCall(`${API_URL}/${id}`, 'DELETE') && tallers.value.splice(i, 1) }
</script>

<template>
  <v-container class="admin-wrapper pa-10" fluid>
    <div class="d-flex justify-space-between align-start mb-4">
      <div class="d-flex align-center">
        <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.push('/admin/indexadmin')"/>
        <div><h1 class="text-h4 font-weight-bold" style="color: black;">Gestió de Tallers</h1><p class="text-grey-darken-1">Administra el catàleg oficial del programa ENGINY.</p></div>
      </div>
      <v-btn color="black" class="text-white mt-1" prepend-icon="mdi-plus" @click="obrir(initForm())">Afegir Taller</v-btn>
    </div>
    <v-row dense class="mb-2"><v-col cols="12" md="4">
      <v-select v-model="state.filter" :items="['Totes', 'Modalitat A', 'Modalitat B', 'Modalitat C']" label="Filtrar per Modalitat" variant="outlined" density="compact" color="black" class="filtre-superior" :menu-props="{ contentClass: 'custom-menu' }"/>
    </v-col></v-row>
    
    <v-card variant="flat" class="border-consorci bg-white">
      <v-table class="bg-white">
        <thead><tr class="header-black"><th class="text-white text-center">ID</th><th class="text-white text-left">TÍTOL / DESCRIPCIÓ</th><th class="text-white text-center">DURADA</th><th class="text-white text-center">PLACES</th><th class="text-white text-center">MODALITAT</th><th class="text-white text-center">ACCIONS</th></tr></thead>
        <tbody>
          <tr v-for="(t, i) in filtered" :key="t._id">
            <td class="text-center font-weight-bold text-grey">{{ i + 1 }}</td>
            <td class="text-left py-4"><div class="font-weight-bold text-black">{{ t.titol }}</div><div class="text-caption text-grey-darken-1">{{ t.descripcio }}</div></td>
            <td class="text-center">{{ t.durada }}</td><td class="text-center">{{ t.places }}</td>
            <td class="text-center"><v-chip size="small" variant="outlined">{{ t.modalitat }}</v-chip></td>
            <td class="text-center"><v-btn variant="text" icon="mdi-pencil-outline" color="black" @click="obrir(t, i)"/><v-btn variant="text" icon="mdi-trash-can-outline" color="red" @click="esborrar(t._id, i)"/></td>
          </tr>
          <tr v-if="!filtered.length"><td colspan="6" class="text-center pa-10 text-grey-darken-1">No existeix cap taller de tipus <strong>{{ state.filter }}</strong>.</td></tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="state.dialog" max-width="600px" persistent>
      <v-card class="pa-6 rounded-lg bg-custom-dark">
        <v-card-title class="text-h5 font-weight-bold text-white">Nou Taller</v-card-title>
        <v-card-text>
          <v-text-field v-model="state.form.titol" label="Títol" variant="outlined" color="white" class="custom-input mb-2"/>
          <v-textarea v-model="state.form.descripcio" label="Descripció" variant="outlined" color="white" class="custom-input mb-2" :counter="MAX_DESC" rows="5" no-resize/>
          <v-row><v-col><v-text-field v-model="state.form.durada" label="Durada" variant="outlined" color="white" class="custom-input"/></v-col><v-col><v-text-field v-model="state.form.places" label="Places" type="number" variant="outlined" color="white" class="custom-input"/></v-col></v-row>
          <v-select v-model="state.form.modalitat" :items="['Modalitat A', 'Modalitat B', 'Modalitat C']" label="Modalitat" variant="outlined" color="white" class="custom-input" :menu-props="{ contentClass: 'custom-menu' }"/>
        </v-card-text>
        <v-card-actions><v-spacer/><v-btn variant="text" color="white" @click="state.dialog = false">Cancel·lar</v-btn><v-btn color="white" class="text-black px-6" variant="flat" @click="guardar">Crear</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="state.dialogEdit" fullscreen>
      <v-card>
        <v-toolbar color="black" dark><v-btn icon @click="state.dialogEdit = false"><v-icon color="white">mdi-close</v-icon></v-btn><v-toolbar-title class="text-white">Editar Taller</v-toolbar-title><v-spacer/><v-btn variant="text" class="text-white" @click="guardar">GUARDAR CANVIS</v-btn></v-toolbar>
        <v-container class="pa-10">
          <v-text-field v-model="state.form.titol" label="Títol" variant="outlined" color="black"/>
          <v-textarea v-model="state.form.descripcio" label="Descripció" variant="outlined" color="black" :counter="MAX_DESC" rows="5" no-resize/>
          <v-row class="mt-2"><v-col><v-text-field v-model="state.form.durada" label="Durada" variant="outlined" color="black"/></v-col><v-col><v-text-field v-model="state.form.places" label="Places" type="number" variant="outlined" color="black"/></v-col><v-col><v-select v-model="state.form.modalitat" :items="['Modalitat A', 'Modalitat B', 'Modalitat C']" label="Modalitat" variant="outlined" color="black"/></v-col></v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.admin-wrapper { min-height: 100vh; background-color: white; }
.header-black { background-color: black !important; }
.border-consorci { border: 1px solid rgba(0, 0, 0, 0.1) !important; border-radius: 8px; overflow: hidden; }
.bg-custom-dark { background-color: #1e1e1e !important; }
:deep(.custom-input .v-field__input), :deep(.custom-input .v-select__selection-text) { color: white !important; }
:deep(.custom-input .v-label) { color: rgba(255, 255, 255, 0.9) !important; }
:deep(.custom-input .v-counter) { color: rgba(255, 255, 255, 0.6) !important; }
:deep(.filtre-superior .v-select__selection-text) { color: #333 !important; font-weight: 500; }
</style>
<style>.custom-menu .v-list { background-color: #2c2c2c !important; color: white !important; } .custom-menu .v-list-item--active { background-color: #444 !important; } .custom-menu .v-list-item-title { color: white !important; }</style>