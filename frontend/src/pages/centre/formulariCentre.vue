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
          >
            {{ taller.titol }} — {{ taller.data }}
            </option>
        </select>
      </div>

      <div v-if="tallerSeleccionat" style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 0.9rem; border-left: 4px solid #2196f3;">
        Data del taller: <strong>{{ tallerSeleccionat.data }}</strong>
      </div>

      <div class="field-group">
        <label>Nombre d'alumnes: *</label>
        <select 
          v-model="form.seleccio_tallers.num_alumnes" 
          required
          :disabled="!form.seleccio_tallers.taller_id"
        >
          <option disabled value="0">Selecciona el nombre d'alumnes</option>
          <option value="5">Entre 0 i 5 alumnes</option>
          <option value="10">Entre 5 i 10 alumnes</option>
          <option value="15">Entre 10 i 15 alumnes</option>
        </select>
      </div>

      <div class="field-group">
        <label>Nivell d'interès en aquest taller: *</label>
        <select v-model="form.nivell_interes" required>
          <option disabled value="">Selecciona el nivell d'interès</option>
          <option value="Baix">Baix</option>
          <option value="Mig">Mig</option>
          <option value="Alt">Alt</option>
        </select>
      </div>

      <div class="field-group">
        <label>Professor/a Referent: *</label>
        <input v-model="form.referent_contacte.nom" placeholder="Nom del referent" required />
      </div>
      
      <div class="field-group">
        <label>Correu de contacte professor/a referent: *</label>
        <input type="email" v-model="form.referent_contacte.correu" placeholder="exemple@centre.cat" required />
      </div>

      <div class="field-group">
        <label>Comentaris addicionals (opcional):</label>
        <textarea v-model="form.comentaris" placeholder="Explica aquí qualsevol detall rellevant..." rows="4"></textarea>
      </div>

      <button 
        type="submit" 
        class="submit-btn" 
        :disabled="!form.seleccio_tallers.taller_id || form.seleccio_tallers.num_alumnes === 0" 
        :style="(!form.seleccio_tallers.taller_id || form.seleccio_tallers.num_alumnes === 0) ? 'background-color: #ccc; cursor: not-allowed;' : ''"
      >
        Enviar Sol·licitud
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; 

const router = useRouter();

const tallersDisponibles = ref([]);

const form = ref({
  nom_centre: '',
  nom_coordinador: '',
  seleccio_tallers: { taller_id: '', num_alumnes: 0 },
  nivell_interes: '',
  referent_contacte: { nom: '', correu: '' },
  comentaris: ''
});

const tallerSeleccionat = computed(() => {
  return tallersDisponibles.value.find(t => t._id === form.value.seleccio_tallers.taller_id);
});

onMounted(async () => {
  const nomUsuariLoguejat = localStorage.getItem('userName');
  if (nomUsuariLoguejat) {
    form.value.nom_centre = nomUsuariLoguejat;
  }

  try {
    const resTallers = await fetch('/api/tallers');
    tallersDisponibles.value = await resTallers.json();
  } catch (error) {
    console.error("Error carregant dades:", error);
  }
});

const enviarFormulari = async () => {
  const f = form.value;
  
  if (!f.nom_centre || !f.nom_coordinador || !f.seleccio_tallers.taller_id || f.seleccio_tallers.num_alumnes <= 0 || !f.nivell_interes || !f.referent_contacte.nom || !f.referent_contacte.correu) {
    alert("Si us plau, emplena tots els camps obligatoris.");
    return;
  }

  if (!confirm(`Confirmes la sol·licitud per al taller: "${tallerSeleccionat.value.titol}" el dia ${tallerSeleccionat.value.data} amb un interès ${f.nivell_interes}?`)) return;

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
/* Los mismos estilos que tenías */
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
.field-group { margin-bottom: 20px; }
label { font-weight: 600; display: block; margin-bottom: 8px; color: #333 !important; }
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
}
.d-flex { display: flex; }
.align-center { align-items: center; }
.mr-4 { margin-right: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-0 { margin-bottom: 0 !important; }
</style>