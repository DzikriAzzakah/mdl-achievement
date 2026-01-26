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
    @update:font-size="updateHandlers.updateFontSize"
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
      <UiFormGroup label="Preview">
        <div class="p-3 bg-gray-25 rounded-lg text-sm break-all">
          {{ certificateNumberPreview || '-' }}
        </div>
      </UiFormGroup>

      <UiFormGroup label="Variables">
        <draggable
          v-model="certificateVariables"
          item-key="id"
          handle=".drag-handle"
          ghost-class="opacity-50"
          class="flex flex-col gap-1.5"
          @end="onDragEnd"
        >
          <template #item="{ element, index: varIndex }">
            <div class="w-full flex items-center justify-between px-3 py-1.5 bg-gray-25 rounded-lg">
              <div class="flex items-center gap-1">
                <Icon
                  name="ci:drag-vertical"
                  class="drag-handle text-gray-300 w-5 h-5 mr-2 cursor-grab active:cursor-grabbing"
                />
                <p class="text-sm">
                  {{ getVariableDisplayLabel(element) }}
                </p>
              </div>
              <Dropdown
                placement="bottom-end"
                popper-class="experience-more-actions"
              >
                <UiButton
                  size="md"
                  variant="transparent"
                  color="ghost"
                  icon="mdi:dots-horizontal"
                  class="!text-gray-300"
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
                      icon="mdi-edit"
                      @click="openEditVariableModal(varIndex)"
                    >
                      Edit
                    </UiButton>
                    <UiButton
                      size="md"
                      class="w-full text-left"
                      variant="transparent"
                      color="ghost"
                      icon="mdi-delete"
                      @click="deleteVariable(varIndex)"
                    >
                      Delete
                    </UiButton>
                  </div>
                </template>
              </Dropdown>
            </div>
          </template>
        </draggable>
        <div
          v-if="!certificateVariables.length"
          class="text-gray-400 text-sm py-2"
        >
          No variables added yet. Click "Add Variable" to get started.
        </div>
      </UiFormGroup>

      <UiButton
        size="md"
        variant="outline"
        color="primary"
        class="w-full"
        icon="mdi-plus-circle"
        @click="openAddVariableModal"
      >
        Add Variable
      </UiButton>
    </template>

    <template #modals>
      <Teleport to="body">
        <UiModal
          v-model="showSelectVariableModal"
          prevent-close
          position="center"
          size="sm"
          :footer="{
            ok: isEditingVariable ? 'Update' : 'Add',
            cancel: 'Cancel',
            okDisabled: !isVariableFormValid,
          }"
          :ui="{ divider: true }"
          @ok="onSubmitVariable"
          @cancel="onCancelVariableModal"
        >
          <template #header-title>
            <p class="text-lg font-semibold">
              {{ isEditingVariable ? 'Edit Variable' : 'Add Variable' }}
            </p>
          </template>

          <div class="space-y-4">
            <UiFormGroup label="Type">
              <UiSelect
                :model-value="selectedVariableType"
                size="md"
                :options="availableVariableOptions"
                :select-props="{
                  useTeleport: true,
                  trackBy: 'key',
                  label: 'label',
                }"
                option-value="key"
                option-label="label"
                @update:model-value="handleVariableTypeChange"
              />
            </UiFormGroup>

            <UiFormGroup
              v-if="selectedVariableType?.key === 'serial_number'"
              label="Start From"
            >
              <UiInput
                :model-value="serialNumberValue"
                type="number"
                size="md"
                placeholder="Enter starting number (e.g., 1000)"
                @update:model-value="handleSerialNumberChange"
              />
            </UiFormGroup>

            <UiFormGroup
              v-if="selectedVariableType?.key === 'text_area'"
              label="Text"
            >
              <UiInput
                :model-value="textAreaValue"
                size="md"
                placeholder="Enter custom text"
                @update:model-value="handleTextAreaChange"
              />
            </UiFormGroup>
          </div>
        </UiModal>
      </Teleport>
    </template>
  </ContentTextWrapper>
</template>

<script setup lang="ts">
import type {
  ICertificateContentCertificateNumberForm,
  ICertificateNumberVariable,
} from '#achievement/config/types';
import { getSerialNumberUUID } from '#achievement/api/api';
import ContentTextWrapper from '#achievement/components/form/certificate/contents/ContentTextWrapper.vue';
import { useContentTextControls } from '#achievement/composables/useContentTextControls';
import { CANVAS_HEIGHT, CANVAS_WIDTH, CERTIFICATE_NUMBER_VARIABLES } from '#achievement/config/constants';
import UiButton from '#ui/components/atoms/button/index.vue';
import UiInput from '#ui/components/atoms/input/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiModal from '#ui/components/molecules/modal/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';
import { Dropdown } from 'floating-vue';
import draggable from 'vuedraggable';

interface Props {
  contentItem: ICertificateContentCertificateNumberForm;
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
  'update:contentItem': [value: ICertificateContentCertificateNumberForm];
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
  handleAlignmentUpdate,
  toggleAspectRatioLock,
  handleWidthUpdate,
  handleHeightUpdate,
  handleWidthModeChange,
  handleHeightModeChange,
} = useContentTextControls(props, emit as any);

const showSelectVariableModal = ref(false);
const selectedVariableType = ref<typeof CERTIFICATE_NUMBER_VARIABLES[0] | null>(null);
const serialNumberValue = ref('');
const textAreaValue = ref('');
const editingVariableIndex = ref<number | null>(null);
const isLoadingUUID = ref(false);

const isEditingVariable = computed(() => editingVariableIndex.value !== null);

const generatePayloadValue = (variables: ICertificateNumberVariable[]): string => {
  return variables.map((v) => {
    if (v.type === 'text_area') {
      return v.customValue || '';
    }
    if (v.type === 'serial_number') {
      return `{{serial_number:${v.uuid}:${v.customValue || '1'}}}`;
    }
    return v.value;
  }).join('');
};

const generatePreviewValue = (variables: ICertificateNumberVariable[]): string => {
  return variables.map((v) => {
    if (v.type === 'text_area') {
      return v.customValue || '';
    }
    if (v.type === 'serial_number') {
      return `[Serial: ${v.customValue || '1'}]`;
    }
    return v.value;
  }).join('');
};

const generateVariableId = (): string => {
  return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const resetVariableModal = () => {
  showSelectVariableModal.value = false;
  selectedVariableType.value = null;
  serialNumberValue.value = '';
  textAreaValue.value = '';
  editingVariableIndex.value = null;
  isLoadingUUID.value = false;
};

const certificateVariables = computed({
  get: () => {
    return props.contentItem.variables || [];
  },
  set: (newVariables: ICertificateNumberVariable[]) => {
    const updatedContent: ICertificateContentCertificateNumberForm = {
      ...props.contentItem,
      variables: newVariables,
      value: generatePayloadValue(newVariables),
    };
    emit('update:contentItem', updatedContent);
  },
});

const certificateNumberPreview = computed(() => {
  return generatePreviewValue(certificateVariables.value);
});

const getVariableDisplayLabel = (variable: ICertificateNumberVariable): string => {
  if (variable.type === 'text_area') {
    const text = variable.customValue || '';
    return text.length > 30 ? `${text.substring(0, 30)}...` : text || 'Text Area';
  }
  if (variable.type === 'serial_number') {
    return `Serial Number (Start: ${variable.customValue || '1'})`;
  }
  return variable.label;
};

const availableVariableOptions = computed(() => {
  const usedTypes = certificateVariables.value.map(v => v.type);

  return CERTIFICATE_NUMBER_VARIABLES.filter((option) => {
    if (option.key === 'text_area' || option.key === 'serial_number') {
      return true;
    }
    if (isEditingVariable.value) {
      const editingVar = certificateVariables.value[editingVariableIndex.value!];
      if (editingVar && editingVar.type === option.key) {
        return true;
      }
    }
    return !usedTypes.includes(option.key);
  });
});

const isVariableFormValid = computed(() => {
  if (!selectedVariableType.value) {
    return false;
  }

  const type = selectedVariableType.value.key;

  if (type === 'serial_number') {
    return serialNumberValue.value.toString().trim().length > 0;
  }

  if (type === 'text_area') {
    return textAreaValue.value.trim().length > 0;
  }

  return true;
});

const openAddVariableModal = () => {
  editingVariableIndex.value = null;
  selectedVariableType.value = availableVariableOptions.value[0] || null;
  serialNumberValue.value = '';
  textAreaValue.value = '';
  showSelectVariableModal.value = true;
};

const openEditVariableModal = (index: number) => {
  const variable = certificateVariables.value[index];
  if (!variable) {
    return;
  }

  editingVariableIndex.value = index;
  selectedVariableType.value = CERTIFICATE_NUMBER_VARIABLES.find(v => v.key === variable.type) || null;

  if (variable.type === 'serial_number') {
    serialNumberValue.value = variable.customValue || '';
    textAreaValue.value = '';
  }
  else if (variable.type === 'text_area') {
    textAreaValue.value = variable.customValue || '';
    serialNumberValue.value = '';
  }
  else {
    serialNumberValue.value = '';
    textAreaValue.value = '';
  }

  showSelectVariableModal.value = true;
};

const onSubmitVariable = async () => {
  if (!selectedVariableType.value || !isVariableFormValid.value) {
    return;
  }

  const isSerialNumber = selectedVariableType.value.key === 'serial_number';
  const isEditing = isEditingVariable.value && editingVariableIndex.value !== null;

  let uuid: string | undefined;

  if (isSerialNumber) {
    if (isEditing) {
      const existingVar = certificateVariables.value[editingVariableIndex.value!];
      uuid = existingVar.uuid;
    }
    else {
      try {
        isLoadingUUID.value = true;
        const response = await getSerialNumberUUID();
        uuid = response.data?.uuid;
        if (!uuid) {
          throw new Error('Failed to get UUID');
        }
      }
      catch (error) {
        console.error('Failed to fetch UUID:', error);
        return;
      }
      finally {
        isLoadingUUID.value = false;
      }
    }
  }

  const variableId = isEditing
    ? certificateVariables.value[editingVariableIndex.value!].id
    : generateVariableId();

  let customValue: string | undefined;
  if (isSerialNumber) {
    customValue = serialNumberValue.value;
  }
  else if (selectedVariableType.value.key === 'text_area') {
    customValue = textAreaValue.value;
  }

  const newVariable: ICertificateNumberVariable = {
    id: variableId,
    type: selectedVariableType.value.key,
    label: selectedVariableType.value.label,
    value: selectedVariableType.value.value,
    customValue,
    uuid,
  };

  const updatedVariables = [...certificateVariables.value];

  if (isEditing) {
    updatedVariables[editingVariableIndex.value!] = newVariable;
  }
  else {
    updatedVariables.push(newVariable);
  }

  certificateVariables.value = updatedVariables;
  resetVariableModal();
};

const onCancelVariableModal = () => {
  resetVariableModal();
};

const deleteVariable = (index: number) => {
  const updatedVariables = certificateVariables.value.filter((_, i) => i !== index);
  certificateVariables.value = updatedVariables;
};

const onDragEnd = () => {
  certificateVariables.value = [...certificateVariables.value];
};

const handleVariableTypeChange = (value: any) => {
  selectedVariableType.value = value;
  serialNumberValue.value = '';
  textAreaValue.value = '';
};

const handleSerialNumberChange = (value: string | number | undefined) => {
  serialNumberValue.value = String(value ?? '');
};

const handleTextAreaChange = (value: string | undefined) => {
  textAreaValue.value = value ?? '';
};
</script>

<style scoped lang="postcss">
.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
