<template>
  <v-container class="pa-0" fluid>
    <v-sheet color="blue-darken-4" class="py-8 px-4 text-center">
      <h1 class="text-h4 font-weight-bold text-white">Programa ENGINY</h1>
      <p class="text-subtitle-1 text-blue-lighten-4">Consorci d'Educació de Barcelona</p>
    </v-sheet>

    <v-container class="py-10">
      <v-row>
        <v-col cols="12" md="8">
          <div class="border-bottom mb-4">
            <h2 class="text-h5 text-blue-darken-4 pb-2">Sobre el programa</h2>
          </div>
          
          <p class="text-body-1 mb-6">
            L'objectiu d'aquest aplicatiu és permetre als centres educatius la 
            <strong>sol·licitud de tallers</strong> del catàleg disponible[cite: 3, 4], 
            indicant el nombre d'alumnes i les seves preferències[cite: 5].
          </p>

          <v-row class="mt-4">
            <v-col cols="12" sm="6">
              <v-card variant="outlined" color="grey-lighten-2" class="pa-4 text-grey-darken-3">
                <v-icon color="blue-darken-4" class="mb-2">mdi-toolbox</v-icon>
                <div class="font-weight-bold text-blue-darken-4">Catàleg de Tallers</div>
                <div class="text-caption">Selecció de modalitats A, B i C[cite: 18].</div>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card variant="outlined" color="grey-lighten-2" class="pa-4 text-grey-darken-3">
                <v-icon color="blue-darken-4" class="mb-2">mdi-account-check</v-icon>
                <div class="font-weight-bold text-blue-darken-4">Assignacions</div>
                <div class="text-caption">Consulta de places i professors referents[cite: 6, 11].</div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" md="4">
          <div class="bg-grey-lighten-4 pa-6 rounded-lg border">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 text-uppercase">Accés a la gestió</h3>
            
            <v-btn 
              block 
              color="blue-darken-4" 
              variant="flat" 
              class="mb-4 text-none" 
              to="/login"
            >
              Iniciar sessió
            </v-btn>

            <v-divider class="my-4"></v-divider>
            
            <div class="text-caption text-grey-darken-1">
              <strong>Recordatori:</strong> Un cop tinguis les places assignades, cal completar el 
              <em>checklist final</em> per validar el procés[cite: 7, 21].
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<style scoped>
.border-bottom {
  border-bottom: 2px solid #004580;
}
</style>