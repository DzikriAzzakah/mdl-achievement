<template>
  <TemplateManageLayout
    title="Add Certificate"
    class="layout-add-certificate"
    :active-stepper="activeStepper"
    :breadcrumbs="[]"
    :stepper="stepper"
    :disable-submit="isDisabledSubmitBtn"
    :disable-cancel="activeStepper === 1"
    :label-cancel="buttonLabelCancel"
    :label-submit="buttonLabelSubmit"
    :is-loading-submit="isLoading"
    :is-loading-cancel="isLoading"
    :fixed-bottom-footer="true"
    :is-use-breadcrumbs="false"
    show-header-button
    disable-footer
    @on-cancel="handleCancel"
    @on-submit="handleSubmit"
  >
    <template #content>
      <template v-if="activeStepper === 1">
        <FormLayout>
          <template #sidebar-content>
            <Sidebar
              :errors="errors"
              :title="title"
              :certificate-type="certificate_type"
              :image="image"
              :contents="contents"
              :safe-zone="safe_zone"
              :type-options="TYPE_OPTIONS"
              :show-content-section="!!(imagePreview || contents.length > 0)"
              :uploaded-image-meta="uploadedImageMeta"
              :selected-content-key="selectedContentKey"
              @update:title="(value) => store.title = value"
              @update:certificate-type="(value) => store.certificate_type = value"
              @update:safe-zone="(value) => store.safe_zone = value"
              @update:image="(value) => store.image = value"
              @update:contents="(value) => store.contents = value"
              @update:uploaded-image-meta="(value) => uploadedImageMeta = value"
              @update:selected-content-key="(value) => selectedContentKey = value"
            />
          </template>
          <template #main-content>
            <div
              class="w-full h-full bg-gray-25 rounded-xl relative border border-solid border-gray-50 p-5"
              @click="handleClickOutsideContent"
            >
              <div
                v-if="imagePreview"
                class="mb-4 flex items-center justify-end absolute top-4 right-8 z-10"
              >
                <UiSwitch
                  v-model="showSafeZone"
                  label="Show Safe Zone"
                  size="md"
                />
              </div>
              <ZoomableContent
                :controls-disabled="!imagePreview"
              >
                <div>
                  <div class="w-[842px] h-[594.5px] bg-white relative">
                    <div
                      v-if="imagePreview || contents.length > 0"
                      class="absolute top-0 left-0 w-full h-full"
                    >
                      <div
                        class="w-full h-full bg-center bg-no-repeat bg-contain relative"
                        :style="`background-image: url(${imagePreview})`"
                      >
                        <div
                          v-if="showSafeZone"
                          class="absolute border-2 border-dashed border-primary-500 pointer-events-none"
                          :style="safeZoneStyle"
                        />

                        <template
                          v-for="content in contents"
                          :key="content.key"
                        >
                          <img
                            v-if="content.type === 'image' || content.type === 'sertificate_signee'"
                            :src="getContentImageSrc(content)"
                            :style="getContentImageStyle(content)"
                            class="absolute cursor-pointer transition-all duration-200"
                            :class="[
                              selectedContentKey === content.key ? 'selected-content' : '',
                            ]"
                            @click.stop="handlePreviewItemClick(content.key)"
                          >
                          <div
                            v-else-if="['text', 'certificate_number', 'fullname', 'employee_id', 'event_title', 'location', 'valid_thru'].includes(content.type)"
                            :style="getContentTextStyle(content)"
                            class="cursor-pointer transition-all duration-200"
                            :class="[
                              selectedContentKey === content.key ? 'selected-content' : '',
                            ]"
                            @click.stop="handlePreviewItemClick(content.key)"
                          >
                            {{ content.value }}
                          </div>
                        </template>
                      </div>
                    </div>
                    <div
                      v-else
                      class="bg-white p-8 text-sm text-gray-400 w-full h-full flex items-center justify-center"
                    >
                      Upload background certificate and add content to see the preview
                    </div>
                  </div>
                </div>
              </ZoomableContent>
            </div>
          </template>
        </FormLayout>
      </template>
      <div v-if="activeStepper === 2">
        <Accessibility />
      </div>
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import type { ICertificateContentCertificateNumberForm, ICertificateContentCertificateSigneeForm, ICertificateContentEmployeeIdForm, ICertificateContentEventTitleForm, ICertificateContentFullNameForm, ICertificateContentImageForm, ICertificateContentLocationForm, ICertificateContentTextForm, ICertificateContentValidThruForm } from '#achievement/config/types.ts';

import { postAddCertificate } from '#achievement/api/api.ts';

import Accessibility from '#achievement/components/form/certificate/Accessibility.vue';

import Sidebar from '#achievement/components/form/certificate/Sidebar.vue';
import ZoomableContent from '#achievement/components/ZoomableContent.vue';

import { CREATE_STEPPER, TYPE_OPTIONS } from '#achievement/config/constants.ts';
import { PERMISSION_CREATE, PERMISSION_LIST } from '#achievement/config/featureFlag.ts';
import FormLayout from '#achievement/layouts/FormLayout.vue';
import { postUploadFile } from '#core/api/upload.ts';

import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import UiSwitch from '#ui/components/atoms/switch/index.vue';

import { useMutation } from '@tanstack/vue-query';

const { $toast } = useNuxtApp();

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_CREATE],
  },
});

const store = useCertificateStore();
const { errors, title, certificate_type, image, contents, safe_zone } = storeToRefs(store);

const router = useRouter();
const { showLoading, hideLoading } = useGlobalLoading();
const { preventLeave } = useConfirmLeave();
const { getApiErrorMessage } = useUtility();

// Reactive properties
const activeStepper = ref<number>(1);
const stepper = CREATE_STEPPER;
const isLoading = ref<boolean>(false);
const certificateId = ref<number | string | null>(null);
const uploadedImageMeta = ref<any>(null);
const selectedContentKey = ref<string | null>(null);

// === START: ADDED FOR SAFE ZONE TOGGLE ===
const showSafeZone = ref<boolean>(true);

const layoutDimensions = { width: 842, height: 594.5 };

const safeZoneStyle = computed(() => {
  const { width: layoutWidth, height: layoutHeight } = layoutDimensions;
  const top = safe_zone.value?.top || 0;
  const right = safe_zone.value?.right || 0;
  const bottom = safe_zone.value?.bottom || 0;
  const left = safe_zone.value?.left || 0;

  return `
    top: ${top}px;
    right: ${right}px;
    bottom: ${bottom}px;
    left: ${left}px;
    width: ${layoutWidth - left - right}px;
    height: ${layoutHeight - top - bottom}px;
  `;
});

function isFormDirty(): boolean {
  return !!(store.title?.trim() || store.certificate_type || store.image);
}

const isDisabledSubmitBtn = computed(() => {
  if (activeStepper.value === 1) {
    const isPrimaryDataValid = !!(store.title?.trim() && store.certificate_type && store.image);
    return !isPrimaryDataValid || Object.keys(errors.value).length > 0;
  }
  return false;
});

const buttonLabelCancel = computed(() => {
  return activeStepper.value === 1 ? 'Cancel' : 'Previous';
});

const buttonLabelSubmit = computed(() => {
  if (activeStepper.value === stepper.length) {
    return 'Done';
  }
  if (activeStepper.value === stepper.length - 1) {
    return 'Add Certificate';
  }
  return 'Next';
});

const imagePreview = computed(() => {
  if (store.image instanceof File) {
    return URL.createObjectURL(store.image);
  }
  if (typeof store.image === 'string') {
    return store.image;
  }
  return null;
});

function getContentImageSrc(content: ICertificateContentImageForm | ICertificateContentCertificateSigneeForm): string {
  if (content.type === 'image' || content.type === 'sertificate_signee') {
    if (content.file) {
      return URL.createObjectURL(content.file);
    }
    return content.value || '';
  }
  return '';
}

function getContentImageStyle(content: ICertificateContentImageForm | ICertificateContentCertificateSigneeForm): string {
  if ((content.type !== 'image' && content.type !== 'sertificate_signee') || (!content.value && !content.file)) {
    return 'display: none;';
  }

  const { width: layoutWidth, height: layoutHeight } = layoutDimensions;
  const { width, height, vertical, horizontal } = content.metadata;
  const safeTop = safe_zone.value?.top || 0;
  const safeRight = safe_zone.value?.right || 0;
  const safeBottom = safe_zone.value?.bottom || 0;
  const safeLeft = safe_zone.value?.left || 0;
  const safeWidth = layoutWidth - safeLeft - safeRight;
  const safeHeight = layoutHeight - safeTop - safeBottom;

  // Calculate position based on percentage (0-100)
  // 0% = content at left/top edge, 100% = content at right/bottom edge
  // Subtract content dimensions to ensure it stays within safe zone
  const maxHorizontalOffset = Math.max(0, safeWidth - width);
  const maxVerticalOffset = Math.max(0, safeHeight - height);

  const translateX = safeLeft + (horizontal / 100) * maxHorizontalOffset;
  const translateY = safeTop + (vertical / 100) * maxVerticalOffset;

  return `
    width: ${width}px;
    height: ${height}px;
    transform: translate(${translateX}px, ${translateY}px);
    will-change: transform;
  `;
}

function getContentTextStyle(content: ICertificateContentTextForm | ICertificateContentCertificateNumberForm | ICertificateContentLocationForm | ICertificateContentFullNameForm | ICertificateContentEmployeeIdForm | ICertificateContentEventTitleForm | ICertificateContentValidThruForm): string {
  if (!content.value) {
    return 'display: none;';
  }

  const { width: layoutWidth, height: layoutHeight } = layoutDimensions;
  const { width, height, font_family, font_size, font_weight, alignment, color, vertical, horizontal } = content.metadata;
  const safeTop = safe_zone.value?.top || 0;
  const safeRight = safe_zone.value?.right || 0;
  const safeBottom = safe_zone.value?.bottom || 0;
  const safeLeft = safe_zone.value?.left || 0;
  const safeWidth = layoutWidth - safeLeft - safeRight;
  const safeHeight = layoutHeight - safeTop - safeBottom;

  // Constrain width and height to safe zone boundaries
  const constrainedWidth = Math.min(width, safeWidth);
  const constrainedHeight = Math.min(height, safeHeight);

  // Calculate position based on percentage (0-100)
  // 0% = content at left/top edge, 100% = content at right/bottom edge
  // Subtract content dimensions to ensure it stays within safe zone
  const maxHorizontalOffset = Math.max(0, safeWidth - constrainedWidth);
  const maxVerticalOffset = Math.max(0, safeHeight - constrainedHeight);

  const translateX = safeLeft + (horizontal / 100) * maxHorizontalOffset;
  const translateY = safeTop + (vertical / 100) * maxVerticalOffset;

  return `
    position: absolute;
    transform: translate(${translateX}px, ${translateY}px);
    width: ${constrainedWidth}px;
    height: ${constrainedHeight}px;
    font-family: ${font_family || '\'Montserrat\', sans-serif'};
    font-size: ${font_size}px;
    font-weight: ${font_weight};
    text-align: ${alignment || 'left'};
    color: ${color};
    white-space: pre-wrap;
    overflow: hidden;
    box-sizing: border-box;
    will-change: transform;
    display: block;
  `;
}

const uploadImage = async (file: File) => {
  const now = new Date();
  const folder = `content/user-upload/image/${now.getFullYear()}/${now.getMonth() + 1}`;
  try {
    isLoading.value = true;
    showLoading('Uploading image', 'Please wait while we upload the file.');
    const response = await postUploadFile(file, folder);

    uploadedImageMeta.value = response?.data;
    store.image = response?.data?.full_path || null;
    return response?.data?.full_path;
  }
  catch (err) {
    $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Image upload failed.' });
    throw err;
  }
  finally {
    isLoading.value = false;
    hideLoading();
  }
};

const uploadContentImage = async (file: File) => {
  const now = new Date();
  const folder = `content/user-upload/certificate-content/${now.getFullYear()}/${now.getMonth() + 1}`;
  try {
    const response = await postUploadFile(file, folder);
    return response?.data?.full_path || null;
  }
  catch (err) {
    $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Content image upload failed.' });
    throw err;
  }
};

const { mutate: submitCertificateForm } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    isLoading.value = true;
    showLoading('Creating certificate', 'Please wait while we create the certificate.');

    const response = await postAddCertificate(payload).catch((err) => {
      hideLoading();
      $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Failed to add certificate.' });
      throw err;
    });

    if (response) {
      const { data } = response;
      store.certificateResponse = data;
      certificateId.value = data?.id || null;

      preventLeave.value = false;
      activeStepper.value += 1;
    }
  },
  onSettled: () => {
    isLoading.value = false;
    hideLoading();
  },
});

function handleCancel() {
  if (activeStepper.value === 1) {
    router.back();
  }
  else {
    activeStepper.value -= 1;
  }
}

const handleSubmit = async () => {
  if (activeStepper.value === 1) {
    let imageUrl: string | undefined = '';
    if (store.image instanceof File) {
      imageUrl = await uploadImage(store.image);
    }
    else if (typeof store.image === 'string') {
      imageUrl = store.image;
    }

    if (!imageUrl) {
      return;
    }

    const uploadedContents = await Promise.all(
      store.contents.map(async (content) => {
        if (content.type === 'image' && content.file) {
          const contentImageUrl = await uploadContentImage(content.file);
          return {
            type: content.type,
            key: content.key,
            value: contentImageUrl,
            metadata: content.metadata,
          };
        }
        return {
          type: content.type,
          key: content.key,
          value: content.value,
          metadata: content.metadata,
        };
      }),
    );

    const payload = {
      title: store.title,
      certificate_type: store.certificate_type,
      image: imageUrl,
      contents: uploadedContents,
      safe_zone: store.safe_zone,
    };

    submitCertificateForm(payload);
  }
  else {
    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Certificate successfully added.',
    });
    router.push({ name: 'achievement' });
  }
};

function handleClickOutsideContent() {
  selectedContentKey.value = null;
}

function handlePreviewItemClick(key: string) {
  selectedContentKey.value = key;
}

watch(isFormDirty, (value) => {
  preventLeave.value = value;
});

onBeforeMount(() => {
  store.$resetAll();
});
</script>

<style lang="postcss">
.empty-layout:has(.layout-add-certificate) {
  @apply h-screen w-full !bg-gray-25 !m-0;
}

.template-manage {
  @apply h-full flex flex-col; /* 1. Make the layout a full-height flex column */
}

.template-manage__content {
  @apply flex-grow min-h-0 max-w-[1280px] m-auto w-full;
}

.template-manage__header {
  @apply py-4 flex-shrink-0;
}

.template-manage__header > div {
  @apply max-w-[1280px] m-auto;
}

.ui-upload-compact {
  &__content {
    @apply flex flex-col text-xs font-medium gap-[2px];
  }
}
</style>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}

.selected-content {
  @apply border-2 border-primary-500;
}
</style>
