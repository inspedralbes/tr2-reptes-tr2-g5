<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = '/api'

const stats = ref(null)
const loading = ref(true)
const refrescant = ref(false)

// 1. Carregar dades reals del backend
const carregarDades = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/informes/dashboard`)
    if (res.ok) {
      stats.value = await res.json()
    }
  } catch (e) {
    console.error("Error al carregar estadístiques", e)
  } finally {
    loading.value = false
    refrescant.value = false
  }
}

// 2. Funció d'exportar PDF (Sense instal·lar res, carrega CDN al moment)
const exportarPDF = () => {
  if (!stats.value) return
  
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
  const data = stats.value
  
  // Capçalera del PDF
  doc.setFillColor(33, 33, 33) // Color gris fosc/negre simplificat
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.text("INFORME D'ESTADÍSTIQUES", 15, 20)

  // Dades generals
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text(`Ocupació Global: ${data.ocupacio_global}%`, 15, 45)
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 15, 52)

  // Taula de modalitats
  doc.autoTable({
    startY: 60,
    head: [['Modalitat', 'Alumnes Inscrits']],
    body: data.detall_modalitats.map(m => [m.nom, m.val]),
    headStyles: { fillColor: [100, 100, 100] }
  })

  // Taula de rànquing
  doc.text("Top Tallers", 15, doc.lastAutoTable.finalY + 15)
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Taller', 'Alumnes']],
    body: data.top_tallers.map(t => [t.titol, t.inscrits]),
    headStyles: { fillColor: [33, 33, 33] }
  })

  doc.save(`Informe_Estadistiques.pdf`)
}

onMounted(carregarDades)
</script>

<template>
  <v-container class="pa-8 bg-white" style="max-width: 1200px;">
    
    <header class="d-flex align-center justify-space-between mb-8 border-b pb-4">
      <div>
        <h1 class="text-h4 font-weight-bold">Estadístiques</h1>
        <p class="text-grey">Resum d'impacte del sistema</p>
      </div>
      <div class="d-flex gap-2">
        <v-btn variant="outlined" prepend-icon="mdi-file-pdf-box" @click="exportarPDF">PDF</v-btn>
        <v-btn variant="flat" color="black" :loading="loading" @click="carregarDades">Actualitzar</v-btn>
      </div>
    </header>

    <v-row v-if="stats">
      <v-col cols="12" md="4">
        <div class="pa-6 rounded border text-center">
          <div class="text-overline text-grey">Ocupació Global</div>
          <div class="text-h2 font-weight-bold my-4">{{ stats.ocupacio_global }}%</div>
          <v-progress-linear :model-value="stats.ocupacio_global" color="black" height="10" rounded></v-progress-linear>
        </div>
      </v-col>

      <v-col cols="12" md="8">
        <v-row>
          <v-col v-for="mod in stats.detall_modalitats" :key="mod.nom" cols="12" sm="4">
            <div class="pa-4 rounded border">
              <div class="text-h5 font-weight-bold">{{ mod.val }}</div>
              <div class="text-caption text-uppercase text-grey">{{ mod.nom }}</div>
            </div>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" class="mt-6">
        <h3 class="text-h6 mb-4 font-weight-bold">Tallers amb més demanda</h3>
        <v-table class="border rounded">
          <thead>
            <tr class="bg-grey-lighten-4">
              <th>TALLER</th>
              <th class="text-right">ALUMNES INSCRITS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in stats.top_tallers" :key="t.titol">
              <td>{{ t.titol }}</td>
              <td class="text-right font-weight-bold">{{ t.inscrits }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>

    <div v-else-if="!loading" class="text-center py-12">
      <v-icon size="64" color="grey-lighten-2">mdi-database-off</v-icon>
      <p class="text-grey">No hi ha dades per mostrar</p>
    </div>
  </v-container>
</template>

<style scoped>
.border { border: 1px solid #e0e0e0 !important; }
.border-b { border-bottom: 2px solid #f5f5f5 !important; }
</style>