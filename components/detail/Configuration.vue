<template>
  <WebUiLoading
    v-if="loading"
    class="h-screen"
  />
  <div v-else>
    <PreferenceSection />
  </div>
</template>

<script lang="ts" setup>
import PreferenceSection from '#audio/components/detail/PreferenceSection.vue';

withDefaults(defineProps<{ loading?: boolean; }>(), {
  loading: false,
});
</script>
