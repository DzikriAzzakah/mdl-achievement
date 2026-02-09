<template>
  <TemplateManageLayout
    :title="isEditMode ? 'Edit Certificate' : 'Add Certificate'"
    :class="[isEditMode ? 'layout-edit-certificate' : 'layout-add-certificate']"
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
    :show-submit="true"
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
              v-model:show-safe-zone="showSafeZone"
              :errors="errors"
              :title="title"
              :certificate-type="certificate_type"
              :image="image"
              :contents="contents"
              :safe-zone="safe_zone"
              :layout-guideline="store.layoutGuideline"
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
              @update:layout-guideline="(value: any) => store.updateLayoutGuideline(value)"
            />
          </template>
          <template #main-content>
            <div
              class="w-full h-full bg-gray-25 rounded-xl relative border border-solid border-gray-50 p-5"
              @click="handleClickOutsideContent"
            >
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

                        <GuidelineOverlay
                          :guideline="store.layoutGuideline"
                          :safe-zone="safe_zone"
                          :canvas-width="CANVAS_WIDTH"
                          :canvas-height="CANVAS_HEIGHT"
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
                            v-else-if="['text', 'certificate_number', 'participant_name', 'module_type', 'nik', 'title', 'city', 'date', 'valid_thru'].includes(content.type)"
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
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import type { RouteLocationNormalized } from 'vue-router';
import GuidelineOverlay from '#achievement/components/form/certificate/GuidelineOverlay.vue';
import Sidebar from '#achievement/components/form/certificate/Sidebar.vue';
import ZoomableContent from '#achievement/components/ZoomableContent.vue';
import { useCanvasInteract } from '#achievement/composables/useCanvasInteract';
import { useCertificateContentRendering } from '#achievement/composables/useCertificateContentRendering';
import { useCertificateDetailLoader } from '#achievement/composables/useCertificateDetailLoader';
import { useCertificateForm } from '#achievement/composables/useCertificateForm';
import { useCertificateSubmit } from '#achievement/composables/useCertificateSubmit';
import { useKeyboardShortcuts } from '#achievement/composables/useKeyboardShortcuts';
import { CANVAS_HEIGHT, CANVAS_WIDTH, CERTIFICATE_TABS_EDIT, CREATE_STEPPER, TYPE_OPTIONS } from '#achievement/config/constants.ts';
import {
  PERMISSION_CERTIFICATE_CREATE,
  PERMISSION_CERTIFICATE_EDIT,
  PERMISSION_FEATURE_KEY,
} from '#achievement/config/featureFlag.ts';
import FormLayout from '#achievement/layouts/FormLayout.vue';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import CoreUtilsQrCodeClient from '#core/components/utils/QrCode.client.vue';
import { useQuery } from '@tanstack/vue-query';
import Moveable from 'vue3-moveable';

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

const {
  store,
  canvas,
  errors,
  title,
  certificate_type,
  image,
  safe_zone,
  contents,
  selectedContentKey,
  activeStepper,
  activeStep,
  isLoading,
  certificateId,
  uploadedImageMeta,
  isLoadingDetail,
  hasJustSaved,
  initialVisualState,
  isEditMode,
  routeId,
  returnUrl,
  breadcrumbs,
  showCertificateInformation,
  imagePreview,
  isDisabledSubmitBtn,
  buttonLabelCancel,
  buttonLabelSubmit,
  getVisualSnapshot,
  isFormChanged,
  updateInitialState,
  isFormDirtyLegacy,
  handleTabChange,
  handleCancel,
} = useCertificateForm();

// Content rendering
const {
  canvasStyle,
  safeZoneStyle,
  getContentImageSrc,
  getContentImageStyle,
  getContentDisplayValue,
  getContentTextStyle,
  getQRCodeContainerStyle,
  getQRCodeConfig,
} = useCertificateContentRendering(safe_zone);

// Detail loading
const { loadCertificateDetail } = useCertificateDetailLoader();

// Certificate submission
const { submitCertificate } = useCertificateSubmit();

const { preventLeave } = useConfirmLeave();
const canvasRef = ref<HTMLElement | null>(null);
const showSafeZone = ref<boolean>(true);
const currentZoomLevel = ref<number>(1);

// Load certificate detail in edit mode
useQuery({
  queryKey: ['get-certificate-detail', routeId],
  queryFn: async () => {
    if (!isEditMode.value || !routeId.value) {
      return null;
    }

    isLoadingDetail.value = true;
    const data = await loadCertificateDetail(
      routeId.value,
      store,
      canvas,
      uploadedImageMeta,
      certificateId,
      updateInitialState,
    );
    isLoadingDetail.value = false;
    return data;
  },
  enabled: computed(() => isEditMode.value && !!routeId.value),
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

// Canvas interaction
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

// Keyboard shortcuts
useKeyboardShortcuts();

// Computed properties
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

const handleSubmit = async () => {
  isLoading.value = true;

  try {
    await submitCertificate({
      isEditMode: isEditMode.value,
      certificateId: certificateId.value,
      store,
      canvas,
      uploadedImageMeta: uploadedImageMeta.value,
      getVisualSnapshot,
      initialVisualState: initialVisualState.value,
      updateInitialState,
      hasJustSaved,
      returnUrl: returnUrl.value,
    });
  }
  finally {
    isLoading.value = false;
  }
};

// Watchers for form dirty state
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

      preventLeave.value = isFormChanged();
    }
  },
  { deep: true },
);

// Lifecycle hooks
onBeforeMount(() => {
  store.$resetAll();
  canvas.resetCanvas();
});
</script>

<style lang="postcss">
.empty-layout:has(.layout-add-certificate) {
  @apply h-screen w-full !bg-gray-25 !m-0;
}

.empty-layout:has(.layout-edit-certificate) {
  @apply h-screen w-full !bg-gray-25 !m-0;
}

.template-manage {
  @apply h-full flex flex-col;
}

.template-manage__content {
  @apply flex-grow min-h-0 max-w-[1280px] m-auto w-full;
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

.locked-content {
  cursor: not-allowed;
}

.locked-content.selected-content {
  @apply border-amber-500;
}
</style>
