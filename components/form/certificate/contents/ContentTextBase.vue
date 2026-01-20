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
            :model-value="contentItem.metadata.location"
            size="md"
            placeholder="Enter location"
            @update:model-value="updateHandlers.updateLocation"
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
            @update:model-value="handleDateFormatUpdate"
          />
        </UiFormGroup>
      </template>

      <UiFormGroup
        v-if="!contentConfig.isSource"
        label="Text"
      >
        <UITextarea
          :model-value="contentItem.value"
          size="md"
          @update:model-value="handleValueUpdate"
        />
      </UiFormGroup>
    </template>
  </ContentTextWrapper>
</template>

<script setup lang="ts">
import type {
  ICertificateContentEmployeeIdForm,
  ICertificateContentEventTitleForm,
  ICertificateContentFullNameForm,
  ICertificateContentLocationForm,
  ICertificateContentTextForm,
  ICertificateContentValidThruForm,
} from '#achievement/config/types';
import ContentTextWrapper from '#achievement/components/form/certificate/contents/ContentTextWrapper.vue';
import { useContentTextControls } from '#achievement/composables/useContentTextControls';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DATE_FORMAT_OPTIONS } from '#achievement/config/constants';
import { isLocationContent } from '#achievement/config/types';
import UiInput from '#ui/components/atoms/input/index.vue';
import UITextarea from '#ui/components/atoms/textarea/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';

type TextBasedContentItem =
  | ICertificateContentTextForm
  | ICertificateContentLocationForm
  | ICertificateContentFullNameForm
  | ICertificateContentEmployeeIdForm
  | ICertificateContentEventTitleForm
  | ICertificateContentValidThruForm;

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

// Use shared composable for common logic
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

// Location-specific logic
const dateFormatOptions = DATE_FORMAT_OPTIONS;

const selectedDateFormat = computed(() => {
  if (!isLocationContent(props.contentItem)) {
    return dateFormatOptions[0];
  }
  return dateFormatOptions.find(opt => opt.value === props.contentItem.metadata.date_format) || dateFormatOptions[0];
});

const handleDateFormatUpdate = (selectedOption: any) => {
  const dateFormat = selectedOption?.value || 'DD/MM/YYYY';
  updateHandlers.updateDateFormat(dateFormat);
};
</script>
