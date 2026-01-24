<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = '/api'

const informe = ref(null)
const loading = ref(true)
const generantInforme = ref(false)

const carregarDades = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/informes/latest`)
    if (res.ok) {
      informe.value = await res.json()
    }
  } catch (e) {
    console.error("Error al carregar l'informe", e)
  } finally {
    loading.value = false
  }
}

const actualitzarDades = async () => {
  generantInforme.value = true
  try {
    const res = await fetch(`${API_URL}/informes/generar`, { method: 'POST' })
    if (res.ok) {
      informe.value = await res.json()
    }
  } catch (e) {
    console.error("Error al generar nou informe", e)
  } finally {
    generantInforme.value = false
  }
}

onMounted(carregarDades)

const exportarPDF = () => {
  if (!informe.value) return
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
  const autoTable = document.createElement('script')
  autoTable.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'
  document.body.appendChild(script)
  script.onload = () => {
    document.body.appendChild(autoTable)
    autoTable.onload = () => generarDocument()
  }
}

const generarDocument = () => {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  const data = informe.value
  
  // Disseny Professional
  doc.setFillColor(52, 101, 164)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.text("", 15, 25)
  doc.setFontSize(10)
  doc.text(`Data: ${new Date(data.fecha).toLocaleString()}`, 15, 32)

  // KPI Global
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(14)
  doc.text(`Ocupació Global: ${data.ocupacion_global}%`, 15, 55)

  // Taula amb dades Alumnes / Places
  doc.autoTable({
    startY: 65,
    head: [['Taller', 'Alumnes / Capaçitat', 'Estat']],
    body: data.top_tallers.map(t => [
      t.titol, 
      `${t.alumnes} / ${t.places}`, 
      t.percentatge >= 100 ? 'COMPLET' : `${t.percentatge}%`
    ]),
    headStyles: { fillColor: [52, 101, 164] },
    columnStyles: { 2: { fontStyle: 'bold' } }
  })

  doc.save(`Estadistiques.pdf`)
}
</script>

<template>
  <v-container class="dashboard-wrapper pa-10" fluid v-if="!loading">
    
    <header class="d-flex justify-space-between align-start mb-10 border-bottom-ceb pb-6">
      <div>
        <div class="d-flex align-center">
          <v-btn icon="mdi-arrow-left" variant="text" size="small" class="mr-2" color="black" @click="router.push('/admin/indexadmin')"/>
          <h1 class="text-h4 font-weight-bold text-black uppercase-ceb">Estadístiques</h1>
        </div>
        <p class="text-body-2 text-grey-darken-2 mt-2 ml-12">
          Anàlisi de peticions i places disponibles
          <span v-if="generantInforme" class="ml-4 text-blue-ceb">
            <v-progress-circular indeterminate size="14" width="2" class="mr-2"></v-progress-circular>
            Processant...
          </span>
        </p>
      </div>
      <div class="d-flex gap-2">
        <v-btn variant="outlined" color="grey-darken-2" class="mr-2 rounded-0" @click="actualitzarDades" :disabled="generantInforme">
          RECALCULAR DADES
        </v-btn>
        <v-btn variant="flat" color="#3465a4" class="rounded-0 text-white font-weight-bold" prepend-icon="mdi-file-pdf-box" @click="exportarPDF">
          PDF PROFESSIONAL
        </v-btn>
      </div>
    </header>

    <div v-if="informe">
      <v-row>
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="kpi-card-ceb pa-8 text-center bg-white">
            <div class="text-overline text-grey-darken-1 mb-4">OCUPACIÓ TOTAL</div>
            <v-progress-circular :model-value="informe.ocupacion_global" :size="180" :width="18" color="#3465a4">
              <span class="text-h3 font-weight-bold">{{ informe.ocupacion_global }}%</span>
            </v-progress-circular>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card variant="outlined" class="kpi-card-ceb pa-6 bg-ceb-grey">
            <div class="text-overline text-grey-darken-1 mb-6">IMPACTE PER MODALITAT</div>
            <div v-for="mod in informe.detall_modalitats" :key="mod.nom" class="mb-6">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-subtitle-2 font-weight-bold">{{ mod.nom }}</span>
                <span class="text-subtitle-2 font-weight-black text-blue-ceb">{{ mod.percent }}%</span>
              </div>
              <v-progress-linear :model-value="mod.percent" color="#3465a4" height="10" rounded />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12">
  <v-card variant="outlined" class="kpi-card-ceb mt-6 border-ceb">
    <v-table hover>
      <thead>
        <tr class="bg-grey-lighten-4">
          <th class="text-left font-weight-bold py-4" style="color: #3465a4">NOM DEL TALLER</th>
          <th class="text-center font-weight-bold py-4" style="color: #3465a4">ALUMNES / PLACES</th>
          <th class="text-center font-weight-bold py-4" style="color: #3465a4">ESTAT OCUPACIÓ</th>
        </tr>
      </thead>
      <tbody class="bg-white">
        <tr v-for="t in informe.top_tallers" :key="t.titol" class="table-row">
          <td class="font-weight-medium text-grey-darken-3">{{ t.titol }}</td>
          <td class="text-center">
            <span class="text-body-1 font-weight-bold">{{ t.alumnes }}</span>
            <span class="text-grey-lighten-1 mx-2">/</span>
            <span class="text-body-1">{{ t.places }}</span>
          </td>
          <td class="text-center">
            <v-chip 
              :color="t.percentatge >= 100 ? 'red-darken-1' : '#3465a4'" 
              variant="flat" 
              class="text-white font-weight-bold px-4"
              style="min-width: 80px; justify-content: center;"
            >
              {{ t.percentatge }}% {{ t.percentatge >= 100 ? 'PLE' : '' }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</v-col>
      </v-row>
    </div>

    <v-card v-else variant="tonal" color="orange" class="pa-10 text-center">
      <v-icon size="64" class="mb-4">mdi-database-off</v-icon>
      <h2 class="text-h5 font-weight-bold">Sense informes a la Base de Dades</h2>
      <p class="mb-6">No s'ha generat cap anàlisi d'impacte encara.</p>
      <v-btn color="orange-darken-2" @click="actualitzarDades" size="large" prepend-icon="mdi-refresh">
        GENERAR ARA
      </v-btn>
    </v-card>

  </v-container>
</template>

<style scoped>
.dashboard-wrapper { background-color: #ffffff; }
.text-blue-ceb { color: #3465a4 !important; }
.bg-ceb-grey { background-color: #fcfcfc !important; }
.uppercase-ceb { text-transform: uppercase; letter-spacing: 2px; }
.border-bottom-ceb { border-bottom: 3px solid #000000; }
.kpi-card-ceb { border-radius: 0 !important; border: 1px solid #eeeeee !important; }
</style>