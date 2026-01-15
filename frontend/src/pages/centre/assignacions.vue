<template>
  <div class="assignacions-container">
    <h2>Tallers Confirmats i Assignacions</h2>
    
    <div v-if="assignacions.length === 0" class="no-data">
      Encara no teniu cap taller assignat oficialment.
    </div>

    <div v-else class="grid-assignacions">
      <div v-for="item in assignacions" :key="item._id" class="card">
        <div class="card-header">
          <h3>{{ item.taller_titol }}</h3>
          <span class="badge">Assignat</span>
        </div>
        
        <div class="card-body">
          <p><strong>Centre:</strong> {{ item.nom_centre }}</p>
          <p><strong>Alumnes:</strong> {{ item.seleccio_tallers.num_alumnes }}</p>
          
          <div class="referents-box">
            <h4>Professors Referents:</h4>
            <ul>
              <li>{{ item.referent_contacte.nom }} ({{ item.referent_contacte.correu }})</li>
              <li v-if="item.referent_contacte.nom_segon">{{ item.referent_contacte.nom_segon }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const assignacions = ref([]);

const carregarAssignacions = async () => {
  try {
    const nomDelCentre = localStorage.getItem('userName');
    const res = await fetch(`/api/peticions/centre/${encodeURIComponent(nomDelCentre)}`);
    
    if (res.ok) {
      const dades = await res.json();
      
      // FILTRE: Només les que SÍ que estan assignades
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
}

.card-header {
  background-color: #ececec; /* El teu gris de referència */
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

.card-body {
  padding: 15px;
}

.referents-box {
  margin-top: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.btn-detalls {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #2196F3;
  color: white;
  cursor: pointer;
}

.no-data {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>