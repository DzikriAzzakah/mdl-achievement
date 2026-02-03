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
      <template v-if="contentItem.type === 'location'">
        <UiFormGroup label="Location">
          <UiInput
            :model-value="contentItem.metadata.city"
            size="md"
            placeholder="Enter City"
            @update:model-value="updateHandlers.updateLocation"
          />
        </UiFormGroup>

        <UiFormGroup label="Completion Date Format">
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
      </template>

      <UiFormGroup
        v-if="!contentConfig.isSource"
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
  EventTitleContentForm,
  LocationContentForm,
  NIKContentForm,
  ParticipantNameContentForm,
  TextContentForm,
  ValidThruContentForm,
} from '#achievement/config/types';
import ContentTextWrapper from '#achievement/components/form/certificate/contents/ContentTextWrapper.vue';
import { useContentTextControls } from '#achievement/composables/useContentTextControls';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DATE_FORMAT_OPTIONS } from '#achievement/config/constants';
import { isLocationContent } from '#achievement/helpers/checkContentType';
import { UiFormGroup, UiInput, UiSelect, UiTextarea } from '@mydigilearn-saas/web-ui';

type TextBasedContentItem =
  | TextContentForm
  | LocationContentForm
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

const {
  contentConfig,
  isCollapsed,
  selectedFontObject,
  selectedFontWeightObject,
  fontWeightOptions,
  isAspectRatioLocked,
  canLockAspectRatio,
  widthMode,
  heightMode,
  selectedWidthModeObject,
  selectedHeightModeObject,
  updateHandlers,
  handleFontFamilyUpdate,
  handleFontWeightUpdate,
  handleFontSizeUpdate,
  handleAlignmentUpdate,
  toggleAspectRatioLock,
  handleWidthUpdate,
  handleHeightUpdate,
  handleWidthModeChange,
  handleHeightModeChange,
  handleValueUpdate,
} = useContentTextControls(props, emit as any);

const textValue = computed({
  get: () => {
    // For text type, use element_value; for others use value
    if (props.contentItem.type === 'text') {
      return (props.contentItem as TextContentForm).element_value ?? '';
    }
    return props.contentItem.value ?? '';
  },
  set: (newValue) => {
    handleValueUpdate(newValue);
  },
});

const dateFormatOptions = DATE_FORMAT_OPTIONS;

const selectedDateFormat = computed(() => {
  if (!isLocationContent(props.contentItem)) {
    return dateFormatOptions[0];
  }

  const metadata = props.contentItem.metadata;

  const selectedDateFormat
    = 'date_format' in metadata
      ? dateFormatOptions.find(opt => opt.value === metadata.date_format)
      : undefined;

  return selectedDateFormat || dateFormatOptions[0];
});

const handleDateFormatUpdate = (selectedOption: any) => {
  const dateFormat = selectedOption?.value || 'DD/MM/YYYY';
  updateHandlers.updateDateFormat(dateFormat);
};
</script>
