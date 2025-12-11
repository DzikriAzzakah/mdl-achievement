// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'node:path';

export default defineNuxtConfig({
  alias: {
    '#achievement': resolve('layers/achievement'),
  },
  routeRules: {
    '/achievement/**': {
      ssr: false,
    },
  },
});
