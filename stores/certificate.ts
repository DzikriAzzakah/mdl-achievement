import type {
  ICertificateBackgroundPayload,
  ICertificateContentForm,
  ICertificateContentPayload,
  ICertificateCreatePayload,
  ICertificateDetail,
  ICertificateForm,
  ICertificateResponse,
  ICertificateSafeZone,
  QRCodeBorderStyle,
  QRCodeShape,
  SizeMode,
} from '#achievement/config/types.ts';
import { TYPE_OPTIONS } from '#achievement/config/constants.ts';
import { createContent, generateContentKey } from '#achievement/utils/contentFactory';
import { certificateValidationSchema } from '#achievement/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm } from 'vee-validate';

export const useCertificateStore = defineStore('certificate', () => {
  const detailCertificate = ref<ICertificateDetail>();

  const { errors, defineField, resetForm, values, setValues: setFormValues } = useForm({
    validationSchema: certificateValidationSchema,
    initialValues: {
      title: '',
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

  const certificateResponse = ref<ICertificateResponse>();

  const [title] = defineField('title');
  const [certificate_type] = defineField('certificate_type');
  const [image] = defineField('image');
  const [contents] = defineField('contents');
  const [safe_zone] = defineField('safe_zone');

  const contentIdCounter = ref<number>(0);
  const selectedContentKey = ref<string | null>(null);
  const uploadedBackgroundMeta = ref<ICertificateBackgroundPayload | null>(null);

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

  function toggleContentSelection(key: string): void {
    if (selectedContentKey.value === key) {
      selectedContentKey.value = null;
    }
    else {
      selectedContentKey.value = key;
    }
  }

  function setFormFromDetail(data: Omit<ICertificateCreatePayload, 'preview'> & { id?: number; preview_url?: string; }): void {
    const typeOption = TYPE_OPTIONS.find(opt => opt.value === data.type);
    const certificateType = typeOption
      ? { label: typeOption.label, value: typeOption.value }
      : { label: data.type, value: data.type };

    const imageUrl = data.background?.full_path
      || (data.background?.image_host && data.background?.file_path
        ? `${data.background.image_host}${data.background.file_path}`
        : null);

    uploadedBackgroundMeta.value = data.background || null;

    const safeZone: ICertificateSafeZone = data.metadata?.safe_zone || {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    };

    const mappedContents: ICertificateContentForm[] = (data.contents || []).map((content, index) => {
      return mapContentPayloadToForm(content, index);
    });

    if (mappedContents.length > 0) {
      const maxId = mappedContents.reduce((max, c) => {
        const match = c.key.match(/_(\d+)$/);
        const id = match ? Number.parseInt(match[1], 10) : 0;
        return Math.max(max, id);
      }, 0);
      contentIdCounter.value = maxId;
    }

    setFormValues({
      title: data.title || '',
      certificate_type: certificateType,
      image: imageUrl,
      contents: mappedContents,
      safe_zone: safeZone,
    });

    if (data.id) {
      detailCertificate.value = {
        id: data.id,
        title: data.title,
        certificate_type: certificateType,
      };
    }
  }

  function mapContentPayloadToForm(content: ICertificateContentPayload, index: number): ICertificateContentForm {
    const { type, key, value, metadata, variables } = content;

    const contentKey = key || generateContentKey(type, index + 1);

    const baseMetadata = {
      width: metadata.width,
      height: metadata.height,
      vertical: metadata.vertical || 0,
      horizontal: metadata.horizontal || 0,
      width_mode: (metadata.width_mode as SizeMode) || 'fix',
      height_mode: (metadata.height_mode as SizeMode) || 'fix',
      isAspectRatioLocked: metadata.isAspectRatioLocked ?? false,
    };

    if (type === 'image') {
      return {
        type: 'image',
        key: contentKey,
        value: value || metadata.full_path || null,
        metadata: {
          ...baseMetadata,
          originalWidth: metadata.original_width,
          originalHeight: metadata.original_height,
        },
        file: null,
      };
    }

    if (type === 'sertificate_signee') {
      return {
        type: 'sertificate_signee',
        key: contentKey,
        value: value || metadata.full_path || null,
        metadata: {
          ...baseMetadata,
          originalWidth: metadata.original_width,
          originalHeight: metadata.original_height,
        },
        file: null,
      };
    }

    if (type === 'qr_code') {
      return {
        type: 'qr_code',
        key: contentKey,
        value: value || '',
        metadata: {
          ...baseMetadata,
          background_color: metadata.background_color || 'FFFFFF',
          background_transparent: metadata.background_transparent ?? false,
          shape: (metadata.shape as QRCodeShape) || 'square',
          shape_color: metadata.shape_color || '000000',
          border_style: (metadata.border_style as QRCodeBorderStyle) || 'rounded',
          border_color: metadata.border_color || 'FFFFFF',
        },
      };
    }

    const textMetadata = {
      ...baseMetadata,
      font_family: metadata.font_family || '\'Montserrat\', sans-serif',
      font_size: metadata.font_size || 16,
      font_weight: metadata.font_weight || 400,
      alignment: metadata.alignment || { label: 'Center', value: 'center' },
      color: metadata.color || '000000',
    };

    if (type === 'certificate_number') {
      return {
        type: 'certificate_number',
        key: contentKey,
        value: value || '',
        metadata: textMetadata,
        variables: variables?.map(v => ({
          id: v.id,
          type: v.type,
          label: v.label,
          value: v.value,
          customValue: v.customValue,
        })),
      };
    }

    if (type === 'location') {
      return {
        type: 'location',
        key: contentKey,
        value: value || '',
        metadata: {
          ...textMetadata,
          location: metadata.location || '',
          date_format: metadata.date_format || 'DD/MM/YYYY',
        },
      };
    }

    if (type === 'fullname') {
      return {
        type: 'fullname',
        key: contentKey,
        value: value || '',
        metadata: textMetadata,
      };
    }

    if (type === 'employee_id') {
      return {
        type: 'employee_id',
        key: contentKey,
        value: value || '',
        metadata: textMetadata,
      };
    }

    if (type === 'event_title') {
      return {
        type: 'event_title',
        key: contentKey,
        value: value || '',
        metadata: textMetadata,
      };
    }

    if (type === 'valid_thru') {
      return {
        type: 'valid_thru',
        key: contentKey,
        value: value || '',
        metadata: textMetadata,
      };
    }

    return {
      type: 'text',
      key: contentKey,
      value: value || '',
      metadata: textMetadata,
    };
  }

  const $resetAll = () => {
    resetForm();
    detailCertificate.value = undefined;
    certificateResponse.value = undefined;
    contentIdCounter.value = 0;
    selectedContentKey.value = null;
    uploadedBackgroundMeta.value = null;
  };

  return {
    detailCertificate,
    errors,
    title,
    certificate_type,
    image,
    contents,
    safe_zone,
    selectedContentKey,
    certificateResponse,
    uploadedBackgroundMeta,

    getForm,

    resetForm,
    setFormValues,
    $resetAll,
    addContent,
    updateContentByIndex,
    deleteContent,
    updateSafeZone,
    toggleContentSelection,
    setFormFromDetail,
  };
});
