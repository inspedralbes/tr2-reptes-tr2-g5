<template>
  <div class="form-container">
    <h2>Sol·licitud de Tallers ENGINY</h2>
    <form @submit.prevent="enviarFormulari">
      <label>Nom del Centre:</label>
      <input v-model="form.nom_centre" placeholder="Ex: Escola Torrent" required />
      
      <label>Nom del Coordinador/a:</label>
      <input v-model="form.nom_coordinador" placeholder="Nom i cognoms" required />

      <label>Taller sol·licitat:</label>
      <select v-model="form.seleccio_tallers.taller_id" required>
        <option disabled value="">Selecciona un taller del catàleg</option>
        <option v-for="taller in tallersDisponibles" :key="taller._id" :value="taller._id">
          {{ taller.titol }} (Modalitat {{ taller.modalitat }})
        </option>
      </select>

      <label>Nombre d'alumnes:</label>
      <input type="number" v-model="form.seleccio_tallers.num_alumnes" placeholder="Quantitat aproximada" />

      <label>Professor/a Referent:</label>
      <input v-model="form.referent_contacte.nom" placeholder="Nom del referent" />
      
      <label>Correu de contacte:</label>
      <input type="email" v-model="form.referent_contacte.correu" placeholder="exemple@centre.cat" />

      <button type="submit">Enviar Sol·licitud</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const tallersDisponibles = ref([]);
const form = ref({
  nom_centre: '',
  nom_coordinador: '',
  seleccio_tallers: { 
    taller_id: '', 
    num_alumnes: 0 
  },
  referent_contacte: { 
    nom: '', 
    correu: '' 
  }
});

// Carregar els tallers del catàleg en iniciar per omplir el select [cite: 35, 37]
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/tallers');
    tallersDisponibles.value = await res.json();
  } catch (error) {
    console.error("Error carregant tallers:", error);
  }
});

// Enviar la petició al backend per guardar-la a MongoDB [cite: 40]
const enviarFormulari = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/peticions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    if (res.ok) {
      alert("Petició guardada correctament a la base de dades!");
    }
  } catch (error) {
    alert("Error en connectar amb el servidor.");
  }
};
</script>

<style scoped>
/* Apliquem el color gris als recuadres del formulari */
input, select {
  background-color: #ececec; /* Color gris */
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  width: 100%;
  display: block;
  box-sizing: border-box; /* Perquè el padding no surti del recuadrado */
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
  font-family: sans-serif;
  color: black;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>