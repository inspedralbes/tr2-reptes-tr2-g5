<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const peticio = ref(null)
const loading = ref(true)
const checklist = ref({ material: false, espai: false, satisfaccio: false })

onMounted(async () => {
  try {
    const id = route.query.id
    // Fem la crida a admin per obtenir les dades del taller
    const res = await fetch(`/api/peticions/admin`)
    const data = await res.json()
    peticio.value = data.find(p => p._id === id)
    
    // Si ja s'ha finalitzat, marquem els checks
    if (peticio.value?.finalitzat) {
      checklist.value = peticio.value.checklist_detalls || { material: true, espai: true, satisfaccio: true }
    }
  } catch (e) { 
    console.error("Error carregant detalls:", e) 
  } finally { 
    loading.value = false 
  }
})

const enviarChecklist = async () => {
  try {
    const res = await fetch(`/api/peticions/${peticio.value._id}/finalitzar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: checklist.value })
    })
    if (res.ok) {
      router.push('/professor/iniciprofessor')
    }
  } catch (e) { 
    console.error("Error al finalitzar:", e) 
  }
}
</script>

<template>
  <v-container class="details-wrapper pa-0" fluid v-if="peticio">
    <v-sheet color="indigo-darken-4" class="pa-10 pb-16" flat>
      <v-container>
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="d-flex align-center mb-2">
              <v-btn icon="mdi-arrow-left" variant="tonal" color="white" size="small" class="mr-4" @click="router.push('/professor/iniciprofessor')" />
              <h1 class="text-h4 font-weight-bold text-white">Validació de l'Activitat</h1>
            </div>
            <p class="text-indigo-lighten-3 ml-12 mb-0">Consorci d'Estudiants - Revisió de protocol de qualitat</p>
          </div>
          <v-chip v-if="peticio.finalitzat" color="white" size="large" variant="outlined" prepend-icon="mdi-check-decagram" class="font-weight-bold">
            EXPEDIENT FINALITZAT
          </v-chip>
        </div>
      </v-container>
    </v-sheet>

    <v-container class="mt-n10">
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="rounded-xl pa-6 border-0 shadow-soft" elevation="2">
            <h3 class="text-subtitle-1 font-weight-black mb-6 text-indigo-darken-4 text-uppercase">
              <v-icon color="indigo" class="mr-2" size="20">mdi-file-document-outline</v-icon>
              Resum de l'expedient
            </h3>
            
            <div class="info-group mb-4">
              <div class="text-caption text-grey-darken-1 font-weight-bold text-uppercase">Taller</div>
              <div class="text-body-1 font-weight-bold text-indigo-darken-4">{{ peticio.taller_titol }}</div>
            </div>

            <div class="info-group mb-4">
              <div class="text-caption text-grey-darken-1 font-weight-bold text-uppercase">Centre</div>
              <div class="text-body-1">{{ peticio.nom_centre }}</div>
            </div>

            <v-divider class="my-4" />

            <div class="info-group mb-4">
              <div class="text-caption text-grey-darken-1 font-weight-bold text-uppercase">Ubicació</div>
              <div class="text-body-1">{{ peticio.poblacio }}</div>
            </div>

            <div class="info-group">
              <div class="text-caption text-grey-darken-1 font-weight-bold text-uppercase">Alumnes participants</div>
              <div class="text-body-1">{{ peticio.seleccio_tallers?.num_alumnes || 0 }} estudiants</div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="rounded-xl overflow-hidden shadow-soft" elevation="2">
            <v-toolbar color="white" flat border class="px-4">
              <v-toolbar-title class="text-h6 font-weight-bold text-indigo-darken-4">Checklist de Conformitat</v-toolbar-title>
            </v-toolbar>

            <v-card-text class="pa-8">
              <p class="text-body-2 text-grey-darken-1 mb-6">
                Marqueu els següents punts per certificar que el taller s'ha realitzat correctament:
              </p>

              <div 
                v-for="(label, key) in { material: 'Material complet i funcional', espai: 'Espai de treball adequat', satisfaccio: 'Objectius assolits i satisfacció' }" 
                :key="key"
                class="checklist-item mb-3"
              >
                <v-card
                  :color="checklist[key] ? 'indigo-lighten-5' : 'white'"
                  class="pa-4 rounded-lg cursor-pointer transition-swing border"
                  variant="flat"
                  @click="!peticio.finalitzat ? checklist[key] = !checklist[key] : null"
                >
                  <div class="d-flex align-center">
                    <v-checkbox-btn
                      v-model="checklist[key]"
                      :color="checklist[key] ? 'indigo-darken-3' : 'grey'"
                      :disabled="peticio.finalitzat"
                    />
                    <span :class="checklist[key] ? 'text-indigo-darken-4 font-weight-bold' : 'text-grey-darken-2'">
                      {{ label }}
                    </span>
                    <v-spacer />
                    <v-icon v-if="checklist[key]" color="indigo-darken-3">mdi-check-circle</v-icon>
                  </div>
                </v-card>
              </div>

              <v-divider class="my-8" />

              <div class="d-flex align-center justify-space-between">
                <div class="text-caption text-grey-darken-1 mr-4" style="max-width: 300px;">
                  En clicar aquest botó, es donarà l'activitat per finalitzada al sistema del Consorci.
                </div>
                <v-btn 
                  :color="peticio.finalitzat ? 'success' : 'indigo-darken-4'" 
                  size="x-large" 
                  class="rounded-lg font-weight-bold px-8"
                  :disabled="!checklist.material && !checklist.espai && !checklist.satisfaccio && peticio.finalitzat"
                  elevation="2"
                  @click="enviarChecklist"
                >
                  <v-icon start>{{ peticio.finalitzat ? 'mdi-check-all' : 'mdi-send' }}</v-icon>
                  {{ peticio.finalitzat ? 'ACTIVITAT VALIDADA' : 'FINALITZAR TALLER' }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>

  <v-overlay v-model="loading" class="align-center justify-center" persistent>
    <v-progress-circular indeterminate color="indigo-darken-4" size="64" />
  </v-overlay>
</template>

<style scoped>
.details-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
}
.shadow-soft {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
}
.cursor-pointer {
  cursor: pointer;
}
.transition-swing {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.checklist-item :hover {
  border-color: #3f51b5 !important;
}
</style>