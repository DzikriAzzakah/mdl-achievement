<template>
  <div class="flex flex-col gap-5 border-b border-gray-50 pb-8 self-stretch">
    <h3 class="text-base font-semibold text-gray-900">
      General
    </h3>
    <LabelContent
      title="Badge Title"
      :description="detailBadge?.title || '-'"
    />
    <LabelContent
      title="Badge Description"
      :description="detailBadge?.description || '-'"
    />
    <LabelContent
      title="Badge Type"
      :description="detailBadge?.type || '-'"
    />
  </div>
</template>

<script setup lang="ts">
import LabelContent from '#achievement/components/LabelContent.vue';
import { useBadgeStore } from '#achievement/stores/badge.ts';

defineProps<{
  loading?: boolean;
}>();

const store = useBadgeStore();
const { detailBadge } = storeToRefs(store);
</script>
