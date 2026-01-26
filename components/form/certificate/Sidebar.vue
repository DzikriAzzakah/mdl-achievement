<template>
  <div
    v-if="isContentListOpen"
    class="fixed inset-0 z-40 bg-black/50"
    @click="isContentListOpen = false"
  />
  <div class="flex flex-col h-full relative pt-5">
    <CertificateInfoForm
      v-model:title="title"
      v-model:certificate-type="certificateType"
      v-model:image="image"
      v-model:uploaded-image-meta="uploadedImageMeta"
      :errors="errors"
      :type-options="typeOptions"
    />

    <LayoutGuidelines
      v-if="showLayoutGuidSection"
      :safe-zone="safeZone"
      :has-uploaded-image="hasUploadedImage"
      @update:safe-zone="handleUpdateSafeZone"
    />

    <ContentList
      v-if="showContentSection"
      v-model:is-content-list-open="isContentListOpen"
      :contents="contents"
      :selected-content-key="selectedContentKey"
      :safe-zone-width="calculatedSafeZoneWidth"
      :safe-zone-height="calculatedSafeZoneHeight"
      @add-content="handleAddContent"
      @delete-content="handleDeleteContent"
      @update-content="handleUpdateContent"
      @content-click="handleContentClick"
    />
  </div>
</template>

<script setup lang="ts">
import type { ICertificateContentForm, ICertificateSafeZone } from '#achievement/config/types.ts';
import CertificateInfoForm from '#achievement/components/form/certificate/sidebar/CertificateInfoForm.vue';
import ContentList from '#achievement/components/form/certificate/sidebar/ContentList.vue';
import LayoutGuidelines from '#achievement/components/form/certificate/sidebar/LayoutGuidelines.vue';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '#achievement/config/constants.ts';

interface Props {
  errors: Record<string, any>;
  typeOptions: any[];
  showContentSection: boolean;
  showLayoutGuidSection: boolean;
}

defineProps<Props>();

const store = useCertificateStore();
const { selectedContentKey } = storeToRefs(store);

const title = defineModel<string>('title', { required: true });
const certificateType = defineModel<{ label: string; value: string; }>('certificateType', { required: true });
const image = defineModel<File | string | null>('image', { required: true });
const contents = defineModel<ICertificateContentForm[]>('contents', { required: true });
const safeZone = defineModel<ICertificateSafeZone>('safeZone', { required: true });
const uploadedImageMeta = defineModel<any>('uploadedImageMeta');

const isContentListOpen = ref<boolean>(false);

const hasUploadedImage = computed(() => !!image.value);

const calculatedSafeZoneWidth = computed(() => {
  return CANVAS_WIDTH - (safeZone.value?.left || 0) - (safeZone.value?.right || 0);
});

const calculatedSafeZoneHeight = computed(() => {
  return CANVAS_HEIGHT - (safeZone.value?.top || 0) - (safeZone.value?.bottom || 0);
});

const handleAddContent = (type: string) => {
  store.addContent(type);
  isContentListOpen.value = false;
};

const handleUpdateContent = (index: number, updatedContent: ICertificateContentForm) => {
  store.updateContentByIndex(index, updatedContent);
};

const handleDeleteContent = (index: number) => {
  store.deleteContent(index);
};

const handleContentClick = (contentKey: string) => {
  store.toggleContentSelection(contentKey);
};

const handleUpdateSafeZone = (zone: ICertificateSafeZone) => {
  store.updateSafeZone(zone);
};
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}
</style>
