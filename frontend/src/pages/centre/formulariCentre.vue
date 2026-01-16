<template>
  <div class="form-container">
    <div class="d-flex align-center mb-6">
      <v-btn 
        icon="mdi-arrow-left" 
        variant="text" 
        color="black" 
        class="mr-4" 
        @click="router.push('/centre/indexcentre')" 
      />
      <h2 class="form-title mb-0" style="text-align: left;">Sol·licitud de Tallers ENGINY</h2>
    </div>

    <form @submit.prevent="enviarFormulari">
      <div class="field-group">
        <label>Nom del Centre: *</label>
        <input 
          v-model="form.nom_centre" 
          readonly 
          class="input-readonly"
          placeholder="Carregant nom del centre..." 
          required 
        />
        <small style="color: #666;">Aquest nom s'assigna automàticament al teu compte.</small>
      </div>
      
      <div class="field-group">
        <label>Nom del Coordinador/a: *</label>
        <input v-model="form.nom_coordinador" placeholder="Nom i cognoms" required />
      </div>

      <div class="field-group">
        <label>Taller sol·licitat: *</label>
        <select v-model="form.seleccio_tallers.taller_id" required>
          <option disabled value="">Selecciona un taller del catàleg</option>
          <option 
            v-for="taller in tallersDisponibles" 
            :key="taller._id" 
            :value="taller._id"
            :disabled="getPlacesRestants(taller) <= 0"
          >
            {{ taller.titol }} 
            <template v-if="getPlacesRestants(taller) <= 0"> —— [PLE] </template>
            <template v-else> (Lliures: {{ getPlacesRestants(taller) }} / {{ taller.places }}) </template>
          </option>
        </select>
        <p v-if="tallerSeleccionat && getPlacesRestants(tallerSeleccionat) <= 0" style="color: #d32f2f; font-size: 0.85rem; margin-top: 5px; font-weight: bold;">
          ⚠️ Aquest taller ja no té places disponibles.
        </p>
      </div>

      <div v-if="tallerSeleccionat && getPlacesRestants(tallerSeleccionat) > 0" style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 0.9rem; border-left: 4px solid #2196f3;">
        Places disponibles actualment: <strong>{{ getPlacesRestants(tallerSeleccionat) }}</strong>.
      </div>

      <div class="field-group">
        <label>Nombre d'alumnes: *</label>
        <input 
          type="number" 
          v-model.number="form.seleccio_tallers.num_alumnes" 
          placeholder="Quants alumnes vindran?" 
          min="1"
          required
          :disabled="!form.seleccio_tallers.taller_id"
          :style="excedeixLimit ? 'border-color: red; background-color: #fff8f8;' : ''"
        />
        <p v-if="excedeixLimit" style="color: red; font-size: 0.8rem; margin-top: 5px; font-weight: bold;">
          ⚠️ No hi ha prou places (Només en queden {{ getPlacesRestants(tallerSeleccionat) }}).
        </p>
      </div>

      <div class="field-group">
        <label>Professor/a Referent: *</label>
        <input v-model="form.referent_contacte.nom" placeholder="Nom del referent" required />
      </div>
      
      <div class="field-group">
        <label>Correu de contacte: *</label>
        <input type="email" v-model="form.referent_contacte.correu" placeholder="exemple@centre.cat" required />
      </div>

      <div class="field-group">
        <label>Comentaris addicionals (opcional):</label>
        <textarea v-model="form.comentaris" placeholder="Explica aquí qualsevol detall rellevant..." rows="4"></textarea>
      </div>

      <button 
        type="submit" 
        class="submit-btn" 
        :disabled="excedeixLimit || !form.seleccio_tallers.taller_id || getPlacesRestants(tallerSeleccionat) <= 0" 
        :style="(excedeixLimit || !form.seleccio_tallers.taller_id) ? 'background-color: #ccc; cursor: not-allowed;' : ''"
      >
        {{ excedeixLimit ? 'Redueix el nombre d\'alumnes' : 'Enviar Sol·licitud' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; 

const router = useRouter();

const tallersDisponibles = ref([]);
const peticionsActives = ref([]); 

const form = ref({
  nom_centre: '',
  nom_coordinador: '',
  seleccio_tallers: { taller_id: '', num_alumnes: 0 },
  referent_contacte: { nom: '', correu: '' },
  comentaris: ''
});

// Cerquem el taller seleccionat
const tallerSeleccionat = computed(() => {
  return tallersDisponibles.value.find(t => t._id === form.value.seleccio_tallers.taller_id);
});

// Calcula places lliures restant les peticions PENDENTS i ASSIGNADES
const getPlacesRestants = (taller) => {
  if (!taller) return 0;
  const alumnesReservats = peticionsActives.value
    .filter(p => p.seleccio_tallers?.taller_id === taller._id && (p.estat === 'PENDENT' || p.estat === 'ASSIGNAT'))
    .reduce((sum, p) => sum + (p.seleccio_tallers?.num_alumnes || 0), 0);
  return taller.places - alumnesReservats;
};

const excedeixLimit = computed(() => {
  if (!tallerSeleccionat.value) return false;
  return form.value.seleccio_tallers.num_alumnes > getPlacesRestants(tallerSeleccionat.value);
});

onMounted(async () => {
  // AFEGIT: Assignar automàticament el nom del centre des de la sessió
  const nomUsuariLoguejat = localStorage.getItem('userName');
  if (nomUsuariLoguejat) {
    form.value.nom_centre = nomUsuariLoguejat;
  }

  try {
    const resTallers = await fetch('/api/tallers');
    tallersDisponibles.value = await resTallers.json();

    const resPeticions = await fetch('/api/peticions');
    peticionsActives.value = await resPeticions.json();
  } catch (error) {
    console.error("Error carregant dades:", error);
  }
});

const enviarFormulari = async () => {
  const f = form.value;
  
  if (!f.nom_centre || !f.nom_coordinador || !f.seleccio_tallers.taller_id || f.seleccio_tallers.num_alumnes <= 0 || !f.referent_contacte.nom || !f.referent_contacte.correu) {
    alert("Si us plau, emplena tots els camps obligatoris.");
    return;
  }

  if (excedeixLimit.value) {
    alert(`Ho sentim, només queden ${getPlacesRestants(tallerSeleccionat.value)} places disponibles.`);
    return;
  }

  if (!confirm(`Confirmes la sol·licitud per a ${f.seleccio_tallers.num_alumnes} alumnes al taller: "${tallerSeleccionat.value.titol}"?`)) return;

  try {
    const res = await fetch('/api/peticions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    if (res.ok) {
      alert("Petició enviada correctament!");
      router.push('/centre/indexcentre');
    } else {
      const data = await res.json();
      alert(data.error || "Error al guardar la petició.");
    }
  } catch (error) {
    alert("Error de connexió amb el servidor.");
  }
};
</script>

<style scoped>
/* AFEGIT: Estil per al camp que no es pot editar */
.input-readonly {
  background-color: #e9ecef !important;
  cursor: not-allowed;
  color: #495057 !important;
  border-color: #ced4da !important;
}

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
.d-flex { display: flex; }
.align-center { align-items: center; }
.mr-4 { margin-right: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-0 { margin-bottom: 0 !important; }

.form-title {
  color: #1a1a1a;
  font-weight: 700;
  flex: 1; 
}
</style>