<template>
  <v-container fluid class="pa-10 bg-white h-100">
    <!-- ENCALEZADO -->
    <div class="d-flex justify-space-between align-center mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2 text-black">Gestió d'Usuaris</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Administració de comptes, rols i accessos.</p>
      </div>
      <v-btn color="black" prepend-icon="mdi-plus" size="large" @click="openDialog()">
        Crear Usuari
      </v-btn>
    </div>

    <!-- TABLA DE USUARIOS -->
    <v-card variant="outlined" class="border-consorci mb-6">
      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        class="elevation-0"
        item-value="_id"
      >
        <!-- ROL CHIP -->
        <template v-slot:item.rol="{ item }">
          <v-chip
            :color="getRoleColor(item.rol)"
            size="small"
            class="font-weight-bold text-uppercase"
            variant="flat"
          >
            {{ item.rol }}
          </v-chip>
        </template>

        <!-- ACCIONES -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-btn icon="mdi-pencil" variant="text" size="small" color="blue" @click="openDialog(item)" />
            <v-btn icon="mdi-delete" variant="text" size="small" color="red" @click="confirmDelete(item)" />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- DIALOGO CREAR / EDITAR -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="pa-4 bg-black text-white">
          <span class="text-h6">{{ editedIndex === -1 ? 'Crear Nou Usuari' : 'Editar Usuari' }}</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedItem.nom"
              label="Nom Complet"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'El nom és obligatori']"
            ></v-text-field>

            <v-text-field
              v-model="editedItem.email"
              label="Email"
              variant="outlined"
              density="comfortable"
              type="email"
              :rules="[v => !!v || 'L\'email és obligatori']"
            ></v-text-field>

            <v-select
              v-model="editedItem.rol"
              :items="['admin', 'centre', 'professor']"
              label="Rol"
              variant="outlined"
              density="comfortable"
            ></v-select>

            <v-text-field
              v-if="editedIndex === -1"
              v-model="editedItem.password"
              label="Contrasenya"
              variant="outlined"
              density="comfortable"
              type="password"
              :rules="[v => !!v || 'La contrasenya és obligatòria']"
            ></v-text-field>
            
            <v-text-field
              v-else
              v-model="editedItem.password"
              label="Nova Contrasenya (Opcional)"
              variant="outlined"
              density="comfortable"
              type="password"
              hint="Deixar en blanc per mantenir l'actual"
              persistent-hint
            ></v-text-field>

          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="close">Cancel·lar</v-btn>
          <v-btn color="black" variant="flat" class="px-4" @click="save">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOGO CONFIRMAR ELIMINAR -->
    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4">Confirmar eliminació</v-card-title>
        <v-card-text>Estàs segur que vols eliminar l'usuari <b>{{ editedItem.nom }}</b>?</v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDelete">Cancel·lar</v-btn>
          <v-btn color="red" variant="flat" @click="deleteItemConfirm">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- FEEDBACK -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Tancar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const users = ref([]);
const loading = ref(true);
const dialog = ref(false);
const dialogDelete = ref(false);
const editedIndex = ref(-1);
const valid = ref(false);

const headers = [
  { title: 'Nom', key: 'nom', align: 'start' },
  { title: 'Email', key: 'email' },
  { title: 'Rol', key: 'rol' },
  { title: 'Accions', key: 'actions', sortable: false, align: 'end' },
];

const defaultItem = {
  nom: '',
  email: '',
  rol: 'centre',
  password: ''
};

const editedItem = reactive({ ...defaultItem });

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const fetchUsers = async () => {
    loading.value = true;
    try {
        const res = await fetch('/api/users'); // Proxy handling connection to 3001
        if (res.ok) {
            users.value = await res.json();
        } else {
            showSnackbar("Error al carregar usuaris", "error");
        }
    } catch (e) {
        showSnackbar("Error de connexió", "error");
    } finally {
        loading.value = false;
    }
};

onMounted(fetchUsers);

const getRoleColor = (rol) => {
    if (rol === 'admin') return 'purple-lighten-4 text-purple-darken-4';
    if (rol === 'centre') return 'blue-lighten-4 text-blue-darken-4';
    return 'grey-lighten-3';
};

const openDialog = (item) => {
    if (item) {
        editedIndex.value = users.value.indexOf(item);
        Object.assign(editedItem, item);
        editedItem.password = ''; // Don't show password
    } else {
        editedIndex.value = -1;
        Object.assign(editedItem, defaultItem);
    }
    dialog.value = true;
};

const close = () => {
    dialog.value = false;
    setTimeout(() => {
        editedIndex.value = -1;
        Object.assign(editedItem, defaultItem);
    }, 300);
};

const save = async () => {
    if(!editedItem.nom || !editedItem.email) return; 

    // Determine URL and Method
    const url = editedIndex.value === -1 
        ? '/api/users' 
        : `/api/users/${editedItem._id}`;
    
    const method = editedIndex.value === -1 ? 'POST' : 'PUT';
    
    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editedItem)
        });

        if (res.ok) {
            showSnackbar(`Usuari ${editedIndex.value === -1 ? 'creat' : 'actualitzat'} correctament`, 'success');
            fetchUsers();
            close();
        } else {
            const d = await res.json();
            showSnackbar(d.error || "Error al guardar", "error");
        }
    } catch (e) {
        showSnackbar("Error de connexió", "error");
    }
};

const confirmDelete = (item) => {
    Object.assign(editedItem, item);
    dialogDelete.value = true;
};

const closeDelete = () => {
    dialogDelete.value = false;
};

const deleteItemConfirm = async () => {
    try {
        const res = await fetch(`/api/users/${editedItem._id}`, { method: 'DELETE' });
        if (res.ok) {
            showSnackbar("Usuari eliminat", "success");
            fetchUsers();
        } else {
            showSnackbar("Error al eliminar", "error");
        }
    } catch (e) {
        showSnackbar("Error de connexió", "error");
    }
    closeDelete();
};

const showSnackbar = (text, color) => {
    snackbarText.value = text;
    snackbarColor.value = color;
    snackbar.value = true;
};
</script>

<style scoped>
.bg-white { background-color: white !important; }
.border-consorci { border: 1px solid #e0e0e0; }
</style>
