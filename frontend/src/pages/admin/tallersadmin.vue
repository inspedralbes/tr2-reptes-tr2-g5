<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter() 
const API_URL = 'http://localhost:3000/api/tallers'
const tallersid = ref([])
const dialog = ref(false)
const dialogEdit = ref(false)
const filtreModalitat = ref('Totes')

const MAX_DESC = 300 

const nouTaller = ref({ titol: '', descripcio: '', durada: '', places: '', modalitat: '' })
const tallerEditant = ref({ index: -1, data: { _id: '', titol: '', descripcio: '', durada: '', places: '', modalitat: '' } })

const carregarTallers = async () => {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error('Error al carregar tallers')
    const data = await res.json()
    tallersid.value = data
  } catch (e) {
    console.error("Error al carregar:", e)
  }
}

onMounted(carregarTallers)

const tallersFiltrats = computed(() => {
  if (filtreModalitat.value === 'Totes') return tallersid.value
  return tallersid.value.filter(t => t.modalitat === filtreModalitat.value)
})

const guardarTaller = async () => {
  if (nouTaller.value.descripcio.length > MAX_DESC) return
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nouTaller.value)
    })
    if (!res.ok) throw new Error('Error al guardar')
    const data = await res.json()
    tallersid.value.push(data)
    dialog.value = false
    nouTaller.value = { titol: '', descripcio: '', durada: '', places: '', modalitat: '' }
  } catch (e) {
    alert("Error al crear taller")
  }
}

const obrirEditor = (taller, index) => {
  tallerEditant.value = { index, data: { ...taller } }
  dialogEdit.value = true
}

const actualizarTaller = async () => {
  try {
    const id = tallerEditant.value.data._id
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tallerEditant.value.data)
    })
    if (!res.ok) throw new Error('Error al actualitzar')
    const data = await res.json()
    tallersid.value[tallerEditant.value.index] = data
    dialogEdit.value = false
  } catch (e) {
    alert("Error al actualitzar")
  }
}

const borrarTaller = async (id, index) => {
  if (confirm('Eliminar taller?')) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      tallersid.value.splice(index, 1)
    } catch (e) {
      alert("Error al eliminar")
    }
  }
}
</script>

<template>
  <v-container class="admin-wrapper pa-10" fluid>
    <div class="d-flex justify-space-between align-start mb-4">
      <div class="d-flex align-center">
        <v-btn 
          icon="mdi-arrow-left" 
          variant="text" 
          color="black" 
          class="mr-4" 
          @click="router.push('/admin/indexadmin')"
        ></v-btn>
        <div>
          <h1 class="text-h4 font-weight-bold mb-1" style="color: black;">Gestió de Tallers</h1>
          <p class="text-subtitle-1 text-grey-darken-1">Administra el catàleg oficial del programa ENGINY.</p>
        </div>
      </div>
      <v-btn color="black" class="text-white mt-1" prepend-icon="mdi-plus" @click="dialog = true">Afegir Taller</v-btn>
    </div>

    <v-row class="mb-2" dense>
      <v-col cols="12" md="4">
        <v-select 
          v-model="filtreModalitat" 
          label="Filtrar per Modalitat" 
          :items="['Totes', 'Modalitat A', 'Modalitat B', 'Modalitat C']" 
          variant="outlined" 
          density="compact" 
          color="black"
          class="filtre-superior"
          :menu-props="{ contentClass: 'custom-menu' }"
        ></v-select>
      </v-col>
    </v-row>

    <v-card variant="flat" class="border-consorci bg-white">
      <v-table class="bg-white">
        <thead>
          <tr class="header-black">
            <th class="text-white text-center">ID</th>
            <th class="text-white text-left">TÍTOL / DESCRIPCIÓ</th>
            <th class="text-white text-center">DURADA</th>
            <th class="text-white text-center">PLACES</th>
            <th class="text-white text-center">MODALITAT</th>
            <th class="text-white text-center">ACCIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(taller, i) in tallersFiltrats" :key="taller._id">
            <td class="text-center font-weight-bold text-grey">{{ i + 1 }}</td>
            <td class="text-left py-4">
              <div class="font-weight-bold text-black">{{ taller.titol }}</div>
              <div class="text-caption text-grey-darken-1">{{ taller.descripcio }}</div>
            </td>
            <td class="text-center">{{ taller.durada }}</td>
            <td class="text-center">{{ taller.places }}</td>
            <td class="text-center"><v-chip size="small" variant="outlined">{{ taller.modalitat }}</v-chip></td>
            <td class="text-center">
              <v-btn variant="text" icon="mdi-pencil-outline" color="black" @click="obrirEditor(taller, i)"></v-btn>
              <v-btn variant="text" icon="mdi-trash-can-outline" color="red" @click="borrarTaller(taller._id, i)"></v-btn>
            </td>
          </tr>

          <tr v-if="tallersFiltrats.length === 0">
            <td colspan="6" class="text-center pa-10 text-grey-darken-1">
              <v-icon icon="mdi-alert-circle-outline" class="mr-2"></v-icon>
              No existeix cap taller de tipus <strong>{{ filtreModalitat }}</strong>.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card class="pa-6 rounded-lg bg-custom-dark">
        <v-card-title class="text-h5 font-weight-bold text-white">Nou Taller</v-card-title>
        <v-card-text>
          <v-text-field v-model="nouTaller.titol" label="Títol" variant="outlined" color="white" class="custom-input mb-2"></v-text-field>
          <v-textarea 
            v-model="nouTaller.descripcio" 
            label="Descripció" 
            variant="outlined" 
            color="white" 
            class="custom-input descripcio-fixa mb-2"
            :counter="MAX_DESC"
            :maxlength="MAX_DESC"
            persistent-counter
            no-resize
            rows="5"
          ></v-textarea>
          <v-row>
            <v-col><v-text-field v-model="nouTaller.durada" label="Durada" variant="outlined" color="white" class="custom-input"></v-text-field></v-col>
            <v-col><v-text-field v-model="nouTaller.places" label="Places" type="number" variant="outlined" color="white" class="custom-input"></v-text-field></v-col>
          </v-row>
          <v-select 
            v-model="nouTaller.modalitat" 
            :items="['Modalitat A', 'Modalitat B', 'Modalitat C']" 
            label="Modalitat" 
            variant="outlined" 
            color="white" 
            class="custom-input"
            :menu-props="{ contentClass: 'custom-menu' }"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="white" @click="dialog = false">Cancel·lar</v-btn>
          <v-btn color="white" class="text-black px-6" @click="guardarTaller" variant="flat">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEdit" fullscreen>
      <v-card>
        <v-toolbar color="black" dark>
          <v-btn icon @click="dialogEdit = false"><v-icon color="white">mdi-close</v-icon></v-btn>
          <v-toolbar-title class="text-white">Editar Taller</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn variant="text" class="text-white" @click="actualizarTaller">GUARDAR CANVIS</v-btn>
        </v-toolbar>
        <v-container class="pa-10">
          <v-text-field v-model="tallerEditant.data.titol" label="Títol" variant="outlined" color="black"></v-text-field>
          <v-textarea 
            v-model="tallerEditant.data.descripcio" 
            label="Descripció" 
            variant="outlined" 
            color="black" 
            :counter="MAX_DESC" 
            :maxlength="MAX_DESC"
            no-resize
            rows="5"
          ></v-textarea>
          <v-row>
            <v-col><v-text-field v-model="tallerEditant.data.durada" label="Durada" variant="outlined" color="black"></v-text-field></v-col>
            <v-col><v-text-field v-model="tallerEditant.data.places" label="Places" type="number" variant="outlined" color="black"></v-text-field></v-col>
            <v-col><v-select v-model="tallerEditant.data.modalitat" :items="['Modalitat A', 'Modalitat B', 'Modalitat C']" label="Modalitat" variant="outlined" color="black"></v-select></v-col>
          </v-row>
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

:deep(.custom-input .v-field__input), 
:deep(.custom-input .v-select__selection-text) {
  color: white !important;
}
:deep(.custom-input .v-label) { color: rgba(255, 255, 255, 0.9) !important; }
:deep(.custom-input .v-counter) { color: rgba(255, 255, 255, 0.6) !important; }

:deep(.filtre-superior .v-select__selection-text) {
  color: #333 !important;
  font-weight: 500;
}

.descripcio-fixa {
  min-height: 150px;
}
</style>

<style>
.custom-menu .v-list { background-color: #2c2c2c !important; color: white !important; }
.custom-menu .v-list-item--active { background-color: #444444 !important; }
.custom-menu .v-list-item-title { color: white !important; }
</style>