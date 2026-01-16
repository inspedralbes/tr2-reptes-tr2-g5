<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <div class="d-flex align-center mb-6">
          <v-btn
            icon="mdi-arrow-left"
            variant="tonal"
            color="grey-darken-2"
            class="mr-4"
            @click="goBack"
          ></v-btn>
          <div>
            <h1 class="text-h4 font-weight-bold custom-blue-text">El meu compte</h1>
            <p class="text-subtitle-1 text-grey-darken-1">Gestió de la identitat digital i perfil</p>
          </div>
        </div>

        <v-divider class="mb-8"></v-divider>

        <v-row>
          <v-col cols="12" md="4">
            <v-card variant="flat" border class="pa-6 text-center bg-white rounded-xl shadow-sm">
              <div class="position-relative d-inline-block mb-4">
                <v-avatar size="120" color="grey-lighten-3" class="elevation-2 border-custom">
                  <v-img v-if="user.foto" :src="user.foto" cover></v-img>
                  <v-icon v-else size="70" color="#3465a4">mdi-account</v-icon>
                </v-avatar>
                
                <v-btn
                  icon="mdi-camera"
                  size="small"
                  color="#3465a4"
                  class="position-absolute bottom-0 right-0 border-white"
                  elevation="2"
                  @click="$refs.fileInput.click()"
                ></v-btn>
                
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="onFileChange"
                />
              </div>

              <h3 class="text-h6 font-weight-bold grey-darken-4">{{ user.nom }}</h3>
              <v-chip
                size="small"
                class="mt-2 text-uppercase font-weight-bold"
                color="#3465a4"
                variant="flat"
              >
                {{ user.rol }}
              </v-chip>

              <v-divider class="my-6"></v-divider>
              
              <div class="text-left">
                <p class="text-caption text-grey-darken-1 mb-1 font-weight-bold uppercase-tracking">Estat del compte</p>
                <div class="d-flex align-center text-body-2 mb-4">
                  <v-icon size="small" color="success" class="mr-2">mdi-check-decagram</v-icon>
                  Usuari Actiu
                </div>
                <p class="text-caption text-grey">
                  Alta al sistema:<br>
                  <span class="font-weight-bold">{{ formatDate(user.data_registre) }}</span>
                </p>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="8">
            <v-card variant="flat" border class="rounded-xl bg-white overflow-hidden">
              <v-toolbar color="transparent" class="px-4" flat>
                <v-toolbar-title class="text-subtitle-1 font-weight-bold">
                  Informació Personal
                </v-toolbar-title>
              </v-toolbar>
              
              <v-card-text class="pa-6 pt-0">
                <div v-if="loading" class="text-center py-10">
                  <v-progress-circular indeterminate color="#3465a4"></v-progress-circular>
                </div>

                <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
                  {{ error }}
                </v-alert>

                <div v-else>
                  <div class="info-row">
                    <span class="label">Nom complet</span>
                    <span class="value font-weight-bold">{{ user.nom }}</span>
                  </div>
                  
                  <v-divider></v-divider>
                  
                  <div class="info-row">
                    <span class="label">Adreça electrònica</span>
                    <span class="value">{{ user.email }}</span>
                  </div>
                  
                  <v-divider></v-divider>
                  
                  <div class="info-row">
                    <span class="label">Rol assignat</span>
                    <div class="value d-flex align-center">
                      <v-icon size="small" color="#3465a4" class="mr-2">mdi-shield-account</v-icon>
                      <span class="text-capitalize">{{ user.rol }}</span>
                    </div>
                  </div>

                  <v-divider></v-divider>

                  <div class="info-row">
                    <span class="label">ID d'usuari</span>
                    <span class="value font-mono text-grey">{{ user._id || user.id }}</span>
                  </div>
                </div>
              </v-card-text>

              <v-divider></v-divider>
              <div class="pa-6 bg-grey-lighten-5">
                <p class="text-caption text-grey-darken-1 mb-0">
                  <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
                  Per modificar les dades de contacte, poseu-vos en contacte amb l'administrador del sistema.
                </p>
              </div>
            </v-card>

            <p class="mt-6 text-caption text-grey text-center">
              © {{ new Date().getFullYear() }} Consorci d'Educació de Barcelona.
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(null);
const user = ref({});
const fileInput = ref(null);

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
            throw new Error('No s’ha pogut connectar amb el servidor');
        }
        
        const data = await response.json();
        user.value = data;

        // Recuperar foto persistente o del store
        const persistentFoto = localStorage.getItem(`userFoto_${data.email}`);
        if (data.foto) {
            authStore.user.foto = data.foto;
            localStorage.setItem('userFoto', data.foto);
        } else if (persistentFoto) {
            user.value.foto = persistentFoto;
            authStore.user.foto = persistentFoto;
        } else {
            user.value.foto = localStorage.getItem('userFoto');
        }

    } catch (err) {
        console.error(err);
        error.value = "No s'han pogut carregar les dades del perfil.";
    } finally {
        loading.value = false;
    }
};

const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Image = event.target.result;
            
            user.value.foto = base64Image;
            
            if (authStore.user) {
                authStore.user.foto = base64Image;
            }

            // Clave persistente por email para que no se pierda al cerrar sesión
            const userEmail = user.value.email || localStorage.getItem('userEmail');
            if (userEmail) {
                localStorage.setItem(`userFoto_${userEmail}`, base64Image);
            }
            
            localStorage.setItem('userFoto', base64Image);
            console.log("Foto de perfil actualizada.");
        };
        reader.readAsDataURL(file);
    }
}; // <--- AQUÍ FALTABA ESTA LLAVE

const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
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

<style scoped>
.custom-blue-text {
  color: #3465a4 !important;
}
.border-custom {
  border: 3px solid #3465a4 !important;
}
.border-white {
  border: 2px solid white !important;
}
.uppercase-tracking {
  text-transform: uppercase;
  letter-spacing: 1px;
}
.font-mono {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.85rem;
}
.info-row {
  display: flex;
  padding: 20px 0;
  align-items: center;
}
.label {
  flex: 0 0 35%;
  color: #757575;
  font-size: 0.9rem;
}
.value {
  flex: 1;
  color: #212121;
}
@media (max-width: 600px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .label {
    margin-bottom: 5px;
  }
}
:deep(.v-card--variant-flat) {
  border: 1px solid #e0e6ed !important;
}
h1 {
  letter-spacing: -1px !important;
}
</style>