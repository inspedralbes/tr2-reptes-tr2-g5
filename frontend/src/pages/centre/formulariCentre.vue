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
      <input 
        v-model="form.coordinador.nom" 
        readonly 
        class="input-readonly" 
        placeholder="Nom i cognoms" 
        required 
      />
      <small style="color: #666;">Dada recuperada del registre d'activació.</small>
      </div>
      <div class="field-group">
      <label>Correu del Coordinador/a: *</label>
      <input 
        v-model="form.coordinador.email" 
        readonly 
        class="input-readonly" 
        required 
      />
      <small style="color: #666;">Dades automàtiques del vostre perfil de centre.</small>
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
        <div class="field-group checkbox-group">
        <label class="d-flex align-center cursor-pointer">
        <input 
          type="checkbox" 
          v-model="form.primera_vegada" 
          style="width: auto; margin-right: 12px;"
        />
        <span>És la primera vegada que el centre participa en aquest taller?</span>
      </label>
    </div>


      <button 
        type="submit" 
        class="submit-btn" 
        :disabled="!form.seleccio_tallers.taller_id || form.seleccio_tallers.num_alumnes === 0 || !form.coordinador.email" 
        :style="(!form.seleccio_tallers.taller_id || form.seleccio_tallers.num_alumnes === 0 || !form.coordinador.email) ? 'background-color: #ccc; cursor: not-allowed;' : ''"
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
  coordinador: {
    nom: '',
    email: ''
  },
  seleccio_tallers: { taller_id: '', num_alumnes: 0 },
  nivell_interes: '',
  primera_vegada: false,
  referent_contacte: { nom: '', correu: '' },
  comentaris: ''
});
onMounted(async () => {
  // Recuperamos los datos del localStorage
  const nomCentreSaved = localStorage.getItem('userName');
  const nomCoordinadorSaved = localStorage.getItem('coordinadorNom');
  const emailCoordinadorSaved = localStorage.getItem('coordinadorEmail');

  // Los asignamos a la nueva estructura
  if (nomCentreSaved) form.value.nom_centre = nomCentreSaved;
  if (nomCoordinadorSaved) form.value.coordinador.nom = nomCoordinadorSaved;
  if (emailCoordinadorSaved) form.value.coordinador.email = emailCoordinadorSaved;

  // Carga de tallers (mismo código que ya tenías)...
  try {
    const resTallers = await fetch('/api/tallers');
    tallersDisponibles.value = await resTallers.json();
  } catch (error) {
    console.error("Error carregant dades:", error);
  }
});

const enviarFormulari = async () => {
  // Validación de seguridad
  if (!form.value.coordinador.email || !form.value.seleccio_tallers.taller_id) {
    alert("Falten camps obligatoris.");
    return;
  }

  try {
    const res = await fetch('/api/peticions', { // URL Relativa para el Proxy
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value) // Enviamos todo el objeto 'form'
    });

    if (res.ok) {
      alert("Petició guardada correctament!");
      router.push('/centre/indexcentre');
    } else {
      const errorData = await res.json();
      console.error("Error del servidor:", errorData);
      alert("Error: " + (errorData.error || "No s'ha pogut guardar"));
    }
  } catch (error) {
    console.error("Error de xarxa:", error);
    alert("No es pot connectar amb el servidor. ");
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
.checkbox-group {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}
.cursor-pointer { cursor: pointer; }
input[type="checkbox"] {
  accent-color: #4CAF50; 
  transform: scale(1.2);
}
.d-flex { display: flex; }
.align-center { align-items: center; }
.mr-4 { margin-right: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-0 { margin-bottom: 0 !important; }
</style>