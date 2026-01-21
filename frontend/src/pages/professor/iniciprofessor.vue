<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tallers = ref([])
const loading = ref(true)
const tab = ref(0) 

const EMAIL_PROFESSOR = localStorage.getItem('userEmail'); 

const tallersPendents = computed(() => tallers.value.filter(t => !t.finalitzat))
const tallersFinalitzats = computed(() => tallers.value.filter(t => t.finalitzat))

const headers = [
  { title: 'TALLER', key: 'taller_titol', align: 'start', class: 'header-style' },
  { title: 'CENTRE', key: 'nom_centre', align: 'start', class: 'header-style' },
  { title: 'ALUMNES', key: 'seleccio_tallers.num_alumnes', align: 'center', class: 'header-style' },
  { title: 'ACCIONS', key: 'actions', align: 'end', sortable: false, class: 'header-style' },
]

// 2. FUNCIÓ CORREGIDA: Sense localhost, per evitar errors de CORS
// Agafem l'email en comptes del nom
onMounted(() => {
  console.log("Email del professor detectat:", EMAIL_PROFESSOR);
  if (!EMAIL_PROFESSOR) {
    console.error("No s'ha trobat l'email al localStorage. Revisa el login.");
  }
  carregarTallers();
});

const tallersOficials = ref([]); // Nova variable d'estat



const carregarTallersOficials = async () => {
  try {
    const res = await fetch(`/api/tallers/representant/${EMAIL_PROFESSOR}`);
    if (res.ok) {
      tallersOficials.value = await res.json();
    }
  } catch (error) {
    console.error("Error carregant representació oficial");
  }
};

// Crida la funció a l'onMounted
onMounted(() => {
  carregarTallers();
  carregarTallersOficials(); // Carreguem també la representació oficial
});

const carregarTallers = async () => {
  loading.value = true
  try {
    // 1. Busquem quins tallers gestiones tu oficialment
    const resTallers = await fetch(`/api/peticions/representant/${EMAIL_PROFESSOR}`)
    const meusTallersCertificats = await resTallers.json()

    if (meusTallersCertificats.length > 0) {
      // 2. Busquem totes les peticions del sistema
      const resPeticions = await fetch('/api/peticions/admin')
      const totes = await resPeticions.json()
      
      // 3. Filtrem: Només guardem les peticions que coincideixin amb els teus tallers
      const idsDelsMeusTallers = meusTallersCertificats.map(t => t._id)
      
      tallers.value = totes.filter(p => 
        idsDelsMeusTallers.includes(p.taller_busqueda) || idsDelsMeusTallers.includes(p.tallerId)
      )
      console.log("Dades carregades:", tallers.value)
    }
  } catch (error) {
    console.error("Error en la càrrega de dades:", error)
  } finally {
    loading.value = false
  }
}

const anarADetalls = (id) => {
  // Ara 'path' coincideix amb la ruta que Vite ha generat automàticament 
  // en moure el fitxer a la carpeta /pages/professor/
  router.push({ 
    path: '/professor/detallsprofessor', 
    query: { id: id } 
  })
}

onMounted(carregarTallers)
</script>

<template>
  <v-alert
  v-for="taller in tallersOficials"
  :key="taller._id"
  color="success"
  icon="mdi-star-decagram"
  variant="elevated"
  class="mb-6 rounded-lg"
>
  <div class="text-h6">Ets el representant oficial de: <strong>{{ taller.titol }}</strong></div>
  <div>Com a representant oficial, apareixeràs com a contacte preferent per a aquest taller en futures sol·licituds.</div>
</v-alert>
  <v-container class="professor-wrapper pa-10" fluid>
    <header class="mb-10">
      <h1 class="text-h4 font-weight-bold mb-2 text-blue-darken-4">El meu Panell</h1>
      <p class="text-body-1 text-grey-darken-1">Benvingut. Aquí tens la teva activitat.</p>
    </header>

    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <v-card variant="flat" class="pa-6 border-blue kpi-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline font-weight-bold text-blue-darken-4">TALLERS TOTALS</div>
              <div class="text-h4 font-weight-black text-blue-darken-4">{{ tallers.length }}</div>
            </div>
            <v-icon size="48" color="blue-lighten-4">mdi-clipboard-text-outline</v-icon>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="flat" class="pa-6 border-orange kpi-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline font-weight-bold text-orange-darken-4">PENDENTS</div>
              <div class="text-h4 font-weight-black text-orange-darken-4">{{ tallersPendents.length }}</div>
            </div>
            <v-icon size="48" color="orange-lighten-4">mdi-timer-sand</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-tabs v-model="tab" color="blue-darken-4" align-tabs="start" class="mb-6 custom-tabs">
      <v-tab :value="0" class="text-body-2 font-weight-bold">
        <v-icon start size="18">mdi-progress-check</v-icon> PENDENTS ({{ tallersPendents.length }})
      </v-tab>
      <v-tab :value="1" class="text-body-2 font-weight-bold">
        <v-icon start size="18">mdi-archive-check</v-icon> FINALITZATS ({{ tallersFinalitzats.length }})
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item :value="0">
        <v-card variant="flat" class="border-consorci bg-white">
          <v-data-table :headers="headers" :items="tallersPendents" :loading="loading" class="normal-text-table">
            <template v-slot:item.taller_titol="{ item }">
              <div class="text-body-2 font-weight-bold color-blue">{{ item.taller_titol }}</div>
            </template>

            <template v-slot:item.seleccio_tallers.num_alumnes="{ item }">
              <div class="text-body-2 font-weight-bold">{{ item.seleccio_tallers?.num_alumnes }}</div>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn color="blue-darken-4" variant="flat" size="small" rounded="lg" @click="anarADetalls(item._id)">
                VALIDAR ARA
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <v-window-item :value="1">
        <v-card variant="flat" class="border-consorci bg-indigo-lighten-5">
          <v-data-table :headers="headers" :items="tallersFinalitzats" :loading="loading" class="normal-text-table">
            <template v-slot:item.taller_titol="{ item }">
              <div class="text-body-2 font-weight-bold text-indigo-darken-4">{{ item.taller_titol }}</div>
            </template>

            <template v-slot:item.seleccio_tallers.num_alumnes="{ item }">
              <div class="text-body-2 font-weight-bold text-indigo-lighten-1">{{ item.seleccio_tallers?.num_alumnes }}</div>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn color="indigo-darken-2" variant="tonal" size="small" rounded="lg" prepend-icon="mdi-eye" @click="anarADetalls(item._id)">
                REVISAR
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<style scoped>
.professor-wrapper { background-color: #f0f4f8; min-height: 100vh; }

.kpi-card { border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; background-color: white !important; }

/* Encapçalaments amb contrast màxim però mida normal */
:deep(.header-style) {
  background-color: #0d47a1 !important;
  color: white !important;
  font-weight: 700 !important;
  font-size: 0.85rem !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  height: 48px !important;
}

/* Files de la taula amb mida normal */
.normal-text-table :deep(td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  font-size: 0.9rem !important;
  border-bottom: 1px solid #e0e6ed !important;
}

.color-blue { color: #0d47a1; }
.border-blue { border-top: 6px solid #0d47a1; }
.border-orange { border-top: 6px solid #ef6c00; }
.border-consorci { border: 1px solid #d1d9e6 !important; border-radius: 12px; overflow: hidden; }

.custom-tabs :deep(.v-tab--selected) {
  background-color: #0d47a1 !important;
  color: white !important;
  border-radius: 8px 8px 0 0;
}
</style>