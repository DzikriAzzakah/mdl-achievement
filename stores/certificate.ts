import type { ICertificateContentForm, ICertificateDetail, ICertificateForm, ICertificateResponse, ICertificateSafeZone } from '#achievement/config/types.ts';
import { createContent, generateContentKey } from '#achievement/utils/contentFactory';
import { certificateValidationSchema } from '#achievement/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm, useIsFormValid } from 'vee-validate';

export const useCertificateStore = defineStore('certificate', () => {
  const detailCertificate = ref<ICertificateDetail>();

  const { errors, defineField, handleSubmit, resetForm, values, setValues: setFormValues } = useForm({
    validationSchema: certificateValidationSchema,
    initialValues: {
      title: '',
      description: '',
      certificate_type: { label: '', value: '' },
      image: null,
      contents: [],
      safe_zone: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
    } as ICertificateForm,
  });

  const getForm = computed(() => ({
    ...values,
  }));

  const isValid = useIsFormValid();
  const certificateResponse = ref<ICertificateResponse>();

  const [title] = defineField('title');
  const [description] = defineField('description');
  const [certificate_type] = defineField('certificate_type');
  const [image] = defineField('image');
  const [contents] = defineField('contents');
  const [safe_zone] = defineField('safe_zone');

  const contentIdCounter = ref<number>(0);

  const selectedContentKey = ref<string | null>(null);

  function addContent(type: string): string | null {
    contentIdCounter.value++;
    const key = generateContentKey(type, contentIdCounter.value);
    const newContent = createContent(type, key);

    if (!newContent) {
      console.error(`Unknown content type: ${type}`);
      return null;
    }

    contents.value = [...contents.value, newContent];
    selectedContentKey.value = key;
    return key;
  }

  function updateContent(key: string, data: Partial<ICertificateContentForm>): void {
    const index = contents.value.findIndex(c => c.key === key);
    if (index === -1) {
      console.error(`Content with key "${key}" not found`);
      return;
    }

    const updatedContents = [...contents.value];
    updatedContents[index] = {
      ...updatedContents[index],
      ...data,
      metadata: {
        ...updatedContents[index].metadata,
        ...(data.metadata || {}),
      },
    } as ICertificateContentForm;

    contents.value = updatedContents;
  }

  function updateContentByIndex(index: number, data: ICertificateContentForm): void {
    if (index < 0 || index >= contents.value.length) {
      console.error(`Content at index ${index} not found`);
      return;
    }

    const updatedContents = [...contents.value];
    updatedContents[index] = data;
    contents.value = updatedContents;
  }

  function deleteContent(index: number): void {
    if (index < 0 || index >= contents.value.length) {
      console.error(`Content at index ${index} not found`);
      return;
    }

    const deletedKey = contents.value[index].key;
    const updatedContents = [...contents.value];
    updatedContents.splice(index, 1);
    contents.value = updatedContents;

    if (selectedContentKey.value === deletedKey) {
      selectedContentKey.value = null;
    }
  }

  function updateSafeZone(zone: ICertificateSafeZone): void {
    const layoutWidth = 842;
    const oldSafeZone = safe_zone.value;
    const newSafeZoneWidth = layoutWidth - (zone?.left || 0) - (zone?.right || 0);
    const oldSafeZoneWidth = layoutWidth - (oldSafeZone?.left || 0) - (oldSafeZone?.right || 0);

    safe_zone.value = { ...zone };

    if (newSafeZoneWidth !== oldSafeZoneWidth) {
      const updatedContents = contents.value.map((content) => {
        if (content.type !== 'text') {
          return content;
        }

        const currentWidth = content.metadata.width;

        if (currentWidth !== 'fit-content' && currentWidth > newSafeZoneWidth) {
          return {
            ...content,
            metadata: {
              ...content.metadata,
              width: newSafeZoneWidth,
            },
          };
        }

        if (currentWidth === oldSafeZoneWidth) {
          return {
            ...content,
            metadata: {
              ...content.metadata,
              width: newSafeZoneWidth,
            },
          };
        }

        return content;
      });

      contents.value = updatedContents;
    }
  }

  function setSelectedContentKey(key: string | null): void {
    selectedContentKey.value = key;
  }

  function toggleContentSelection(key: string): void {
    if (selectedContentKey.value === key) {
      selectedContentKey.value = null;
    }
    else {
      selectedContentKey.value = key;
    }
  }

  const $resetAll = () => {
    resetForm();
    detailCertificate.value = undefined;
    certificateResponse.value = undefined;
    contentIdCounter.value = 0;
    selectedContentKey.value = null;
  };

  return {

    detailCertificate,
    errors,
    title,
    description,
    certificate_type,
    image,
    contents,
    safe_zone,
    selectedContentKey,
    certificateResponse,

    getForm,
    isValid,

    handleSubmit,
    resetForm,
    setFormValues,
    $resetAll,

    addContent,
    updateContent,
    updateContentByIndex,
    deleteContent,

    updateSafeZone,

    setSelectedContentKey,
    toggleContentSelection,
  };
});
