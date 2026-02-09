<template>
  <UiInput
    type="text"
    :model-value="modelValue"
    :size="size"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #prefix>
      <span class="text-gray-500">#</span>
    </template>
    <template #suffix>
      <input
        ref="colorPickerInput"
        type="color"
        :value="`#${modelValue}`"
        class="invisible absolute"
        @input="handleColorChange"
      >
      <div
        class="w-6 h-6 rounded-md border border-gray-200 cursor-pointer flex-shrink-0"
        :style="{ backgroundColor: `#${modelValue}` }"
        @click="openColorPicker"
      />
    </template>
  </UiInput>
</template>

<script setup lang="ts">
import { UiInput } from '@mydigilearn-saas/web-ui';

interface Props {
  modelValue: string;
  size?: 'sm' | 'md' | 'lg';
}

withDefaults(defineProps<Props>(), {
  size: 'md',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const colorPickerInput = ref<HTMLInputElement | null>(null);

const openColorPicker = () => {
  colorPickerInput.value?.click();
};

const handleColorChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const color = input.value.replace('#', '');
  emit('update:modelValue', color);
};
</script>
