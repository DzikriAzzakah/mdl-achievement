<template>
  <AccessibilityManager
    content-type="AUDIO"
    :content-id="contentId"
    :description="{
      title: 'Manage who can access this audio',
      switch: 'Grant all users to access this audio.',
    }"
  />
</template>

<script setup lang="ts">
import AccessibilityManager from '#accessibility-wizard/manager.vue';

const store = useAudioStore();
const route = useRoute();

const contentId = computed(() => {
  const id = store?.audioResponse?.id || route.params?.id || '';
  return Number(id);
});
</script>
