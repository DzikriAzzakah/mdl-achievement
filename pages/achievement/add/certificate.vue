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
              :show-layout-guid-section="!!(imagePreview || contents.length > 0)"
              :uploaded-image-meta="uploadedImageMeta"
              :selected-content-key="selectedContentKey"
              @update:title="(value: string) => store.title = value"
              @update:certificate-type="(value: { label: string; value: string; }) => store.certificate_type = value"
              @update:safe-zone="(value: any) => store.safe_zone = value"
              @update:image="(value: File | string | null) => store.image = value"
              @update:contents="(value: any[]) => store.contents = value"
              @update:uploaded-image-meta="(value: any) => uploadedImageMeta = value"
              @update:selected-content-key="(value: string | null) => selectedContentKey = value"
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
                @update:zoom="(val: number) => currentZoomLevel = val"
              >
                <div>
                  <div
                    ref="canvasRef"
                    class="w-[842px] h-[595px] bg-white relative"
                  >
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
                          data-safe-zone="true"
                          class="absolute border-2 border-dashed border-primary-500 pointer-events-none"
                          :style="safeZoneStyle"
                        />

                        <template
                          v-for="content in contents"
                          :key="content.key"
                        >
                          <img
                            v-if="content.type === 'image' || content.type === 'sertificate_signee'"
                            :id="content.key"
                            :src="getContentImageSrc(content)"
                            :style="getContentImageStyle(content)"
                            class="absolute cursor-pointer transition-none prevent-zoom-pan"
                            :class="[selectedContentKey === content.key ? 'selected-content' : '']"
                            @click.stop="(e) => handleSelectContent(e, content.key)"
                          >
                          <div
                            v-else-if="content.type === 'qr_code'"
                            :id="content.key"
                            :style="getQRCodeContainerStyle(content)"
                            class="cursor-pointer transition-none prevent-zoom-pan"
                            :class="[selectedContentKey === content.key ? 'selected-content' : '']"
                            @click.stop="(e) => handleSelectContent(e, content.key)"
                          >
                            <Qrcode
                              :value="content.value || 'https://example.com'"
                              :variant="{
                                pixel: content.metadata.shape === 'dots' ? 'circle' : 'default',
                                marker: content.metadata.border_style === 'rounded' ? 'rounded' : 'default',
                                inner: content.metadata.shape === 'dots' ? 'circle' : 'default',
                              }"
                              :radius="content.metadata.border_style === 'rounded' ? 1 : 0"
                              :black-color="`#${content.metadata.shape_color}`"
                              white-color="transparent"
                              class="w-full h-full"
                            />
                          </div>
                          <div
                            v-else-if="['text', 'certificate_number', 'fullname', 'employee_id', 'event_title', 'location', 'valid_thru'].includes(content.type)"
                            :id="content.key"
                            :style="getContentTextStyle(content)"
                            class="cursor-pointer transition-none hover:border hover:border-blue-300 prevent-zoom-pan"
                            :class="[selectedContentKey === content.key ? 'selected-content' : '']"
                            @click.stop="(e) => handleSelectContent(e, content.key)"
                          >
                            {{ getContentDisplayValue(content) }}
                          </div>
                        </template>
                        <Moveable
                          v-if="selectedContentKey && targetRef"
                          ref="moveableRef"
                          :target="targetRef"
                          :draggable="true"
                          :resizable="true"
                          :zoom="currentZoomLevel"
                          :throttle-drag="0"
                          :throttle-resize="0"
                          :keep-ratio="selectedContentAspectRatioLocked"
                          :render-directions="['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']"
                          :snappable="true"
                          :snap-directions="{ top: true, left: true, bottom: true, right: true, center: true, middle: true }"
                          @drag="onDrag"
                          @drag-end="onDragEnd"
                          @resize="onResize"
                          @resize-end="onResizeEnd"
                        />
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

import { useCertificateCanvas } from '#achievement/composables/useCertificateCanvas';
import { CREATE_STEPPER, TYPE_OPTIONS } from '#achievement/config/constants.ts';
import { PERMISSION_CREATE, PERMISSION_LIST } from '#achievement/config/featureFlag.ts';

import FormLayout from '#achievement/layouts/FormLayout.vue';
import { buildCertificateCreatePayload, buildContentPayload } from '#achievement/utils/certificatePayloadBuilder';
import { generateCertificateTemplate } from '#achievement/utils/certificateTemplateGenerator';
import { postUploadFile } from '#core/api/upload.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import UiSwitch from '#ui/components/atoms/switch/index.vue';

import { useMutation } from '@tanstack/vue-query';
import { nextTick } from 'vue';

import Moveable from 'vue3-moveable';

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

const activeStepper = ref<number>(1);
const stepper = CREATE_STEPPER;
const isLoading = ref<boolean>(false);
const certificateId = ref<number | string | null>(null);
const uploadedImageMeta = ref<any>(null);
const selectedContentKey = ref<string | null>(null);
const currentZoomLevel = ref<number>(1);

const canvasRef = ref<HTMLElement | null>(null);
const targetRef = ref<HTMLElement | null>(null);

const moveableRef = ref<any>(null);

const showSafeZone = ref<boolean>(true);

const layoutDimensions = { width: 842, height: 595 };

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

const selectedContentAspectRatioLocked = computed(() => {
  if (!selectedContentKey.value) {
    return false;
  }

  const selectedContent = store.contents.find(c => c.key === selectedContentKey.value);
  if (!selectedContent) {
    return false;
  }

  return selectedContent.metadata.isAspectRatioLocked ?? false;
});

function isFormDirty(): boolean {
  return !!(store.title?.trim() || store.certificate_type || store.image);
}

const isDisabledSubmitBtn = computed(() => {
  if (activeStepper.value === 1) {
    const isPrimaryDataInvalid = !(store.title?.trim() && store.certificate_type?.value && store.image);
    return isPrimaryDataInvalid || Object.keys(errors.value).length > 0;
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

function getMargins() {
  return {
    left: safe_zone.value?.left || 0,
    top: safe_zone.value?.top || 0,
  };
}

function getContentImageStyle(content: ICertificateContentImageForm | ICertificateContentCertificateSigneeForm): string {
  if ((content.type !== 'image' && content.type !== 'sertificate_signee') || (!content.value && !content.file)) {
    return 'display: none;';
  }

  const { width, height, vertical, horizontal } = content.metadata;
  const { left, top } = getMargins();

  const renderX = (horizontal || 0) + left;
  const renderY = (vertical || 0) + top;

  return `
    width: ${width}px;
    height: ${height}px;
    position: absolute;
    left: ${renderX}px;
    top: ${renderY}px;
    z-index: 10;
  `;
}

function getContentDisplayValue(content: ICertificateContentTextForm | ICertificateContentCertificateNumberForm | ICertificateContentLocationForm | ICertificateContentFullNameForm | ICertificateContentEmployeeIdForm | ICertificateContentEventTitleForm | ICertificateContentValidThruForm): string {
  if (content.type === 'certificate_number') {
    return '{{certificate_number}}';
  }
  if (content.type === 'fullname') {
    return '{{participant_name}}';
  }
  if (content.type === 'employee_id') {
    return '{{nik}}';
  }
  if (content.type === 'event_title') {
    return '{{title}}';
  }
  if (content.type === 'location') {
    return '{{city}}, {{date}}';
  }
  if (content.type === 'valid_thru') {
    return '{{expired_date}}';
  }
  return content.value || '';
}

function getContentTextStyle(content: ICertificateContentTextForm | ICertificateContentCertificateNumberForm | ICertificateContentLocationForm | ICertificateContentFullNameForm | ICertificateContentEmployeeIdForm | ICertificateContentEventTitleForm | ICertificateContentValidThruForm): string {
  const isDynamicContent = ['certificate_number', 'fullname', 'employee_id', 'event_title', 'location', 'valid_thru'].includes(content.type);
  if (!isDynamicContent && !content.value) {
    return 'display: none;';
  }

  const { width, height, font_family, font_size, font_weight, alignment, color, vertical, horizontal } = content.metadata;
  const { left, top } = getMargins();

  const renderX = (horizontal || 0) + left;
  const renderY = (vertical || 0) + top;

  return `
    position: absolute;
    left: ${renderX}px;
    top: ${renderY}px;
    width: ${width}px;
    height: ${height}px;
    font-family: ${font_family || '\'Montserrat\', sans-serif'};
    font-size: ${font_size}px;
    font-weight: ${font_weight};
    text-align: ${alignment?.value || 'left'};
    color: #${color};
    white-space: pre-wrap;
    overflow: hidden;
    box-sizing: border-box;
    display: block;
    z-index: 10;
  `;
}

function getQRCodeContainerStyle(content: any): string {
  const { width, height, vertical, horizontal, background_color, background_transparent, border_color, border_style } = content.metadata;
  const { left, top } = getMargins();

  const renderX = (horizontal || 0) + left;
  const renderY = (vertical || 0) + top;

  // Padding: 1/10 of size with minimum 6px
  const padding = Math.max(6, Math.floor(Math.min(width, height) / 10));
  const bgColor = background_transparent ? 'transparent' : `#${background_color}`;
  const borderRadius = border_style === 'rounded' ? '10px' : '0';

  return `
    position: absolute;
    left: ${renderX}px;
    top: ${renderY}px;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${bgColor};
    border: 2px solid #${border_color};
    border-radius: ${borderRadius};
    padding: ${padding}px;
    box-sizing: border-box;
    z-index: 10;
  `;
}

function handleSelectContent(e: Event, key: string) {
  selectedContentKey.value = key;

  nextTick(() => {
    const el = document.getElementById(key);
    targetRef.value = el;
  });
}

function handleClickOutsideContent() {
  selectedContentKey.value = null;
  targetRef.value = null;
}

const { captureCanvasAsImage } = useCertificateCanvas({
  canvasRef,
  backgroundUrl: imagePreview,
  contents,
  safeZone: safe_zone,
});

const uploadImage = async (file: File) => {
  const now = new Date();
  const folder = `content/user-upload/image/${now.getFullYear()}/${now.getMonth() + 1}`;
  try {
    isLoading.value = true;
    showLoading('Uploading image', 'Please wait while we upload the file.');
    const response = await postUploadFile(file, folder);

    uploadedImageMeta.value = response?.data;
    store.image = response?.data?.full_path || null;
    return {
      url: response?.data?.full_path,
      meta: response?.data,
    };
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
    return {
      url: response?.data?.full_path || null,
      meta: response?.data,
    };
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

    const response = await postAddCertificate(payload).catch((err: Error) => {
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
    try {
      isLoading.value = true;
      showLoading('Processing certificate', 'Please wait while we prepare the certificate.');

      let backgroundUrl: string = '';
      let backgroundMeta: any = uploadedImageMeta.value;

      if (store.image instanceof File) {
        const uploadResult = await uploadImage(store.image);
        backgroundUrl = uploadResult?.url || '';
        backgroundMeta = uploadResult?.meta;
      }
      else if (typeof store.image === 'string') {
        backgroundUrl = store.image;
      }

      if (!backgroundUrl) {
        $toast({ variant: 'error', title: 'Error', text: 'Background image is required.' });
        return;
      }

      const uploadedContents = await Promise.all(
        store.contents.map(async (content) => {
          if ((content.type === 'image' || content.type === 'sertificate_signee') && content.file) {
            const uploadResult = await uploadContentImage(content.file);
            return buildContentPayload(content, uploadResult?.url, uploadResult?.meta);
          }
          return buildContentPayload(content);
        }),
      );

      const template = generateCertificateTemplate({
        backgroundUrl,
        contents: store.contents,
        safeZone: store.safe_zone,
      });

      let imagePreviewBase64 = '';
      try {
        imagePreviewBase64 = await captureCanvasAsImage();
      }
      catch (err) {
        console.warn('Could not capture canvas preview:', err);
      }

      const payload = buildCertificateCreatePayload({
        title: store.title,
        certificateType: store.certificate_type?.value || '',
        backgroundUrl,
        backgroundMeta,
        template,
        imagePreview: imagePreviewBase64,
        safeZone: store.safe_zone,
        contents: uploadedContents,
      });

      submitCertificateForm(payload);
    }
    catch (err) {
      console.error('Error creating certificate:', err);
      $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Failed to create certificate.' });
    }
    finally {
      isLoading.value = false;
      hideLoading();
    }
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

const onDrag = ({ target, left, top }: any) => {
  target.style.left = `${left}px`;
  target.style.top = `${top}px`;
};

const onDragEnd = ({ target }: any) => {
  const contentIndex = store.contents.findIndex(c => c.key === selectedContentKey.value);
  if (contentIndex === -1) {
    return;
  }

  const { left: safeLeft, top: safeTop } = getMargins();

  const finalLeft = Number.parseFloat(target.style.left || 0);
  const finalTop = Number.parseFloat(target.style.top || 0);

  store.contents[contentIndex].metadata.horizontal = Math.round(finalLeft - safeLeft);
  store.contents[contentIndex].metadata.vertical = Math.round(finalTop - safeTop);
};

const onResize = ({ target, width, height, drag }: any) => {
  target.style.width = `${width}px`;
  target.style.height = `${height}px`;
  target.style.left = `${drag.left}px`;
  target.style.top = `${drag.top}px`;
};

const onResizeEnd = ({ target, _ }: any) => {
  const contentIndex = store.contents.findIndex(c => c.key === selectedContentKey.value);
  if (contentIndex === -1) {
    return;
  }

  const { left: safeLeft, top: safeTop } = getMargins();

  const finalWidth = Number.parseFloat(target.style.width);
  const finalHeight = Number.parseFloat(target.style.height);
  const finalLeft = Number.parseFloat(target.style.left);
  const finalTop = Number.parseFloat(target.style.top);

  store.contents[contentIndex].metadata.width = Math.round(finalWidth);
  store.contents[contentIndex].metadata.height = Math.round(finalHeight);

  store.contents[contentIndex].metadata.horizontal = Math.round(finalLeft - safeLeft);
  store.contents[contentIndex].metadata.vertical = Math.round(finalTop - safeTop);
};

watch(isFormDirty, (value) => {
  preventLeave.value = value;
});

watch(
  () => store.contents,
  () => {
    nextTick(() => {
      moveableRef.value?.updateRect();
    });
  },
  { deep: true },
);

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
  @apply flex-grow min-h-0 max-w-[1440px] m-auto w-full;
}

.template-manage__header {
  @apply py-4 flex-shrink-0;
}

.template-manage__header > div {
  @apply max-w-[1440px] m-auto;
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
