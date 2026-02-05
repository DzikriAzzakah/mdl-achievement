<template>
  <TemplateManageLayout
    :title="isEditMode ? 'Edit Certificate' : 'Add Certificate'"
    :class="[
      isEditMode ? 'layout-edit-certificate' : 'layout-add-certificate',
      activeStepper === 2 ? 'layout-certificate--accessibility' : '',
    ]"
    :active-stepper="isEditMode ? activeStep : activeStepper"
    :breadcrumbs="breadcrumbs"
    :stepper="isEditMode ? CERTIFICATE_TABS_EDIT : CREATE_STEPPER"
    :is-tabs="isEditMode"
    :disable-submit="isDisabledSubmitBtn"
    :disable-cancel="!isEditMode && activeStepper === 1"
    :label-cancel="buttonLabelCancel"
    :label-submit="buttonLabelSubmit"
    :is-loading-submit="isLoading"
    :is-loading-cancel="isLoading"
    :fixed-bottom-footer="true"
    :is-use-breadcrumbs="isEditMode"
    :show-cancel="!isEditMode"
    :show-submit="!isEditMode || activeStep !== 'accessibility'"
    show-header-button
    disable-footer
    @on-cancel="handleCancel"
    @on-submit="handleSubmit"
    @on-change="handleTabChange"
  >
    <template #content>
      <template v-if="showCertificateInformation">
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
              @update:title="(value: string) => store.title = value"
              @update:certificate-type="(value: { label: string; value: string; }) => store.certificate_type = value"
              @update:safe-zone="(value: any) => store.safe_zone = value"
              @update:image="(value: File | string | null) => store.image = value"
              @update:contents="(value: any[]) => canvas.contents.value = value"
              @update:uploaded-image-meta="(value: any) => uploadedImageMeta = value"
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
                    :style="canvasStyle"
                    class="bg-white relative"
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
                          :key="content.element_id"
                        >
                          <img
                            v-if="content.type === 'image' || content.type === 'sertificate_signee'"
                            :id="content.element_id"
                            :src="getContentImageSrc(content)"
                            :style="getContentImageStyle(content)"
                            class="absolute cursor-pointer transition-none prevent-zoom-pan"
                            :class="[
                              selectedContentKey === content.element_id ? 'selected-content' : '',
                              content.metadata.isLocked ? 'locked-content' : '',
                            ]"
                            @click.stop="(e) => handleSelectContent(e, content.element_id)"
                          >
                          <div
                            v-else-if="content.type === 'qr_code'"
                            :id="content.element_id"
                            :style="getQRCodeContainerStyle(content)"
                            class="cursor-pointer transition-none prevent-zoom-pan"
                            :class="[
                              selectedContentKey === content.element_id ? 'selected-content' : '',
                              content.metadata.isLocked ? 'locked-content' : '',
                            ]"
                            @click.stop="(e) => handleSelectContent(e, content.element_id)"
                          >
                            <CoreUtilsQrCodeClient
                              :data="content.value || 'https://example.com'"
                              :qr-config="getQRCodeConfig(content)"
                            />
                          </div>
                          <div
                            v-else-if="['text', 'certificate_number', 'participant_name', 'nik', 'title', 'city', 'date', 'valid_thru'].includes(content.type)"
                            :id="content.element_id"
                            :style="getContentTextStyle(content)"
                            class="cursor-pointer transition-none hover:border hover:border-blue-300 prevent-zoom-pan"
                            :class="[
                              selectedContentKey === content.element_id ? 'selected-content' : '',
                              content.metadata.isLocked ? 'locked-content' : '',
                            ]"
                            @click.stop="(e) => handleSelectContent(e, content.element_id)"
                          >
                            {{ getContentDisplayValue(content) }}
                          </div>
                        </template>
                        <Moveable
                          v-if="selectedContentKey && targetRef"
                          ref="moveableRef"
                          :target="targetRef"
                          :draggable="!isSelectedContentLocked"
                          :resizable="!isSelectedContentLocked"
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
      <div v-if="showAccessibility">
        <Accessibility />
      </div>
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import type {
  CertificateDetailResponseData,
  CertificateNumberContentForm,
  CertificateSigneeContentForm,
  CityContentForm,
  DateContentForm,
  EventTitleContentForm,
  ImageContentForm,
  NIKContentForm,
  ParticipantNameContentForm,
  TextContentForm,
  ValidThruContentForm,
} from '#achievement/config/types.ts';
import type { Options } from 'qr-code-styling';
import type { RouteLocationNormalized } from 'vue-router';
import { getCertificateDetail, patchEditCertificate, postAddCertificate, postUploadAchievementFile } from '#achievement/api/api.ts';

import Accessibility from '#achievement/components/form/certificate/Accessibility.vue';

import Sidebar from '#achievement/components/form/certificate/Sidebar.vue';

import ZoomableContent from '#achievement/components/ZoomableContent.vue';
import { useCanvasInteract } from '#achievement/composables/useCanvasInteract';
import { useCertificateCanvas } from '#achievement/composables/useCertificateCanvas';
import { useKeyboardShortcuts } from '#achievement/composables/useKeyboardShortcuts';

import { CANVAS_HEIGHT, CANVAS_WIDTH, CERTIFICATE_TABS_EDIT, CREATE_STEPPER, FormMode, TYPE_OPTIONS } from '#achievement/config/constants.ts';
import {
  PERMISSION_CERTIFICATE_CREATE,
  PERMISSION_CERTIFICATE_EDIT,
  PERMISSION_FEATURE_KEY,
} from '#achievement/config/featureFlag.ts';

import { generateInlineStyleFromConfig, getTextContentStyleConfig } from '#achievement/helpers/contentStyle';
import FormLayout from '#achievement/layouts/FormLayout.vue';
import { buildCertificateCreatePayload, buildContentPayload } from '#achievement/utils/certificatePayloadBuilder';
import { generateCertificateTemplate } from '#achievement/utils/certificateTemplateGenerator';
import { htmlToImageFile } from '#achievement/utils/htmlToImage';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import CoreUtilsQrCodeClient from '#core/components/utils/QrCode.client.vue';

import { UiSwitch } from '@mydigilearn-saas/web-ui';

import { useMutation, useQuery } from '@tanstack/vue-query';
import Moveable from 'vue3-moveable';

type TStep = 'certificate-configuration' | 'accessibility';

const { $toast } = useNuxtApp();

const route = useRoute();
const formMode = computed(() => route.params.formMode as string);
const isEditMode = computed(() => formMode.value === FormMode.EDIT);
const routeId = computed(() => route.params.id as string | undefined);

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  validate: async (route) => {
    const formMode = route.params.formMode as string;
    const id = route.params.id;

    if (formMode === 'create' && id) {
      return false;
    }

    if (formMode === 'edit' && !id) {
      return false;
    }
    return ['create', 'edit'].includes(formMode);
  },
  rbac: {
    feature: PERMISSION_FEATURE_KEY,
    permissions: [PERMISSION_CERTIFICATE_CREATE, PERMISSION_CERTIFICATE_EDIT],
    matchFn: (permissions: string[], to: RouteLocationNormalized) => {
      const formMode = to.params.formMode as string;

      if (formMode === 'create') {
        return permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_CERTIFICATE_CREATE}`);
      }

      if (formMode === 'edit') {
        return permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_CERTIFICATE_EDIT}`);
      }

      return false;
    },
  },
});

const store = useCertificateStore();
const canvas = useCertificateCanvas();
const { errors, title, certificate_type, image, safe_zone } = storeToRefs(store);
const contents = toRef(canvas, 'contents');
const selectedContentKey = toRef(canvas, 'selectedContentKey');

const router = useRouter();
const { showLoading, hideLoading } = useGlobalLoading();
const { preventLeave } = useConfirmLeave();
const { getApiErrorMessage } = useUtility();
const { buildReturnUrl } = useQueryUrlParams();

const returnUrl = buildReturnUrl('/achievement');

const breadcrumbs = computed(() => {
  if (!isEditMode.value) {
    return [];
  }

  return [
    { text: 'Master Data', href: '', active: false },
    { text: 'Achievement', href: returnUrl.value, active: false },
    { text: 'Edit', href: `/achievement/edit/certificate/${routeId.value}`, active: true },
  ];
});

const activeStepper = ref<number>(1);
const activeStep = ref<TStep>('certificate-configuration');
const isLoading = ref<boolean>(false);
const certificateId = ref<number | string | null>(null);
const uploadedImageMeta = ref<any>(null);
const currentZoomLevel = ref<number>(1);
const isLoadingDetail = ref<boolean>(false);

const initialFormState = ref<string>('');
const initialVisualState = ref<string>('');
const hasJustSaved = ref<boolean>(false);

const canvasRef = ref<HTMLElement | null>(null);

const showSafeZone = ref<boolean>(true);

const getVisualState = () => ({
  image: store.image instanceof File
    ? { name: store.image.name, size: store.image.size, lastModified: store.image.lastModified }
    : store.image,
  safe_zone: store.safe_zone,
  contents: canvas.contents.value.map((c: any) => {
    const contentFile = (c as any).file;
    return {
      ...c,
      file: contentFile ? { name: contentFile.name, size: contentFile.size } : null,
      metadata: c.metadata,
    };
  }),
});

const getVisualSnapshot = () => JSON.stringify(getVisualState());

const getFormSnapshot = () => JSON.stringify({
  title: store.title,
  certificate_type: store.certificate_type,
  visual: getVisualState(),
});

const isFormChanged = computed(() => {
  return getFormSnapshot() !== initialFormState.value;
});

const updateInitialState = () => {
  initialFormState.value = getFormSnapshot();
  initialVisualState.value = getVisualSnapshot();
  hasJustSaved.value = false;
};

useQuery({
  queryKey: ['get-certificate-detail', routeId],
  queryFn: async () => {
    if (!isEditMode.value || !routeId.value) {
      return null;
    }

    isLoadingDetail.value = true;
    showLoading('Loading certificate', 'Please wait while we load the certificate data.');

    try {
      const response = await getCertificateDetail(Number(routeId.value));
      const data = response?.data as CertificateDetailResponseData;

      if (data) {
        store.setFormFromDetail(data);

        if (data.contents && data.contents.length > 0) {
          canvas.loadContentsFromPayload(data.contents);
        }

        certificateId.value = data.id;

        uploadedImageMeta.value = store.uploadedBackgroundMeta;

        updateInitialState();
      }

      return data;
    }
    catch (err) {
      $toast({
        variant: 'error',
        title: 'Error',
        text: getApiErrorMessage(err as Error) || 'Failed to fetch certificate details.',
      });
      router.push({ name: 'achievement' });
      return null;
    }
    finally {
      isLoadingDetail.value = false;
      hideLoading();
    }
  },
  enabled: computed(() => isEditMode.value && !!routeId.value),
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

const {
  moveableRef,
  targetRef,
  handleSelectContent,
  handleClickOutsideContent,
  onDrag,
  onDragEnd,
  onResize,
  onResizeEnd,
} = useCanvasInteract({
  contents,
  safeZone: safe_zone,
  selectedContentKey,
});

useKeyboardShortcuts();

const canvasStyle = computed(() => ({
  width: `${CANVAS_WIDTH}px`,
  height: `${CANVAS_HEIGHT}px`,
}));

const safeZoneStyle = computed(() => {
  const top = safe_zone.value?.top || 0;
  const right = safe_zone.value?.right || 0;
  const bottom = safe_zone.value?.bottom || 0;
  const left = safe_zone.value?.left || 0;

  return `
    top: ${top}px;
    right: ${right}px;
    bottom: ${bottom}px;
    left: ${left}px;
    width: ${CANVAS_WIDTH - left - right}px;
    height: ${CANVAS_HEIGHT - top - bottom}px;
  `;
});

const selectedContentAspectRatioLocked = computed(() => {
  if (!selectedContentKey.value) {
    return false;
  }

  const selectedContent = canvas.contents.value.find((c: any) => c.element_id === selectedContentKey.value);
  if (!selectedContent) {
    return false;
  }

  return selectedContent.metadata.isAspectRatioLocked ?? false;
});

const isSelectedContentLocked = computed(() => {
  if (!selectedContentKey.value) {
    return false;
  }

  const content = canvas.contents.value.find((c: any) => c.element_id === selectedContentKey.value);
  return content?.metadata.isLocked === true;
});

function handleTabChange(value: string | number): void {
  if (isEditMode.value) {
    activeStep.value = value as TStep;

    if (value === 'certificate-configuration') {
      activeStepper.value = 1;
    }
    else if (value === 'accessibility') {
      activeStepper.value = 2;
    }
  }
}

function isFormDirtyLegacy(): boolean {
  return !!(store.title?.trim() || store.certificate_type || store.image);
}

const isDisabledSubmitBtn = computed(() => {
  if (activeStepper.value === 1) {
    const isPrimaryDataInvalid = !(store.title?.trim() && store.certificate_type?.value && store.image);
    if (isPrimaryDataInvalid || Object.keys(errors.value).length > 0 || isLoadingDetail.value) {
      return true;
    }

    if (isEditMode.value) {
      if (hasJustSaved.value) {
        return true;
      }

      if (!isFormChanged.value) {
        return true;
      }

      return false;
    }
  }

  return false;
});

const buttonLabelCancel = computed(() => {
  return activeStepper.value === 1 ? 'Cancel' : 'Previous';
});

const buttonLabelSubmit = computed(() => {
  if (activeStepper.value === CREATE_STEPPER.length) {
    return 'Done';
  }
  if (activeStepper.value === CREATE_STEPPER.length - 1) {
    if (isEditMode.value) {
      if (hasJustSaved.value) {
        return 'Saved';
      }

      return 'Save Certificate';
    }
    return 'Add Certificate';
  }
  return 'Next';
});

const showCertificateInformation = computed(() => {
  if (!isEditMode.value) {
    return activeStepper.value === 1;
  }
  return activeStep.value === 'certificate-configuration';
});

const showAccessibility = computed(() => {
  if (!isEditMode.value) {
    return activeStepper.value === 2;
  }
  return activeStep.value === 'accessibility';
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

function getContentImageSrc(content: ImageContentForm | CertificateSigneeContentForm): string {
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

function getContentImageStyle(content: ImageContentForm | CertificateSigneeContentForm): string {
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

function getContentDisplayValue(content: TextContentForm | CertificateNumberContentForm | CityContentForm | DateContentForm | ParticipantNameContentForm | NIKContentForm | EventTitleContentForm | ValidThruContentForm): string {
  if (content.type === 'certificate_number') {
    return '{{certificate_number}}';
  }
  if (content.type === 'participant_name') {
    return '{{participant_name}}';
  }
  if (content.type === 'nik') {
    return '{{nik}}';
  }
  if (content.type === 'title') {
    return '{{title}}';
  }
  if (content.type === 'city') {
    return content.element_value || '';
  }
  if (content.type === 'date') {
    return '{{date}}';
  }
  if (content.type === 'valid_thru') {
    return '{{expired_date}}';
  }
  return content.element_value || '';
}

function getContentTextStyle(content: TextContentForm | CertificateNumberContentForm | CityContentForm | DateContentForm | ParticipantNameContentForm | NIKContentForm | EventTitleContentForm | ValidThruContentForm): string {
  const isDynamicContent = ['certificate_number', 'participant_name', 'nik', 'title', 'date', 'valid_thru'].includes(content.type);

  if (!isDynamicContent && !content.element_value) {
    return 'display: none;';
  }

  const styleConfig = getTextContentStyleConfig(content, safe_zone.value || { top: 0, right: 0, bottom: 0, left: 0 });
  return generateInlineStyleFromConfig(styleConfig);
}

function getQRCodeContainerStyle(content: any): string {
  const { width, height, vertical, horizontal, background_color, background_transparent, border_color, border_style } = content.metadata;
  const { left, top } = getMargins();

  const renderX = (horizontal || 0) + left;
  const renderY = (vertical || 0) + top;

  // const padding = Math.max(6, Math.floor(Math.min(width, height) / 10));
  const padding = 0;
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

function getQRCodeConfig(content: any): Partial<Options> {
  const { width, height, shape, border_style, shape_color } = content.metadata;

  const qrSize = Math.min(width, height);
  const padding = Math.max(6, Math.floor(qrSize / 10));
  const actualQRSize = qrSize - (padding * 2);

  return {
    width: actualQRSize,
    height: actualQRSize,
    type: 'svg',
    margin: 0,
    data: content.value || 'https://example.com',
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'Q',
    },
    dotsOptions: {
      type: shape === 'dots' ? 'dots' : 'rounded',
      color: `#${shape_color}`,
    },
    backgroundOptions: {
      color: 'transparent',
    },
    cornersSquareOptions: {
      type: border_style === 'rounded' ? 'extra-rounded' : 'square',
      color: `#${shape_color}`,
    },
    cornersDotOptions: {
      type: border_style === 'rounded' ? 'dot' : 'square',
      color: `#${shape_color}`,
    },
  };
}

const uploadBackgroundImage = async (file: File) => {
  try {
    isLoading.value = true;
    showLoading('Uploading image', 'Please wait while we upload the file.');
    const response = await postUploadAchievementFile(file, 'certificate_background');

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
  try {
    const response = await postUploadAchievementFile(file, 'certificate_custom_image');
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

const uploadPreviewImage = async (file: File) => {
  try {
    const response = await postUploadAchievementFile(file, 'certificate_template_preview');
    return {
      url: response?.data?.full_path || null,
      meta: response?.data,
    };
  }
  catch (err) {
    $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Preview image upload failed.' });
    throw err;
  }
};

const { mutate: submitCertificateForm } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    isLoading.value = true;
    const loadingMessage = isEditMode.value ? 'Updating certificate' : 'Creating certificate';
    showLoading(loadingMessage, 'Please wait while we process the certificate.');

    let response;
    if (isEditMode.value && certificateId.value) {
      response = await patchEditCertificate(Number(certificateId.value), payload as any).catch((err: Error) => {
        hideLoading();
        $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Failed to update certificate.' });
        throw err;
      });
    }
    else {
      response = await postAddCertificate(payload).catch((err: Error) => {
        hideLoading();
        $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Failed to add certificate.' });
        throw err;
      });
    }

    if (response) {
      const { data } = response;
      store.certificateResponse = data;
      if (!isEditMode.value) {
        certificateId.value = data?.id || null;
        activeStepper.value += 1;
      }
      else {
        updateInitialState();
        hasJustSaved.value = true;
      }

      preventLeave.value = false;
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

      const isVisualChanged = getVisualSnapshot() !== initialVisualState.value;

      if (isEditMode.value && !isVisualChanged) {
        const payload: any = {};
        if (store.title !== store.detailCertificate?.title) {
          payload.title = store.title;
        }
        if (store.certificate_type?.value !== store.detailCertificate?.certificate_type?.value) {
          payload.type = store.certificate_type?.value;
        }

        if (Object.keys(payload).length > 0) {
          submitCertificateForm(payload);
        }
        else {
          isLoading.value = false;
          hideLoading();
        }
        return;
      }

      let backgroundUrl: string = '';
      let backgroundMeta: any = uploadedImageMeta.value || store.uploadedBackgroundMeta;

      if (store.image instanceof File) {
        const uploadResult = await uploadBackgroundImage(store.image);
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

      const contentImageUrls: Record<string, { url: string; originalFileName?: string; }> = {};

      const uploadedContents = await Promise.all(
        canvas.contents.value.map(async (content: any) => {
          if (content.type === 'image' || content.type === 'sertificate_signee') {
            if (content.file) {
              const uploadResult = await uploadContentImage(content.file);
              if (uploadResult?.url) {
                contentImageUrls[content.element_id] = {
                  url: uploadResult.url,
                  originalFileName: uploadResult.meta?.original_file_name || content.file.name,
                };
              }
              return buildContentPayload(content, uploadResult?.url, uploadResult?.meta);
            }

            else if (content.value) {
              const contentMeta = content.metadata as Record<string, any>;
              contentImageUrls[content.element_id] = {
                url: content.value,
                originalFileName: contentMeta?.original_file_name,
              };
              return buildContentPayload(content);
            }
          }
          return buildContentPayload(content);
        }),
      );

      const deletedContentsPayload = canvas.deletedContents.value.map((content: any) =>
        buildContentPayload(content, null, null, true),
      );

      const finalContentsPayload = [...uploadedContents, ...deletedContentsPayload];

      const template = generateCertificateTemplate({
        backgroundUrl,
        contents: canvas.contents.value,
        safeZone: store.safe_zone,
        contentImageUrls,
      });

      let previewMeta: any = null;
      try {
        showLoading('Generating preview', 'Please wait while we generate the certificate preview.');

        const sanitizedTitle = (store.title || 'certificate').replace(/[^a-z0-9]/gi, '-').substring(0, 30);
        const timestamp = Date.now();
        const uniqueFileName = `preview-${sanitizedTitle}-${timestamp}.png`;

        const previewTemplate = generateCertificateTemplate({
          backgroundUrl,
          contents: canvas.contents.value,
          safeZone: store.safe_zone,
          contentImageUrls,
          useActualUrls: true,
        });

        const previewFile = await htmlToImageFile(previewTemplate, uniqueFileName);
        const previewUploadResult = await uploadPreviewImage(previewFile);
        previewMeta = previewUploadResult?.meta;
      }
      catch (err) {
        console.error('[App] Could not generate/upload preview image:', err);
        $toast({ variant: 'warning', title: 'Warning', text: 'Preview image generation failed' });
        return;
      }

      const payload = buildCertificateCreatePayload({
        title: store.title,
        certificateType: store.certificate_type?.value || '',
        backgroundMeta,
        previewMeta,
        template,
        safeZone: store.safe_zone,
        contents: finalContentsPayload,
      });

      const finalPayload: any = { ...payload };

      if (isEditMode.value) {
        if (store.title === store.detailCertificate?.title) {
          delete finalPayload.title;
        }

        if (store.certificate_type?.value === store.detailCertificate?.certificate_type?.value) {
          delete finalPayload.type;
        }
      }

      submitCertificateForm(finalPayload);
    }
    catch (err) {
      console.error('Error processing certificate:', err);
      $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Failed to process certificate.' });
    }
    finally {
      isLoading.value = false;
      hideLoading();
    }
  }
  else {
    const successMessage = isEditMode.value ? 'Certificate successfully updated.' : 'Certificate successfully added.';
    $toast({
      variant: 'success',
      title: 'Success',
      text: successMessage,
    });
    router.push({ name: 'achievement' });
  }
};

watch(isFormDirtyLegacy, (value: any) => {
  if (!isEditMode.value) {
    preventLeave.value = value;
  }
});

watch(
  () => [store.title, store.certificate_type, store.image, canvas.contents.value, store.safe_zone],
  () => {
    if (isEditMode.value) {
      if (hasJustSaved.value) {
        hasJustSaved.value = false;
      }

      preventLeave.value = isFormChanged.value;
    }
  },
  { deep: true },
);

onBeforeMount(() => {
  store.$resetAll();
  canvas.resetCanvas();
});
</script>

<style lang="postcss">
.empty-layout:has(.layout-add-certificate) {
  @apply h-screen w-full !bg-gray-25 !m-0;
}

.empty-layout:has(.layout-add-certificate.layout-certificate--accessibility) {
  @apply !bg-white;
}

.empty-layout:has(.layout-edit-certificate) {
  @apply h-screen w-full !bg-gray-25 !m-0;
}

.empty-layout:has(.layout-edit-certificate.layout-certificate--accessibility) {
  @apply !bg-white;
}

.template-manage {
  @apply h-full flex flex-col;
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

.locked-content {
  cursor: not-allowed;
}

.locked-content.selected-content {
  @apply border-amber-500;
}
</style>
