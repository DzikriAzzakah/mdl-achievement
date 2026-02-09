<template>
  <div class="flex items-center gap-2">
    <UiFormGroup
      label="Width"
      class="flex-1 min-w-0"
    >
      <div
        v-if="enableSizeMode"
        class="size-mode-field"
      >
        <template v-if="widthMode === 'fix'">
          <UiInput
            type="number"
            :model-value="width"
            :disabled="disabled"
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
            :disabled="disabled"
            :select-props="{
              useTeleport: true,
              trackBy: 'value',
              label: 'label',
            }"
            @update:model-value="handleWidthModeFromSelect"
          />
        </template>
      </div>

      <UiInput
        v-else
        type="number"
        :model-value="width"
        :disabled="disabled"
        size="md"
        @update:model-value="emit('update:width', $event)"
      >
        <template #suffix>
          <span class="text-xs text-gray-500">px</span>
        </template>
      </UiInput>
    </UiFormGroup>

    <UiFormGroup
      label="Height"
      class="flex-1 min-w-0"
    >
      <div
        v-if="enableSizeMode"
        class="size-mode-field"
      >
        <template v-if="heightMode === 'fix'">
          <UiInput
            type="number"
            :model-value="height"
            :disabled="disabled"
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
            :disabled="disabled"
            :select-props="{
              useTeleport: true,
              trackBy: 'value',
              label: 'label',
            }"
            @update:model-value="handleHeightModeFromSelect"
          />
        </template>
      </div>

      <UiInput
        v-else
        type="number"
        :model-value="height"
        :disabled="disabled"
        size="md"
        @update:model-value="emit('update:height', $event)"
      >
        <template #suffix>
          <span class="text-xs text-gray-500">px</span>
        </template>
      </UiInput>
    </UiFormGroup>

    <UiFormGroup
      v-if="showAspectRatioLock"
      class="mt-5 flex-shrink-0"
    >
      <UiButton
        v-tooltip="aspectRatioTooltip"
        square
        size="md"
        variant="soft"
        icon="mdi:aspect-ratio"
        :color="isAspectRatioLocked ? 'primary' : 'ghost'"
        :disabled="disabled || aspectRatioDisabled"
        @click="emit('toggleAspectRatio')"
      />
    </UiFormGroup>
  </div>
</template>

<script setup lang="ts">
import type { SizeMode } from '#achievement/config/types';
import { UiButton, UiFormGroup, UiInput, UiSelect } from '@mydigilearn-saas/web-ui';
import { Dropdown } from 'floating-vue';

interface SizeModeOption {
  label: string;
  value: SizeMode;
}

interface Props {
  width: number | string;
  height: number | string;
  isAspectRatioLocked?: boolean;
  showAspectRatioLock?: boolean;
  disabled?: boolean;
  aspectRatioTooltip?: string;
  aspectRatioDisabled?: boolean;
  // Size mode props
  enableSizeMode?: boolean;
  widthMode?: SizeMode;
  heightMode?: SizeMode;
  sizeModeOptions?: SizeModeOption[];
  selectedWidthModeObject?: SizeModeOption;
  selectedHeightModeObject?: SizeModeOption;
}

withDefaults(defineProps<Props>(), {
  isAspectRatioLocked: false,
  showAspectRatioLock: true,
  disabled: false,
  aspectRatioTooltip: 'Lock/Unlock Aspect Ratio',
  aspectRatioDisabled: false,
  enableSizeMode: false,
  widthMode: 'fix',
  heightMode: 'fix',
  sizeModeOptions: () => [],
});

const emit = defineEmits<{
  'update:width': [value: string | number];
  'update:height': [value: string | number];
  'toggleAspectRatio': [];
  'update:widthMode': [value: SizeModeOption];
  'update:heightMode': [value: SizeModeOption];
}>();

const widthDropdownRef = ref<InstanceType<typeof Dropdown> | null>(null);
const heightDropdownRef = ref<InstanceType<typeof Dropdown> | null>(null);

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
