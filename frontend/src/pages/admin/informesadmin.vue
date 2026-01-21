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
  <v-container class="dashboard-wrapper pa-8" fluid v-if="!loading">
    
    <header class="d-flex justify-space-between align-center mb-8">
      <div>
        <div class="d-flex align-center">
          <v-btn icon="mdi-chevron-left" variant="tonal" size="small" class="mr-4 bg-white" @click="router.push('/admin/indexadmin')"/>
          <h1 class="text-h4 font-weight-black text-black">Gestió i Impacte Educatiu</h1>
        </div>
        <p class="text-body-2 text-grey-darken-1 mt-1 ml-12">Monitorització en temps real del rendiment acadèmic</p>
      </div>
      <div class="d-flex gap-3">
        <v-btn variant="flat" color="red-darken-4" class="rounded-pill px-6" prepend-icon="mdi-file-pdf-box" @click="exportarPDF">INFORME PDF</v-btn>
      </div>
    </header>

    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <v-card class="kpi-card glass-amber pa-6 text-white">
          <div class="d-flex justify-space-between align-center mb-4">
            <v-icon color="#FFD700" size="38">mdi-star</v-icon>
            <v-chip color="rgba(255,255,255,0.2)" size="x-small" variant="flat" class="font-weight-bold">QUALITAT</v-chip>
          </div>
          <div class="text-h3 font-weight-black mb-1">
            <span v-if="millorsTallers.length > 0">
              {{ (millorsTallers.reduce((acc, t) => acc + parseFloat(t.nota), 0) / millorsTallers.length).toFixed(1) }}
            </span>
            <span v-else class="text-h5 opacity-70">SENSE DADES</span>
          </div>
          <div class="text-caption font-weight-bold uppercase opacity-80">Satisfacció mitjana global</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="kpi-card glass-indigo pa-6">
          <div class="d-flex justify-space-between align-center mb-2">
            <v-icon color="indigo-lighten-1" size="32">mdi-account-group</v-icon>
            <div class="text-h6 font-weight-bold">{{ Math.round((tallers.reduce((acc, t) => acc + getAlumnesPerTaller(t.titol), 0) / (tallers.reduce((acc, t) => acc + t.places, 0) || 1)) * 100) }}%</div>
          </div>
          <v-progress-linear 
            :model-value="(tallers.reduce((acc, t) => acc + getAlumnesPerTaller(t.titol), 0) / (tallers.reduce((acc, t) => acc + t.places, 0) || 1)) * 100"
            color="white" height="12" rounded class="mt-4"
          />
          <div class="text-caption mt-3 opacity-8">Taxa d'ocupació de places total</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="kpi-card bg-grey-darken-4 text-white pa-6">
          <div class="text-overline mb-4 text-grey-lighten-1">🚀 Demanda per Modalitat</div>
          <div v-for="mod in statsModalitats" :key="mod.nom" class="d-flex align-center mb-2">
            <v-icon :color="mod.color" class="mr-2" size="18">{{ mod.icon }}</v-icon>
            <v-progress-linear :model-value="mod.percent" :color="mod.color" height="6" rounded class="flex-grow-1" />
            <span class="ml-3 text-caption font-weight-bold" style="min-width: 35px">{{ mod.percent }}%</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="table-card border-thin bg-white elevation-1">
          <div class="pa-6 border-bottom d-flex justify-space-between align-center">
            <h3 class="text-subtitle-1 font-weight-bold">Detall de Disponibilitat per Taller</h3>
          </div>
          <v-table class="custom-table">
            <thead>
              <tr>
                <th class="text-left font-weight-bold">ID</th>
                <th class="text-left font-weight-bold">TALLER</th>
                <th class="text-left font-weight-bold">MODALITAT</th>
                <th class="text-center font-weight-bold">OCUPACIÓ</th>
                <th class="text-center font-weight-bold">LLIURES</th>
                <th class="text-right font-weight-bold">NOTA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in tallers" :key="t._id">
                <td class="text-caption text-grey">#{{ t._id.substring(t._id.length - 4) }}</td>
                <td class="font-weight-bold py-4">{{ t.titol }}</td>
                <td class="text-caption">{{ t.modalitat || 'N/A' }}</td>
                <td class="text-center">
                  <div class="text-caption font-weight-bold mb-1">{{ getAlumnesPerTaller(t.titol) }} / {{ t.places }}</div>
                  <v-progress-linear 
                    :model-value="(getAlumnesPerTaller(t.titol) / t.places) * 100" 
                    :color="getAlumnesPerTaller(t.titol) >= t.places ? 'red' : 'blue'"
                    height="4" rounded
                  />
                </td>
                <td class="text-center">
                  <v-chip :color="t.places - getAlumnesPerTaller(t.titol) <= 5 ? 'orange-darken-4' : 'green-darken-1'" size="x-small" variant="tonal" class="font-weight-black">
                    {{ t.places - getAlumnesPerTaller(t.titol) }} VACANTS
                  </v-chip>
                </td>
                <td class="text-right">
                  <span v-if="getSatisfaccioPerTaller(t.titol)" class="font-weight-black text-amber-darken-3">
                    {{ getSatisfaccioPerTaller(t.titol) }}
                  </span>
                  <span v-else class="text-caption text-grey-lighten-1 italic">Pendent de valorar</span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-6 border-thin bg-white elevation-1 mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-6 d-flex align-center">
            <v-icon color="blue-darken-2" class="mr-2">mdi-fire</v-icon>
            Més Sol·licitats
          </h3>
          <div v-for="(t, idx) in tallersMesSolicitats" :key="idx" class="mb-4">
            <div class="d-flex justify-space-between text-caption font-weight-bold mb-1">
              <span class="text-truncate" style="max-width: 150px">{{ t.titol }}</span>
              <span>{{ t.alumnes }} de {{ t.places }}</span>
            </div>
            <v-progress-linear :model-value="t.percentatge" color="blue-lighten-2" height="8" rounded></v-progress-linear>
          </div>
        </v-card>

        <v-card class="pa-6 border-thin bg-white elevation-1">
          <h3 class="text-subtitle-1 font-weight-bold mb-6 d-flex align-center">
            <v-icon color="amber-darken-2" class="mr-2">mdi-trophy-outline</v-icon>
            Líders en Satisfacció
          </h3>
          <v-list lines="two">
            <v-list-item v-for="(taller, idx) in millorsTallers" :key="idx" class="px-0 mb-4 border-dashed-bottom pb-4">
              <template v-slot:prepend>
                <div class="rank-number mr-4" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
              </template>
              <v-list-item-title class="font-weight-bold text-body-2">{{ taller.titol }}</v-list-item-title>
              <v-list-item-subtitle class="mt-1">
                <v-rating :model-value="parseFloat(taller.nota)" color="amber-darken-3" density="compact" size="x-small" readonly />
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-container v-else class="fill-height d-flex justify-center align-center">
    <v-progress-circular indeterminate size="50" color="blue-darken-2" width="5"></v-progress-circular>
  </v-container>
</template>

<style scoped>
.dashboard-wrapper { background-color: #f8fafc; min-height: 100vh; }
.kpi-card { border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); transition: transform 0.2s; }
.kpi-card:hover { transform: translateY(-4px); }

/* ESTILO COLOR NARANJA/ÁMBAR PARA SATISFACCIÓN */
.glass-amber { 
  background: linear-gradient(135deg, #f1874eff 0%, #FF8F00 100%); 
  border-left: 6px solid #FFD700 !important; 
}

.glass-indigo { background: #303F9F; color: white; }
.table-card { border-radius: 16px; overflow: hidden; }
.custom-table :deep(thead) { background-color: #f1f5f9; }
.custom-table :deep(th) { text-transform: uppercase; letter-spacing: 0.5px; color: #64748b !important; font-size: 11px !important; }
.rank-number { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; }
.rank-1 { background-color: #FFECB3; color: #FF8F00; }
.rank-2 { background-color: #F1F5F9; color: #64748B; }
.rank-3 { background-color: #EFEBE9; color: #795548; }
.border-thin { border: 1px solid #e2e8f0 !important; }
.border-dashed-bottom { border-bottom: 1px dashed #e2e8f0; }
.border-bottom { border-bottom: 1px solid #e2e8f0; }
.uppercase { text-transform: uppercase; letter-spacing: 1px; }
.gap-3 { gap: 12px; }
.italic { font-style: italic; }
.opacity-70 { opacity: 0.7; }
.opacity-80 { opacity: 0.8; }
</style>