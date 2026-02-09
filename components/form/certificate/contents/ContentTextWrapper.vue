<template>
  <div class="bg-white border border-solid border-gray-50 shadow-sm rounded-xl p-4 w-full">
    <ContentItemHeader
      :icon="contentConfig.icon"
      :title="contentConfig.title"
      :is-collapsed="isCollapsed"
      @delete="emit('delete', index)"
      @toggle-collapse="emit('headerClick')"
    />

    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'max-h-0' : 'max-h-[1000px]'"
    >
      <div class="space-y-4 pt-2">
        <slot name="before-fields" />

        <DimensionControl
          :width="metadata.width"
          :height="metadata.height"
          :is-aspect-ratio-locked="isAspectRatioLocked"
          :aspect-ratio-tooltip="aspectRatioTooltip"
          :aspect-ratio-disabled="!canLockAspectRatio"
          :enable-size-mode="true"
          :width-mode="widthMode"
          :height-mode="heightMode"
          :size-mode-options="sizeModeOptions"
          :selected-width-mode-object="selectedWidthModeObject"
          :selected-height-mode-object="selectedHeightModeObject"
          @update:width="emit('update:width', $event)"
          @update:height="emit('update:height', $event)"
          @update:width-mode="emit('update:widthMode', $event)"
          @update:height-mode="emit('update:heightMode', $event)"
          @toggle-aspect-ratio="emit('toggleAspectRatio')"
        />

        <UiFormGroup label="Font Family">
          <UiSelect
            :model-value="selectedFontObject"
            size="md"
            class="font-family-select"
            :options="fontOptions"
            :select-props="{
              useTeleport: true,
              trackBy: 'value',
              label: 'label',
            }"
            @update:model-value="emit('update:fontFamily', $event)"
          >
            <template #select-option="{ option }">
              <span :style="{ fontFamily: option.value }">
                {{ option.label }}
              </span>
            </template>
            <template #select-singleLabel="{ option }">
              <span :style="{ fontFamily: option.value }">
                {{ option.label }}
              </span>
            </template>
          </UiSelect>
        </UiFormGroup>

        <div class="flex items-center gap-4">
          <UiFormGroup
            class="flex-1"
            label="Font Size"
          >
            <UiInput
              type="number"
              :model-value="metadata.font_size"
              size="md"
              class="w-24"
              @update:model-value="emit('update:fontSize', $event)"
            >
              <template #suffix>
                <span class="text-xs text-gray-500">
                  px
                </span>
              </template>
            </UiInput>
          </UiFormGroup>

          <UiFormGroup
            class="flex-1"
            label="Font Weight"
          >
            <UiSelect
              :model-value="selectedFontWeightObject"
              size="md"
              :options="fontWeightOptions"
              :select-props="{
                useTeleport: true,
                trackBy: 'value',
                label: 'label',
              }"
              @update:model-value="emit('update:fontWeight', $event)"
            />
          </UiFormGroup>
        </div>

        <div class="flex items-center gap-4">
          <UiFormGroup
            class="flex-1"
            label="Color"
          >
            <ColorPickerInput
              :model-value="metadata.color"
              @update:model-value="emit('update:color', $event)"
            />
          </UiFormGroup>
          <UiFormGroup
            class="flex-1"
            label="Alignment"
          >
            <UiSelect
              :model-value="metadata.alignment"
              size="md"
              :options="alignmentOptions"
              :select-props="{
                useTeleport: true,
              }"
              @update:model-value="emit('update:alignment', $event)"
            />
          </UiFormGroup>
        </div>

        <PositionAlignmentControl
          :horizontal="metadata.horizontal"
          :vertical="metadata.vertical"
          :current-horizontal-align="currentHorizontalAlign"
          :current-vertical-align="currentVerticalAlign"
          :horizontal-disabled="isHorizontalAlignDisabled"
          :vertical-disabled="isVerticalAlignDisabled"
          :center-right-disabled="isCenterRightDisabled"
          :middle-bottom-disabled="isMiddleBottomDisabled"
          :horizontal-input-disabled="widthMode === 'fill'"
          :vertical-input-disabled="heightMode === 'fill'"
          :disabled-tooltip="`Disabled in ${widthMode} mode`"
          @align="handleAlignContent"
          @update:horizontal="emit('update:horizontal', $event)"
          @update:vertical="emit('update:vertical', $event)"
        />

        <slot name="after-fields" />
      </div>
    </div>
  </div>

  <slot name="modals" />
</template>

<script setup lang="ts">
import type { ContentTypeConfig, SizeMode, TextContentMetadata } from '#achievement/config/types';
import ColorPickerInput from '#achievement/components/form/certificate/shared/ColorPickerInput.vue';
import ContentItemHeader from '#achievement/components/form/certificate/shared/ContentItemHeader.vue';
import DimensionControl from '#achievement/components/form/certificate/shared/DimensionControl.vue';
import PositionAlignmentControl from '#achievement/components/form/certificate/shared/PositionAlignmentControl.vue';
import { useCertificateCanvas } from '#achievement/composables/useCertificateCanvas';
import { ALIGNMENT_OPTIONS, CANVAS_HEIGHT, CANVAS_WIDTH, FONT_OPTIONS, SIZE_MODE_OPTIONS } from '#achievement/config/constants';
import { useCertificateStore } from '#achievement/stores/certificate';
import { UiFormGroup, UiInput, UiSelect } from '@mydigilearn-saas/web-ui';

interface FontOption {
  label: string;
  value: string;
}

interface FontWeightOption {
  label: string;
  value: number;
}

interface SizeModeOption {
  label: string;
  value: SizeMode;
}

interface Props {
  index: number;
  isCollapsed: boolean;
  contentConfig: ContentTypeConfig;
  metadata: TextContentMetadata;
  selectedFontObject: FontOption;
  selectedFontWeightObject: FontWeightOption;
  fontWeightOptions: FontWeightOption[];
  isAspectRatioLocked: boolean;
  canLockAspectRatio?: boolean;
  widthMode?: SizeMode;
  heightMode?: SizeMode;
  selectedWidthModeObject?: SizeModeOption;
  selectedHeightModeObject?: SizeModeOption;
  elementId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  canLockAspectRatio: true,
  widthMode: 'fix',
  heightMode: 'fix',
  selectedWidthModeObject: () => ({ label: 'Fix', value: 'fix' as SizeMode }),
  selectedHeightModeObject: () => ({ label: 'Fix', value: 'fix' as SizeMode }),
});

const emit = defineEmits<{
  'headerClick': [];
  'delete': [index: number];
  'update:fontFamily': [value: any];
  'update:fontSize': [value: string | number];
  'update:fontWeight': [value: any];
  'update:color': [value: string | number];
  'update:alignment': [value: any];
  'update:width': [value: string | number];
  'update:height': [value: string | number];
  'update:horizontal': [value: string | number];
  'update:vertical': [value: string | number];
  'update:widthMode': [value: SizeModeOption];
  'update:heightMode': [value: SizeModeOption];
  'toggleAspectRatio': [];
}>();

const fontOptions = FONT_OPTIONS;
const alignmentOptions = ALIGNMENT_OPTIONS;
const sizeModeOptions = SIZE_MODE_OPTIONS as SizeModeOption[];

const certificateStore = useCertificateStore();
const canvas = useCertificateCanvas();

const aspectRatioTooltip = computed(() => {
  if (!props.canLockAspectRatio) {
    return 'Aspect ratio lock is only available when both Width and Height are set to "Fix"';
  }
  return props.isAspectRatioLocked ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio';
});

const currentHorizontalAlign = computed(() => {
  const horizontal = props.metadata.horizontal;
  const width = props.metadata.width;
  const elementWidth = width === 'fit-content' || typeof width !== 'number' ? 200 : width;

  const safeZoneLeft = certificateStore.safe_zone?.left || 0;
  const safeZoneRight = certificateStore.safe_zone?.right || 0;
  const safeZoneWidth = CANVAS_WIDTH - safeZoneLeft - safeZoneRight;

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
  const vertical = props.metadata.vertical;
  const height = props.metadata.height;
  const elementHeight = height === 'fit-content' || typeof height !== 'number' ? 200 : height;

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

const isHorizontalAlignDisabled = computed(() => {
  return props.widthMode === 'fill';
});

const isVerticalAlignDisabled = computed(() => {
  return props.heightMode === 'fill';
});

const isCenterRightDisabled = computed(() => {
  return props.widthMode === 'fill' || props.metadata.width === 'fit-content';
});

const isMiddleBottomDisabled = computed(() => {
  return props.heightMode === 'fill' || props.metadata.height === 'fit-content';
});

const handleAlignContent = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
  if (props.elementId) {
    canvas.alignContent(props.elementId, type, certificateStore.safe_zone);
  }
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
