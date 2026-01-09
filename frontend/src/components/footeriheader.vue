<template>
  <v-app>
    <v-app-bar app color="white" elevation="1" height="90" class="px-4">
      <v-img src="/Logo.jpg" alt="Logo" max-height="70" max-width="320" contain />

      <v-spacer></v-spacer>

      <div class="d-none d-md-flex align-center">
        <template v-for="(link, i) in navLinks" :key="link.title">
          
          <v-menu v-if="link.title === 'Log in'" transition="slide-y-transition">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" variant="text" class="text-none font-weight-bold px-2 custom-blue">
                <v-icon start size="small">mdi-login</v-icon>
                {{ link.title }}
                <v-icon end size="small">mdi-menu-down</v-icon>
              </v-btn>
            </template>

            <v-list min-width="150" elevation="2" class="mt-2">
              <v-list-item v-for="opcio in loginOptions" :key="opcio.text" :to="opcio.to" link>
                <template v-slot:prepend>
                  <v-icon :icon="opcio.icon" size="small" class="custom-blue"></v-icon>
                </template>
                <v-list-item-title class="custom-blue font-weight-bold">{{ opcio.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn v-else :to="link.to" variant="text" class="text-none font-weight-bold px-2 custom-blue">
            {{ link.title }}
          </v-btn>

          <v-divider v-if="i < navLinks.length - 1" vertical inset class="mx-1" length="15"></v-divider>
        </template>
      </div>

      <v-btn icon="mdi-account-circle" href="#" variant="text" class="ml-2 custom-blue"></v-btn>
      <v-app-bar-nav-icon class="d-md-none" />
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <slot />
    </v-main>

    <v-footer app color="white" class="pa-0 d-flex flex-column">
      <v-divider class="w-100"></v-divider>
      <div class="py-2 text-caption text-grey-darken-1 text-center w-100">
        &copy; {{ new Date().getFullYear() }} Consorci d'Educació de Barcelona.
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
const navLinks = [
  { title: 'Inici', to: '/' },
  { title: 'Log in', to: null },
]

const loginOptions = [
  { text: 'Administració', icon: 'mdi-school', to: '/login' },
  { text: 'Professor', icon: 'mdi-briefcase-variant', to: '/login' },
  { text: 'Centre', icon: 'mdi-shield-account', to: '/login' },
]
</script>

<style scoped>
/* Definim el color personalitzat 3465a4 */
.custom-blue {
  color: #3465a4 !important;
}
</style>