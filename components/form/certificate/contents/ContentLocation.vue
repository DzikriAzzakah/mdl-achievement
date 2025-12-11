<template>
  <ContentTextBase
    :model-value="contentItem.value"
    :metadata="contentItem.metadata"
    :index="index"
    :title="`Location ${index + 1}`"
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
      <UiFormGroup label="Location">
        <UiInput
          :model-value="contentItem.metadata.location"
          size="md"
          placeholder="Enter location"
          @update:model-value="updateLocation"
        />
      </UiFormGroup>

      <UiFormGroup label="Completion Date Format">
        <UiSelect
          :model-value="selectedDateFormat"
          size="md"
          :options="dateFormatOptions"
          :select-props="{
            trackBy: 'value',
            label: 'label',
          }"
          @update:model-value="updateDateFormat"
        />
      </UiFormGroup>
    </template>
  </ContentTextBase>
</template>

<script setup lang="ts">
import type { ICertificateContentLocationForm } from '#achievement/config/types';
import UiInput from '#ui/components/atoms/input/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';
import ContentTextBase from './ContentTextBase.vue';

const props = defineProps<{
  contentItem: ICertificateContentLocationForm;
  index: number;
  isExpanded?: boolean;
}>();

const emit = defineEmits<{
  'delete': [index: number];
  'update:contentItem': [value: ICertificateContentLocationForm];
  'headerClick': [];
}>();

const dateFormatOptions = [
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
  { label: 'MM-DD-YYYY', value: 'MM-DD-YYYY' },
  { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
  { label: 'DD MMM YYYY', value: 'DD MMM YYYY' },
  { label: 'MMM DD, YYYY', value: 'MMM DD, YYYY' },
  { label: 'MMMM DD, YYYY', value: 'MMMM DD, YYYY' },
  { label: 'DD MMMM YYYY', value: 'DD MMMM YYYY' },
];

const selectedDateFormat = computed(() => {
  return dateFormatOptions.find(opt => opt.value === props.contentItem.metadata.date_format) || dateFormatOptions[0];
});

const updateValue = (value: string | undefined) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    value: value || '{{ location }}',
  };
  emit('update:contentItem', updatedItem);
};

const updateLocation = (value: string | undefined) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      location: value || '',
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateDateFormat = (selectedOption: any) => {
  const dateFormat = selectedOption?.value || 'DD/MM/YYYY';
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      date_format: dateFormat,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateWidth = (value: string | number) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      width: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateHeight = (value: string | number) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      height: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateFontSize = (value: string | number) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      font_size: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateFontWeight = (value: number) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      font_weight: value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateFontFamily = (value: string) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      font_family: value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateAlignment = (value: 'left' | 'center' | 'right') => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      alignment: value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateColor = (value: string | number) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      color: String(value) || '#000000',
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateVertical = (value: string | number) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      vertical: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};

const updateHorizontal = (value: string | number) => {
  const updatedItem: ICertificateContentLocationForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      horizontal: typeof value === 'string' ? Number(value) : value,
    },
  };
  emit('update:contentItem', updatedItem);
};
</script>
