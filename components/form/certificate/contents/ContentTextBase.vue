<template>
  <div class="bg-white border border-solid border-gray-50 shadow-sm rounded-xl p-4 w-full space-y-2">
    <div
      class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-2 cursor-pointer"
      @click="$emit('headerClick')"
    >
      <div class="flex items-center gap-2">
        <Icon
          name="material-symbols:text-fields-rounded"
          class="text-gray-500 w-5 h-5"
        />
        <p class="text-sm font-medium">
          <slot name="title">
            {{ title }}
          </slot>
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
        <!-- Custom fields slot (injected at the top) -->
        <slot name="custom-fields" />

        <!-- Text input field - hidden when isSource is true -->
        <UiFormGroup
          v-if="!isSource"
          label="Text"
        >
          <UITextarea
            v-model="localModel"
            size="md"
          />
        </UiFormGroup>

        <!-- Size field -->
        <UiFormGroup
          v-if="shouldShowField('size')"
          label="Size"
        >
          <div class="flex items-center gap-2">
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="metadata.width"
                size="md"
                @update:model-value="$emit('update:width', $event)"
              >
                <template #suffix>
                  <span class="text-gray-500">W</span>
                </template>
              </UiInput>
            </div>
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="metadata.height"
                size="md"
                @update:model-value="$emit('update:height', $event)"
              >
                <template #suffix>
                  <span class="text-gray-500">H</span>
                </template>
              </UiInput>
            </div>
          </div>
        </UiFormGroup>

        <!-- Font Family field -->
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
              :model-value="metadata.font_size"
              size="md"
              class="w-24"
              @update:model-value="$emit('update:fontSize', $event)"
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
              :model-value="metadata.alignment"
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
              type="color"
              :model-value="metadata.color"
              size="md"
              class="w-16 h-10 p-0 border-0"
              @update:model-value="$emit('update:color', $event)"
            />
          </UiFormGroup>
        </div>

        <!-- Vertical field -->
        <UiFormGroup
          v-if="shouldShowField('vertical')"
          label="Vertical"
        >
          <div class="flex items-center gap-2">
            <UiSliderRange
              :model-value="metadata.vertical"
              :min="0"
              :max="100"
              :start-point="50"
              @update:model-value="$emit('update:vertical', $event)"
            />
            <div class="w-32">
              <UiInput
                :model-value="metadata.vertical"
                size="md"
                @update:model-value="$emit('update:vertical', $event)"
              >
                <template #suffix>
                  <span class="text-gray-500">%</span>
                </template>
              </UiInput>
            </div>
          </div>
        </UiFormGroup>

        <!-- Horizontal field -->
        <UiFormGroup
          v-if="shouldShowField('horizontal')"
          label="Horizontal"
        >
          <div class="flex items-center gap-2">
            <UiSliderRange
              :disabled="isHorizontalDisabled"
              :model-value="metadata.horizontal"
              :min="0"
              :max="100"
              :start-point="50"
              @update:model-value="$emit('update:horizontal', $event)"
            />
            <div class="w-32">
              <UiInput
                :model-value="metadata.horizontal"
                size="md"
                :disabled="isHorizontalDisabled"
                @update:model-value="$emit('update:horizontal', $event)"
              >
                <template #suffix>
                  <span class="text-gray-500">%</span>
                </template>
              </UiInput>
            </div>
          </div>
        </UiFormGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContentTextField, ICertificateContentLocationMetadata, ICertificateContentTextMetadata } from '#achievement/config/types';
import UiButton from '#ui/components/atoms/button/index.vue';
import UiInput from '#ui/components/atoms/input/index.vue';
import UiSliderRange from '#ui/components/atoms/slider-range/index.vue';
import UITextarea from '#ui/components/atoms/textarea/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';
import { Dropdown } from 'floating-vue';

interface Props {
  modelValue: string;
  metadata: ICertificateContentTextMetadata | ICertificateContentLocationMetadata;
  index: number;
  title: string;
  fields: ContentTextField[];
  isSource: boolean;
  isExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSource: false,
  isExpanded: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:width': [value: string | number];
  'update:height': [value: string | number];
  'update:fontSize': [value: string | number];
  'update:fontWeight': [value: number];
  'update:fontFamily': [value: string];
  'update:alignment': [value: 'left' | 'center' | 'right'];
  'update:color': [value: string | number];
  'update:vertical': [value: string | number];
  'update:horizontal': [value: string | number];
  'delete': [index: number];
  'headerClick': [];
}>();

const store = useCertificateStore();
const { safe_zone } = storeToRefs(store);

const isCollapsed = computed(() => !props.isExpanded);

const shouldShowField = (field: ContentTextField): boolean => {
  return props.fields.includes(field);
};

const fontOptions = [
  { label: 'Great Vibes', value: '\'Great Vibes\', cursive', url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap', weights: [400] },
  { label: 'Pinyon Script', value: '\'Pinyon Script\', cursive', url: 'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap', weights: [400] },
  { label: 'Allura', value: '\'Allura\', cursive', url: 'https://fonts.googleapis.com/css2?family=Allura&display=swap', weights: [400] },
  { label: 'Dancing Script', value: '\'Dancing Script\', cursive', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap', weights: [400, 500, 600, 700] },
  { label: 'Alex Brush', value: '\'Alex Brush\', cursive', url: 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap', weights: [400] },
  { label: 'EB Garamond', value: '\'EB Garamond\', serif', url: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700;800&display=swap', weights: [400, 500, 600, 700, 800] },
  { label: 'Playfair Display', value: '\'Playfair Display\', serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap', weights: [400, 500, 600, 700, 800, 900] },
  { label: 'Cormorant Garamond', value: '\'Cormorant Garamond\', serif', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap', weights: [300, 400, 500, 600, 700] },
  { label: 'Libre Baskerville', value: '\'Libre Baskerville\', serif', url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap', weights: [400, 700] },
  { label: 'Merriweather', value: '\'Merriweather\', serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap', weights: [300, 400, 700, 900] },
  { label: 'Cinzel', value: '\'Cinzel\', serif', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap', weights: [400, 500, 600, 700, 800, 900] },
  { label: 'Cinzel Decorative', value: '\'Cinzel Decorative\', serif', url: 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&display=swap', weights: [400, 700, 900] },
  { label: 'UnifrakturMaguntia', value: '\'UnifrakturMaguntia\', cursive', url: 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap', weights: [400] },
  { label: 'MedievalSharp', value: '\'MedievalSharp\', cursive', url: 'https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap', weights: [400] },
  { label: 'Montserrat', value: '\'Montserrat\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Lato', value: '\'Lato\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap', weights: [100, 300, 400, 700, 900] },
  { label: 'Raleway', value: '\'Raleway\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
];

const alignmentOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

const loadFont = (fontUrl: string) => {
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

const localModel = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

const availableFontWeights = computed(() => {
  const selectedFont = fontOptions.find(f => f.value === props.metadata.font_family);
  return selectedFont?.weights || [100, 200, 300, 400, 500, 600, 700, 800, 900];
});

const getClosestFontWeight = (targetWeight: number, availableWeights: number[]): number => {
  return availableWeights.reduce((prev, curr) => {
    return Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev;
  });
};

const handleFontFamilyUpdate = (selectedOption: any) => {
  const fontValue = selectedOption?.value || '\'Montserrat\', sans-serif';
  emit('update:fontFamily', fontValue);

  const selectedFont = fontOptions.find(f => f.value === fontValue);
  const newAvailableWeights = selectedFont?.weights || [400];

  let newWeight = props.metadata.font_weight;
  if (!newAvailableWeights.includes(newWeight)) {
    newWeight = getClosestFontWeight(newWeight, newAvailableWeights);
    emit('update:fontWeight', newWeight);
  }
};

const handleFontWeightUpdate = (selectedOption: any) => {
  let weight = selectedOption?.value || 400;

  if (!availableFontWeights.value.includes(weight)) {
    weight = getClosestFontWeight(weight, availableFontWeights.value);
  }

  emit('update:fontWeight', weight);
};

const handleAlignmentUpdate = (value: string | number | object | any[] | undefined) => {
  let alignmentValue: 'left' | 'center' | 'right' = 'left';

  if (typeof value === 'object' && value !== null && 'value' in value) {
    alignmentValue = (value as any).value || 'left';
  }
  else if (typeof value === 'string') {
    alignmentValue = value as 'left' | 'center' | 'right';
  }

  emit('update:alignment', alignmentValue);
};

const isHorizontalDisabled = computed(() => {
  const layoutWidth = 842;
  const safeZoneWidth = layoutWidth - (safe_zone.value?.left || 0) - (safe_zone.value?.right || 0);
  return props.metadata.width >= safeZoneWidth;
});

const handleDelete = () => {
  emit('delete', props.index);
};

const selectedFontObject = computed(() => {
  return fontOptions.find(f => f.value === props.metadata.font_family) || fontOptions[14];
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
  return fontWeightOptions.value.find(w => w.value === props.metadata.font_weight) || fontWeightOptions.value[0];
});
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}

:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(1) span) {
  font-family: 'Great Vibes', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(2) span) {
  font-family: 'Pinyon Script', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(3) span) {
  font-family: 'Allura', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(4) span) {
  font-family: 'Dancing Script', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(5) span) {
  font-family: 'Alex Brush', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(6) span) {
  font-family: 'EB Garamond', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(7) span) {
  font-family: 'Playfair Display', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(8) span) {
  font-family: 'Cormorant Garamond', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(9) span) {
  font-family: 'Libre Baskerville', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(10) span) {
  font-family: 'Merriweather', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(11) span) {
  font-family: 'Cinzel', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(12) span) {
  font-family: 'Cinzel Decorative', serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(13) span) {
  font-family: 'UnifrakturMaguntia', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(14) span) {
  font-family: 'MedievalSharp', cursive;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(15) span) {
  font-family: 'Montserrat', sans-serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(16) span) {
  font-family: 'Lato', sans-serif;
}
:deep(.font-family-select .select-field-wrapper .multiselect__option:nth-child(17) span) {
  font-family: 'Raleway', sans-serif;
}
</style>
