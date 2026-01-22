<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = '/api'

const peticions = ref([])
const tallers = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [resPet, resTal] = await Promise.all([
      fetch(`${API_URL}/peticions/admin`), 
      fetch(`${API_URL}/tallers`)
    ])
    if (resPet.ok) peticions.value = await resPet.json()
    if (resTal.ok) tallers.value = await resTal.json()
  } catch (e) {
    console.error("Error carregar dades", e)
  } finally {
    loading.value = false
  }
})

// --- LÒGICA DE DADES ---
const getSatisfaccioPerTaller = (tallerTitol) => {
  const valoracions = peticions.value
    .filter(p => p.taller_titol === tallerTitol && p.seguiment_professor?.valoracio_comportament)
    .map(p => p.seguiment_professor.valoracio_comportament)
  if (valoracions.length === 0) return null 
  const suma = valoracions.reduce((acc, nota) => acc + nota, 0)
  return (suma / valoracions.length).toFixed(1)
}

const getAlumnesPerTaller = (tallerTitol) => {
  return peticions.value
    .filter(p => p.taller_titol === tallerTitol)
    .reduce((acc, p) => acc + (p.seleccio_tallers?.num_alumnes || 0), 0)
}

const millorsTallers = computed(() => {
  return tallers.value
    .map(t => ({ titol: t.titol, nota: getSatisfaccioPerTaller(t.titol) }))
    .filter(t => t.nota !== null)
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 3)
})

const tallersMesSolicitats = computed(() => {
  return tallers.value
    .map(t => ({ 
      titol: t.titol, 
      alumnes: getAlumnesPerTaller(t.titol),
      places: t.places,
      percentatge: Math.round((getAlumnesPerTaller(t.titol) / (t.places || 1)) * 100)
    }))
    .sort((a, b) => b.alumnes - a.alumnes)
    .slice(0, 3)
})

const statsModalitats = computed(() => {
  const totals = peticions.value.length || 1
  return [
    { nom: 'Modalitat A', icon: 'mdi-alpha-a-circle', color: '#1E88E5', val: peticions.value.filter(p => p.modalitat?.includes('A')).length },
    { nom: 'Modalitat B', icon: 'mdi-alpha-b-circle', color: '#00897B', val: peticions.value.filter(p => p.modalitat?.includes('B')).length },
    { nom: 'Modalitat C', icon: 'mdi-alpha-c-circle', color: '#8E24AA', val: peticions.value.filter(p => p.modalitat?.includes('C')).length }
  ].map(m => ({ ...m, percent: Math.round((m.val / totals) * 100) }))
})

// --- EXPORTACIÓ FINAL OPTIMITZADA CEB ---
const exportarPDF = () => {
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
  document.body.appendChild(script)
  script.onload = () => {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF('p', 'mm', 'a4')
    
    const BLAU_CEB = [52, 101, 164]; // #3465a4
    const NEGRE = [0, 0, 0];
    const GRIS_TEXT = [87, 87, 86];
    const LOGO_NEGRE = "Logo.jpg";

    // --- PÀGINA 1: PORTADA ---
    try { doc.addImage(LOGO_NEGRE, 'PNG', 15, 12, 65, 12); } catch (e) {}
    doc.setFont("arial", "bold"); doc.setFontSize(26); doc.text("Informe de Resultats Educatius", 15, 110);
    doc.setFontSize(14); doc.setFont("arial", "normal"); doc.setTextColor(...GRIS_TEXT);
    doc.text("Anàlisi exhaustiva de participació i gestió de mòduls", 15, 120);
    doc.text(`Curs Acadèmic: ${new Date().getFullYear()}-${new Date().getFullYear()+1}`, 15, 128);
    doc.setTextColor(...NEGRE); doc.text(`Barcelona, ${new Date().toLocaleDateString('ca-ES')}`, 15, 270);

    // --- PÀGINA 2: RESUM EXECUTIU I RÀNQUING ---
    doc.addPage();
    doc.setDrawColor(...BLAU_CEB); doc.setLineWidth(0.8); doc.line(15, 22, 195, 22);
    
    let yPos = 40;
    doc.setFontSize(18); doc.setFont("arial", "bold"); doc.setTextColor(...BLAU_CEB);
    doc.text("01. Resum executiu d'indicadors", 15, yPos);

    // CÀLCULS
    const totalPeticions = peticions.value.length; // Dades reals de la teva app
    const inscritsTotals = tallers.value.reduce((acc, t) => acc + getAlumnesPerTaller(t.titol), 0);
    const placesTotals = tallers.value.reduce((acc, t) => acc + t.places, 0);
    const ratioOcupacio = Math.round((inscritsTotals / (placesTotals || 1)) * 100);
    
    // Rànquing dels 3 mòduls més triats
    const rankingTallers = [...tallers.value]
      .map(t => ({ titol: t.titol, inscrits: getAlumnesPerTaller(t.titol) }))
      .sort((a, b) => b.inscrits - a.inscrits)
      .slice(0, 3);

    yPos += 15;
    // Quadre de KPIs - CANVIAT: "TOTAL SOL·LICITUDS REBUDES"
    doc.setFillColor(245, 247, 250); doc.rect(15, yPos, 180, 25, 'F');
    doc.setFontSize(8); doc.setTextColor(...GRIS_TEXT);
    doc.text("TOTAL SOL·LICITUDS REBUDES", 20, yPos + 8);
    doc.text("RÀTIO D'OCUPACIÓ", 85, yPos + 8);
    doc.text("ESTAT DE LA CONVOCATÒRIA", 140, yPos + 8);
    
    doc.setFontSize(14); doc.setTextColor(...BLAU_CEB); doc.setFont("arial", "bold");
    doc.text(`${totalPeticions}`, 20, yPos + 18);
    doc.text(`${ratioOcupacio}%`, 85, yPos + 18);
    doc.setFontSize(11);
    doc.text(ratioOcupacio > 80 ? "ALTA DEMANDA" : "OPERATIU", 140, yPos + 18);

    // NOU: MÒDULS MÉS TRIATS (RANKING)
    yPos += 45;
    doc.setFontSize(14); doc.setTextColor(...BLAU_CEB);
    doc.text("02. Mòduls amb major participació", 15, yPos);
    
    yPos += 10;
    rankingTallers.forEach((t, index) => {
      doc.setFillColor(255, 255, 255); doc.setDrawColor(230, 230, 230);
      doc.roundedRect(15, yPos, 180, 12, 1, 1, 'DF');
      doc.setFontSize(10); doc.setTextColor(...NEGRE); doc.setFont("arial", "bold");
      doc.text(`${index + 1}. ${t.titol.substring(0, 60)}`, 20, yPos + 7.5);
      doc.setTextColor(...BLAU_CEB);
      doc.text(`${t.inscrits} alumnes`, 160, yPos + 7.5);
      yPos += 15;
    });

    // 3. ANÀLISI PER MODALITAT
    yPos += 10;
    doc.setFontSize(14); doc.setTextColor(...BLAU_CEB);
    doc.text("03. Distribució per modalitat", 15, yPos);
    yPos += 10;
    
    statsModalitats.value.forEach((m) => {
      doc.setFontSize(9); doc.setTextColor(...NEGRE); doc.setFont("arial", "normal");
      doc.text(m.nom, 15, yPos);
      doc.setFillColor(230, 230, 230); doc.rect(60, yPos - 3, 100, 4, 'F');
      doc.setFillColor(...BLAU_CEB); doc.rect(60, yPos - 3, m.percent, 4, 'F');
      doc.setFont("arial", "bold"); doc.text(`${m.percent}%`, 165, yPos);
      yPos += 10;
    });

    // 4. TAULA DETALLADA (Pàgina 3)
    doc.addPage();
    yPos = 30;
    doc.setFontSize(14); doc.setFont("arial", "bold"); doc.setTextColor(...BLAU_CEB);
    doc.text("04. Llistat detallat de tallers i capacitat", 15, yPos);
    
    yPos += 10;
    doc.setFillColor(...BLAU_CEB); doc.rect(15, yPos, 180, 10, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(8);
    doc.text("ACTIVITAT", 20, yPos + 6.5);
    doc.text("PLACES", 135, yPos + 6.5);
    doc.text("INSCRITS", 155, yPos + 6.5);
    doc.text("ESTAT", 175, yPos + 6.5);

    yPos += 10;
    tallers.value.forEach((t, i) => {
      if (yPos > 270) { doc.addPage(); yPos = 20; }
      const inscrits = getAlumnesPerTaller(t.titol);
      if (i % 2 !== 0) { doc.setFillColor(248, 248, 248); doc.rect(15, yPos, 180, 8, 'F'); }
      doc.setTextColor(...NEGRE); doc.setFont("arial", "normal");
      doc.text(t.titol.substring(0, 50), 20, yPos + 5.5);
      doc.text(`${t.places}`, 135, yPos + 5.5);
      doc.text(`${inscrits}`, 155, yPos + 5.5);
      doc.setFontSize(7);
      doc.text(inscrits >= t.places ? "COMPLET" : "DISPONIBLE", 175, yPos + 5.5);
      doc.setFontSize(8);
      doc.setDrawColor(230, 230, 230); doc.line(15, yPos + 8, 195, yPos + 8);
      yPos += 8;
    });

    // PEU DE PÀGINA
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(...GRIS_TEXT);
      doc.text("Consorci d'Educació de Barcelona", 15, 285);
      doc.text(`Pàgina ${i} de ${totalPages}`, 180, 285);
    }

    doc.save(`Informe_Resultats_CEB_${new Date().getFullYear()}.pdf`);
  };
};
</script>

<template>
  <v-container class="dashboard-wrapper pa-10" fluid v-if="!loading">
    
    <header class="d-flex justify-space-between align-start mb-10 border-bottom-ceb pb-6">
      <div>
        <div class="d-flex align-center">
          <v-btn icon="mdi-arrow-left" variant="text" size="small" class="mr-2" color="black" @click="router.push('/admin/indexadmin')"/>
          <h1 class="text-h4 font-weight-bold text-black uppercase-ceb">Gestió i Impacte Educatiu</h1>
        </div>
        <p class="text-body-2 text-grey-darken-2 mt-2 ml-12">Panel d'anàlisi tècnica i rendiment de la convocatòria</p>
      </div>
      <v-btn 
        variant="flat" 
        color="#3465a4" 
        class="rounded-0 px-8 text-white font-weight-bold" 
        prepend-icon="mdi-file-pdf-box" 
        @click="exportarPDF"
      >
        DESCARREGAR INFORME
      </v-btn>
    </header>

    <v-row class="mb-10">
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="kpi-card-ceb pa-6">
          <div class="text-overline text-grey-darken-1 mb-2">SATISFACCIÓ GLOBAL</div>
          <div class="d-flex align-baseline">
            <span class="text-h3 font-weight-bold text-black" v-if="millorsTallers.length > 0">
              {{ (millorsTallers.reduce((acc, t) => acc + parseFloat(t.nota), 0) / millorsTallers.length).toFixed(1) }}
            </span>
            <span v-else class="text-h5 text-grey">PENDENT</span>
            <span class="ml-2 text-body-1 text-grey">/ 5.0</span>
          </div>
          <v-divider class="my-4" color="#3465a4"></v-divider>
          <div class="text-caption font-weight-bold text-blue-ceb uppercase-ceb">Qualitat mitjana de servei</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="kpi-card-ceb pa-6">
          <div class="text-overline text-grey-darken-1 mb-2">OCUPACIÓ DE PLACES</div>
          <div class="text-h3 font-weight-bold text-black">
            {{ Math.round((tallers.reduce((acc, t) => acc + getAlumnesPerTaller(t.titol), 0) / (tallers.reduce((acc, t) => acc + t.places, 0) || 1)) * 100) }}%
          </div>
          <v-progress-linear 
            :model-value="(tallers.reduce((acc, t) => acc + getAlumnesPerTaller(t.titol), 0) / (tallers.reduce((acc, t) => acc + t.places, 0) || 1)) * 100"
            color="#3465a4" height="8" class="mt-4"
          />
          <div class="text-caption mt-3 text-grey-darken-1 uppercase-ceb">Total d'alumnat inscrit</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="kpi-card-ceb pa-6 bg-ceb-grey">
          <div class="text-overline text-grey-darken-1 mb-4">DEMANDA PER MODALITAT</div>
          <div v-for="mod in statsModalitats" :key="mod.nom" class="d-flex align-center mb-3">
            <span class="text-caption font-weight-bold text-black" style="min-width: 80px">{{ mod.nom }}</span>
            <v-progress-linear :model-value="mod.percent" color="#3465a4" height="6" class="flex-grow-1" />
            <span class="ml-3 text-caption font-weight-black text-blue-ceb">{{ mod.percent }}%</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card variant="outlined" class="table-card-ceb">
          <div class="pa-4 bg-black d-flex justify-space-between align-center">
            <h3 class="text-subtitle-2 font-weight-bold text-white uppercase-ceb">Disponibilitat i Mètriques per Taller</h3>
          </div>
          <v-table class="ceb-table">
            <thead>
              <tr>
                <th class="text-left font-weight-bold">CODI</th>
                <th class="text-left font-weight-bold">TALLER</th>
                <th class="text-center font-weight-bold">PLACES</th>
                <th class="text-center font-weight-bold">ESTAT</th>
                <th class="text-right font-weight-bold">VALORACIÓ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in tallers" :key="t._id" class="ceb-row">
                <td class="text-caption font-mono text-grey">#{{ t._id.substring(t._id.length - 4) }}</td>
                <td class="font-weight-bold py-4 text-black">{{ t.titol }}</td>
                <td class="text-center">
                  <div class="text-caption font-weight-bold">{{ getAlumnesPerTaller(t.titol) }} / {{ t.places }}</div>
                </td>
                <td class="text-center">
                  <v-chip 
                    :color="getAlumnesPerTaller(t.titol) >= t.places ? 'black' : '#3465a4'" 
                    size="x-small" 
                    variant="flat" 
                    class="rounded-0 text-white px-3"
                  >
                    {{ getAlumnesPerTaller(t.titol) >= t.places ? 'COMPLET' : 'VACANTS' }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <span v-if="getSatisfaccioPerTaller(t.titol)" class="font-weight-black text-blue-ceb">
                    {{ getSatisfaccioPerTaller(t.titol) }}
                  </span>
                  <span v-else class="text-caption text-grey italic">S/D</span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-6 mb-6 rounded-0">
          <h3 class="text-subtitle-2 font-weight-bold mb-6 text-black border-left-ceb pl-3 uppercase-ceb">Major demanda</h3>
          <div v-for="(t, idx) in tallersMesSolicitats" :key="idx" class="mb-5">
            <div class="d-flex justify-space-between text-caption mb-1">
              <span class="text-truncate font-weight-bold" style="max-width: 200px">{{ t.titol }}</span>
              <span class="font-weight-black">{{ t.alumnes }} inscrits</span>
            </div>
            <v-progress-linear :model-value="t.percentatge" color="#3465a4" height="4"></v-progress-linear>
          </div>
        </v-card>

        <v-card variant="outlined" class="pa-6 rounded-0">
          <h3 class="text-subtitle-2 font-weight-bold mb-6 text-black border-left-ceb pl-3 uppercase-ceb">Líders en qualitat</h3>
          <v-list lines="one" class="pa-0">
            <v-list-item v-for="(taller, idx) in millorsTallers" :key="idx" class="px-0 py-3 border-bottom-thin">
              <div class="d-flex justify-space-between align-center">
                <span class="text-body-2 font-weight-bold text-black">{{ taller.titol }}</span>
                <v-chip size="small" variant="text" class="font-weight-black text-blue-ceb">{{ taller.nota }}</v-chip>
              </div>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.dashboard-wrapper { 
  background-color: #ffffff; 
  font-family: 'Arial', sans-serif;
}


.text-blue-ceb { color: #3465a4 !important; }
.bg-ceb-grey { background-color: #f9f9f9 !important; }
.uppercase-ceb { text-transform: uppercase; letter-spacing: 1.5px; }

.border-bottom-ceb { border-bottom: 2px solid #000000; }
.border-left-ceb { border-left: 4px solid #3465a4; }
.border-bottom-thin { border-bottom: 1px solid #eeeeee; }

.kpi-card-ceb {
  border-radius: 0 !important;
  border: 1px solid #e0e0e0 !important;
  transition: all 0.2s;
}

.kpi-card-ceb:hover {
  border-color: #3465a4 !important;
  background-color: #fcfcfc;
}

.table-card-ceb {
  border-radius: 0 !important;
  border: 1px solid #000000 !important;
}

/* TABLA ESTILO CEB */
.ceb-table :deep(th) {
  background-color: #f2f2f2 !important;
  color: #000000 !important;
  font-size: 11px !important;
  text-transform: uppercase;
  border-bottom: 2px solid #000000 !important;
}


.font-mono { font-family: monospace; }
</style>