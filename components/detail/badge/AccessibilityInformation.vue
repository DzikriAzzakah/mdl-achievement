<template>
  <div class="flex flex-col gap-5 self-stretch">
    <h3 class="text-base font-semibold text-gray-900">
      Accessibility
    </h3>
    <ListAccessibility
      content-type="BADGE"
      :content-id="badgeId"
      :with-actions="false"
    />
  </div>
</template>

<script lang="ts" setup>
import ListAccessibility from '#accessibility-wizard/list.vue';

const route = useRoute();
const badgeId = computed(() => route.params.id as string);
</script>
