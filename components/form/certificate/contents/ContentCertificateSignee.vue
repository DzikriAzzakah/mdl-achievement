<template>
  <div class="bg-white border border-solid border-gray-50 shadow-sm rounded-xl p-4 w-full space-y-2">
    <div
      class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-2 cursor-pointer"
      @click="$emit('headerClick')"
    >
      <div class="flex items-center gap-2">
        <Icon
          name="mdi:draw"
          class="text-gray-500 w-5 h-5"
        />
        <p class="text-sm font-medium">
          Certificate Signee {{ index + 1 }}
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
            icon="mdi-dots-vertical"
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
          class="transition-transform duration-300"
          :class="{ 'rotate-180': isCollapsed }"
          @click="isCollapsed = !isCollapsed"
        />
      </div>
    </div>
    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'max-h-0' : 'max-h-[1000px]'"
    >
      <div class="space-y-4 pt-2">
        <div>
          <UIFileUploadFiles
            v-if="contentItem.value || contentItem.file"
            :files="displayUploadedImage"
            :enable-remove="true"
            @remove-file="handleRemoveImage"
            @cancel-fetch="handleRemoveImage"
          />
          <UIFileUploadCompact
            v-else
            :id="`upload-content-${contentItem.key}`"
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
                  Maximum file size: 500 x 500 up to 5 MB
                </div>
              </div>
            </template>
          </UIFileUploadCompact>
        </div>
        <UiFormGroup label="Size">
          <div class="flex items-center gap-2">
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="contentItem.metadata.width"
                size="md"
                :disabled="!hasImage"
                @update:model-value="updateWidth"
              >
                <template #suffix>
                  <span class="text-gray-500">W</span>
                </template>
              </UiInput>
            </div>
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="contentItem.metadata.height"
                size="md"
                :disabled="!hasImage"
                @update:model-value="updateHeight"
              >
                <template #suffix>
                  <span class="text-gray-500">H</span>
                </template>
              </UiInput>
            </div>
            <Icon
              name="mdi:lock"
              class="w-5 h-5 text-primary-500"
            />
          </div>
        </UiFormGroup>
        <UiFormGroup label="Vertical">
          <div class="flex items-center gap-2">
            <CustomSlider
              :model-value="contentItem.metadata.vertical"
              :min="0"
              :max="100"
              :start-point="50"
              :disabled="!hasImage"
              @update:model-value="updateVertical"
            />
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="contentItem.metadata.vertical"
                size="md"
                :disabled="!hasImage"
                @update:model-value="updateVertical"
              >
                <template #suffix>
                  <span class="text-gray-500">%</span>
                </template>
              </UiInput>
            </div>
          </div>
        </UiFormGroup>
        <UiFormGroup label="Horizontal">
          <div class="flex items-center gap-2">
            <CustomSlider
              :model-value="contentItem.metadata.horizontal"
              :min="0"
              :max="100"
              :start-point="50"
              :disabled="!hasImage"
              @update:model-value="updateHorizontal"
            />
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="contentItem.metadata.horizontal"
                size="md"
                :disabled="!hasImage"
                @update:model-value="updateHorizontal"
              >
                <template #suffix>
                  <span class="text-gray-500">%</span>
                </template>
              </UiInput>
            </div>
          </div>
        </UiFormGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICertificateContentCertificateSigneeForm } from '#achievement/config/types.ts';
import UiButton from '#ui/components/atoms/button/index.vue';
import UiInput from '#ui/components/atoms/input/index.vue';
import CustomSlider from '#ui/components/atoms/slider-range/index.vue';
import UIFileUploadCompact from '#ui/components/molecules/fileupload/compact/index.vue';
import UIFileUploadFiles from '#ui/components/molecules/fileupload/files/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import { Dropdown } from 'floating-vue';

const props = defineProps<{
  contentItem: ICertificateContentCertificateSigneeForm;
  index: number;
  isExpanded?: boolean;
}>();

const emit = defineEmits<{
  'delete': [index: number];
  'update:contentItem': [value: ICertificateContentCertificateSigneeForm];
  'headerClick': [];
}>();

const isCollapsed = computed(() => !props.isExpanded);

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
      filename: 'signee-image',
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

const updateWidth = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  const newHeight = Math.round(numValue / ratio.value);

  const updatedItem: ICertificateContentCertificateSigneeForm = {
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
  const newWidth = Math.round(numValue * ratio.value);

  const updatedItem: ICertificateContentCertificateSigneeForm = {
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
  const updatedItem: ICertificateContentCertificateSigneeForm = {
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
  const updatedItem: ICertificateContentCertificateSigneeForm = {
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

        const updatedItem: ICertificateContentCertificateSigneeForm = {
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
  const updatedItem: ICertificateContentCertificateSigneeForm = {
    ...props.contentItem,
    file: null,
    value: null,
  };

  emit('update:contentItem', updatedItem);
};

const handleDelete = () => {
  emit('delete', props.index);
};
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}
</style>
