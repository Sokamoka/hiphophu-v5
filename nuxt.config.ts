// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-i18n-micro',
    'nuxt-og-image',
    'nitro-cloudflare-dev',
    'nuxt-image-cropper',
    '@nuxthub/core'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    experimental: {
      sqliteConnector: 'native'
    }
  },

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false }
  },

  devServer: {
    host: 'localhost',
    port: 3555
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    preset: 'cloudflare-pages'
  },

  hub: {
    blob: {
      driver: 'cloudflare-r2',
      binding: 'BLOB',
      bucketName: 'hiphophu'
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      { code: 'hu', iso: 'hu-HU', displayName: 'Magyar' },
      { code: 'en', iso: 'en-US', displayName: 'English' }
    ],
    defaultLocale: 'hu',
    strategy: 'no_prefix'
  },

  image: {
    none: {}
  },

  ogImage: {
    zeroRuntime: true
  },

  prerender: {
    routes: [
      '/'
    ],
    crawlLinks: true
  }
})
