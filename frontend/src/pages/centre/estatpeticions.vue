<template>
  <v-container class="pa-8 bg-white" fluid>
    <div class="d-flex align-center mb-8">
      <v-btn 
        icon="mdi-arrow-left" 
        variant="text" 
        size="small" 
        color="black" 
        class="mr-4" 
        @click="router.push('/centre/indexcentre')" 
      />
      <h1 class="text-h4 font-weight-bold text-black uppercase-ceb">Estat de les meves sol·licituds</h1>
    </div>

    <v-tabs v-model="tab" color="blue-darken-4" class="mb-6 border-bottom">
      <v-tab value="pendents" class="font-weight-bold">Pendents i Altres</v-tab>
      <v-tab value="assignades" class="font-weight-bold">Assignades (Èxit)</v-tab>
    </v-tabs>

    <v-responsive max-width="400" class="mb-4">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Cerca taller per nom..."
        variant="outlined"
        density="compact"
        hide-details
        class="custom-search"
      ></v-text-field>
    </v-responsive>

    <v-window v-model="tab">
      <v-window-item value="pendents">
        <v-card variant="flat" class="dark-table-card shadow-sm">
          <v-data-table 
            :headers="headers" 
            :items="peticionsFiltrades('PENDENT')" 
            :search="search"
            hover
            class="dark-theme-table"
          >
            <template v-slot:item.estat="{ item }">
              <v-chip :color="getEstatColor(item.estat)" size="small" class="font-weight-black px-4 text-white">
                {{ formatEstatText(item.estat) }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <v-window-item value="assignades">
        <v-card variant="flat" class="dark-table-card shadow-sm">
          <v-data-table 
            :headers="headers" 
            :items="peticionsFiltrades('ASSIGNAT')" 
            :search="search"
            hover
            class="dark-theme-table"
          >
            <template v-slot:item.estat="{ item }">
              <v-chip color="green-darken-1" size="small" class="font-weight-black px-4 text-white">
                ASSIGNAT
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; 

const router = useRouter();               
const peticions = ref([]);
const tab = ref('pendents'); 
const search = ref('');

const headers = [
  { title: 'TALLER', key: 'taller_titol', align: 'start' },
  { title: 'ALUMNES', key: 'seleccio_tallers.num_alumnes', align: 'center' },
  { title: 'ESTAT', key: 'estat', align: 'end', sortable: false },
];

const carregarPeticions = async () => {
  const centreNom = localStorage.getItem('userName'); 
  if (!centreNom) return;
  try {
    const res = await fetch(`/api/peticions/centre/${encodeURIComponent(centreNom)}`);
    if (res.ok) {
      peticions.value = await res.json();
    }
  } catch (error) {
    console.error("Error cargando peticiones:", error);
  }
};

const peticionsFiltrades = (tipo) => {
  if (tipo === 'ASSIGNAT') return peticions.value.filter(p => p.estat === 'ASSIGNAT');
  return peticions.value.filter(p => p.estat !== 'ASSIGNAT');
};

const getEstatColor = (estat) => {
  if (estat === 'REBUTJAT') return 'red-darken-2';
  if (estat === 'PENDENT') return 'orange-darken-2';
  return 'grey-darken-1';
};

const formatEstatText = (estat) => {
  if (estat === 'REBUTJAT') return 'Rebutjat';
  if (estat === 'PENDENT') return 'Pendent';
  return estat;
};

onMounted(carregarPeticions);
</script>

<style scoped>
.uppercase-ceb {
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #000000 !important;
}

/* Contenedor oscuro de la tabla */
.dark-table-card {
  background-color: #1e1e1e !important;
  border-radius: 8px;
  overflow: hidden;
}

/* Configuración de la tabla para letras BLANCAS */
.dark-theme-table {
  background-color: #1e1e1e !important;
  color: #ffffff !important; /* Letras blancas en el cuerpo */
}

/* Cabeceras de la tabla */
.dark-theme-table :deep(th) {
  background-color: #2a2a2a !important;
  color: #ffffff !important; /* Letras blancas en cabecera */
  font-weight: bold !important;
  border-bottom: 1px solid #444 !important;
}

/* Filas y celdas */
.dark-theme-table :deep(td) {
  color: #ffffff !important; /* Forzar blanco en celdas */
  border-bottom: 1px solid #333 !important;
}

/* Efecto hover en filas */
.dark-theme-table :deep(tr:hover) {
  background-color: #333333 !important;
}

/* Buscador */
.custom-search :deep(input) {
  color: #000000 !important;
}

.shadow-sm {
  box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important;
}

.border-bottom {
  border-bottom: 1px solid #e2e8f0;
}
</style>