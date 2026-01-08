<script setup>
import { useRouter } from 'vue-router'; const router = useRouter()
</script>

<template>
  <v-container class="admin-wrapper pa-10" fluid>
    <div class="d-flex justify-space-between align-start mb-8">
      <div class="d-flex align-center">
        <v-btn icon="mdi-arrow-left" variant="text" color="black" class="mr-4" @click="router.push('/admin/indexadmin')"/>
        <div><h1 class="text-h4 font-weight-bold mb-1" style="color: black;">Informes i Mètriques</h1><p class="text-subtitle-1 text-grey-darken-1">Analitza el rendiment del programa.</p></div>
      </div>
      <div class="d-flex mt-2"><v-btn color="black" class="text-white mr-2" prepend-icon="mdi-file-pdf-box">PDF</v-btn><v-btn color="black" class="text-white" prepend-icon="mdi-file-excel">CSV</v-btn></div>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-card variant="flat" class="pa-6 border-consorci bg-white">
          <h3 class="text-subtitle-1 font-weight-bold mb-6">Satisfacció General</h3>
          <div class="bg-grey-lighten-4 py-10 rounded d-flex align-end justify-center" style="height: 200px; gap: 10px;">
             <div style="width: 40px; height: 80%; background-color: black;"/><div style="width: 40px; height: 60%; background-color: #666;"/><div style="width: 40px; height: 90%; background-color: black;"/>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="flat" class="pa-6 border-consorci bg-white">
          <h3 class="text-subtitle-1 font-weight-bold mb-6">Assistència Mitjana</h3>
          <div class="bg-grey-lighten-4 py-10 rounded d-flex flex-column align-center justify-center">
            <span class="text-h2 font-weight-bold">94.2%</span><v-icon size="40" class="mt-2">mdi-trending-up</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.admin-wrapper { min-height: 100vh; background-color: white; }
.border-consorci { border: 1px solid rgba(0, 0, 0, 0.1) !important; border-radius: 8px; }
</style>