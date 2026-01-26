<template>
  <div class="mb-4 flex-shrink-0 px-5">
    <div
      class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-4 cursor-pointer"
      @click="isCollapsed = !isCollapsed"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICertificateSafeZone } from '#achievement/config/types.ts';
import UiInput from '#ui/components/atoms/input/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';

interface Props {
  safeZone: ICertificateSafeZone;
  hasUploadedImage: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:safeZone': [zone: ICertificateSafeZone];
}>();

const isCollapsed = ref<boolean>(false);

const handleSafeZoneChange = (key: keyof ICertificateSafeZone, value: number | string) => {
  const numValue = typeof value === 'string' ? Number.parseInt(value, 10) || 0 : value;
  emit('update:safeZone', {
    ...props.safeZone,
    [key]: numValue,
  });
};
</script>
