<template>
  <div class="form-container">
    <h2 class="form-title">Sol·licitud de Tallers ENGINY</h2>
    <form @submit.prevent="enviarFormulari">
      <div class="field-group">
        <label>Nom del Centre:</label>
        <input v-model="form.nom_centre" placeholder="Ex: Escola Torrent" required />
      </div>
      
      <div class="field-group">
        <label>Nom del Coordinador/a:</label>
        <input v-model="form.nom_coordinador" placeholder="Nom i cognoms" required />
      </div>

      <div class="field-group">
        <label>Taller sol·licitat:</label>
        <select v-model="form.seleccio_tallers.taller_id" required>
          <option disabled value="">Selecciona un taller del catàleg</option>
          <option v-for="taller in tallersDisponibles" :key="taller._id" :value="taller._id">
            {{ taller.titol }} (Màxim: {{ taller.places }} places)
          </option>
        </select>
      </div>

      <div v-if="tallerSeleccionat" style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 0.9rem; border-left: 4px solid #2196f3;">
        Límit de capacitat: <strong>{{ tallerSeleccionat.places }}</strong> alumnes.
      </div>

      <div class="field-group">
        <label>Nombre d'alumnes:</label>
        <input 
          type="number" 
          v-model.number="form.seleccio_tallers.num_alumnes" 
          placeholder="Quantitat aproximada" 
          :style="excedeixLimit ? 'border-color: red; background-color: #fff8f8;' : ''"
        />
        <p v-if="excedeixLimit" style="color: red; font-size: 0.8rem; margin-top: 5px; font-weight: bold;">
          ⚠️ El nombre d'alumnes no pot superar les {{ tallerSeleccionat.places }} places.
        </p>
      </div>

      <div class="field-group">
        <label>Professor/a Referent:</label>
        <input v-model="form.referent_contacte.nom" placeholder="Nom del referent" />
      </div>
      
      <div class="field-group">
        <label>Correu de contacte:</label>
        <input type="email" v-model="form.referent_contacte.correu" placeholder="exemple@centre.cat" />
      </div>

      <div class="field-group">
        <label>Comentaris addicionals:</label>
        <textarea v-model="form.comentaris" placeholder="Explica aquí qualsevol detall rellevant..." rows="4"></textarea>
      </div>

      <button type="submit" class="submit-btn" :disabled="excedeixLimit" :style="excedeixLimit ? 'background-color: #ccc; cursor: not-allowed;' : ''">
        {{ excedeixLimit ? 'Revisa el nombre d\'alumnes' : 'Enviar Sol·licitud' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const tallersDisponibles = ref([]);
const form = ref({
  nom_centre: '',
  nom_coordinador: '',
  seleccio_tallers: { taller_id: '', num_alumnes: 0 },
  referent_contacte: { nom: '', correu: '' },
  comentaris: ''
});

// Cerquem el taller seleccionat per obtenir les seves places
const tallerSeleccionat = computed(() => {
  return tallersDisponibles.value.find(t => t._id === form.value.seleccio_tallers.taller_id);
});

// Validació de límit de places
const excedeixLimit = computed(() => {
  if (!tallerSeleccionat.value) return false;
  return form.value.seleccio_tallers.num_alumnes > tallerSeleccionat.value.places;
});

onMounted(async () => {
  try {
    // CORRECCIÓ: Ruta relativa per usar el PROXY de vite.config.js
    const res = await fetch('/api/tallers');
    tallersDisponibles.value = await res.json();
  } catch (error) {
    console.error("Error carregant tallers:", error);
  }
});

const enviarFormulari = async () => {
  if (excedeixLimit.value) return;

  try {
    // CORRECCIÓ: Ruta relativa per usar el PROXY
    const res = await fetch('/api/peticions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    if (res.ok) {
      alert("Petició guardada correctament!");
      location.reload();
    }
  } catch (error) {
    alert("Error en connectar amb el servidor.");
  }
};
</script>

<style scoped>
.form-container {
  max-width: 550px;
  margin: 30px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #fdfdfd;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.form-title {
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 25px;
  font-weight: 700;
}

.field-group {
  margin-bottom: 20px;
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  color: #333 !important;
}

input, select, textarea {
  background-color: #f2f2f2;
  border: 2px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  width: 100%;
  display: block;
  box-sizing: border-box;
  font-size: 1rem;
  color: #000 !important;
  transition: border-color 0.3s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4CAF50;
  background-color: #fff;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #45a049;
}
</style>