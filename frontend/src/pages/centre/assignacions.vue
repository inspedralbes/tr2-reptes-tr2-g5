<template>
  <div class="assignacions-container">
    <div class="d-flex align-center mb-6">
      <v-btn 
        icon="mdi-arrow-left" 
        variant="text" 
        color="black" 
        class="mr-4" 
        @click="router.push('/centre/indexcentre')"
      />
      <h2 class="text-h4 font-weight-bold mb-0">Tallers Confirmats i Assignacions</h2>
    </div>

    <!-- ✅ NOTIFICACIÓ DESPLEGABLE DE REPRESENTANTS SELECCIONATS -->
    <v-expand-transition>
      <v-alert 
        v-if="representantsSeleccionats.length > 0 && mostrarNotificacio"
        type="success"
        variant="tonal"
        prominent
        closable
        @click:close="mostrarNotificacio = false"
        class="mb-6 notificacio-representant"
      >
        <v-alert-title class="text-h6 mb-2">
          Teniu professors seleccionats com a Representants Oficials
        </v-alert-title>

        <div v-for="p in representantsSeleccionats" :key="p._id" class="representant-item">
          <v-chip 
            color="success" 
            variant="flat" 
            size="small" 
            prepend-icon="mdi-star"
            class="mr-2 mb-2"
          >
            {{ p.taller_titol }}
          </v-chip>
          <span>
            <strong>{{ p.referent_contacte?.nom }}</strong> ha estat escollit com a 
            <strong>Representant Oficial</strong> d'aquest taller.
          </span>
        </div>
      </v-alert>
    </v-expand-transition>

    <div v-if="assignacions.length === 0" class="no-data">
      Encara no teniu cap taller assignat oficialment.
    </div>

    <div v-else class="grid-assignacions">
      <div v-for="item in assignacions" :key="item._id" class="card">
        <div class="card-header">
          <h3>{{ item.taller_titol }}</h3>
          <div class="d-flex align-center gap-2">
            <!-- Badge de Representant Oficial -->
            <v-chip 
              v-if="item.es_representant_triat" 
              color="success" 
              size="x-small"
              prepend-icon="mdi-star"
              class="representant-badge"
            >
              OFICIAL
            </v-chip>
            <span class="badge">Assignat</span>
          </div>
        </div>
        
        <div class="card-body">
          <p><strong>Centre:</strong> {{ item.nom_centre }}</p>
          <p><strong>Alumnes:</strong> {{ item.seleccio_tallers.num_alumnes }}</p>
          
          <div class="referents-box">
            <div class="d-flex justify-space-between align-center mb-2">
              <h4>Professors Referents:</h4>
              <v-icon 
                v-if="item.es_representant_triat" 
                color="success" 
                size="24"
              >
                mdi-shield-star
              </v-icon>
            </div>
            <ul>
              <li>{{ item.referent_contacte.nom }} ({{ item.referent_contacte.correu }})</li>
              <li v-if="item.referent_contacte.nom_segon">{{ item.referent_contacte.nom_segon }}</li>
            </ul>
            
            <!-- Missatge especial si és representant -->
            <div v-if="item.es_representant_triat" class="representant-info">
              <v-icon size="16" color="success">mdi-information</v-icon>
              Aquest professor és el Representant Oficial del taller
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const assignacions = ref([]);
const mostrarNotificacio = ref(true);

const representantsSeleccionats = computed(() => {
  return assignacions.value.filter(p => p.es_representant_triat === true);
});

const carregarAssignacions = async () => {
  try {
    const nomDelCentre = localStorage.getItem('userName');
    const res = await fetch(`/api/peticions/centre/${encodeURIComponent(nomDelCentre)}`);
    
    if (res.ok) {
      const dades = await res.json();
      assignacions.value = dades.filter(p => p.estat === 'ASSIGNAT');
    }
  } catch (error) {
    console.error("Error carregant assignacions:", error);
  }
};

onMounted(() => {
  carregarAssignacions();
});
</script>

<style scoped>
.assignacions-container {
  max-width: 900px;
  margin: 20px auto;
  font-family: sans-serif;
}

.d-flex { display: flex; }
.align-center { align-items: center; }
.justify-space-between { justify-content: space-between; }
.mb-6 { margin-bottom: 24px; }
.mb-2 { margin-bottom: 8px; }
.mr-4 { margin-right: 16px; }
.mr-2 { margin-right: 8px; }
.gap-2 { gap: 8px; }


.notificacio-representant {
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.representant-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
}

.representant-item:last-child {
  border-bottom: none;
}

.grid-assignacions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.card-header {
  background-color: #ececec;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  background-color: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.representant-badge {
  font-weight: bold;
}

.card-body {
  padding: 15px;
}

.referents-box {
  margin-top: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.referents-box h4 {
  margin: 0 0 8px 0;
  font-size: 0.95em;
  color: #333;
}

.representant-info {
  margin-top: 12px;
  padding: 8px;
  background-color: #e8f5e9;
  border-left: 3px solid #4CAF50;
  border-radius: 4px;
  font-size: 0.85em;
  color: #2e7d32;
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-data {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>