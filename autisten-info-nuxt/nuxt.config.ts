export default defineNuxtConfig({
  modules: ["@nuxt/content"],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
        }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
          tagPosition: 'bodyClose'
        }
      ]
    }
  },

  ssr: true,
  css: ['@/assets/css/bs-theme-overrides.css', '@/assets/css/Navbar-Centered-Brand-Dark-icons.css']
})