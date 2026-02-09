<template>
  <div class="mb-4 flex-shrink-0 px-5">
    <div
      class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-4 cursor-pointer"
      @click="emit('toggle')"
    >
      <h2 class="text-base font-semibold">
        Layout Guidelines
      </h2>
      <Icon
        name="mdi:chevron-down"
        class="transition-transform duration-300"
        :class="{ 'rotate-180': isCollapsed }"
      />
    </div>

    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'max-h-0' : ''"
    >
      <div class="flex flex-col gap-4 w-full my-4">
        <UiFormGroup
          v-if="hasUploadedImage"
          label="Safe Zone Margins"
          class="flex flex-col gap-3 w-full"
        >
          <div class="flex items-center gap-2 my-2">
            <UiSwitch
              :model-value="showSafeZone"
              size="md"
              @update:model-value="(val) => emit('update:showSafeZone', val)"
            />
            <span class="text-sm text-gray-700">Show Safe Zone</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <UiInput
              :model-value="safeZone.top"
              type="number"
              size="md"
              placeholder="Top"
              @update:model-value="(val) => handleSafeZoneChange('top', val)"
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
              @update:model-value="(val) => handleSafeZoneChange('right', val)"
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
              @update:model-value="(val) => handleSafeZoneChange('bottom', val)"
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
              @update:model-value="(val) => handleSafeZoneChange('left', val)"
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
        <UiFormGroup
          label="Layout Guides"
          class="flex flex-col gap-3 w-full"
        >
          <div class="flex items-center gap-2 my-2">
            <UiSwitch
              :model-value="guideline.enabled"
              size="md"
              @update:model-value="(val) => handleGuidelineChange('enabled', val)"
            />
            <span class="text-sm text-gray-700">Enable Guidelines</span>
          </div>

          <template v-if="guideline.enabled">
            <UiSelect
              :model-value="selectedGuidelineType"
              :options="GUIDELINE_TYPE_OPTIONS"
              placeholder="Select Type"
              size="md"
              :select-props="{
                trackBy: 'value',
                label: 'label',
              }"
              @update:model-value="handleGuidelineTypeChange"
            />

            <UiInput
              :model-value="guideline.count"
              type="number"
              size="md"
              placeholder="Count"
              :min="1"
              :max="50"
              @update:model-value="(val) => handleGuidelineChange('count', val)"
            >
              <template #prefix>
                <Icon
                  name="mdi:grid"
                  class="text-gray-500"
                />
              </template>
            </UiInput>

            <UiInput
              :model-value="guideline.gutter"
              type="number"
              size="md"
              placeholder="Gutter (px)"
              :min="0"
              :max="100"
              @update:model-value="(val) => handleGuidelineChange('gutter', val)"
            >
              <template #prefix>
                <Icon
                  name="mdi:arrow-expand-horizontal"
                  class="text-gray-500"
                />
              </template>
            </UiInput>

            <div class="flex items-center gap-2">
              <UiInput
                type="text"
                :model-value="guideline.color?.replace('#', '') || '000000'"
                size="md"
                @update:model-value="(val) => handleGuidelineChange('color', `#${val}`)"
              >
                <template #prefix>
                  <span class="text-gray-500">#</span>
                </template>
                <template #suffix>
                  <input
                    ref="colorPickerInput"
                    type="color"
                    :value="guideline.color || '#000000'"
                    class="invisible absolute"
                    @input="handleColorPickerChange"
                  >
                  <div
                    class="w-6 h-6 rounded-md border border-gray-200 cursor-pointer flex-shrink-0"
                    :style="{ backgroundColor: guideline.color || '#000000' }"
                    @click="openColorPicker"
                  />
                </template>
              </UiInput>
            </div>
          </template>
        </UiFormGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LayoutGuideline, SafeZone } from '#achievement/config/types.ts';
import {
  UiFormGroup,
  UiInput,
  UiSelect,
  UiSwitch,
} from '@mydigilearn-saas/web-ui';

interface Props {
  safeZone: SafeZone;
  hasUploadedImage: boolean;
  guideline: LayoutGuideline;
  isCollapsed: boolean;
  showSafeZone: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:safeZone': [zone: SafeZone];
  'update:guideline': [guideline: LayoutGuideline];
  'update:showSafeZone': [value: boolean];
  'toggle': [];
}>();

const GUIDELINE_TYPE_OPTIONS = [
  { label: 'Grid', value: 'grid' },
  { label: 'Columns', value: 'column' },
  { label: 'Rows', value: 'row' },
];

const selectedGuidelineType = computed(() => {
  return GUIDELINE_TYPE_OPTIONS.find(opt => opt.value === props.guideline.type) || GUIDELINE_TYPE_OPTIONS[0];
});

const colorPickerInput = ref<HTMLInputElement | null>(null);

const handleSafeZoneChange = (key: keyof SafeZone, value: number | string) => {
  const numValue = typeof value === 'string' ? Number.parseInt(value, 10) || 0 : value;
  emit('update:safeZone', {
    ...props.safeZone,
    [key]: numValue,
  });
};

const handleGuidelineChange = (key: keyof LayoutGuideline, value: any) => {
  let processedValue = value;

  if (key === 'count' || key === 'gutter') {
    processedValue = typeof value === 'string' ? Number.parseInt(value, 10) || 0 : value;
    // Ensure count is at least 1 and gutter is at least 0
    if (key === 'count') {
      processedValue = Math.max(1, Math.min(50, processedValue));
    }
    else if (key === 'gutter') {
      processedValue = Math.max(0, Math.min(100, processedValue));
    }
  }

  emit('update:guideline', {
    ...props.guideline,
    [key]: processedValue,
  });
};

const handleGuidelineTypeChange = (val: any) => {
  const newType = typeof val === 'object' && val?.value ? val.value : val;
  handleGuidelineChange('type', newType);
};

const openColorPicker = () => {
  colorPickerInput.value?.click();
};

const handleColorPickerChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const color = input.value;
  handleGuidelineChange('color', color);
};
</script>
