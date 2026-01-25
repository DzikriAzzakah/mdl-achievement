<template>
  <div class="bg-white border border-solid border-gray-50 shadow-sm rounded-xl p-4 w-full space-y-2">
    <div
      class="flex justify-between items-center w-full cursor-pointer"
      :class="{ 'border-b-2 border-gray-50 pb-2': !isCollapsed }"
      @click="$emit('headerClick')"
    >
      <div class="flex items-center gap-2">
        <Icon
          name="mdi:qrcode"
          class="text-gray-500 w-5 h-5"
        />
        <p class="text-sm font-medium">
          QR Code {{ index + 1 }}
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
            icon="mdi:dots-horizontal"
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
          @click.stop="isCollapsed = !isCollapsed"
        />
      </div>
    </div>
    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'max-h-0' : 'max-h-[1000px]'"
    >
      <div class="space-y-4 pt-2">
        <!-- Size -->
        <UiFormGroup label="Size">
          <div class="flex items-center gap-2">
            <div class="w-32">
              <UiInput
                type="number"
                :model-value="contentItem.metadata.width"
                size="md"
                @update:model-value="updateSize"
              >
                <template #suffix>
                  <span class="text-gray-400 text-xs">px</span>
                </template>
              </UiInput>
            </div>
          </div>
        </UiFormGroup>

        <!-- Position -->
        <div class="flex items-center gap-4">
          <UiFormGroup label="Position X">
            <UiInput
              type="number"
              :model-value="contentItem.metadata.horizontal"
              size="md"
              @update:model-value="updateHorizontal"
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
              @update:model-value="updateVertical"
            >
              <template #suffix>
                <span class="text-gray-500">px</span>
              </template>
            </UiInput>
          </UiFormGroup>
        </div>

        <!-- Background Color -->
        <UiFormGroup label="Background">
          <div class="flex items-center gap-3">
            <UiSwitch
              :model-value="contentItem.metadata.background_transparent"
              label="Transparent"
              size="md"
              @update:model-value="updateBackgroundTransparent"
            />
            <div
              v-if="!contentItem.metadata.background_transparent"
              class="flex items-center gap-2"
            >
              <UiInput
                type="text"
                :model-value="contentItem.metadata.background_color"
                size="md"
                class="w-32"
                @update:model-value="updateBackgroundColor"
              >
                <template #prefix>
                  <span class="text-gray-500">#</span>
                </template>
                <template #suffix>
                  <input
                    ref="bgColorPickerInput"
                    type="color"
                    :value="`#${contentItem.metadata.background_color}`"
                    class="invisible absolute"
                    @input="handleBgColorChange"
                  >
                  <div
                    class="w-6 h-6 rounded-md border border-gray-200 cursor-pointer"
                    :style="{ backgroundColor: `#${contentItem.metadata.background_color}` }"
                    @click="openBgColorPicker"
                  />
                </template>
              </UiInput>
            </div>
          </div>
        </UiFormGroup>

        <!-- QR Shape -->
        <UiFormGroup label="QR Shape">
          <div class="flex items-center gap-2">
            <UiButton
              v-for="option in QR_CODE_SHAPE_OPTIONS"
              :key="option.value"
              square
              size="md"
              :variant="contentItem.metadata.shape === option.value ? 'solid' : 'soft'"
              :color="contentItem.metadata.shape === option.value ? 'primary' : 'ghost'"
              :icon="option.icon"
              @click="updateShape(option.value as QRCodeShape)"
            />
            <div class="flex items-center gap-2 ml-2">
              <UiInput
                type="text"
                :model-value="contentItem.metadata.shape_color"
                size="md"
                class="w-32"
                @update:model-value="updateShapeColor"
              >
                <template #prefix>
                  <span class="text-gray-500">#</span>
                </template>
                <template #suffix>
                  <input
                    ref="shapeColorPickerInput"
                    type="color"
                    :value="`#${contentItem.metadata.shape_color}`"
                    class="invisible absolute"
                    @input="handleShapeColorChange"
                  >
                  <div
                    class="w-6 h-6 rounded-md border border-gray-200 cursor-pointer"
                    :style="{ backgroundColor: `#${contentItem.metadata.shape_color}` }"
                    @click="openShapeColorPicker"
                  />
                </template>
              </UiInput>
            </div>
          </div>
        </UiFormGroup>

        <!-- Border Style -->
        <UiFormGroup label="Border Style">
          <div class="flex items-center gap-2">
            <UiButton
              v-for="option in QR_CODE_BORDER_OPTIONS"
              :key="option.value"
              square
              size="md"
              :variant="contentItem.metadata.border_style === option.value ? 'solid' : 'soft'"
              :color="contentItem.metadata.border_style === option.value ? 'primary' : 'ghost'"
              :icon="option.icon"
              @click="updateBorderStyle(option.value as QRCodeBorderStyle)"
            />
            <div class="flex items-center gap-2 ml-2">
              <UiInput
                type="text"
                :model-value="contentItem.metadata.border_color"
                size="md"
                class="w-32"
                @update:model-value="updateBorderColor"
              >
                <template #prefix>
                  <span class="text-gray-500">#</span>
                </template>
                <template #suffix>
                  <input
                    ref="borderColorPickerInput"
                    type="color"
                    :value="`#${contentItem.metadata.border_color}`"
                    class="invisible absolute"
                    @input="handleBorderColorChange"
                  >
                  <div
                    class="w-6 h-6 rounded-md border border-gray-200 cursor-pointer"
                    :style="{ backgroundColor: `#${contentItem.metadata.border_color}` }"
                    @click="openBorderColorPicker"
                  />
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
import type { ICertificateContentQRCodeForm, QRCodeBorderStyle, QRCodeShape } from '#achievement/config/types.ts';
import { QR_CODE_BORDER_OPTIONS, QR_CODE_SHAPE_OPTIONS } from '#achievement/config/constants.ts';
import UiButton from '#ui/components/atoms/button/index.vue';
import UiInput from '#ui/components/atoms/input/index.vue';
import UiSwitch from '#ui/components/atoms/switch/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import { Dropdown } from 'floating-vue';

const props = defineProps<{
  contentItem: ICertificateContentQRCodeForm;
  index: number;
  isExpanded?: boolean;
  safeZoneWidth?: number;
  safeZoneHeight?: number;
}>();

const emit = defineEmits<{
  'delete': [index: number];
  'update:contentItem': [value: ICertificateContentQRCodeForm];
  'headerClick': [];
}>();

const isCollapsed = computed(() => !props.isExpanded);

// Color picker refs
const bgColorPickerInput = ref<HTMLInputElement | null>(null);
const shapeColorPickerInput = ref<HTMLInputElement | null>(null);
const borderColorPickerInput = ref<HTMLInputElement | null>(null);

// Define updateMetadata first before it's used
const updateMetadata = (updates: Partial<ICertificateContentQRCodeForm['metadata']>) => {
  const updatedItem: ICertificateContentQRCodeForm = {
    ...props.contentItem,
    metadata: {
      ...props.contentItem.metadata,
      ...updates,
    },
  };
  emit('update:contentItem', updatedItem);
};

// Color picker open functions
const openBgColorPicker = () => {
  bgColorPickerInput.value?.click();
};

const openShapeColorPicker = () => {
  shapeColorPickerInput.value?.click();
};

const openBorderColorPicker = () => {
  borderColorPickerInput.value?.click();
};

// Color change handlers
const handleBgColorChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const color = input.value.replace('#', '');
  updateMetadata({ background_color: color });
};

const handleShapeColorChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const color = input.value.replace('#', '');
  updateMetadata({ shape_color: color });
};

const handleBorderColorChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const color = input.value.replace('#', '');
  updateMetadata({ border_color: color });
};

const updateSize = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  // Always update both width and height to maintain 1:1 aspect ratio
  updateMetadata({ width: numValue, height: numValue });
};

const updateVertical = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  updateMetadata({ vertical: numValue });
};

const updateHorizontal = (value: number | string) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  updateMetadata({ horizontal: numValue });
};

const updateBackgroundTransparent = (value: boolean) => {
  updateMetadata({ background_transparent: value });
};

const updateBackgroundColor = (value: string) => {
  updateMetadata({ background_color: value });
};

const updateShape = (value: QRCodeShape) => {
  updateMetadata({ shape: value });
};

const updateShapeColor = (value: string) => {
  updateMetadata({ shape_color: value });
};

const updateBorderStyle = (value: QRCodeBorderStyle) => {
  updateMetadata({ border_style: value });
};

const updateBorderColor = (value: string) => {
  updateMetadata({ border_color: value });
};

const handleDelete = () => {
  emit('delete', props.index);
};
</script>

<style scoped lang="postcss">
:deep(.input-field .input-area) {
  @apply w-full;
}
</style>
