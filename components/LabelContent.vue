<template>
  <div class="flex flex-col gap-1">
    <p class="text-gray-400 text-sm font-medium title-label">
      {{ title }}
    </p>
    <slot>
      <span class="text-gray-900 text-sm font-medium desc-label">
        {{ description }}
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>
