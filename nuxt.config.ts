// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'node:path';

export default defineNuxtConfig({
  alias: {
    '#audio': resolve('layers/audio'),
  },
  routeRules: {
    '/audio/**': {
      ssr: false,
    },
  },
});
