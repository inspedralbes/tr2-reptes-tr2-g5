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
    const res = await fetch(`http://localhost:3000/api/peticions/admin`)
    const data = await res.json()
    peticio.value = data.find(p => p._id === id)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

const enviarChecklist = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/peticions/${peticio.value._id}/finalitzar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: checklist.value })
    })
    if (res.ok) {
      alert("✅ Taller finalitzat i notificat al Consorci.")
      router.push('/professor/iniciprofessor')
    }
  } catch (e) { console.error(e) }
}
</script>

<template>
  <v-container class="professor-wrapper pa-10" v-if="peticio">
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="tonal" color="grey-darken-3" class="mr-4" @click="router.back()"/>
      <div>
        <h1 class="text-h4 font-weight-bold">Detalls del Taller</h1>
        <p class="text-subtitle-1">ID de registre: {{ peticio._id.slice(-6).toUpperCase() }}</p>
      </div>
      <v-spacer/>
      <v-chip :color="peticio.finalitzat ? 'green' : 'orange'" variant="flat">
        {{ peticio.finalitzat ? 'Taller Finalitzat' : 'En curs / Pendents' }}
      </v-chip>
    </div>
    
    <v-row>
      <v-col cols="12" md="7">
        <v-card variant="flat" class="pa-8 border-consorci bg-white">
          <div class="d-flex align-center mb-6">
            <v-icon size="40" color="blue-darken-4" class="mr-4">mdi-school-outline</v-icon>
            <div>
              <h2 class="text-h5 font-weight-bold text-blue-darken-4">{{ peticio.tallerId?.titol }}</h2>
              <span class="text-subtitle-2 text-grey">MODALITAT {{ peticio.tallerId?.modalitat || 'A' }}</span>
            </div>
          </div>

          <v-divider class="mb-6"></v-divider>

          <v-row>
            <v-col cols="6">
              <div class="label">CENTRE EDUCATIU</div>
              <div class="value mb-4">{{ peticio.nom_centre }}</div>
              
              <div class="label">POBLACIÓ</div>
              <div class="value mb-4">{{ peticio.poblacio_centre || 'Barcelona' }}</div>
            </v-col>
            <v-col cols="6">
              <div class="label">NRE. ALUMNES</div>
              <div class="value mb-4">{{ peticio.seleccio_tallers?.num_alumnes }} alumnes</div>

              <div class="label">REFERENT DEL CENTRE</div>
              <div class="value">{{ peticio.referent_contacte?.nom }}</div>
              <div class="text-caption text-blue-darken-2">{{ peticio.referent_contacte?.correu }}</div>
            </v-col>
          </v-row>

          <div class="mt-6 pa-4 bg-blue-lighten-5 rounded-lg border-blue-lighten-4 border">
             <div class="label text-blue-darken-4">OBSERVACIONS DEL CENTRE</div>
             <p class="text-body-2 italic mt-1">{{ peticio.comentaris || 'Sense comentaris addicionals.' }}</p>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card variant="flat" class="pa-8 border-consorci bg-grey-darken-4 text-white">
          <h3 class="text-h5 font-weight-bold mb-2">Checklist Final</h3>
          <p class="text-grey-lighten-1 mb-6 text-body-2">Confirma que el taller s'ha realitzat correctament per tancar l'expedient.</p>
          
          <v-checkbox v-model="checklist.material" color="blue-lighten-2" hide-details class="mb-2">
            <template v-slot:label><span class="text-white">Material preparat i lliurat</span></template>
          </v-checkbox>
          <v-checkbox v-model="checklist.espai" color="blue-lighten-2" hide-details class="mb-2">
            <template v-slot:label><span class="text-white">L'espai del centre ha estat adequat</span></template>
          </v-checkbox>
          <v-checkbox v-model="checklist.satisfaccio" color="blue-lighten-2" hide-details class="mb-6">
            <template v-slot:label><span class="text-white">Objectius pedagògics assolits</span></template>
          </v-checkbox>

          <v-btn 
            block color="blue-darken-4" size="x-large" class="text-white font-weight-bold"
            :disabled="!checklist.material || !checklist.espai || !checklist.satisfaccio || peticio.finalitzat"
            @click="enviarChecklist"
          >
            <v-icon start>mdi-check-decagram</v-icon>
            {{ peticio.finalitzat ? 'VALIDACIÓ COMPLETADA' : 'VALIDAR TALLER' }}
          </v-btn>

          <v-alert v-if="peticio.finalitzat" type="success" variant="tonal" class="mt-4" density="compact">
            Aquesta petició ja s'ha tancat correctament.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.professor-wrapper { min-height: 100vh; background-color: #fcfcfc; }
.border-consorci { border: 1px solid #e0e0e0 !important; border-radius: 16px; }
.label { font-size: 0.7rem; font-weight: 800; color: #9e9e9e; letter-spacing: 0.5px; }
.value { font-size: 1.1rem; font-weight: 600; color: #212121; }
.italic { font-style: italic; }
</style>