<template>
  <div
    v-if="isContentListOpen"
    class="fixed inset-0 z-40 bg-black/50"
    @click="isContentListOpen = false"
  />
  <div class="flex flex-col h-full relative pt-5">
    <!-- Certificate Information Section -->
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
            :error="errors.title"
          >
            <UiInput
              :model-value="title"
              placeholder="Enter certificate title"
              :error="!!errors.title"
              @update:model-value="$emit('update:title', $event)"
            />
          </UiFormGroup>

          <UiFormGroup
            label="Certificate Type"
            :error="errors.certificate_type"
          >
            <UiSelect
              :model-value="certificateType"
              placeholder="Select certificate type"
              :options="typeOptions"
              :error="!!errors.certificate_type"
              @update:model-value="handleUpdateCertificateType"
            />
          </UiFormGroup>

          <UiFormGroup
            label="Background Certificate"
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

          <UiFormGroup
            v-if="displayUploadedImage.length > 0"
            label="Safe Zone Margins"
            class="flex flex-col gap-3 w-full"
          >
            <div class="grid grid-cols-2 gap-3">
              <UiInput
                :model-value="safeZone.top"
                type="number"
                size="md"
                placeholder="Top"
                @update:model-value="$emit('update:safeZone', { ...safeZone, top: Number($event) })"
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
                :model-value="safeZone.right"
                type="number"
                size="md"
                placeholder="Right"
                @update:model-value="$emit('update:safeZone', { ...safeZone, right: Number($event) })"
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
                :model-value="safeZone.bottom"
                type="number"
                size="md"
                placeholder="Bottom"
                @update:model-value="$emit('update:safeZone', { ...safeZone, bottom: Number($event) })"
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
                :model-value="safeZone.left"
                type="number"
                size="md"
                placeholder="Left"
                @update:model-value="$emit('update:safeZone', { ...safeZone, left: Number($event) })"
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

    <!-- Content Section -->
    <div
      v-if="showContentSection"
      class="flex flex-col flex-grow min-h-0 px-5 mb-10"
    >
      <div
        class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-4 mb-4 cursor-pointer flex-shrink-0"
        @click="isContentCollapsed = !isContentCollapsed"
      >
        <h2 class="text-base font-semibold">
          Content
        </h2>
        <Icon
          name="mdi:chevron-down"
          class="transition-transform duration-300"
          :class="{ 'rotate-180': isContentCollapsed }"
        />
      </div>

      <div
        class="overflow-hidden transition-all duration-300 ease-in-out flex-grow min-h-0 overflow-y-auto"
        :class="isContentCollapsed ? 'max-h-0' : ''"
      >
        <div class="flex flex-col gap-4 w-full">
          <template
            v-for="(content, idx) in contents"
            :key="content.key"
          >
            <ContentImage
              v-if="content.type === 'image'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentCertificateSignee
              v-else-if="content.type === 'sertificate_signee'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentText
              v-else-if="content.type === 'text'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentCertificateNumber
              v-else-if="content.type === 'certificate_number'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentFullName
              v-else-if="content.type === 'fullname'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentEmployeeId
              v-else-if="content.type === 'employee_id'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentEventTitle
              v-else-if="content.type === 'event_title'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentLocation
              v-else-if="content.type === 'location'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
            <ContentValidThru
              v-else-if="content.type === 'valid_thru'"
              :content-item="content"
              :index="idx"
              :is-expanded="isContentExpanded(content.key)"
              @delete="handleDeleteContent(idx)"
              @update:content-item="(updated) => handleUpdateContent(idx, updated)"
              @header-click="handleContentClick(content.key)"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- Add Content Button -->
    <div
      v-if="showContentSection"
      class="absolute bottom-0 left-0 w-full bg-white z-50"
    >
      <div class="w-full flex flex-col items-center justify-center border-t border-solid border-gray-50">
        <div
          v-if="isContentListOpen"
          class="w-full flex flex-col gap-1 mb-4 p-2 bg-white rounded-lg shadow-lg"
        >
          <div class="flex items-center gap-2 p-3 rounded-lg">
            <Icon
              name="mdi:image"
              class="text-gray-500 w-5 h-5"
            />
            <span class="text-sm font-medium text-gray-500">Image</span>
          </div>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('image')"
          >
            Image
          </UiButton>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('sertificate_signee')"
          >
            Certificate Signee
          </UiButton>
          <div class="flex items-center gap-2 p-3 rounded-lg">
            <Icon
              name="material-symbols:text-fields-rounded"
              class="text-gray-500 w-5 h-5"
            />
            <span class="text-sm font-medium text-gray-500">Text</span>
          </div>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('text')"
          >
            Text Area
          </UiButton>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('certificate_number')"
          >
            Certificate Number
          </UiButton>
          <div class="flex items-center gap-2 p-3 rounded-lg">
            <Icon
              name="material-symbols:code-rounded"
              class="text-gray-500 w-5 h-5"
            />
            <span class="text-sm font-medium text-gray-500">Source</span>
          </div>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('fullname')"
          >
            Fullname
          </UiButton>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('employee_id')"
          >
            Employee ID (NIK)
          </UiButton>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('event_title')"
          >
            Event Title
          </UiButton>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('location')"
          >
            Location
          </UiButton>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('barcode')"
          >
            Certificate Barcode
          </UiButton>
          <UiButton
            color="ghost"
            variant="transparent"
            class="ml-[2rem] text-start"
            @click="handleAddContent('valid_thru')"
          >
            Certificate Valid Thru
          </UiButton>
        </div>
        <UiButton
          color="ghost"
          variant="outline"
          class="w-full bg-white py-4 !rounded-t-none"
          @click="isContentListOpen = !isContentListOpen"
        >
          <div class="flex items-center justify-center gap-2">
            <Icon
              name="mdi:plus"
              width="20"
              height="20"
              class="text-gray-300"
            />
            Add Content
          </div>
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICertificateContentCertificateNumberForm, ICertificateContentCertificateSigneeForm, ICertificateContentEmployeeIdForm, ICertificateContentEventTitleForm, ICertificateContentForm, ICertificateContentFullNameForm, ICertificateContentImageForm, ICertificateContentLocationForm, ICertificateContentTextForm, ICertificateContentValidThruForm, ICertificateSafeZone } from '#achievement/config/types.ts';
import ContentCertificateNumber from '#achievement/components/form/certificate/contents/ContentCertificateNumber.vue';
import ContentCertificateSignee from '#achievement/components/form/certificate/contents/ContentCertificateSignee.vue';
import ContentEmployeeId from '#achievement/components/form/certificate/contents/ContentEmployeeId.vue';
import ContentEventTitle from '#achievement/components/form/certificate/contents/ContentEventTitle.vue';
import ContentFullName from '#achievement/components/form/certificate/contents/ContentFullName.vue';
import ContentImage from '#achievement/components/form/certificate/contents/ContentImage.vue';
import ContentLocation from '#achievement/components/form/certificate/contents/ContentLocation.vue';
import ContentText from '#achievement/components/form/certificate/contents/ContentText.vue';
import ContentValidThru from '#achievement/components/form/certificate/contents/ContentValidThru.vue';
import UiButton from '#ui/components/atoms/button/index.vue';
import UiInput from '#ui/components/atoms/input/index.vue';
import UIFileUploadCompact from '#ui/components/molecules/fileupload/compact/index.vue';
import UIFileUploadFiles from '#ui/components/molecules/fileupload/files/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';

interface Props {
  errors: Record<string, any>;
  title: string;
  certificateType: string;
  image: File | string | null;
  contents: (ICertificateContentForm)[];
  safeZone: ICertificateSafeZone;
  typeOptions: any[];
  showContentSection: boolean;
  uploadedImageMeta?: any;
  selectedContentKey?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:title': [value: string];
  'update:certificateType': [value: string];
  'update:safeZone': [value: ICertificateSafeZone];
  'update:image': [value: File | null];
  'update:contents': [value: (ICertificateContentForm)[]];
  'update:uploadedImageMeta': [value: any];
  'update:selectedContentKey': [value: string | null];
}>();

// Local state
const isInfoCollapsed = ref<boolean>(false);
const isContentCollapsed = ref<boolean>(false);
const isContentListOpen = ref<boolean>(false);
const contentIdCounter = ref<number>(0);

// Computed
const displayUploadedImage = computed(() => {
  if (!props.image) {
    return [];
  }

  if (props.image instanceof File) {
    const file = props.image;
    return [{
      id: '1',
      filename: file.name || '-',
      extension: file.name.split('.').pop()?.toLowerCase() || 'png',
      size: file.size,
      link: '',
      isLoading: false,
    }];
  }

  // when edit mode or after success create certificate
  if (typeof props.image === 'string' && props.uploadedImageMeta) {
    const meta = props.uploadedImageMeta;
    return [{
      id: '1',
      filename: meta.original_file_name || 'certificate-image',
      extension: meta.file_mime || 'png',
      size: undefined,
      link: props.image,
      isLoading: false,
    }];
  }

  return [];
});

// Methods
const handleUpdateCertificateType = (value: string | number | object | any[] | undefined) => {
  emit('update:certificateType', String(value));
};

const handleChangeImage = (files: File[]) => {
  if (files && files.length > 0) {
    emit('update:image', files[0]);
  }
};

const handleRemoveImage = () => {
  emit('update:image', null);
  emit('update:uploadedImageMeta', null);
};

const handleCancelFetchImage = () => {
  emit('update:image', null);
};

const addContent = (type: string) => {
  const newContents = [...props.contents];
  const layoutWidth = 842;
  const safeZoneWidth = layoutWidth - (props.safeZone?.left || 0) - (props.safeZone?.right || 0);

  if (type === 'image') {
    contentIdCounter.value++;
    const newContent: ICertificateContentImageForm = {
      type: 'image',
      key: `image_${contentIdCounter.value}`,
      value: null,
      metadata: {
        width: 200,
        height: 100,
        vertical: 50,
        horizontal: 50,
      },
      file: null,
    };
    newContents.push(newContent);
    emit('update:contents', newContents);
    emit('update:selectedContentKey', newContent.key);
  }
  else if (type === 'sertificate_signee') {
    contentIdCounter.value++;
    const newContent: ICertificateContentCertificateSigneeForm = {
      type: 'sertificate_signee',
      key: `sertificate_signee_${contentIdCounter.value}`,
      value: null,
      metadata: {
        width: 200,
        height: 100,
        vertical: 50,
        horizontal: 50,
      },
      file: null,
    };
    newContents.push(newContent);
    emit('update:contents', newContents);
    emit('update:selectedContentKey', newContent.key);
  }
  else if (type === 'text') {
    contentIdCounter.value++;
    const newContent: ICertificateContentTextForm = {
      type: 'text',
      key: `text_${contentIdCounter.value}`,
      value: 'Input Text Here',
      metadata: {
        width: safeZoneWidth,
        height: 100,
        font_family: '\'Montserrat\', sans-serif',
        font_size: 16,
        font_weight: 400,
        alignment: 'left',
        color: '#000000',
        vertical: 50,
        horizontal: 50,
      },
    };
    newContents.push(newContent);
    emit('update:contents', newContents);
    emit('update:selectedContentKey', newContent.key);
  }
  else if (type === 'certificate_number') {
    contentIdCounter.value++;
    const newContent: ICertificateContentCertificateNumberForm = {
      type: 'certificate_number',
      key: `certificate_number_${contentIdCounter.value}`,
      value: '',
      metadata: {
        width: safeZoneWidth,
        height: 100,
        font_family: '\'Montserrat\', sans-serif',
        font_size: 16,
        font_weight: 400,
        alignment: 'left',
        color: '#000000',
        vertical: 50,
        horizontal: 50,
      },
    };
    newContents.push(newContent);
    emit('update:contents', newContents);
    emit('update:selectedContentKey', newContent.key);
  }
  else if (type === 'fullname') {
    contentIdCounter.value++;
    const newContent: ICertificateContentFullNameForm = {
      type: 'fullname',
      key: `fullname_${contentIdCounter.value}`,
      value: '{{ fullname }}',
      metadata: {
        width: safeZoneWidth,
        height: 100,
        font_family: '\'Montserrat\', sans-serif',
        font_size: 16,
        font_weight: 400,
        alignment: 'left',
        color: '#000000',
        vertical: 50,
        horizontal: 50,
      },
    };
    newContents.push(newContent);
    emit('update:contents', newContents);
    emit('update:selectedContentKey', newContent.key);
  }
  else if (type === 'employee_id') {
    contentIdCounter.value++;
    const newContent: ICertificateContentEmployeeIdForm = {
      type: 'employee_id',
      key: `employee_id_${contentIdCounter.value}`,
      value: '{{ NIK }}',
      metadata: {
        width: safeZoneWidth,
        height: 100,
        font_family: '\'Montserrat\', sans-serif',
        font_size: 16,
        font_weight: 400,
        alignment: 'left',
        color: '#000000',
        vertical: 50,
        horizontal: 50,
      },
    };
    newContents.push(newContent);
    emit('update:contents', newContents);
    emit('update:selectedContentKey', newContent.key);
  }
  else if (type === 'event_title') {
    contentIdCounter.value++;
    const newContent: ICertificateContentEventTitleForm = {
      type: 'event_title',
      key: `event_title_${contentIdCounter.value}`,
      value: '{{ event_title }}',
      metadata: {
        width: safeZoneWidth,
        height: 100,
        font_family: '\'Montserrat\', sans-serif',
        font_size: 16,
        font_weight: 400,
        alignment: 'left',
        color: '#000000',
        vertical: 50,
        horizontal: 50,
      },
    };
    newContents.push(newContent);
    emit('update:contents', newContents);
    emit('update:selectedContentKey', newContent.key);
  }
  else if (type === 'location') {
    contentIdCounter.value++;
    const newContent: ICertificateContentLocationForm = {
      type: 'location',
      key: `location_${contentIdCounter.value}`,
      value: '{{ location }}',
      metadata: {
        width: safeZoneWidth,
        height: 100,
        font_family: '\'Montserrat\', sans-serif',
        font_size: 16,
        font_weight: 400,
        alignment: 'left',
        color: '#000000',
        vertical: 50,
        horizontal: 50,
        location: '',
        date_format: 'DD/MM/YYYY',
      },
    };
    newContents.push(newContent);
    emit('update:contents', newContents);
    emit('update:selectedContentKey', newContent.key);
  }
  else if (type === 'valid_thru') {
    contentIdCounter.value++;
    const newContent: ICertificateContentValidThruForm = {
      type: 'valid_thru',
      key: `valid_thru_${contentIdCounter.value}`,
      value: '{{ valid_thru }}',
      metadata: {
        width: safeZoneWidth,
        height: 100,
        font_family: '\'Montserrat\', sans-serif',
        font_size: 16,
        font_weight: 400,
        alignment: 'left',
        color: '#000000',
        vertical: 50,
        horizontal: 50,
      },
    };
    newContents.push(newContent);
    emit('update:contents', newContents);
    emit('update:selectedContentKey', newContent.key);
  }

  isContentListOpen.value = false;
};

const handleUpdateContent = (index: number, updatedContent: ICertificateContentForm) => {
  const newContents = [...props.contents];
  newContents[index] = updatedContent;
  emit('update:contents', newContents);
};

const handleDeleteContent = (index: number) => {
  const deletedKey = props.contents[index].key;
  const newContents = [...props.contents];
  newContents.splice(index, 1);
  emit('update:contents', newContents);

  // If the deleted item was selected, clear selection
  if (props.selectedContentKey === deletedKey) {
    emit('update:selectedContentKey', null);
  }
};

const handleAddContent = (type: string) => {
  addContent(type);
};

const handleContentClick = (contentKey: string) => {
  // If clicking the same item, deselect it
  if (props.selectedContentKey === contentKey) {
    emit('update:selectedContentKey', null);
  }
  else {
    // Select the clicked item
    emit('update:selectedContentKey', contentKey);
  }
};

const isContentExpanded = (contentKey: string) => {
  return props.selectedContentKey === contentKey;
};

// Watch for safe zone changes and adjust text widths automatically
watch(() => props.safeZone, (newSafeZone, oldSafeZone) => {
  const layoutWidth = 842;
  const newSafeZoneWidth = layoutWidth - (newSafeZone?.left || 0) - (newSafeZone?.right || 0);
  const oldSafeZoneWidth = layoutWidth - (oldSafeZone?.left || 0) - (oldSafeZone?.right || 0);

  // Only proceed if safe zone width actually changed
  if (newSafeZoneWidth === oldSafeZoneWidth) {
    return;
  }

  const updatedContents = props.contents.map((content) => {
    // Only process text content
    if (content.type !== 'text') {
      return content;
    }

    const currentWidth = content.metadata.width;

    // If current text width exceeds new safe zone width, shrink it to fit
    if (currentWidth > newSafeZoneWidth) {
      return {
        ...content,
        metadata: {
          ...content.metadata,
          width: newSafeZoneWidth,
        },
      };
    }

    // If text width was at full width of old safe zone, resize to new safe zone width
    if (currentWidth === oldSafeZoneWidth) {
      return {
        ...content,
        metadata: {
          ...content.metadata,
          width: newSafeZoneWidth,
        },
      };
    }

    // Otherwise, keep the current width unchanged
    return content;
  });

  emit('update:contents', updatedContents);
}, { deep: true });
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}
</style>
