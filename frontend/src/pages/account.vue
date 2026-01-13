<template>
  <v-container fluid class="fill-height bg-grey-lighten-4 pa-0">
    <v-row no-gutters class="fill-height justify-center align-center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="elevation-4 rounded-lg">
          <v-toolbar color="blue-darken-4" dark>
             <v-toolbar-title class="font-weight-bold">El meu compte</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text class="pa-6">
            <div v-if="loading" class="text-center py-5">
              <v-progress-circular indeterminate color="blue-darken-4"></v-progress-circular>
              <p class="mt-2 text-grey">Carregant dades...</p>
            </div>

            <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
              {{ error }}
            </v-alert>

            <div v-else>
               <v-list lines="two">
                  <v-list-item prepend-icon="mdi-account">
                    <v-list-item-title>Nom</v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 text-high-emphasis">{{ user.nom }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-divider inset></v-divider>

                  <v-list-item prepend-icon="mdi-email">
                    <v-list-item-title>Correu Electrònic</v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 text-high-emphasis">{{ user.email }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-divider inset></v-divider>

                  <v-list-item prepend-icon="mdi-shield-account">
                    <v-list-item-title>Rol</v-list-item-title>
                     <v-list-item-subtitle class="text-body-1 text-high-emphasis text-capitalize">{{ user.rol }}</v-list-item-subtitle>
                  </v-list-item>
                   <v-divider inset></v-divider>

                   <v-list-item prepend-icon="mdi-calendar-range">
                    <v-list-item-title>Data de registre</v-list-item-title>
                     <v-list-item-subtitle class="text-body-1 text-high-emphasis">{{ formatDate(user.data_registre) }}</v-list-item-subtitle>
                  </v-list-item>
               </v-list>
            </div>
          </v-card-text>
          
           <v-divider></v-divider>

          <v-card-actions class="pa-4 justify-end">
            <v-btn color="grey-darken-1" variant="text" @click="goBack">
              Tornar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const user = ref({});

const fetchUserData = async () => {
    loading.value = true;
    error.value = null;
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            router.push('/login');
            return;
        }

        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            throw new Error('Error al carregar les dades de l\'usuari');
        }
        user.value = await response.json();
    } catch (err) {
        console.error(err);
        error.value = err.message || "Error desconegut";
    } finally {
        loading.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'Desconeguda';
    return new Date(dateString).toLocaleDateString('ca-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const goBack = () => {
    router.back();
};

onMounted(() => {
    fetchUserData();
});
</script>
