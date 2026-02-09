<template>
  <div class="bg-white border border-solid border-gray-50 shadow-sm rounded-xl p-4 w-full">
    <ContentItemHeader
      icon="mdi:qrcode"
      title="QR Code"
      :is-collapsed="isCollapsed"
      @delete="handleDelete"
      @toggle-collapse="emit('headerClick')"
    />
    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'max-h-0' : 'max-h-[1000px]'"
    >
      <div class="space-y-4 pt-2">
        <UiFormGroup label="Size">
          <div class="flex items-center gap-2">
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="contentItem.metadata.width"
                size="md"
                @update:model-value="updateSize"
              >
                <template #suffix>
                  <span class="text-gray-500 text-xs">px</span>
                </template>
              </UiInput>
            </div>
          </div>
        </UiFormGroup>

        <PositionAlignmentControl
          :horizontal="contentItem.metadata.horizontal"
          :vertical="contentItem.metadata.vertical"
          :current-horizontal-align="currentHorizontalAlign"
          :current-vertical-align="currentVerticalAlign"
          @align="handleAlignContent"
          @update:horizontal="updateHorizontal"
          @update:vertical="updateVertical"
        />

        <UiFormGroup label="Background">
          <div class="flex items-center gap-3">
            <UiSwitch
              :model-value="contentItem.metadata.background_transparent"
              label="Transparent"
              size="md"
              @update:model-value="updateBackgroundTransparent"
            />
            <div
              v-if="!contentItem.metadata.background_transparent"
              class="flex items-center gap-2 min-w-0 flex-1"
            >
              <div class="min-w-0 flex-shrink">
                <ColorPickerInput
                  :model-value="contentItem.metadata.background_color"
                  @update:model-value="updateBackgroundColor"
                />
              </div>
            </div>
          </div>
        </UiFormGroup>

        <UiFormGroup label="QR Shape">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 flex-shrink-0">
              <UiButton
                v-for="option in QR_CODE_SHAPE_OPTIONS"
                :key="option.value"
                v-tooltip="option.label"
                square
                size="md"
                :variant="contentItem.metadata.shape === option.value ? 'solid' : 'soft'"
                :color="contentItem.metadata.shape === option.value ? 'primary' : 'ghost'"
                :icon="option.icon"
                @click="updateShape(option.value as QRCodeShape)"
              />
            </div>
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <ColorPickerInput
                :model-value="contentItem.metadata.shape_color"
                @update:model-value="updateShapeColor"
              />
            </div>
          </div>
        </UiFormGroup>

        <UiFormGroup label="Border Style">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 flex-shrink-0">
              <UiButton
                v-for="option in QR_CODE_BORDER_OPTIONS"
                :key="option.value"
                v-tooltip="option.label"
                square
                size="md"
                :variant="contentItem.metadata.border_style === option.value ? 'solid' : 'soft'"
                :color="contentItem.metadata.border_style === option.value ? 'primary' : 'ghost'"
                :icon="option.icon"
                @click="updateBorderStyle(option.value as QRCodeBorderStyle)"
              />
            </div>
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <ColorPickerInput
                :model-value="contentItem.metadata.border_color"
                @update:model-value="updateBorderColor"
              />
            </div>
          </div>
        </UiFormGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QRCodeBorderStyle, QRCodeContentForm, QRCodeShape } from '#achievement/config/types.ts';
import ColorPickerInput from '#achievement/components/form/certificate/shared/ColorPickerInput.vue';
import ContentItemHeader from '#achievement/components/form/certificate/shared/ContentItemHeader.vue';
import PositionAlignmentControl from '#achievement/components/form/certificate/shared/PositionAlignmentControl.vue';
import { useCertificateCanvas } from '#achievement/composables/useCertificateCanvas';
import { CANVAS_HEIGHT, CANVAS_WIDTH, QR_CODE_BORDER_OPTIONS, QR_CODE_SHAPE_OPTIONS } from '#achievement/config/constants.ts';
import { useCertificateStore } from '#achievement/stores/certificate';
import { UiButton, UiFormGroup, UiInput, UiSwitch } from '@mydigilearn-saas/web-ui';

const props = defineProps<{
  contentItem: QRCodeContentForm;
  index: number;
  isExpanded?: boolean;
}>();

const emit = defineEmits<{
  'delete': [index: number];
  'update:contentItem': [value: QRCodeContentForm];
  'headerClick': [];
}>();

const certificateStore = useCertificateStore();
const canvas = useCertificateCanvas();

const isCollapsed = computed(() => !props.isExpanded);

const updateMetadata = (updates: Partial<QRCodeContentForm['metadata']>) => {
  const updatedItem: QRCodeContentForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      ...updates,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateSize = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;

  updateMetadata({ width: numValue, height: numValue });
};

const updateVertical = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  updateMetadata({ vertical: numValue });
};

const updateHorizontal = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  updateMetadata({ horizontal: numValue });
};

const updateBackgroundTransparent = (value: boolean) => {
  updateMetadata({ background_transparent: value });
};

const updateBackgroundColor = (value: string) => {
  updateMetadata({ background_color: value });
};

const updateShape = (value: QRCodeShape) => {
  updateMetadata({ shape: value });
};

const updateShapeColor = (value: string) => {
  updateMetadata({ shape_color: value });
};

const updateBorderStyle = (value: QRCodeBorderStyle) => {
  updateMetadata({ border_style: value });
};

const updateBorderColor = (value: string) => {
  updateMetadata({ border_color: value });
};

const handleDelete = () => {
  emit('delete', props.index);
};

const currentHorizontalAlign = computed(() => {
  const horizontal = props.contentItem.metadata.horizontal;
  const width = props.contentItem.metadata.width;
  const elementWidth = typeof width === 'number' ? width : 100;

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
  const elementHeight = typeof height === 'number' ? height : 100;

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

const handleAlignContent = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
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
