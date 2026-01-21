<template>
  <div class="list-container">
    <div class="d-flex align-center mb-6">
      <v-btn 
        icon="mdi-arrow-left" 
        variant="text" 
        color="black" 
        class="mr-4" 
        @click="router.push('/centre/indexcentre')" 
      />
      <h2 class="text-h4 font-weight-bold mb-0">Estat de les meves sol·licituds</h2>
    </div>
    
    <p v-if="peticions.length === 0">No s'han trobat sol·licituds pendents o rebutjades.</p>

    <table v-else>
      <thead>
        <tr>
          <th>Centre</th>
          <th>Taller</th>
          <th>Alumnes</th>
          <th>Estat</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="peticio in peticions" :key="peticio._id">
          <td>{{ peticio.nom_centre }}</td>
          <td>{{ peticio.taller_titol || 'No especificat' }}</td>
          <td>{{ peticio.seleccio_tallers?.num_alumnes }}</td>
          <td>
            <span :class="getEstatClass(peticio.estat)">
              {{ formatEstatText(peticio.estat) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; 

const router = useRouter();               

const peticions = ref([]);

// Funció per anar a buscar les dades al backend
const carregarPeticions = async () => {
  const centreNom = localStorage.getItem('userName'); 
  if (!centreNom) return;

  try {
    // Esta ruta debe existir en tu index.js de rutas del backend
    const res = await fetch(`/api/peticions/centre/${encodeURIComponent(centreNom)}`);
    if (res.ok) {
      peticions.value = await res.json();
    }
  } catch (error) {
    console.error("Error al llistar:", error);
  }
};

// Funcions auxiliars per gestionar els estats sense esborrar res
const getEstatClass = (estat) => {
  if (estat === 'REBUTJAT') return 'rebutjat';
  return 'pendent'; // Per a PENDENT o qualsevol altre que no sigui ASSIGNAT
};

const formatEstatText = (estat) => {
  if (estat === 'REBUTJAT') return 'Rebutjat';
  if (estat === 'PENDENT') return 'Pendent';
  return estat;
};

// Executar la funció quan el component s'ha muntat
onMounted(() => {
  carregarPeticions();
});
</script>

<style scoped>
.list-container {
  max-width: 800px;
  margin: 20px auto;
  font-family: sans-serif;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

/* Apliquem el color gris de fons a les capçaleres per coherència */
th {
  background-color: #ececec;
  font-weight: bold;
}

/* Estils per a l'estat Pendent (Groc/Marró) */
.pendent {
  color: #856404;
  background-color: #fff3cd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: bold;
}

/* Estils per a l'estat Rebutjat (Vermell) - AFEGIT */
.rebutjat {
  color: #721c24;
  background-color: #f8d7da;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: bold;
}

/* Mantinc la classe completat per si la necessites en un futur, 
encara que el filtre l'exclogui d'aquesta llista */
.completat {
  color: #155724;
  background-color: #d4edda;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

/* CLASSES PER L'ALINEACIÓ DEL BOTÓ */
.d-flex { display: flex; }
.align-center { align-items: center; }
.mr-4 { margin-right: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-0 { margin-bottom: 0 !important; }
</style>