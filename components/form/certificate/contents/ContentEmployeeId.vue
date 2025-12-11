<template>
  <ContentTextBase
    :model-value="contentItem.value"
    :metadata="contentItem.metadata"
    :index="index"
    :title="`Employee ID ${index + 1}`"
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
  />
</template>

<script setup lang="ts">
import type { ICertificateContentEmployeeIdForm } from '#achievement/config/types';
import ContentTextBase from './ContentTextBase.vue';

const props = defineProps<{
  contentItem: ICertificateContentEmployeeIdForm;
  index: number;
  isExpanded?: boolean;
}>();

const emit = defineEmits<{
  'delete': [index: number];
  'update:contentItem': [value: ICertificateContentEmployeeIdForm];
  'headerClick': [];
}>();

const updateValue = (value: string | undefined) => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    value: value || '{{ employee_id }}',
  };
  emit('update:contentItem', updatedItem);
};

const updateWidth = (value: string | number) => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      width: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateHeight = (value: string | number) => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      height: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateFontSize = (value: string | number) => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      font_size: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateFontWeight = (value: number) => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      font_weight: value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateFontFamily = (value: string) => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      font_family: value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateAlignment = (value: 'left' | 'center' | 'right') => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      alignment: value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateColor = (value: string | number) => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      color: String(value) || '#000000',
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateVertical = (value: string | number) => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      vertical: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateHorizontal = (value: string | number) => {
  const updatedItem: ICertificateContentEmployeeIdForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      horizontal: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};
</script>
