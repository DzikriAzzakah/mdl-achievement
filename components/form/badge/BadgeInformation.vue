<template>
  <FormLayout>
    <template #sidebar-content>
      <div class="w-full p-5">
        <div class="w-full border-b-2 border-gray-50 pb-4 mb-4">
          <h2 class="text-base font-semibold">
            Badge Information
          </h2>
        </div>
        <div class="flex flex-col gap-6 w-full">
          <UiFormGroup
            label="Badge Title"
            class="w-full"
            :error="errors.title"
          >
            <UiInput
              v-model="title"
              placeholder="Enter badge title"
              :error="!!errors.title"
            />
          </UiFormGroup>
          <UiFormGroup
            label="Badge Description"
            :error="errors.description"
          >
            <UiTextarea
              v-model="description"
              placeholder="Enter badge description"
              :max-length="1000"
              :error="!!errors.description"
            />
          </UiFormGroup>
          <UiFormGroup
            label="Badge Image"
            class="flex flex-col gap-3 w-full"
            :error="errors.image"
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
              dimensions="500 x 500"
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
          </UiFormGroup>
        </div>
      </div>
    </template>
    <template #main-content>
      <div class="w-full h-full bg-gray-25 rounded-xl relative border border-solid border-gray-50 p-5">
        <ZoomableContent :controls-disabled="!imagePreview">
          <div>
            <div
              v-if="imagePreview"
              class="w-[500px] h-[500px]"
            >
              <img
                :src="imagePreview"
                class="object-cover object-center"
                alt="Badge preview"
              >
            </div>
            <div v-else>
              <div class="bg-white px-8 aspect-square">
                <p class="w-full h-full text-sm text-gray-400 flex items-center justify-center">
                  Upload badge image to see the preview
                </p>
              </div>
            </div>
          </div>
        </ZoomableContent>
      </div>
    </template>
  </FormLayout>
</template>

<script setup lang="ts">
import type { IUploadedFile } from '#achievement/config/types.ts';
import ZoomableContent from '#achievement/components/ZoomableContent.vue';
import FormLayout from '#achievement/layouts/FormLayout.vue';
import { useBadgeStore } from '#achievement/stores/badge.ts';

import UiInput from '#ui/components/atoms/input/index.vue';
import UiTextarea from '#ui/components/atoms/textarea/index.vue';
import UIFileUploadCompact from '#ui/components/molecules/fileupload/compact/index.vue';
import UIFileUploadFiles from '#ui/components/molecules/fileupload/files/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';

const store = useBadgeStore();
const { errors, title, description, image, uploadedImageMeta } = storeToRefs(store);

const imagePreview = computed((): string | null => {
  if (store.image instanceof File) {
    return URL.createObjectURL(store.image);
  }
  if (typeof store.image === 'string') {
    return store.image;
  }
  return null;
});

const displayUploadedImage = computed((): IUploadedFile[] => {
  const currentImage = image.value;

  if (!currentImage) {
    return [];
  }

  if (currentImage instanceof File) {
    const file = currentImage;
    return [{
      id: '1',
      filename: file.name || '-',
      extension: file.name.split('.').pop()?.toLowerCase() || 'png',
      size: file.size,
      link: '',
      isLoading: false,
    }];
  }

  if (typeof currentImage === 'string') {
    const meta = uploadedImageMeta.value;

    if (meta) {
      return [{
        id: '1',
        filename: meta.original_file_name || 'badge-image',
        extension: meta.file_mime || 'png',
        size: undefined,
        link: currentImage,
        isLoading: false,
      }];
    }

    // Fallback when no metadata is available
    return [{
      id: '1',
      filename: 'badge-image',
      extension: currentImage.split('.').pop()?.toLowerCase() || 'png',
      size: undefined,
      link: currentImage,
      isLoading: false,
    }];
  }

  return [];
});

function handleChangeImage(files: File[]): void {
  if (files && files.length > 0) {
    store.image = files[0];
  }
}

function handleRemoveImage(): void {
  store.image = null;
  store.uploadedImageMeta = null;
}

function handleCancelFetchImage(): void {
  store.image = null;
}
</script>
