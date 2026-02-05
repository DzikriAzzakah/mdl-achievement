<template>
  <ContentTextWrapper
    :index="index"
    :is-collapsed="isCollapsed"
    :content-config="contentConfig"
    :metadata="contentItem.metadata"
    :selected-font-object="selectedFontObject"
    :selected-font-weight-object="selectedFontWeightObject"
    :font-weight-options="fontWeightOptions"
    :is-aspect-ratio-locked="isAspectRatioLocked"
    :can-lock-aspect-ratio="canLockAspectRatio"
    :width-mode="widthMode"
    :height-mode="heightMode"
    :selected-width-mode-object="selectedWidthModeObject"
    :selected-height-mode-object="selectedHeightModeObject"
    :element-id="contentItem.element_id"
    @header-click="$emit('headerClick')"
    @delete="$emit('delete', $event)"
    @update:font-family="handleFontFamilyUpdate"
    @update:font-size="handleFontSizeUpdate"
    @update:font-weight="handleFontWeightUpdate"
    @update:color="updateHandlers.updateColor"
    @update:alignment="handleAlignmentUpdate"
    @update:width="handleWidthUpdate"
    @update:height="handleHeightUpdate"
    @update:width-mode="handleWidthModeChange"
    @update:height-mode="handleHeightModeChange"
    @update:horizontal="updateHandlers.updateHorizontal"
    @update:vertical="updateHandlers.updateVertical"
    @toggle-aspect-ratio="toggleAspectRatioLock"
  >
    <template #before-fields>
      <UiFormGroup
        v-if="contentItem.type === 'city'"
        label="City"
      >
        <UiInput
          :model-value="textValue"
          size="md"
          placeholder="Enter City"
          @update:model-value="handleValueUpdate"
        />
      </UiFormGroup>

      <UiFormGroup
        v-if="contentItem.type === 'date'"
        label="Date Format"
      >
        <UiSelect
          :model-value="selectedDateFormat"
          size="md"
          :options="dateFormatOptions"
          :select-props="{
            useTeleport: true,
            trackBy: 'value',
            label: 'label',
          }"
          @update:model-value="handleDateFormatUpdate"
        />
      </UiFormGroup>

      <UiFormGroup
        v-if="contentItem.type === 'text'"
        label="Text"
      >
        <UiTextarea
          v-model="textValue"
          size="md"
        />
      </UiFormGroup>
    </template>
  </ContentTextWrapper>
</template>

<script setup lang="ts">
import type {
  CityContentForm,
  DateContentForm,
  EventTitleContentForm,
  NIKContentForm,
  ParticipantNameContentForm,
  TextContentForm,
  ValidThruContentForm,
} from '#achievement/config/types';
import ContentTextWrapper from '#achievement/components/form/certificate/contents/ContentTextWrapper.vue';
import { useAlignmentControls } from '#achievement/composables/useAlignmentControls';
import { useCertificateContentUpdate } from '#achievement/composables/useCertificateContentUpdate';
import { useDimensionControls } from '#achievement/composables/useDimensionControls';
import { useTypographyControls } from '#achievement/composables/useTypographyControls';
import { CANVAS_HEIGHT, CANVAS_WIDTH, CONTENT_TYPE_CONFIGS, DATE_FORMAT_OPTIONS } from '#achievement/config/constants';
import { UiFormGroup, UiInput, UiSelect, UiTextarea } from '@mydigilearn-saas/web-ui';

type TextBasedContentItem =
  | TextContentForm
  | CityContentForm
  | DateContentForm
  | ParticipantNameContentForm
  | NIKContentForm
  | EventTitleContentForm
  | ValidThruContentForm;

interface Props {
  contentItem: TextBasedContentItem;
  index: number;
  isExpanded?: boolean;
  safeZoneWidth?: number;
  safeZoneHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isExpanded: false,
  safeZoneWidth: CANVAS_WIDTH,
  safeZoneHeight: CANVAS_HEIGHT,
});

const emit = defineEmits<{
  'update:contentItem': [value: TextBasedContentItem];
  'delete': [index: number];
  'headerClick': [];
}>();

const updateHandlers = useCertificateContentUpdate(() => props.contentItem, emit as any);

const {
  selectedFontObject,
  selectedFontWeightObject,
  fontWeightOptions,
  handleFontFamilyUpdate,
  handleFontWeightUpdate,
  handleFontSizeUpdate,
} = useTypographyControls(props, emit as any);

const {
  widthMode,
  heightMode,
  selectedWidthModeObject,
  selectedHeightModeObject,
  isAspectRatioLocked,
  canLockAspectRatio,
  handleWidthUpdate,
  handleHeightUpdate,
  handleWidthModeChange,
  handleHeightModeChange,
  toggleAspectRatioLock,
} = useDimensionControls(props, emit as any);

const {
  handleAlignmentUpdate,
  handleValueUpdate,
} = useAlignmentControls(props, emit as any);

const contentConfig = computed(() => CONTENT_TYPE_CONFIGS[props.contentItem.type]);
const isCollapsed = computed(() => !props.isExpanded);

const textValue = computed({
  get: () => {
    if (props.contentItem.type === 'text' || props.contentItem.type === 'city') {
      return props.contentItem.element_value ?? '';
    }
    return props.contentItem.value ?? '';
  },
  set: (newValue) => {
    handleValueUpdate(newValue);
  },
});

const dateFormatOptions = DATE_FORMAT_OPTIONS;

const selectedDateFormat = computed(() => {
  if (props.contentItem.type !== 'date') {
    return dateFormatOptions[0];
  }

  const metadata = props.contentItem.metadata;
  const selectedFormat = dateFormatOptions.find(opt => opt.value === metadata.format);
  return selectedFormat || dateFormatOptions[0];
});

const handleDateFormatUpdate = (selectedOption: any) => {
  const dateFormat = selectedOption?.value || 'DD/MM/YYYY';
  updateHandlers.updateDateFormat(dateFormat);
};
</script>
