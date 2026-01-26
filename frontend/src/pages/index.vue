<template>
  <v-container class="pa-0" fluid>
    <v-sheet color="#3465a4" class="header-pattern py-12 px-4" dark>
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center mb-6">
              <div class="linea-gencat-vibrant mr-5"></div>
              <div>
                <h1 class="text-h2 font-weight-black text-white main-title">
                  Programa <span class="text-blue-lighten-4">ENGINY</span>
                </h1>
                <p class="text-h6 font-weight-light text-blue-lighten-4 mt-2">
                  Consorci d'Educació de Barcelona
                </p>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-4">
              <v-chip variant="outlined" color="white" class="backdrop-blur">Generalitat de Catalunya</v-chip>
              <v-chip variant="outlined" color="white" class="backdrop-blur ml-2">Ajuntament de Barcelona</v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="hidden-sm-and-down text-right">
            <v-avatar size="140" color="rgba(255,255,255,0.1)" class="border-white-thin">
              <v-icon size="70" color="white">mdi-lightbulb-on-outline</v-icon>
            </v-avatar>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
    <v-container class="py-12 px-6">
      <v-row>
        <v-col cols="12" md="8">
          <section class="mb-10">
            <div class="section-tag mb-2">CONTEXT I TRAJECTÒRIA</div>
            <h2 class="text-h4 font-weight-bold text-grey-darken-4 mb-4">Un recurs per a l'èxit educatiu</h2>
            <p class="text-body-1 text-grey-darken-2 leading-extra-relaxed">
              El <strong>Programa Enginy</strong> té una llarga trajectòria al Consorci d’Educació de Barcelona. Evolucionant des dels antics tallers TECNE (2003/04), avui es consolida com un 
              <strong>recurs orientador i inclusiu</strong>. El seu objectiu principal és garantir l’escolarització de tothom i evitar l’absentisme, ajustant la resposta educativa als diferents ritmes i estils d’aprenentatge.
            </p>
            <v-row class="mt-6">
              <v-col cols="12" sm="4" v-for="(info, i) in dadesClau" :key="i">
                <div class="pa-4 bg-blue-lighten-5 rounded-lg border-left-highlight">
                  <div class="text-caption font-weight-bold text-blue-darken-3 text-uppercase">{{ info.titol }}</div>
                  <div class="text-h6 font-weight-bold text-grey-darken-3">{{ info.valor }}</div>
                </div>
              </v-col>
            </v-row>
          </section>
          <section class="mb-10">
            <div class="section-tag mb-2">QUÈ VOLEM ACONSEGUIR?</div>
            <h2 class="text-h4 font-weight-bold text-grey-darken-4 mb-6">Objectius Estratègics</h2>
            <v-row>
              <v-col cols="12" sm="6" v-for="(obj, i) in objectius" :key="i" class="py-2">
                <div class="d-flex align-start">
                  <v-icon color="#3465a4" class="mr-3 mt-1">mdi-check-circle</v-icon>
                  <span class="text-body-2 text-grey-darken-3 leading-normal">{{ obj }}</span>
                </div>
              </v-col>
            </v-row>
          </section>
          <section>
            <div class="section-tag mb-2">ÀMBITS PROFESSIONALS</div>
            <h2 class="text-h4 font-weight-bold text-grey-darken-4 mb-4">Exploració de l'entorn laboral</h2>
            <p class="text-body-1 text-grey-darken-2 mb-6">
              A través de 3 modalitats de projectes, l'alumnat pot realitzar "tastets d'oficis" en diversos àmbits per despertar la seva vocació:
            </p>
            <div class="d-flex flex-wrap gap-2 mb-8">
              <v-chip v-for="ambit in ambits" :key="ambit" color="#3465a4" variant="tonal" class="font-weight-bold">
                {{ ambit }}
              </v-chip>
            </div>
          </section>
        </v-col>
        <v-col cols="12" md="4">
          <div class="sticky-sidebar">
            <v-card variant="flat" border class="rounded-xl overflow-hidden shadow-soft mb-6">
              <div class="gradient-accent"></div>
              <v-card-text class="pa-8">
                <div class="text-center mb-8">
                  <v-avatar color="blue-lighten-5" size="64" class="mb-4">
                    <v-icon color="#3465a4" size="32">mdi-account-group</v-icon>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-bold text-blue-darken-3">Iniciar sessió</h3>
                  <p class="text-caption text-grey">Inicieu sessió per accedir a la plataforma</p>
                </div>
                <v-btn 
                  block 
                  color="#3465a4" 
                  size="x-large"
                  variant="flat" 
                  class="rounded-lg font-weight-bold elevation-2" 
                  to="/login"
                >
                  Iniciar sessió
                </v-btn>
              </v-card-text>
            </v-card>
            <v-card variant="tonal" color="grey-darken-3" class="rounded-xl pa-6">
              <h4 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                <v-icon class="mr-2">mdi-account-school</v-icon> A qui s'adreça?
              </h4>
              <p class="text-body-2 leading-normal text-grey-darken-3">
                Als centres públics d'<strong>ESO</strong> i centres d'<strong>Educació Especial</strong>. Adreçat a alumnat de 1r a 4t de l'ESO per facilitar una orientació efectiva i una millor transició a l'etapa postobligatòria.
              </p>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
const dadesClau = [
  { titol: 'Adreçat a', valor: 'ESO i EE' },
  { titol: 'Durada', valor: 'Trimestral' },
  { titol: 'Modalitats', valor: '3 tipologies' }
]

const objectius = [
  'Oferir eines per a la descoberta vocacional des de les primeres etapes.',
  'Evitar l’abandonament prematur potenciant nous aprenentatges.',
  'Generar una cultura orientadora en el propi centre educatiu.',
  'Donar a conèixer oportunitats de continuïtat formativa (tastet pràctic).',
  'Consolidar itineraris formatius no excloents.',
  'Adaptar-se als nous reptes científics i tecnològics.'
]

const ambits = [
  'Tecnològic', 'Artístic', 'Ocupacional', 'Humanístic', 'Esportiu', 'Científic'
]
</script>

<style scoped>
.header-pattern {
  background-color: #3465a4;
  background-image: radial-gradient(rgba(214, 12, 12, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}
.main-title {
  line-height: 1.1;
  font-size: 3.5rem !important;
}
.linea-gencat-vibrant {
  width: 8px;
  height: 90px;
  background-color: #1e3a5f; 
  border-left: 2px solid #3465a4; 
  border-radius: 4px; 
}
.section-tag {
  color: #3465a4;
  font-weight: 900;
  font-size: 0.7rem;
  letter-spacing: 2px;
}
.leading-extra-relaxed {
  line-height: 1.9 !important;
}
.leading-normal {
  line-height: 1.5 !important;
}
.border-left-highlight {
  border-left: 4px solid #3465a4;
}
.border-white-thin {
  border: 1px solid rgba(255,255,255,0.2) !important;
}
.gradient-accent {
  height: 6px;
  background: linear-gradient(90deg, #3465a4, #DA2131);
}
.shadow-soft {
  box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
}
.sticky-sidebar {
  position: sticky;
  top: 40px;
}
.gap-2 {
  gap: 8px;
}
</style>