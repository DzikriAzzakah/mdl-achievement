<template>
  <UiFormGroup label="Position">
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <UiButton
          v-tooltip="horizontalDisabled ? disabledTooltip : 'Align Left'"
          size="sm"
          square
          :disabled="horizontalDisabled"
          :variant="currentHorizontalAlign === 'left' ? 'solid' : 'soft'"
          :color="currentHorizontalAlign === 'left' ? 'primary' : 'ghost'"
          icon="fe:align-left"
          @click="emit('align', 'left')"
        >
          L
        </UiButton>
        <UiButton
          v-tooltip="centerRightDisabled ? disabledTooltip : 'Align Center'"
          size="sm"
          square
          :disabled="centerRightDisabled"
          :variant="currentHorizontalAlign === 'center' ? 'solid' : 'soft'"
          :color="currentHorizontalAlign === 'center' ? 'primary' : 'ghost'"
          icon="fe:align-center"
          @click="emit('align', 'center')"
        >
          C
        </UiButton>
        <UiButton
          v-tooltip="centerRightDisabled ? disabledTooltip : 'Align Right'"
          size="sm"
          square
          :disabled="centerRightDisabled"
          :variant="currentHorizontalAlign === 'right' ? 'solid' : 'soft'"
          :color="currentHorizontalAlign === 'right' ? 'primary' : 'ghost'"
          icon="fe:align-right"
          @click="emit('align', 'right')"
        >
          R
        </UiButton>
      </div>
      <div class="flex items-center justify-between gap-2">
        <UiButton
          v-tooltip="verticalDisabled ? disabledTooltip : 'Align Top'"
          size="sm"
          square
          :disabled="verticalDisabled"
          :variant="currentVerticalAlign === 'top' ? 'solid' : 'soft'"
          :color="currentVerticalAlign === 'top' ? 'primary' : 'ghost'"
          icon="fe:align-top"
          @click="emit('align', 'top')"
        >
          T
        </UiButton>
        <UiButton
          v-tooltip="middleBottomDisabled ? disabledTooltip : 'Align Middle'"
          size="sm"
          square
          :disabled="middleBottomDisabled"
          :variant="currentVerticalAlign === 'middle' ? 'solid' : 'soft'"
          :color="currentVerticalAlign === 'middle' ? 'primary' : 'ghost'"
          icon="fe:align-vertically"
          @click="emit('align', 'middle')"
        >
          M
        </UiButton>
        <UiButton
          v-tooltip="middleBottomDisabled ? disabledTooltip : 'Align Bottom'"
          size="sm"
          square
          :disabled="middleBottomDisabled"
          :variant="currentVerticalAlign === 'bottom' ? 'solid' : 'soft'"
          :color="currentVerticalAlign === 'bottom' ? 'primary' : 'ghost'"
          icon="fe:align-bottom"
          @click="emit('align', 'bottom')"
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
          :model-value="horizontal"
          :disabled="horizontalInputDisabled"
          size="md"
          @update:model-value="emit('update:horizontal', $event)"
        >
          <template #suffix>
            <span class="text-xs text-gray-500">px</span>
          </template>
        </UiInput>
      </UiFormGroup>

      <UiFormGroup
        label="Vertical"
        class="flex-1 min-w-0"
      >
        <UiInput
          type="number"
          :model-value="vertical"
          :disabled="verticalInputDisabled"
          size="md"
          @update:model-value="emit('update:vertical', $event)"
        >
          <template #suffix>
            <span class="text-xs text-gray-500">px</span>
          </template>
        </UiInput>
      </UiFormGroup>
    </div>
  </UiFormGroup>
</template>

<script setup lang="ts">
import { UiButton, UiFormGroup, UiInput } from '@mydigilearn-saas/web-ui';

interface Props {
  horizontal: number;
  vertical: number;
  currentHorizontalAlign?: string | null;
  currentVerticalAlign?: string | null;
  horizontalDisabled?: boolean;
  verticalDisabled?: boolean;
  centerRightDisabled?: boolean;
  middleBottomDisabled?: boolean;
  horizontalInputDisabled?: boolean;
  verticalInputDisabled?: boolean;
  disabledTooltip?: string;
}

withDefaults(defineProps<Props>(), {
  currentHorizontalAlign: null,
  currentVerticalAlign: null,
  horizontalDisabled: false,
  verticalDisabled: false,
  centerRightDisabled: false,
  middleBottomDisabled: false,
  horizontalInputDisabled: false,
  verticalInputDisabled: false,
  disabledTooltip: 'Disabled',
});

const emit = defineEmits<{
  'align': [type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'];
  'update:horizontal': [value: string | number];
  'update:vertical': [value: string | number];
}>();
</script>
