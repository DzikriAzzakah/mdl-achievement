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
import type { CertificateContentForm, SafeZone } from '#achievement/config/types.ts';
import CertificateInfoForm from '#achievement/components/form/certificate/sidebar/CertificateInfoForm.vue';
import ContentList from '#achievement/components/form/certificate/sidebar/ContentList.vue';
import LayoutGuidelines from '#achievement/components/form/certificate/sidebar/LayoutGuidelines.vue';
import { useCertificateCanvas } from '#achievement/composables/useCertificateCanvas';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '#achievement/config/constants.ts';
import { adjustTextWidthsForSafeZone } from '#achievement/utils/certificateHelpers';

interface Props {
  errors: Record<string, any>;
  typeOptions: any[];
  showContentSection: boolean;
  showLayoutGuidSection: boolean;
}

defineProps<Props>();

const store = useCertificateStore();
const canvas = useCertificateCanvas();
const selectedContentKey = toRef(canvas, 'selectedContentKey');

const title = defineModel<string>('title', { required: true });
const certificateType = defineModel<{ label: string; value: string; }>('certificateType', { required: true });
const image = defineModel<File | string | null>('image', { required: true });
const contents = defineModel<CertificateContentForm[]>('contents', { required: true });
const safeZone = defineModel<SafeZone>('safeZone', { required: true });
const uploadedImageMeta = defineModel<any>('uploadedImageMeta');

const isContentListOpen = ref<boolean>(false);

const hasUploadedImage = computed(() => !!image.value);

const calculatedSafeZoneWidth = computed(() => {
  return CANVAS_WIDTH - (safeZone.value?.left || 0) - (safeZone.value?.right || 0);
});

const calculatedSafeZoneHeight = computed(() => {
  return CANVAS_HEIGHT - (safeZone.value?.top || 0) - (safeZone.value?.bottom || 0);
});

watch(() => canvas.contents.value, (newContents) => {
  contents.value = newContents;
}, { deep: true });

watch(() => contents.value, (newContents) => {
  if (JSON.stringify(newContents) !== JSON.stringify(canvas.contents.value)) {
    canvas.contents.value = newContents;
  }
}, { deep: true, immediate: true });

const handleAddContent = (type: string) => {
  canvas.addContent(type);
  isContentListOpen.value = false;
};

const handleUpdateContent = (index: number, updatedContent: CertificateContentForm) => {
  canvas.updateContentByIndex(index, updatedContent);
};

const handleDeleteContent = (index: number) => {
  canvas.deleteContent(index);
};

const handleContentClick = (contentKey: string) => {
  canvas.toggleContentSelection(contentKey);
};

const handleUpdateSafeZone = (zone: SafeZone) => {
  const oldSafeZone = { ...safeZone.value };
  store.updateSafeZone(zone);

  const adjustedContents = adjustTextWidthsForSafeZone(
    canvas.contents.value,
    zone,
    oldSafeZone,
    CANVAS_WIDTH,
  );
  canvas.contents.value = adjustedContents;
};
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}
</style>
