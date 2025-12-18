<template>
  <v-app>
    <v-app-bar app color="white" elevation="1" height="90" class="px-md-4">
      <div class="d-flex align-center">
        <v-img 
          src="/logo.jpg" 
          alt="Consorci d'Educació de Barcelona"
          max-height="70"
          width="320"
          contain
        ></v-img>
      </div>

      <v-spacer></v-spacer>

      <div class="d-flex flex-column align-end justify-center h-100">
        <div class="d-flex align-center mt-2">
          <div class="d-none d-md-flex align-center">
            <template v-for="(link, i) in navLinks" :key="link.title">
              <a :href="link.href" class="text-decoration-none font-weight-bold text-body-2 mx-2 nav-link">
                <v-icon v-if="link.title === 'Idioma'" size="small" class="mr-1">mdi-earth</v-icon>
                {{ link.title }}
                <v-icon v-if="link.title === 'Idioma'" size="small">mdi-menu-down</v-icon>
              </a>
              <span v-if="i < navLinks.length - 1" class="text-grey-lighten-1">|</span>
            </template>
          </div>

          <div class="d-flex ml-4">
            <a v-for="social in socialItems" :key="social.icon" :href="social.href" class="mx-1 text-decoration-none" target="_blank">
              <v-icon :icon="social.icon" color="black" size="24" class="social-icon"></v-icon>
            </a>
          </div>
          <v-app-bar-nav-icon class="d-md-none ml-2" color="black"></v-app-bar-nav-icon>
        </div>
      </div>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <slot />
    </v-main>

    <v-footer app color="white" class="d-flex flex-column pa-0" elevation="2">
      <v-divider class="w-100 border-opacity-50" color="grey" thickness="2"></v-divider>

      <div class="d-flex w-100 align-center justify-space-between px-4 py-2 content-wrap">
        <div class="d-flex align-center flex-wrap justify-center">
          <div class="d-flex mr-3">
            <a v-for="social in socialItems" :key="social.icon" :href="social.href" class="social-icon-link mx-1" target="_blank">
              <v-icon :icon="social.icon" color="black" size="22"></v-icon>
            </a>
          </div>
          <span class="text-grey mx-2 hidden-xs">|</span>
          <div class="d-flex align-center text-body-2 font-weight-bold" style="color: #000000;">
            <a href="#" class="footer-link">RSS</a>
            <span class="mx-1">|</span>
            <a href="#" class="footer-link">Què és l'RSS?</a>
          </div>
        </div>

        <div class="d-flex flex-wrap justify-end text-body-2 font-weight-bold link-group" style="color: #000000;">
          <template v-for="(link, i) in footerLinks" :key="link.title">
            <a :href="link.href" class="footer-link mx-1">{{ link.title }}</a>
            <span v-if="i < footerLinks.length - 1" class="text-grey mx-1 hidden-sm-and-down">|</span>
          </template>
        </div>
      </div>

      <v-divider class="w-100 border-opacity-50" color="grey" thickness="2"></v-divider>

      <div class="w-100 text-center py-2 text-caption text-grey-darken-1">
        &copy; Consorci d'Educació de Barcelona. Tots els drets reservats
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
  const navLinks = [
    { title: 'Idioma', href: '#' },
    { title: 'Notícies', href: '#' },
    { title: 'Bloc', href: '#' },
    { title: 'Agenda', href: '#' },
    { title: 'Mapa web', href: '#' },
    { title: 'Contacte', href: '#' },
  ]

  const socialItems = [
    { icon: 'mdi-twitter', href: '#' },
    { icon: 'mdi-facebook', href: '#' },
    { icon: 'mdi-instagram', href: '#' },
    { icon: 'mdi-youtube', href: '#' },
  ]

  const footerLinks = [
    { title: 'Peticions i consultes de famílies i ciutadania', href: '#' },
    { title: 'Accessibilitat', href: '#' },
    { title: 'Mapa web', href: '#' },
    { title: 'Contacte', href: '#' },
    { title: 'Avís legal', href: '#' },
  ]
</script>

<style scoped lang="sass">
  .nav-link, .footer-link
    color: #000000
    transition: color 0.2s
    text-decoration: none
    white-space: nowrap
    &:hover
      color: #757575

  .social-icon-link
    text-decoration: none
    transition: opacity 0.2s
    &:hover
      opacity: 0.6

  @media (max-width: 960px)
    .content-wrap
      flex-direction: column
      align-items: center !important
      gap: 10px
    .link-group
      justify-content: center !important
      text-align: center
      margin-top: 5px
</style>