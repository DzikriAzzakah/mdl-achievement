<template>
  <ContentTextBase
    :model-value="contentItem.value"
    :metadata="contentItem.metadata"
    :index="index"
    :title="`Certificate Number ${index + 1}`"
    :fields="['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal']"
    :is-source="true"
    :is-expanded="isExpanded"
    @update:model-value="updateValue"
    @update:width="updateWidth"
    @update:height="updateHeight"
    @update:font-size="updateFontSize"
    @update:font-weight="updateFontWeight"
    @update:font-family="updateFontFamily"
    @update:alignment="updateAlignment"
    @update:color="updateColor"
    @update:vertical="updateVertical"
    @update:horizontal="updateHorizontal"
    @delete="$emit('delete', $event)"
    @header-click="$emit('headerClick')"
  >
    <template #custom-fields>
      <UiFormGroup label="Text">
        <UITextarea
          ref="textareaRef"
          :model-value="contentItem.value"
          size="md"
          @update:model-value="updateValue"
        />
      </UiFormGroup>

      <UiFormGroup label="Variables">
        <div class="flex flex-wrap gap-2">
          <UiBadge
            v-for="variable in variables"
            :key="variable.value"
            :color="selectedVariables.includes(variable.value) ? 'primary' : 'ghost'"
            class="cursor-pointer"
            @click="handleBadgeClick(variable.value)"
          >
            {{ variable.label }}
          </UiBadge>
        </div>
      </UiFormGroup>
    </template>
  </ContentTextBase>
</template>

<script setup lang="ts">
import type { ICertificateContentCertificateNumberForm } from '#achievement/config/types';
import UiBadge from '#ui/components/atoms/badge/index.vue';
import UITextarea from '#ui/components/atoms/textarea/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import ContentTextBase from './ContentTextBase.vue';

const props = defineProps<{
  contentItem: ICertificateContentCertificateNumberForm;
  index: number;
  isExpanded?: boolean;
}>();

const emit = defineEmits<{
  'delete': [index: number];
  'update:contentItem': [value: ICertificateContentCertificateNumberForm];
  'headerClick': [];
}>();

const textareaRef = ref<any>(null);

const variables = [
  { label: 'NIK', value: '{{NIK}}' },
  { label: 'Participant Name', value: '{{participant_name}}' },
  { label: 'Year', value: '{{year}}' },
  { label: 'Certificate Date', value: '{{certificate_date}}' },
  { label: 'Email', value: '{{email}}' },
  { label: 'Certificate Type', value: '{{certificate_type}}' },
  { label: 'Serial Number', value: '{{serial_number}}' },
];

const selectedVariables = computed(() => {
  const value = props.contentItem.value;
  return variables
    .filter(variable => value.includes(variable.value))
    .map(variable => variable.value);
});

const updateValue = (value: string | undefined) => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    value: value || '',
  };
  emit('update:contentItem', updatedItem);
};

const handleBadgeClick = (variableValue: string) => {
  const currentValue = props.contentItem.value;
  const isSelected = currentValue.includes(variableValue);

  if (isSelected) {
    // Remove all occurrences of the variable
    const newValue = currentValue.split(variableValue).join('');
    updateValue(newValue);
  }
  else {
    // Insert at cursor position
    const textarea = textareaRef.value?.$el?.querySelector('textarea');
    if (textarea) {
      const cursorPos = textarea.selectionStart || currentValue.length;
      const newValue
        = currentValue.slice(0, cursorPos)
          + variableValue
          + currentValue.slice(cursorPos);
      updateValue(newValue);

      // Set cursor position after the inserted variable
      nextTick(() => {
        const newCursorPos = cursorPos + variableValue.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      });
    }
    else {
      // Fallback: append to the end
      updateValue(currentValue + variableValue);
    }
  }
};

const updateWidth = (value: string | number) => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      width: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateHeight = (value: string | number) => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      height: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateFontSize = (value: string | number) => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      font_size: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateFontWeight = (value: number) => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      font_weight: value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateFontFamily = (value: string) => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      font_family: value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateAlignment = (value: 'left' | 'center' | 'right') => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      alignment: value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateColor = (value: string | number) => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      color: String(value) || '#000000',
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateVertical = (value: string | number) => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      vertical: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateHorizontal = (value: string | number) => {
  const updatedItem: ICertificateContentCertificateNumberForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      horizontal: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};
</script>
