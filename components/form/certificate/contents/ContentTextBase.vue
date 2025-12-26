<template>
  <div class="bg-white border border-solid border-gray-50 shadow-sm rounded-xl p-4 w-full space-y-2">
    <div
      class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-2 cursor-pointer"
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
            v-if="shouldShowField('alignment')"
            label="Alignment"
          >
            <UiSelect
              :model-value="contentItem.metadata.alignment"
              size="md"
              class="w-32"
              :options="alignmentOptions"
              @update:model-value="handleAlignmentUpdate"
            />
          </UiFormGroup>

          <UiFormGroup
            v-if="shouldShowField('fontColor')"
            label="Font Color"
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
        </div>

        <!-- Font Size and Font Weight fields -->
        <div
          v-if="shouldShowField('fontSize') || shouldShowField('fontWeight')"
          class="flex items-center gap-4"
        >
          <UiFormGroup
            v-if="shouldShowField('fontSize')"
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
            label="Font Weight"
          >
            <UiSelect
              :model-value="selectedFontWeightObject"
              size="md"
              class="w-32"
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
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="contentItem.metadata.width"
                size="md"
                @update:model-value="handleWidthUpdate"
              />
            </div>
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="contentItem.metadata.height"
                size="md"
                @update:model-value="handleHeightUpdate"
              />
            </div>
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

// Certificate Number Variables
const certificateNumberVariables = [
  { label: 'NIK', value: '{{NIK}}' },
  { label: 'Participant Name', value: '{{participant_name}}' },
  { label: 'Year', value: '{{year}}' },
  { label: 'Certificate Date', value: '{{certificate_date}}' },
  { label: 'Email', value: '{{email}}' },
  { label: 'Certificate Type', value: '{{certificate_type}}' },
  { label: 'Serial Number', value: '{{serial_number}}' },
];

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

// Location Date Format
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

// Font options
const fontOptions = [
  { label: 'Great Vibes', value: '\'Great Vibes\', cursive', url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap', weights: [400] },
  { label: 'Dancing Script', value: '\'Dancing Script\', cursive', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap', weights: [400, 500, 600, 700] },
  { label: 'EB Garamond', value: '\'EB Garamond\', serif', url: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700;800&display=swap', weights: [400, 500, 600, 700, 800] },
  { label: 'Playfair Display', value: '\'Playfair Display\', serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap', weights: [400, 500, 600, 700, 800, 900] },
  { label: 'Cormorant Garamond', value: '\'Cormorant Garamond\', serif', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap', weights: [300, 400, 500, 600, 700] },
  { label: 'Libre Baskerville', value: '\'Libre Baskerville\', serif', url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap', weights: [400, 700] },
  { label: 'Merriweather', value: '\'Merriweather\', serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap', weights: [300, 400, 700, 900] },
  { label: 'Cinzel', value: '\'Cinzel\', serif', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap', weights: [400, 500, 600, 700, 800, 900] },
  { label: 'UnifrakturMaguntia', value: '\'UnifrakturMaguntia\', cursive', url: 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap', weights: [400] },
  { label: 'MedievalSharp', value: '\'MedievalSharp\', cursive', url: 'https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap', weights: [400] },
  { label: 'Montserrat', value: '\'Montserrat\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Lato', value: '\'Lato\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap', weights: [100, 300, 400, 700, 900] },
  { label: 'Raleway', value: '\'Raleway\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Times New Roman', value: '\'Times New Roman\', serif', url: '', weights: [400, 700] },
  { label: 'Inter', value: '\'Inter\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Arial', value: 'Arial, sans-serif', url: '', weights: [400, 700] },
];

const alignmentOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

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
  updateHandlers.updateFontFamily(fontValue);

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
  const labels: Record<number, string> = {
    100: 'Thin',
    200: 'Extra Light',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'Semi Bold',
    700: 'Bold',
    800: 'Extra Bold',
    900: 'Black',
  };
  return labels[weight] || 'Regular';
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
  updateHandlers.updateWidth(value);
  if (isAspectRatioLocked.value) {
    const aspectRatio = props.contentItem.metadata.width / props.contentItem.metadata.height;
    const newHeight = Number(value) / aspectRatio;
    updateHandlers.updateHeight(newHeight);
  }
};

const handleHeightUpdate = (value: string | number) => {
  updateHandlers.updateHeight(value);
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
