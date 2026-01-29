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
          {{ contentConfig.title }} {{ index + 1 }}
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
            class="flex-1"
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
            class="flex-1"
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

          <UiFormGroup class="mt-5">
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
          <div class="flex items-center gap-4">
            <UiInput
              type="number"
              :model-value="metadata.horizontal"
              :disabled="widthMode === 'fill'"
              placeholder="X"
              size="md"
              @update:model-value="emit('update:horizontal', $event)"
            >
              <template #suffix>
                <span class="text-xs text-gray-500">
                  X
                </span>
              </template>
            </UiInput>
            <UiInput
              type="number"
              :model-value="metadata.vertical"
              :disabled="heightMode === 'fill'"
              placeholder="Y"
              size="md"
              @update:model-value="emit('update:vertical', $event)"
            >
              <template #suffix>
                <span class="text-xs text-gray-500">
                  Y
                </span>
              </template>
            </UiInput>
          </div>
        </UiFormGroup>

        <slot name="after-fields" />
      </div>
    </div>
  </div>

  <slot name="modals" />
</template>

<script setup lang="ts">
import type { ICertificateContentTextMetadata, IContentTypeConfig, SizeMode } from '#achievement/config/types';
import { ALIGNMENT_OPTIONS, FONT_OPTIONS, SIZE_MODE_OPTIONS } from '#achievement/config/constants';
import UiButton from '#ui/components/atoms/button/index.vue';
import UiInput from '#ui/components/atoms/input/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';
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
  contentConfig: IContentTypeConfig;
  metadata: ICertificateContentTextMetadata;
  selectedFontObject: FontOption;
  selectedFontWeightObject: FontWeightOption;
  fontWeightOptions: FontWeightOption[];
  isAspectRatioLocked: boolean;
  canLockAspectRatio?: boolean;
  widthMode?: SizeMode;
  heightMode?: SizeMode;
  selectedWidthModeObject?: SizeModeOption;
  selectedHeightModeObject?: SizeModeOption;
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
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}

.size-mode-field {
  @apply w-full;
}

.size-mode-trigger {
  @apply flex items-center justify-center p-1 hover:bg-gray-100 rounded cursor-pointer text-gray-500;
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
