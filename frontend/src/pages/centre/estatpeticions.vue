<template>
  <div class="list-container">
    <h2>Estat de les meves sol·licituds</h2>

    <p v-if="peticions.length === 0">No s'han trobat peticions.</p>

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
    <span :class="peticio.estat === 'ASSIGNAT' ? 'completat' : 'pendent'">
      {{ peticio.estat === 'ASSIGNAT' ? 'Assignat' : 'Pendent' }}
    </span>
  </td>
</tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const peticions = ref([]);

// Funció per anar a buscar les dades al backend
const carregarPeticions = async () => {
  try {
    const nomDelCentre = localStorage.getItem('userName'); 
    
    if (nomDelCentre) {
      const res = await fetch(`/api/peticions/centre/${encodeURIComponent(nomDelCentre)}`);
      
      if (res.ok) {
        const totes = await res.json();
        
        // FILTRE: Només guardem les que NO estan assignades
        // Això fa que quan s'assignin, desapareguin d'aquesta llista
        peticions.value = totes.filter(p => p.estat !== 'ASSIGNAT');
      }
    }
  } catch (error) {
    console.error("Error carregant les peticions:", error);
  }
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

/* Estils per a l'estat */
.pendent {
  color: #856404;
  background-color: #fff3cd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.completat {
  color: #155724;
  background-color: #d4edda;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>