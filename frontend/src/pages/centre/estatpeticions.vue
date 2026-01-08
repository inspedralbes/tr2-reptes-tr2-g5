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
<td>{{ peticio.taller_titol || 'No especificat' }}</td>          <td>{{ peticio.seleccio_tallers?.num_alumnes }}</td>
          <td>
            <span :class="peticio.estat?.estat_boolean ? 'completat' : 'pendent'">
              {{ peticio.estat?.estat_boolean ? 'Assignat' : 'Pendent' }}
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
    const res = await fetch('http://localhost:3000/api/peticions');
    if (res.ok) {
      peticions.value = await res.json();
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