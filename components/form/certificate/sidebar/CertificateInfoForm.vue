<template>
  <div class="mb-4 flex-shrink-0 px-5">
    <div
      class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-4 cursor-pointer"
      @click="isCollapsed = !isCollapsed"
    >
      <h2 class="text-base font-semibold">
        Certificate Information
      </h2>
      <Icon
        name="mdi:chevron-down"
        class="transition-transform duration-300"
        :class="{ 'rotate-180': isCollapsed }"
      />
    </div>

    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'max-h-0' : ''"
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
            :select-props="{
              useTeleport: true,
            }"
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
</template>

<script setup lang="ts">
import UiInput from '#ui/components/atoms/input/index.vue';
import UIFileUploadCompact from '#ui/components/molecules/fileupload/compact/index.vue';
import UIFileUploadFiles from '#ui/components/molecules/fileupload/files/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';

interface Props {
  errors: Record<string, any>;
  typeOptions: any[];
}

defineProps<Props>();

const title = defineModel<string>('title', { required: true });
const certificateType = defineModel<{ label: string; value: string; }>('certificateType', { required: true });
const image = defineModel<File | string | null>('image', { required: true });
const uploadedImageMeta = defineModel<any>('uploadedImageMeta');

const isCollapsed = ref<boolean>(false);

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
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}
</style>
