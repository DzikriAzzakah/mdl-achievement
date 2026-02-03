<template>
  <div class="bg-white border border-solid border-gray-50 shadow-sm rounded-xl p-4 w-full">
    <div
      class="flex justify-between items-center w-full"
      :class="{ 'border-b-2 border-gray-50 pb-4': !isCollapsed }"
    >
      <div class="flex items-center gap-2">
        <Icon
          :name="contentConfig.icon"
          class="text-gray-500 w-5 h-5"
        />
        <p class="text-sm font-medium">
          {{ contentConfig.title }}
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
            icon="mdi:dots-horizontal"
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
                @click="emit('delete', index)"
              >
                Delete
              </UiButton>
            </div>
          </template>
        </Dropdown>
        <Icon
          name="mdi:chevron-down"
          class="transition-transform duration-300 cursor-pointer"
          :class="{ 'rotate-180': isCollapsed }"
          @click="emit('headerClick')"
        />
      </div>
    </div>

    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'max-h-0' : 'max-h-[1000px]'"
    >
      <div class="space-y-4 pt-2">
        <slot name="before-fields" />

        <div class="flex items-center gap-2">
          <UiFormGroup
            label="Width"
            class="flex-1 min-w-0"
          >
            <div class="size-mode-field">
              <template v-if="widthMode === 'fix'">
                <UiInput
                  type="number"
                  :model-value="metadata.width"
                  size="md"
                  @update:model-value="emit('update:width', $event)"
                >
                  <template #suffix>
                    <Dropdown
                      ref="widthDropdownRef"
                      placement="bottom-end"
                      :triggers="['click']"
                    >
                      <button
                        type="button"
                        class="size-mode-trigger"
                        @click.stop
                      >
                        <span class="text-xs mr-1 text-gray-500">
                          {{ widthMode.charAt(0).toUpperCase() + widthMode.slice(1) }}
                        </span>
                        <Icon
                          name="mdi:chevron-down"
                          width="16"
                          height="16"
                        />
                      </button>
                      <template #popper>
                        <div class="size-mode-options">
                          <button
                            v-for="option in sizeModeOptions"
                            :key="option.value"
                            type="button"
                            class="size-mode-option"
                            :class="{ 'size-mode-option--active': option.value === widthMode }"
                            @click="handleWidthModeSelect(option)"
                          >
                            {{ option.label }}
                          </button>
                        </div>
                      </template>
                    </Dropdown>
                  </template>
                </UiInput>
              </template>

              <template v-else>
                <UiSelect
                  :model-value="selectedWidthModeObject"
                  size="md"
                  :options="sizeModeOptions"
                  :select-props="{
                    useTeleport: true,
                    trackBy: 'value',
                    label: 'label',
                  }"
                  @update:model-value="handleWidthModeFromSelect"
                />
              </template>
            </div>
          </UiFormGroup>

          <UiFormGroup
            label="Height"
            class="flex-1 min-w-0"
          >
            <div class="size-mode-field">
              <template v-if="heightMode === 'fix'">
                <UiInput
                  type="number"
                  :model-value="metadata.height"
                  size="md"
                  @update:model-value="emit('update:height', $event)"
                >
                  <template #suffix>
                    <Dropdown
                      ref="heightDropdownRef"
                      placement="bottom-end"
                      :triggers="['click']"
                    >
                      <button
                        type="button"
                        class="size-mode-trigger"
                        @click.stop
                      >
                        <span class="text-xs mr-1 text-gray-500">
                          {{ heightMode.charAt(0).toUpperCase() + heightMode.slice(1) }}
                        </span>
                        <Icon
                          name="mdi:chevron-down"
                          width="16"
                          height="16"
                        />
                      </button>
                      <template #popper>
                        <div class="size-mode-options">
                          <button
                            v-for="option in sizeModeOptions"
                            :key="option.value"
                            type="button"
                            class="size-mode-option"
                            :class="{ 'size-mode-option--active': option.value === heightMode }"
                            @click="handleHeightModeSelect(option)"
                          >
                            {{ option.label }}
                          </button>
                        </div>
                      </template>
                    </Dropdown>
                  </template>
                </UiInput>
              </template>

              <template v-else>
                <UiSelect
                  :model-value="selectedHeightModeObject"
                  size="md"
                  :options="sizeModeOptions"
                  :select-props="{
                    useTeleport: true,
                    trackBy: 'value',
                    label: 'label',
                  }"
                  @update:model-value="handleHeightModeFromSelect"
                />
              </template>
            </div>
          </UiFormGroup>

          <UiFormGroup class="mt-5 flex-shrink-0">
            <UiButton
              v-tooltip="aspectRatioTooltip"
              square
              size="md"
              variant="soft"
              icon="mdi:aspect-ratio"
              :color="isAspectRatioLocked ? 'primary' : 'ghost'"
              :disabled="!canLockAspectRatio"
              @click="emit('toggleAspectRatio')"
            />
          </UiFormGroup>
        </div>

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
            <UiInput
              type="text"
              :model-value="metadata.color"
              size="md"
              class="w-16 h-10 p-0 border-0"
              @update:model-value="emit('update:color', $event)"
            >
              <template #prefix>
                <span class="text-gray-500">
                  #
                </span>
              </template>
              <template #suffix>
                <input
                  ref="colorPickerInput"
                  type="color"
                  :value="`#${metadata.color}`"
                  class="invisible absolute"
                  @input="handleColorChange"
                >
                <div
                  class="w-6 h-6 rounded-md border border-gray-200 cursor-pointer"
                  :style="{ backgroundColor: `#${metadata.color}` || '#000000' }"
                  @click="openColorPicker"
                />
              </template>
            </UiInput>
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
        <UiFormGroup label="Position">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <UiButton
                v-tooltip="isHorizontalAlignDisabled ? `Disabled in ${widthMode} mode` : 'Align Left'"
                size="sm"
                square
                :disabled="isHorizontalAlignDisabled"
                :variant="currentHorizontalAlign === 'left' ? 'solid' : 'soft'"
                :color="currentHorizontalAlign === 'left' ? 'primary' : 'ghost'"
                icon="fe:align-left"
                @click="handleAlignContent('left')"
              >
                L
              </UiButton>
              <UiButton
                v-tooltip="isCenterRightDisabled ? `Disabled in ${widthMode} mode` : 'Align Center'"
                size="sm"
                square
                :disabled="isCenterRightDisabled"
                :variant="currentHorizontalAlign === 'center' ? 'solid' : 'soft'"
                :color="currentHorizontalAlign === 'center' ? 'primary' : 'ghost'"
                icon="fe:align-center"
                @click="handleAlignContent('center')"
              >
                C
              </UiButton>
              <UiButton
                v-tooltip="isCenterRightDisabled ? `Disabled in ${widthMode} mode` : 'Align Right'"
                size="sm"
                square
                :disabled="isCenterRightDisabled"
                :variant="currentHorizontalAlign === 'right' ? 'solid' : 'soft'"
                :color="currentHorizontalAlign === 'right' ? 'primary' : 'ghost'"
                icon="fe:align-right"
                @click="handleAlignContent('right')"
              >
                R
              </UiButton>
            </div>
            <div class="flex items-center justify-between gap-2">
              <UiButton
                v-tooltip="isVerticalAlignDisabled ? `Disabled in ${heightMode} mode` : 'Align Top'"
                size="sm"
                square
                :disabled="isVerticalAlignDisabled"
                :variant="currentVerticalAlign === 'top' ? 'solid' : 'soft'"
                :color="currentVerticalAlign === 'top' ? 'primary' : 'ghost'"
                icon="fe:align-top"
                @click="handleAlignContent('top')"
              >
                T
              </UiButton>
              <UiButton
                v-tooltip="isMiddleBottomDisabled ? `Disabled in ${heightMode} mode` : 'Align Middle'"
                size="sm"
                square
                :disabled="isMiddleBottomDisabled"
                :variant="currentVerticalAlign === 'middle' ? 'solid' : 'soft'"
                :color="currentVerticalAlign === 'middle' ? 'primary' : 'ghost'"
                icon="fe:align-vertically"
                @click="handleAlignContent('middle')"
              >
                M
              </UiButton>
              <UiButton
                v-tooltip="isMiddleBottomDisabled ? `Disabled in ${heightMode} mode` : 'Align Bottom'"
                size="sm"
                square
                :disabled="isMiddleBottomDisabled"
                :variant="currentVerticalAlign === 'bottom' ? 'solid' : 'soft'"
                :color="currentVerticalAlign === 'bottom' ? 'primary' : 'ghost'"
                icon="fe:align-bottom"
                @click="handleAlignContent('bottom')"
              >
                B
              </UiButton>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <UiFormGroup
              label="Horizontal"
              class="flex-1 min-w-0"
            >
              <UiInput
                type="number"
                :model-value="metadata.horizontal"
                :disabled="widthMode === 'fill'"
                size="md"
                @update:model-value="emit('update:horizontal', $event)"
              >
                <template #suffix>
                  <span class="text-xs text-gray-500">
                    px
                  </span>
                </template>
              </UiInput>
            </UiFormGroup>

            <UiFormGroup
              label="Vertical"
              class="flex-1 min-w-0"
            >
              <UiInput
                type="number"
                :model-value="metadata.vertical"
                :disabled="heightMode === 'fill'"
                size="md"
                @update:model-value="emit('update:vertical', $event)"
              >
                <template #suffix>
                  <span class="text-xs text-gray-500">
                    px
                  </span>
                </template>
              </UiInput>
            </UiFormGroup>
          </div>
        </UiFormGroup>
        <slot name="after-fields" />
      </div>
    </div>
  </div>

  <slot name="modals" />
</template>

<script setup lang="ts">
import type { ContentTypeConfig, SizeMode, TextContentMetadata } from '#achievement/config/types';
import { ALIGNMENT_OPTIONS, CANVAS_HEIGHT, CANVAS_WIDTH, FONT_OPTIONS, SIZE_MODE_OPTIONS } from '#achievement/config/constants';
import { useCertificateStore } from '#achievement/stores/certificate';
import { UiButton, UiFormGroup, UiInput, UiSelect } from '@mydigilearn-saas/web-ui';
import { Dropdown } from 'floating-vue';

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

const colorPickerInput = ref<HTMLInputElement | null>(null);
const widthDropdownRef = ref<InstanceType<typeof Dropdown> | null>(null);
const heightDropdownRef = ref<InstanceType<typeof Dropdown> | null>(null);

const certificateStore = useCertificateStore();

const aspectRatioTooltip = computed(() => {
  if (!props.canLockAspectRatio) {
    return 'Aspect ratio lock is only available when both Width and Height are set to "Fix"';
  }
  return props.isAspectRatioLocked ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio';
});

const openColorPicker = () => {
  colorPickerInput.value?.click();
};

const handleColorChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const color = input.value.replace('#', '');
  emit('update:color', color);
};

const handleWidthModeSelect = (option: SizeModeOption) => {
  emit('update:widthMode', option);
  widthDropdownRef.value?.hide?.();
};

const handleHeightModeSelect = (option: SizeModeOption) => {
  emit('update:heightMode', option);
  heightDropdownRef.value?.hide?.();
};

const handleWidthModeFromSelect = (value: any) => {
  if (value && typeof value === 'object' && 'value' in value) {
    emit('update:widthMode', value as SizeModeOption);
  }
};

const handleHeightModeFromSelect = (value: any) => {
  if (value && typeof value === 'object' && 'value' in value) {
    emit('update:heightMode', value as SizeModeOption);
  }
};

const currentHorizontalAlign = computed(() => {
  const horizontal = props.metadata.horizontal;
  const width = props.metadata.width;
  const elementWidth = width === 'fit-content' || typeof width !== 'number' ? 200 : width;

  // Calculate safe zone width
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

  // Calculate safe zone height
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
    certificateStore.alignContent(props.elementId, type);
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

.size-mode-field {
  @apply w-full;
  min-width: 0;
}

.size-mode-field :deep(.ui-input-wrapper) {
  @apply flex-nowrap;
}

.size-mode-trigger {
  @apply flex items-center justify-center p-1 hover:bg-gray-100 rounded cursor-pointer text-gray-500 flex-shrink-0 whitespace-nowrap;
  min-width: fit-content;
}

.size-mode-options {
  @apply flex flex-col bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden min-w-[100px];
}

.size-mode-option {
  @apply px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors;
}

.size-mode-option--active {
  @apply bg-primary-50 text-primary-600 font-medium;
}
</style>
