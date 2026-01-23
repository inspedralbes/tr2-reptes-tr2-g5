<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = '/api'

const peticions = ref([])
const tallers = ref([])
const loading = ref(true)
const guardando = ref(false) // Estado para el guardado automático

// --- CARREGA DE DADES I GUARDAT AUTOMÀTIC ---
onMounted(async () => {
  try {
    const [resPet, resTal] = await Promise.all([
      fetch(`${API_URL}/peticions/admin`), 
      fetch(`${API_URL}/tallers`)
    ])
    
    if (resPet.ok) peticions.value = await resPet.json()
    if (resTal.ok) tallers.value = await resTal.json()

    // Un cop tenim les dades, guardem la "foto" actual a la BD automàticament
    if (peticions.value.length > 0) {
      await guardarEnBD()
    }

  } catch (e) {
    console.error("Error carregar dades", e)
  } finally {
    loading.value = false
  }
})

// --- LÒGICA DE CÀLCUL ---
const getAlumnesPerTaller = (tallerTitol) => {
  return peticions.value
    .filter(p => p.taller_titol === tallerTitol)
    .reduce((acc, p) => acc + (p.seleccio_tallers?.num_alumnes || 0), 0)
}

const tallersMesSolicitats = computed(() => {
  return tallers.value
    .map(t => ({ 
      titol: t.titol, 
      alumnes: getAlumnesPerTaller(t.titol),
      percentatge: Math.round((getAlumnesPerTaller(t.titol) / (t.places || 1)) * 100)
    }))
    .sort((a, b) => b.alumnes - a.alumnes)
    .slice(0, 5)
})

const statsModalitats = computed(() => {
  const totals = peticions.value.length || 1
  const llistaModalitats = ['Modalitat A', 'Modalitat B', 'Modalitat C']

  return llistaModalitats.map(nom => {
    const tallersDunaModalitat = tallers.value
      .filter(t => t.modalitat === nom)
      .map(t => t.titol)

    const count = peticions.value.filter(p => 
      tallersDunaModalitat.includes(p.taller_titol)
    ).length

    return {
      nom: nom,
      val: count,
      percent: Math.round((count / totals) * 100)
    }
  })
})

const ocupacioGlobal = computed(() => {
  const inscrits = tallers.value.reduce((acc, t) => acc + getAlumnesPerTaller(t.titol), 0)
  const places = tallers.value.reduce((acc, t) => acc + (t.places || 0), 0)
  return Math.round((inscrits / (places || 1)) * 100)
})

// --- PERSISTÈNCIA A LA BD ---
const guardarEnBD = async () => {
  guardando.value = true;
  const informe = {
    fecha: new Date().toISOString(),
    ocupacion_global: ocupacioGlobal.value,
    detall_modalitats: statsModalitats.value,
    top_tallers: tallersMesSolicitats.value
  };

  try {
    const response = await fetch(`${API_URL}/informes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(informe)
    });

    if (response.ok) {
        const data = await response.json();
        console.log("✅ Servidor diu:", data.message);
    } else {
        console.error("❌ Error del servidor:", response.status);
    }
  } catch (e) {
    console.error("❌ Error de red:", e);
  } finally {
    guardando.value = false;
  }
}

// --- EXPORTACIÓ PDF ---
const exportarPDF = () => {
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
  document.body.appendChild(script)
  script.onload = () => {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF('p', 'mm', 'a4')
    const BLAU_CEB = [52, 101, 164]
    const GRIS = [87, 87, 86]
    
    // CAMBIO: Usamos 'helvetica' en lugar de 'arial'
    doc.setFont("helvetica", "bold"); 
    doc.setFontSize(22); 
    doc.text("Informe de Gestió i Impacte", 15, 25);
    
    doc.setFontSize(10); 
    doc.setTextColor(...GRIS);
    doc.text(`Generat el: ${new Date().toLocaleDateString('ca-ES')} ${new Date().toLocaleTimeString()}`, 15, 32);
    
    doc.setDrawColor(...BLAU_CEB); 
    doc.setLineWidth(1); 
    doc.line(15, 35, 195, 35);

    let yPos = 50;
    // ... resto de tu lógica usando "helvetica" ...
    doc.setFont("helvetica", "normal");
    
    doc.save(`Informe_CEB_${new Date().getFullYear()}.pdf`);
  }
}
</script>

<template>
  <v-container class="dashboard-wrapper pa-10" fluid v-if="!loading">
    
    <header class="d-flex justify-space-between align-start mb-10 border-bottom-ceb pb-6">
      <div>
        <div class="d-flex align-center">
          <v-btn icon="mdi-arrow-left" variant="text" size="small" class="mr-2" color="black" @click="router.push('/admin/indexadmin')"/>
          <h1 class="text-h4 font-weight-bold text-black uppercase-ceb">Gestió i Impacte Educatiu</h1>
        </div>
        <p class="text-body-2 text-grey-darken-2 mt-2 ml-12">
          Panel d'anàlisi tècnica 
          <span v-if="guardando" class="ml-4 text-blue-ceb">
            <v-progress-circular indeterminate size="14" width="2" class="mr-2"></v-progress-circular>
            Sincronitzant amb BD...
          </span>
        </p>
      </div>
      <v-btn variant="flat" color="#3465a4" class="rounded-0 px-8 text-white font-weight-bold" prepend-icon="mdi-file-pdf-box" @click="exportarPDF">
        DESCARREGAR INFORME
      </v-btn>
    </header>

    <v-row>
      <v-col cols="12" md="8">
        <v-row>
          <v-col cols="12">
            <v-card variant="outlined" class="kpi-card-ceb pa-6 mb-6">
              <div class="text-overline text-grey-darken-1 mb-2">OCUPACIÓ DE PLACES</div>
              <div class="text-h2 font-weight-bold text-black">{{ ocupacioGlobal }}%</div>
              <v-progress-linear :model-value="ocupacioGlobal" color="#3465a4" height="12" class="mt-6" />
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card variant="outlined" class="kpi-card-ceb pa-6 bg-ceb-grey">
              <div class="text-overline text-grey-darken-1 mb-4">DEMANDA PER MODALITAT</div>
              <div v-for="mod in statsModalitats" :key="mod.nom" class="mb-4">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-subtitle-2 font-weight-bold">{{ mod.nom }}</span>
                  <span class="text-subtitle-2 font-weight-black text-blue-ceb">{{ mod.percent }}%</span>
                </div>
                <v-progress-linear :model-value="mod.percent" color="#3465a4" height="8" />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-6 rounded-0" height="100%">
          <h3 class="text-subtitle-2 font-weight-bold mb-6 text-black border-left-ceb pl-3 uppercase-ceb">Major demanda</h3>
          <div v-for="(t, idx) in tallersMesSolicitats" :key="idx" class="mb-6">
            <div class="d-flex justify-space-between text-caption mb-1">
              <span class="text-truncate font-weight-bold" style="max-width: 180px">{{ t.titol }}</span>
              <span class="font-weight-black">{{ t.alumnes }} inscrits</span>
            </div>
            <v-progress-linear :model-value="t.percentatge" color="#3465a4" height="4"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<style scoped>
.dashboard-wrapper { background-color: #ffffff; font-family: 'Arial', sans-serif; }
.text-blue-ceb { color: #3465a4 !important; }
.bg-ceb-grey { background-color: #f9f9f9 !important; }
.uppercase-ceb { text-transform: uppercase; letter-spacing: 1.5px; }
.border-bottom-ceb { border-bottom: 2px solid #000000; }
.border-left-ceb { border-left: 4px solid #3465a4; }
.kpi-card-ceb { border-radius: 0 !important; border: 1px solid #e0e0e0 !important; }
</style>