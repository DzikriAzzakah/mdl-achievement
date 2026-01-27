<template>
  <div class="flex flex-col gap-5 pb-8 self-stretch">
    <h3 class="text-base font-semibold text-gray-900">
      Certificate Preview
    </h3>
    <div
      v-if="previewUrl"
      class="w-full max-w-[600px] rounded-lg border border-gray-100 overflow-hidden"
    >
      <img
        :src="previewUrl"
        alt="Certificate Preview"
        class="w-full h-auto object-contain"
      >
    </div>
    <div
      v-else
      class="w-full max-w-[600px] h-[300px] rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center"
    >
      <span class="text-gray-400 text-sm">No preview available</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useCertificateStore();
const { detailCertificate } = storeToRefs(store);

const previewUrl = computed(() => {
  return detailCertificate.value?.image_url || null;
});
</script>
