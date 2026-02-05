<template>
  <div class="bg-white border border-solid border-gray-50 shadow-sm rounded-xl p-4 w-full">
    <div
      class="flex justify-between items-center w-full"
      :class="{ 'border-b-2 border-gray-50 pb-2': !isCollapsed }"
    >
      <div class="flex items-center gap-2">
        <Icon
          :name="displayConfig.icon"
          class="text-gray-500 w-5 h-5"
        />
        <p class="text-sm font-medium">
          {{ displayConfig.label }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Dropdown
          placement="bottom-end"
          popper-class="experience-more-actions"
        >
          <UiButton
            size="md"
            variant="transparent"
            color="ghost"
            icon="mdi:dots-horizontal"
            square
            @click.stop
          />
          <template #popper>
            <div class="flex flex-col gap-2.5 w-64 items-start shadow-md p-1.5 btn-experiences-user">
              <UiButton
                size="md"
                class="w-full text-left"
                variant="transparent"
                color="ghost"
                icon="mdi-delete"
                @click="handleDelete"
              >
                Delete
              </UiButton>
            </div>
          </template>
        </Dropdown>
        <Icon
          name="mdi:chevron-down"
          class="transition-transform duration-300 cursor-pointer"
          :class="{ 'rotate-180': isCollapsed }"
          @click="emit('headerClick')"
        />
      </div>
    </div>
    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'max-h-0' : 'max-h-[1000px]'"
    >
      <div class="space-y-4 pt-2">
        <div>
          <UiFileUploadFiles
            v-if="contentItem.value || contentItem.file"
            :files="displayUploadedImage"
            :enable-remove="true"
            @remove-file="handleRemoveImage"
            @cancel-fetch="handleRemoveImage"
          />
          <UiFileUploadCompact
            v-else
            :id="`upload-content-${contentItem.key}`"
            :supported-file-types="displayConfig.fileTypes"
            :max-file-size="displayConfig.maxSize"
            :multiple="false"
            :custom-error-messages="displayConfig.errorMessages"
            @modified="handleChangeImage"
          >
            <template #content>
              <div class="ui-upload-compact__content">
                <div class="text-gray-900">
                  Upload File
                </div>
                <div class="text-gray-400">
                  {{ displayConfig.uploadHint }}
                </div>
              </div>
            </template>
          </UiFileUploadCompact>
        </div>
        <div class="flex items-center gap-2">
          <UiFormGroup
            label="Width"
            class="flex-1 min-w-0"
          >
            <UiInput
              type="number"
              :model-value="contentItem.metadata.width"
              size="md"
              :disabled="!hasImage"
              @update:model-value="updateWidth"
            >
              <template #suffix>
                <span class="text-xs text-gray-500">
                  px
                </span>
              </template>
            </UiInput>
          </UiFormGroup>

          <UiFormGroup
            label="Height"
            class="flex-1 min-w-0"
          >
            <UiInput
              type="number"
              :model-value="contentItem.metadata.height"
              size="md"
              :disabled="!hasImage"
              @update:model-value="updateHeight"
            >
              <template #suffix>
                <span class="text-xs text-gray-500">
                  px
                </span>
              </template>
            </UiInput>
          </UiFormGroup>

          <UiFormGroup class="mt-5 flex-shrink-0">
            <UiButton
              v-tooltip="isAspectRatioLocked ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'"
              square
              size="md"
              variant="soft"
              icon="mdi:aspect-ratio"
              :color="isAspectRatioLocked ? 'primary' : 'ghost'"
              :disabled="!hasImage"
              @click="toggleAspectRatioLock"
            />
          </UiFormGroup>
        </div>
        <UiFormGroup label="Position">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <UiButton
                v-tooltip="'Align Left'"
                size="sm"
                square
                :disabled="!hasImage"
                :variant="currentHorizontalAlign === 'left' ? 'solid' : 'soft'"
                :color="currentHorizontalAlign === 'left' ? 'primary' : 'ghost'"
                icon="fe:align-left"
                @click="handleAlignContent('left')"
              >
                L
              </UiButton>
              <UiButton
                v-tooltip="'Align Center'"
                size="sm"
                square
                :disabled="!hasImage || isCenterRightDisabled"
                :variant="currentHorizontalAlign === 'center' ? 'solid' : 'soft'"
                :color="currentHorizontalAlign === 'center' ? 'primary' : 'ghost'"
                icon="fe:align-center"
                @click="handleAlignContent('center')"
              >
                C
              </UiButton>
              <UiButton
                v-tooltip="'Align Right'"
                size="sm"
                square
                :disabled="!hasImage || isCenterRightDisabled"
                :variant="currentHorizontalAlign === 'right' ? 'solid' : 'soft'"
                :color="currentHorizontalAlign === 'right' ? 'primary' : 'ghost'"
                icon="fe:align-right"
                @click="handleAlignContent('right')"
              >
                R
              </UiButton>
            </div>
            <div class="flex items-center justify-between gap-2">
              <UiButton
                v-tooltip="'Align Top'"
                size="sm"
                square
                :disabled="!hasImage"
                :variant="currentVerticalAlign === 'top' ? 'solid' : 'soft'"
                :color="currentVerticalAlign === 'top' ? 'primary' : 'ghost'"
                icon="fe:align-top"
                @click="handleAlignContent('top')"
              >
                T
              </UiButton>
              <UiButton
                v-tooltip="'Align Middle'"
                size="sm"
                square
                :disabled="!hasImage || isMiddleBottomDisabled"
                :variant="currentVerticalAlign === 'middle' ? 'solid' : 'soft'"
                :color="currentVerticalAlign === 'middle' ? 'primary' : 'ghost'"
                icon="fe:align-vertically"
                @click="handleAlignContent('middle')"
              >
                M
              </UiButton>
              <UiButton
                v-tooltip="'Align Bottom'"
                size="sm"
                square
                :disabled="!hasImage || isMiddleBottomDisabled"
                :variant="currentVerticalAlign === 'bottom' ? 'solid' : 'soft'"
                :color="currentVerticalAlign === 'bottom' ? 'primary' : 'ghost'"
                icon="fe:align-bottom"
                @click="handleAlignContent('bottom')"
              >
                B
              </UiButton>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <UiFormGroup
              label="Horizontal"
              class="flex-1 min-w-0"
            >
              <UiInput
                type="number"
                :model-value="contentItem.metadata.horizontal"
                size="md"
                :disabled="!hasImage"
                @update:model-value="updateHorizontal"
              >
                <template #suffix>
                  <span class="text-xs text-gray-500">
                    px
                  </span>
                </template>
              </UiInput>
            </UiFormGroup>
            <UiFormGroup
              label="Vertical"
              class="flex-1 min-w-0"
            >
              <UiInput
                type="number"
                :model-value="contentItem.metadata.vertical"
                size="md"
                :disabled="!hasImage"
                @update:model-value="updateVertical"
              >
                <template #suffix>
                  <span class="text-xs text-gray-500">
                    px
                  </span>
                </template>
              </UiInput>
            </UiFormGroup>
          </div>
        </UiFormGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CertificateSigneeContentForm, ImageContentForm } from '#achievement/config/types.ts';
import { useCertificateCanvas } from '#achievement/composables/useCertificateCanvas';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CERTIFICATE_IMAGE_FILE_TYPES,
  CERTIFICATE_IMAGE_MAX_SIZE,
  IMAGE_ERROR_MESSAGES,
} from '#achievement/config/constants.ts';
import { useCertificateStore } from '#achievement/stores/certificate';
import { UiButton, UiFileUploadCompact, UiFileUploadFiles, UiFormGroup, UiInput } from '@mydigilearn-saas/web-ui';
import { Dropdown } from 'floating-vue';

type ContentItemType = ImageContentForm | CertificateSigneeContentForm;

const props = defineProps<{
  contentItem: ContentItemType;
  index: number;
  isExpanded?: boolean;
}>();

const emit = defineEmits<{
  'delete': [index: number];
  'update:contentItem': [value: ContentItemType];
  'headerClick': [];
}>();

const isCollapsed = computed(() => !props.isExpanded);
const isAspectRatioLocked = computed({
  get: () => props.contentItem.metadata.isAspectRatioLocked ?? false,
  set: (value: boolean) => {
    const updatedItem: ContentItemType = {
      ...props.contentItem,
      metadata: {
        ...props.contentItem.metadata,
        isAspectRatioLocked: value,
      },
    };
    emit('update:contentItem', updatedItem);
  },
});

const displayConfig = computed(() => {
  const isSignee = props.contentItem.type === 'sertificate_signee';

  return {
    icon: isSignee ? 'mdi:draw' : 'mdi:image',
    label: isSignee ? 'Certificate Signee' : 'Image',
    fileTypes: CERTIFICATE_IMAGE_FILE_TYPES,
    maxSize: CERTIFICATE_IMAGE_MAX_SIZE,
    errorMessages: IMAGE_ERROR_MESSAGES,
    uploadHint: 'PNG, JPG, JPEG (up to 5 MB)',
    filenameDefault: isSignee ? 'signee-image' : 'content-image',
  };
});

const hasImage = computed(() => {
  return !!(props.contentItem.value || props.contentItem.file);
});

const originalWidth = computed(() => props.contentItem.metadata.originalWidth || 1);
const originalHeight = computed(() => props.contentItem.metadata.originalHeight || 1);

const displayUploadedImage = computed(() => {
  const item = props.contentItem;

  if (item.file) {
    return [{
      id: item.key,
      filename: item.file.name || '-',
      extension: item.file.name.split('.').pop()?.toLowerCase() || 'png',
      size: item.file.size,
      link: '',
      isLoading: false,
    }];
  }

  if (item.value) {
    return [{
      id: item.key,
      filename: displayConfig.value.filenameDefault,
      extension: 'png',
      size: undefined,
      link: item.value,
      isLoading: false,
    }];
  }

  return [];
});

const ratio = computed(() => {
  return originalHeight.value !== 0 ? originalWidth.value / originalHeight.value : 1;
});

const toggleAspectRatioLock = () => {
  if (hasImage.value) {
    isAspectRatioLocked.value = !isAspectRatioLocked.value;
  }
};

const updateWidth = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  let newHeight = props.contentItem.metadata.height;

  if (isAspectRatioLocked.value) {
    newHeight = Math.round(numValue / ratio.value);
  }

  const updatedItem: ContentItemType = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      width: numValue,
      height: newHeight,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateHeight = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  let newWidth = props.contentItem.metadata.width;

  if (isAspectRatioLocked.value) {
    newWidth = Math.round(numValue * ratio.value);
  }

  const updatedItem: ContentItemType = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      height: numValue,
      width: newWidth,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateVertical = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  const updatedItem: ContentItemType = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      vertical: numValue,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateHorizontal = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  const updatedItem: ContentItemType = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      horizontal: numValue,
    },
  };
  emit('update:contentItem', updatedItem);
};

const handleChangeImage = (files: File[]) => {
  if (files && files.length > 0) {
    const file = files[0];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        const originalImgWidth = img.width;
        const originalImgHeight = img.height;

        let width = originalImgWidth;
        let height = originalImgHeight;

        if (width > 200) {
          const resizeRatio = 200 / width;
          width = 200;
          height = Math.round(height * resizeRatio);
        }

        const updatedItem: ContentItemType = {
          ...props.contentItem,
          file,
          metadata: {
            ...props.contentItem.metadata,
            width,
            height,
            originalWidth: originalImgWidth,
            originalHeight: originalImgHeight,
          },
        };

        emit('update:contentItem', updatedItem);
      };
    };

    reader.readAsDataURL(file);
  }
};

const handleRemoveImage = () => {
  const updatedItem: ContentItemType = {
    ...props.contentItem,
    file: null,
    value: null,
  };

  emit('update:contentItem', updatedItem);
};

const handleDelete = () => {
  emit('delete', props.index);
};

const certificateStore = useCertificateStore();
const canvas = useCertificateCanvas();

const currentHorizontalAlign = computed(() => {
  const horizontal = props.contentItem.metadata.horizontal;
  const width = props.contentItem.metadata.width;
  const elementWidth = typeof width === 'number' ? width : 200;

  const safeZoneWidth = CANVAS_WIDTH - (certificateStore.safe_zone?.left || 0) - (certificateStore.safe_zone?.right || 0);

  if (horizontal === 0) {
    return 'left';
  }
  if (Math.abs(horizontal - (safeZoneWidth - elementWidth) / 2) < 1) {
    return 'center';
  }
  if (Math.abs(horizontal - (safeZoneWidth - elementWidth)) < 1) {
    return 'right';
  }
  return null;
});

const currentVerticalAlign = computed(() => {
  const vertical = props.contentItem.metadata.vertical;
  const height = props.contentItem.metadata.height;
  const elementHeight = typeof height === 'number' ? height : 200;

  const safeZoneTop = certificateStore.safe_zone?.top || 0;
  const safeZoneBottom = certificateStore.safe_zone?.bottom || 0;
  const safeZoneHeight = CANVAS_HEIGHT - safeZoneTop - safeZoneBottom;

  if (vertical === 0) {
    return 'top';
  }
  if (Math.abs(vertical - (safeZoneHeight - elementHeight) / 2) < 1) {
    return 'middle';
  }
  if (Math.abs(vertical - (safeZoneHeight - elementHeight)) < 1) {
    return 'bottom';
  }
  return null;
});

const isCenterRightDisabled = computed(() => {
  return props.contentItem.metadata.width === 'fit-content';
});

const isMiddleBottomDisabled = computed(() => {
  return props.contentItem.metadata.height === 'fit-content';
});

const handleAlignContent = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
  if (!hasImage.value) {
    return;
  }
  canvas.alignContent(props.contentItem.element_id, type, certificateStore.safe_zone);
};
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}

:deep(.ui-form-group) {
  min-width: 0;
}

:deep(.ui-input) {
  min-width: 0;
  max-width: 100%;
}

:deep(.ui-input-wrapper) {
  min-width: 0;
  overflow: visible !important;
}

:deep(.ui-input-area) {
  min-width: 0;
}

:deep(.ui-input-suffix) {
  @apply flex items-center flex-shrink-0;
  min-width: fit-content;
}

:deep(.ui-input-prefix) {
  @apply flex items-center flex-shrink-0;
  min-width: fit-content;
}
</style>
