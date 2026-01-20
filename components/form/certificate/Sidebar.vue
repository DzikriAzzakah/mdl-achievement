<template>
  <div
    v-if="isContentListOpen"
    class="fixed inset-0 z-40 bg-black/50"
    @click="isContentListOpen = false"
  />
  <div class="flex flex-col h-full relative pt-5">
    <div class="mb-4 flex-shrink-0 px-5">
      <div
        class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-4 cursor-pointer"
        @click="isInfoCollapsed = !isInfoCollapsed"
      >
        <h2 class="text-base font-semibold">
          Certificate Information
        </h2>
        <Icon
          name="mdi:chevron-down"
          class="transition-transform duration-300"
          :class="{ 'rotate-180': isInfoCollapsed }"
        />
      </div>

      <div
        class="overflow-hidden transition-all duration-300 ease-in-out"
        :class="isInfoCollapsed ? 'max-h-0' : ''"
      >
        <div class="flex flex-col gap-4 w-full my-4">
          <UiFormGroup
            label="Certificate Title"
            class="w-full"
            required
          >
            <UiInput
              v-model="title"
              placeholder="Enter certificate title"
              :error="!!errors.title"
              :error-message="errors.title"
            />
          </UiFormGroup>

          <UiFormGroup
            label="Certificate Type"
            required
          >
            <UiSelect
              v-model="certificateType"
              placeholder="Select certificate type"
              :options="typeOptions"
              :error="!!errors.certificate_type"
              :error-message="errors.certificate_type"
            />
          </UiFormGroup>

          <UiFormGroup
            label="Certificate Background"
            class="flex flex-col gap-3 w-full"
            required
          >
            <UIFileUploadFiles
              v-if="image"
              :files="displayUploadedImage"
              :enable-remove="true"
              @remove-file="handleRemoveImage"
              @cancel-fetch="handleCancelFetchImage"
            />
            <UIFileUploadCompact
              v-else
              id="upload-image"
              :supported-file-types="['JPG', 'JPEG', 'PNG', 'WEBP']"
              :max-file-size="5"
              :multiple="false"
              :custom-error-messages="{
                fileType: 'The Uploaded file type is not supported.',
                fileSize: 'The File size exceeds limit of 5 MB.',
              }"
              @modified="handleChangeImage"
            >
              <template #content>
                <div class="ui-upload-compact__content">
                  <div class="text-gray-900">
                    Upload File
                  </div>
                  <div class="text-gray-400">
                    PNG, JPG, JPEG (A4 landscape up to 5 MB)
                  </div>
                </div>
              </template>
            </UIFileUploadCompact>
          </UiFormGroup>
        </div>
      </div>
    </div>

    <div
      v-if="showLayoutGuidSection"
      class="mb-4 flex-shrink-0 px-5"
    >
      <div
        class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-4 cursor-pointer"
        @click="isLayoutGuidCollapsed = !isLayoutGuidCollapsed"
      >
        <h2 class="text-base font-semibold">
          Layout Guidelines
        </h2>
        <Icon
          name="mdi:chevron-down"
          class="transition-transform duration-300"
          :class="{ 'rotate-180': isLayoutGuidCollapsed }"
        />
      </div>

      <div
        class="overflow-hidden transition-all duration-300 ease-in-out"
        :class="isLayoutGuidCollapsed ? 'max-h-0' : ''"
      >
        <div class="flex flex-col gap-4 w-full my-4">
          <UiFormGroup
            v-if="displayUploadedImage.length > 0"
            label="Safe Zone Margins"
            class="flex flex-col gap-3 w-full"
          >
            <div class="grid grid-cols-2 gap-3">
              <UiInput
                v-model="safeZone.top"
                type="number"
                size="md"
                placeholder="Top"
              >
                <template #prefix>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 20 20"
                  ><path
                    fill="var(--color-gray-500)"
                    fill-rule="evenodd"
                    d="M7.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm3.5 4h2v2h-2zm-1 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"
                    clip-rule="evenodd"
                  /></svg>
                </template>
              </UiInput>
              <UiInput
                v-model="safeZone.right"
                type="number"
                size="md"
                placeholder="Right"
              >
                <template #prefix>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 20 20"
                  ><path
                    fill="var(--color-gray-500)"
                    fill-rule="evenodd"
                    d="M17 7.5a.5.5 0 0 0-1 0v9a.5.5 0 0 0 1 0zM13 11v2h-2v-2zm0-1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"
                    clip-rule="evenodd"
                  /></svg>
                </template>
              </UiInput>
              <UiInput
                v-model="safeZone.bottom"
                type="number"
                size="md"
                placeholder="Bottom"
              >
                <template #prefix>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 20 20"
                  ><path
                    fill="var(--color-gray-500)"
                    fill-rule="evenodd"
                    d="M11 11h2v2h-2zm-1 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1zm-2.5 5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1z"
                    clip-rule="evenodd"
                  /></svg>
                </template>
              </UiInput>
              <UiInput
                v-model="safeZone.left"
                type="number"
                size="md"
                placeholder="Left"
              >
                <template #prefix>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 20 20"
                  ><path
                    fill="var(--color-gray-500)"
                    fill-rule="evenodd"
                    d="M8 7.5a.5.5 0 0 0-1 0v9a.5.5 0 0 0 1 0zm5 3.5v2h-2v-2zm0-1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"
                    clip-rule="evenodd"
                  /></svg>
                </template>
              </UiInput>
            </div>
          </UiFormGroup>
        </div>
      </div>
    </div>

    <div
      v-if="showContentSection"
      class="flex flex-col flex-grow min-h-0 px-5 mb-12"
    >
      <div
        class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-4 mb-4 cursor-pointer flex-shrink-0"
        @click="isContentCollapsed = !isContentCollapsed"
      >
        <h2 class="text-base font-semibold">
          Contents
        </h2>
        <Icon
          name="mdi:chevron-down"
          class="transition-transform duration-300"
          :class="{ 'rotate-180': isContentCollapsed }"
        />
      </div>

      <WebUiEmptyState
        v-if="contents.length === 0"
        title="No contents added yet."
        description=" Click ''Add Content'' to get started."
        class="overflow-hidden transition-all duration-300 ease-in-out flex-grow min-h-0 overflow-y-auto"
        :class="isContentCollapsed ? 'max-h-0' : ''"
      >
        <template
          #empty-image
        >
          <div />
        </template>
      </WebUiEmptyState>

      <div
        v-else
        class="overflow-hidden transition-all duration-300 ease-in-out flex-grow min-h-0 overflow-y-auto"
        :class="isContentCollapsed ? 'max-h-0' : ''"
      >
        <div class="flex flex-col gap-4 w-full">
          <template
            v-for="(content, idx) in contents"
            :key="content.key"
          >
            <ContentImage
              v-if="content.type === 'image' || content.type === 'sertificate_signee'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              :safe-zone-width="calculatedSafeZoneWidth"
              :safe-zone-height="calculatedSafeZoneHeight"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentQRCode
              v-else-if="isQRCodeContent(content)"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              :safe-zone-width="calculatedSafeZoneWidth"
              :safe-zone-height="calculatedSafeZoneHeight"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentCertificateNumber
              v-else-if="isCertificateNumberContent(content)"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              :safe-zone-width="calculatedSafeZoneWidth"
              :safe-zone-height="calculatedSafeZoneHeight"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentTextBase
              v-else-if="isTextBasedContent(content) && !isCertificateNumberContent(content)"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              :safe-zone-width="calculatedSafeZoneWidth"
              :safe-zone-height="calculatedSafeZoneHeight"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="showContentSection"
      class="absolute bottom-0 left-0 w-full bg-white z-50"
    >
      <div class="w-full flex flex-col items-center justify-center border-t border-solid border-gray-50">
        <div
          v-if="isContentListOpen"
          class="w-full flex flex-col gap-1 mb-4 p-2 bg-white rounded-lg shadow-lg"
        >
          <UiButton
            v-for="contentType in availableContentTypes"
            :key="contentType.type"
            color="ghost"
            :icon="contentType.icon"
            variant="transparent"
            class="text-start"
            @click="handleAddContent(contentType.type)"
          >
            {{ contentType.label }}
          </UiButton>
        </div>
        <UiButton
          class="w-full py-4 !rounded-t-none"
          icon="mdi:plus"
          @click="isContentListOpen = !isContentListOpen"
        >
          Add Content
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICertificateContentForm, ICertificateSafeZone } from '#achievement/config/types.ts';
import ContentCertificateNumber from '#achievement/components/form/certificate/contents/ContentCertificateNumber.vue';
import ContentImage from '#achievement/components/form/certificate/contents/ContentImage.vue';
import ContentQRCode from '#achievement/components/form/certificate/contents/ContentQRCode.vue';
import ContentTextBase from '#achievement/components/form/certificate/contents/ContentTextBase.vue';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '#achievement/config/constants.ts';
import { isCertificateNumberContent, isQRCodeContent, isTextBasedContent } from '#achievement/config/types.ts';
import { createContent, generateContentKey } from '#achievement/utils/contentFactory';
import UiButton from '#ui/components/atoms/button/index.vue';
import UiInput from '#ui/components/atoms/input/index.vue';
import UIFileUploadCompact from '#ui/components/molecules/fileupload/compact/index.vue';
import UIFileUploadFiles from '#ui/components/molecules/fileupload/files/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';

interface Props {
  errors: Record<string, any>;
  typeOptions: any[];
  showContentSection: boolean;
  showLayoutGuidSection: boolean;
  uploadedImageMeta?: any;
}

defineProps<Props>();

const title = defineModel<string>('title', { required: true });
const certificateType = defineModel<{ label: string; value: string; }>('certificateType', { required: true });
const image = defineModel<File | string | null>('image', { required: true });
const contents = defineModel<ICertificateContentForm[]>('contents', { required: true });
const safeZone = defineModel<ICertificateSafeZone>('safeZone', { required: true });
const uploadedImageMeta = defineModel<any>('uploadedImageMeta');
const selectedContentKey = defineModel<string | null>('selectedContentKey', {
  required: true,
});

const isInfoCollapsed = ref<boolean>(false);
const isContentCollapsed = ref<boolean>(false);
const isLayoutGuidCollapsed = ref<boolean>(false);
const isContentListOpen = ref<boolean>(false);
const contentIdCounter = ref<number>(0);

const availableContentTypes = [
  { type: 'image', label: 'Image', icon: 'mdi:image' },
  { type: 'sertificate_signee', label: 'Certificate Signee', icon: 'mdi:image' },
  { type: 'text', label: 'Text Area', icon: 'ic:round-text-fields' },
  { type: 'certificate_number', label: 'Certificate Number', icon: 'mdi:code-tags' },
  { type: 'fullname', label: 'Fullname', icon: 'mdi:code-tags' },
  { type: 'employee_id', label: 'Employee ID (NIK)', icon: 'mdi:code-tags' },
  { type: 'event_title', label: 'Event Title', icon: 'mdi:code-tags' },
  { type: 'location', label: 'Location', icon: 'mdi:code-tags' },
  { type: 'qr_code', label: 'QR Code', icon: 'mdi:qrcode' },
  { type: 'valid_thru', label: 'Certificate Valid Thru', icon: 'mdi:code-tags' },
];

const displayUploadedImage = computed(() => {
  if (!image.value) {
    return [];
  }

  if (image.value instanceof File) {
    const file = image.value;
    return [{
      id: '1',
      filename: file.name || '-',
      extension: file.name.split('.').pop()?.toLowerCase() || 'png',
      size: file.size,
      link: '',
      isLoading: false,
    }];
  }

  if (typeof image.value === 'string' && uploadedImageMeta.value) {
    const meta = uploadedImageMeta.value;
    return [{
      id: '1',
      filename: meta.original_file_name || 'certificate-image',
      extension: meta.file_mime || 'png',
      size: undefined,
      link: image.value,
      isLoading: false,
    }];
  }

  return [];
});

const handleChangeImage = (files: File[]) => {
  if (files && files.length > 0) {
    image.value = files[0];
  }
};

const handleRemoveImage = () => {
  image.value = null;
  uploadedImageMeta.value = null;
};

const handleCancelFetchImage = () => {
  image.value = null;
};

const addContent = (type: string) => {
  contentIdCounter.value++;
  const key = generateContentKey(type, contentIdCounter.value);
  const newContent = createContent(type, key);

  if (!newContent) {
    console.error(`Unknown content type: ${type}`);
    return;
  }

  const newContents = [...contents.value, newContent];
  contents.value = newContents;
  selectedContentKey.value = newContent.key;
  isContentListOpen.value = false;
};

const handleUpdateContent = (index: number, updatedContent: ICertificateContentForm) => {
  const newContents = [...contents.value];
  newContents[index] = updatedContent;
  contents.value = newContents;
};

const handleDeleteContent = (index: number) => {
  const deletedKey = contents.value[index].key;
  const newContents = [...contents.value];
  newContents.splice(index, 1);
  contents.value = newContents;

  if (selectedContentKey.value === deletedKey) {
    selectedContentKey.value = null;
  }
};

const handleAddContent = (type: string) => {
  addContent(type);
};

const handleContentClick = (contentKey: string) => {
  if (selectedContentKey.value === contentKey) {
    selectedContentKey.value = null;
  }
  else {
    selectedContentKey.value = contentKey;
  }
};

const isContentExpanded = (contentKey: string) => {
  return selectedContentKey.value === contentKey;
};

const calculatedSafeZoneWidth = computed(() => {
  return CANVAS_WIDTH - (safeZone.value?.left || 0) - (safeZone.value?.right || 0);
});

const calculatedSafeZoneHeight = computed(() => {
  return CANVAS_HEIGHT - (safeZone.value?.top || 0) - (safeZone.value?.bottom || 0);
});

watch(() => safeZone.value, (newSafeZone, oldSafeZone) => {
  const layoutWidth = 842;
  const newSafeZoneWidth = layoutWidth - (newSafeZone?.left || 0) - (newSafeZone?.right || 0);
  const oldSafeZoneWidth = layoutWidth - (oldSafeZone?.left || 0) - (oldSafeZone?.right || 0);

  if (newSafeZoneWidth === oldSafeZoneWidth) {
    return;
  }

  const updatedContents = contents.value.map((content) => {
    if (content.type !== 'text') {
      return content;
    }

    const currentWidth = content.metadata.width;

    if (currentWidth > newSafeZoneWidth) {
      return {
        ...content,
        metadata: {
          ...content.metadata,
          width: newSafeZoneWidth,
        },
      };
    }

    if (currentWidth === oldSafeZoneWidth) {
      return {
        ...content,
        metadata: {
          ...content.metadata,
          width: newSafeZoneWidth,
        },
      };
    }

    return content;
  });

  contents.value = updatedContents;
}, { deep: true });
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}
</style>
