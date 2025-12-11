<template>
  <AccessibilityManager
    content-type="CERTIFICATE"
    :content-id="contentId"
    :description="{
      title: 'Manage who can access this certificate',
      switch: 'Grant all users to access this certificate.',
    }"
  />
</template>

<script setup lang="ts">
import AccessibilityManager from '#accessibility-wizard/manager.vue';

const store = useCertificateStore();
const route = useRoute();

const contentId = computed(() => {
  const id = store?.certificateResponse?.id || route.params?.id || '';
  return Number(id);
});
</script>
