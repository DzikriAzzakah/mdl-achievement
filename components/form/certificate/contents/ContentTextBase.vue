<template>
  <div class="bg-white border border-solid border-gray-50 shadow-sm rounded-xl p-4 w-full">
    <div
      class="flex justify-between items-center w-full cursor-pointer"
      :class="{ 'border-b-2 border-gray-50 pb-4': !isCollapsed }"
      @click="$emit('headerClick')"
    >
      <div class="flex items-center gap-2">
        <Icon
          :name="contentConfig.icon"
          class="text-gray-500 w-5 h-5"
        />
        <p class="text-sm font-medium">
          {{ contentConfig.title }} {{ index + 1 }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Dropdown
          placement="bottom-end"
          popper-class="experience-more-actions"
        >
          <UiButton
            size="md"
            variant="transparent"
            color="ghost"
            icon="mdi-dots-vertical"
            square
            @click.stop
          />
          <template #popper>
            <div class="flex flex-col gap-2.5 w-64 items-start shadow-md p-1.5 btn-experiences-user">
              <UiButton
                size="md"
                class="w-full text-left"
                variant="transparent"
                color="ghost"
                icon="mdi-delete"
                @click="handleDelete"
              >
                Delete
              </UiButton>
            </div>
          </template>
        </Dropdown>
        <Icon
          name="mdi:chevron-down"
          class="transition-transform duration-300"
          :class="{ 'rotate-180': isCollapsed }"
        />
      </div>
    </div>
    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'max-h-0' : 'max-h-[1000px]'"
    >
      <div class="space-y-4 pt-2">
        <!-- Certificate Number custom fields -->
        <template v-if="contentItem.type === 'certificate_number'">
          <UiFormGroup label="Text">
            <UITextarea
              ref="textareaRef"
              :model-value="contentItem.value"
              size="md"
              @update:model-value="updateHandlers.updateValue"
            />
          </UiFormGroup>

          <UiFormGroup label="Variables">
            <div class="flex flex-wrap gap-2">
              <UiBadge
                v-for="variable in certificateNumberVariables"
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

        <!-- Location custom fields -->
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

        <!-- Text input field - hidden when isSource is true -->
        <UiFormGroup
          v-if="!contentConfig.isSource"
          label="Text"
        >
          <UITextarea
            :model-value="contentItem.value"
            size="md"
            @update:model-value="updateHandlers.updateValue"
          />
        </UiFormGroup>

        <UiFormGroup
          v-if="shouldShowField('fontFamily')"
          label="Font Family"
        >
          <UiSelect
            :model-value="selectedFontObject"
            size="md"
            class="font-family-select"
            :options="fontOptions"
            :select-props="{
              trackBy: 'value',
              label: 'label',
            }"
            @update:model-value="handleFontFamilyUpdate"
          >
            <template #select-option="{ option }">
              <span :style="{ fontFamily: option.value }">{{ option.label }}</span>
            </template>
            <template #select-singleLabel="{ option }">
              <span :style="{ fontFamily: option.value }">{{ option.label }}</span>
            </template>
          </UiSelect>
        </UiFormGroup>

        <!-- Alignment and Font Color fields -->
        <div
          v-if="shouldShowField('alignment') || shouldShowField('fontColor')"
          class="flex items-center gap-4"
        >
          <UiFormGroup
            v-if="shouldShowField('fontColor')"
            class="flex-1"
            label="Color"
          >
            <UiInput
              type="text"
              :model-value="contentItem.metadata.color"
              size="md"
              class="w-16 h-10 p-0 border-0"
              @update:model-value="updateHandlers.updateColor"
            >
              <template #prefix>
                <span class="text-gray-500">#</span>
              </template>
              <template #suffix>
                <input
                  ref="colorPickerInput"
                  type="color"
                  :value="`#${contentItem.metadata.color}`"
                  class="invisible absolute"
                  @input="handleColorChange"
                >
                <div
                  class="w-6 h-6 rounded-md border border-gray-200 cursor-pointer"
                  :style="{ backgroundColor: `#${contentItem.metadata.color}` || '#000000' }"
                  @click="openColorPicker"
                />
              </template>
            </UiInput>
          </UiFormGroup>
          <UiFormGroup
            v-if="shouldShowField('alignment')"
            class="flex-1"
            label="Alignment"
          >
            <UiSelect
              :model-value="contentItem.metadata.alignment"
              size="md"
              :options="alignmentOptions"
              @update:model-value="handleAlignmentUpdate"
            />
          </UiFormGroup>
        </div>

        <!-- Font Size and Font Weight fields -->
        <div
          v-if="shouldShowField('fontSize') || shouldShowField('fontWeight')"
          class="flex items-center gap-4"
        >
          <UiFormGroup
            v-if="shouldShowField('fontSize')"
            class="flex-1"
            label="Font Size"
          >
            <UiInput
              type="number"
              :model-value="contentItem.metadata.font_size"
              size="md"
              class="w-24"
              @update:model-value="updateHandlers.updateFontSize"
            >
              <template #suffix>
                <span class="text-gray-500">px</span>
              </template>
            </UiInput>
          </UiFormGroup>

          <UiFormGroup
            v-if="shouldShowField('fontWeight')"
            class="flex-1"
            label="Font Weight"
          >
            <UiSelect
              :model-value="selectedFontWeightObject"
              size="md"
              :options="fontWeightOptions"
              :select-props="{
                trackBy: 'value',
                label: 'label',
              }"
              @update:model-value="handleFontWeightUpdate"
            >
              <template #select-option="{ option }">
                <span>{{ option.label }}</span>
              </template>
            </UiSelect>
          </UiFormGroup>
        </div>

        <UiFormGroup
          v-if="shouldShowField('size')"
          label="Size"
        >
          <div class="flex items-center gap-2">
            <UiInput
              type="number"
              :model-value="contentItem.metadata.width"
              size="md"
              @update:model-value="handleWidthUpdate"
            />
            <UiInput
              type="number"
              :model-value="contentItem.metadata.height"
              size="md"
              @update:model-value="handleHeightUpdate"
            />
            <UiButton
              v-tooltip="isAspectRatioLocked ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'"
              square
              size="md"
              variant="soft"
              icon="mdi:aspect-ratio"
              :color="isAspectRatioLocked ? 'primary' : 'ghost'"
              @click="toggleAspectRatioLock"
            />
          </div>
        </UiFormGroup>

        <!-- Position fields -->
        <div class="flex items-center gap-4">
          <UiFormGroup label="Position X">
            <UiInput
              type="number"
              :model-value="contentItem.metadata.horizontal"
              size="md"
              @update:model-value="updateHandlers.updateHorizontal"
            >
              <template #suffix>
                <span class="text-gray-500">px</span>
              </template>
            </UiInput>
          </UiFormGroup>

          <UiFormGroup label="Position Y">
            <UiInput
              type="number"
              :model-value="contentItem.metadata.vertical"
              size="md"
              @update:model-value="updateHandlers.updateVertical"
            >
              <template #suffix>
                <span class="text-gray-500">px</span>
              </template>
            </UiInput>
          </UiFormGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ContentTextField,
  ICertificateContentCertificateNumberForm,
  ICertificateContentEmployeeIdForm,
  ICertificateContentEventTitleForm,
  ICertificateContentFullNameForm,
  ICertificateContentLocationForm,
  ICertificateContentTextForm,
  ICertificateContentValidThruForm,
} from '#achievement/config/types';
import { useCertificateContentUpdate } from '#achievement/composables/useCertificateContentUpdate';
import {
  ALIGNMENT_OPTIONS,
  CERTIFICATE_NUMBER_VARIABLES,
  DATE_FORMAT_OPTIONS,
  FONT_OPTIONS,
  FONT_WEIGHT_LABELS,
} from '#achievement/config/constants';
import { CONTENT_TYPE_CONFIGS, isCertificateNumberContent, isLocationContent } from '#achievement/config/types';
import UiBadge from '#ui/components/atoms/badge/index.vue';
import UiButton from '#ui/components/atoms/button/index.vue';
import UiInput from '#ui/components/atoms/input/index.vue';
import UITextarea from '#ui/components/atoms/textarea/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';
import { Dropdown } from 'floating-vue';

type TextBasedContentItem =
  | ICertificateContentTextForm
  | ICertificateContentCertificateNumberForm
  | ICertificateContentLocationForm
  | ICertificateContentFullNameForm
  | ICertificateContentEmployeeIdForm
  | ICertificateContentEventTitleForm
  | ICertificateContentValidThruForm;

interface Props {
  contentItem: TextBasedContentItem;
  index: number;
  isExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isExpanded: false,
});

const emit = defineEmits<{
  'update:contentItem': [value: TextBasedContentItem];
  'delete': [index: number];
  'headerClick': [];
}>();

const textareaRef = ref<any>(null);
const colorPickerInput = ref<HTMLInputElement | null>(null);

// Get configuration for this content type
const contentConfig = computed(() => CONTENT_TYPE_CONFIGS[props.contentItem.type]);

const isCollapsed = computed(() => !props.isExpanded);

// Use the composable for update handlers
const updateHandlers = useCertificateContentUpdate(props.contentItem, emit);

const shouldShowField = (field: ContentTextField): boolean => {
  return contentConfig.value.fields.includes(field);
};

// Certificate Number Variables - now using constant
const certificateNumberVariables = CERTIFICATE_NUMBER_VARIABLES;

const selectedVariables = computed(() => {
  if (!isCertificateNumberContent(props.contentItem)) {
    return [];
  }
  const value = props.contentItem.value;
  return certificateNumberVariables
    .filter(variable => value.includes(variable.value))
    .map(variable => variable.value);
});

const handleBadgeClick = (variableValue: string) => {
  if (!isCertificateNumberContent(props.contentItem)) {
    return;
  }

  const currentValue = props.contentItem.value;
  const isSelected = currentValue.includes(variableValue);

  if (isSelected) {
    const newValue = currentValue.split(variableValue).join('');
    updateHandlers.updateValue(newValue);
  }
  else {
    const textarea = textareaRef.value?.$el?.querySelector('textarea');
    if (textarea) {
      const cursorPos = textarea.selectionStart || currentValue.length;
      const newValue = currentValue.slice(0, cursorPos) + variableValue + currentValue.slice(cursorPos);
      updateHandlers.updateValue(newValue);

      nextTick(() => {
        const newCursorPos = cursorPos + variableValue.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      });
    }
    else {
      updateHandlers.updateValue(currentValue + variableValue);
    }
  }
};

// Location Date Format - now using constant
const dateFormatOptions = DATE_FORMAT_OPTIONS;

const selectedDateFormat = computed(() => {
  if (!isLocationContent(props.contentItem)) {
    return dateFormatOptions[0];
  }
  // TypeScript now knows this is a LocationContent with date_format property
  return dateFormatOptions.find(opt => opt.value === props.contentItem.metadata.date_format) || dateFormatOptions[0];
});

const handleDateFormatUpdate = (selectedOption: any) => {
  const dateFormat = selectedOption?.value || 'DD/MM/YYYY';
  updateHandlers.updateDateFormat(dateFormat);
};

// Font options - now using constant
const fontOptions = FONT_OPTIONS;

const alignmentOptions = ALIGNMENT_OPTIONS;

const loadFont = (fontUrl: string) => {
  if (!fontUrl) {
    return;
  }
  const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
  if (existingLink) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fontUrl;
  document.head.appendChild(link);
};

onMounted(() => {
  fontOptions.forEach((font) => {
    loadFont(font.url);
  });
});

const availableFontWeights = computed(() => {
  const selectedFont = fontOptions.find(f => f.value === props.contentItem.metadata.font_family);
  return selectedFont?.weights || [100, 200, 300, 400, 500, 600, 700, 800, 900];
});

const getClosestFontWeight = (targetWeight: number, availableWeights: number[]): number => {
  return availableWeights.reduce((prev, curr) => {
    return Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev;
  });
};

const handleFontFamilyUpdate = (selectedOption: any) => {
  const fontValue = selectedOption?.value || '\'Montserrat\', sans-serif';

  const selectedFont = fontOptions.find(f => f.value === fontValue);
  const newAvailableWeights = selectedFont?.weights || [400];

  let newWeight = props.contentItem.metadata.font_weight;
  if (!newAvailableWeights.includes(newWeight)) {
    newWeight = getClosestFontWeight(newWeight, newAvailableWeights);
    updateHandlers.updateFontWeight(newWeight);
  }
};

const handleFontWeightUpdate = (selectedOption: any) => {
  let weight = selectedOption?.value || 400;

  if (!availableFontWeights.value.includes(weight)) {
    weight = getClosestFontWeight(weight, availableFontWeights.value);
  }

  updateHandlers.updateFontWeight(weight);
};

const handleAlignmentUpdate = (value: string | number | object | any[] | undefined) => {
  if (value && typeof value === 'object' && 'label' in value && 'value' in value) {
    updateHandlers.updateAlignment(value as { label: string; value: string; });
  }
};

const handleDelete = () => {
  emit('delete', props.index);
};

const selectedFontObject = computed(() => {
  return fontOptions.find(f => f.value === props.contentItem.metadata.font_family) || fontOptions[10];
});

const getFontWeightLabel = (weight: number): string => {
  return FONT_WEIGHT_LABELS[weight] || 'Regular';
};

const fontWeightOptions = computed(() => {
  return availableFontWeights.value.map(weight => ({
    label: `${getFontWeightLabel(weight)}`,
    value: weight,
  }));
});

const selectedFontWeightObject = computed(() => {
  return fontWeightOptions.value.find(w => w.value === props.contentItem.metadata.font_weight) || fontWeightOptions.value[0];
});

const isAspectRatioLocked = computed(() => props.contentItem.metadata.isAspectRatioLocked ?? false);

const toggleAspectRatioLock = () => {
  updateHandlers.updateAspectRatioLock(!isAspectRatioLocked.value);
};

const handleWidthUpdate = (value: string | number) => {
  if (isAspectRatioLocked.value) {
    const aspectRatio = props.contentItem.metadata.width / props.contentItem.metadata.height;
    const newHeight = Number(value) / aspectRatio;
    updateHandlers.updateHeight(newHeight);
  }
};

const handleHeightUpdate = (value: string | number) => {
  if (isAspectRatioLocked.value) {
    const aspectRatio = props.contentItem.metadata.width / props.contentItem.metadata.height;
    const newWidth = Number(value) * aspectRatio;
    updateHandlers.updateWidth(newWidth);
  }
};

const openColorPicker = () => {
  colorPickerInput.value?.click();
};

const handleColorChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const color = input.value.replace('#', '');
  updateHandlers.updateColor(color);
};
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}

:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(1) span) {
  font-family: 'Great Vibes', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(2) span) {
  font-family: 'Dancing Script', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(3) span) {
  font-family: 'EB Garamond', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(4) span) {
  font-family: 'Playfair Display', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(5) span) {
  font-family: 'Cormorant Garamond', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(6) span) {
  font-family: 'Libre Baskerville', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(7) span) {
  font-family: 'Merriweather', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(8) span) {
  font-family: 'Cinzel', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(9) span) {
  font-family: 'UnifrakturMaguntia', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(10) span) {
  font-family: 'MedievalSharp', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(11) span) {
  font-family: 'Montserrat', sans-serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(12) span) {
  font-family: 'Lato', sans-serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(13) span) {
  font-family: 'Raleway', sans-serif;
}
</style>
