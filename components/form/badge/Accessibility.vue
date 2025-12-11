<template>
  <AccessibilityManager
    content-type="BADGE"
    :content-id="contentId"
    :description="{
      title: 'Manage who can access this badge',
      switch: 'Grant all users to access this badge.',
    }"
  />
</template>

<script setup lang="ts">
import AccessibilityManager from '#accessibility-wizard/manager.vue';

const store = useBadgeStore();
const route = useRoute();

const contentId = computed(() => {
  const id = store?.badgeResponse?.id || route.params?.id || '';
  return Number(id);
});
</script>
