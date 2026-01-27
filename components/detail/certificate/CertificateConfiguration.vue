<template>
  <div class="flex flex-col gap-5 border-b border-gray-50 pb-8 self-stretch">
    <h3 class="text-base font-semibold text-gray-900">
      General
    </h3>
    <LabelContent
      title="Certificate Title"
      :description="detailCertificate?.title || '-'"
    />
    <LabelContent
      title="Certificate Type"
      :description="detailCertificate?.certificate_type?.label || '-'"
    />
  </div>
</template>

<script setup lang="ts">
import LabelContent from '#achievement/components/LabelContent.vue';

defineProps<{
  loading?: boolean;
}>();

const store = useCertificateStore();
const { detailCertificate } = storeToRefs(store);
</script>
