import type {
  CertificateContentForm,
  CertificateContentPayload,
  CertificateCreatePayload,
  CertificateDetail,
  CertificateForm,
  CertificateResponse,
  QRCodeBorderStyle,
  QRCodeShape,
  SafeZone,
  SizeMode,
  UploadedFileMeta,
} from '#achievement/config/types.ts';
import { CANVAS_HEIGHT, CANVAS_WIDTH, TYPE_OPTIONS } from '#achievement/config/constants.ts';
import { createContent, generateContentKey } from '#achievement/utils/contentFactory';
import { certificateValidationSchema } from '#achievement/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm } from 'vee-validate';

export const useCertificateStore = defineStore('certificate', () => {
  const detailCertificate = ref<CertificateDetail>();

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
    } as CertificateForm,
  });

  const getForm = computed(() => ({
    ...values,
  }));

  const certificateResponse = ref<CertificateResponse>();

  const [title] = defineField('title');
  const [certificate_type] = defineField('certificate_type');
  const [image] = defineField('image');
  const [contents] = defineField('contents');
  const [safe_zone] = defineField('safe_zone');

  const contentIdCounter = ref<number>(0);
  const selectedContentKey = ref<string | null>(null);
  const uploadedBackgroundMeta = ref<UploadedFileMeta | null>(null);
  const deletedContents = ref<CertificateContentForm[]>([]);

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

  function updateContentByIndex(index: number, data: CertificateContentForm): void {
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

    const contentToDelete = contents.value[index];
    const deletedKey = contentToDelete.key;

    if (contentToDelete.id) {
      deletedContents.value.push(contentToDelete);
    }

    const updatedContents = [...contents.value];
    updatedContents.splice(index, 1);
    contents.value = updatedContents;

    if (selectedContentKey.value === deletedKey) {
      selectedContentKey.value = null;
    }
  }

  function updateSafeZone(zone: SafeZone): void {
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

        if (currentWidth !== 'fit-content' && typeof currentWidth === 'number' && currentWidth > newSafeZoneWidth) {
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

  function setFormFromDetail(data: Omit<CertificateCreatePayload, 'preview'> & { id?: number; preview_url?: string; }): void {
    deletedContents.value = [];

    const typeOption = TYPE_OPTIONS.find(opt => opt.value === data.type);
    const certificateType = typeOption
      ? { label: typeOption.label, value: typeOption.value }
      : { label: data.type, value: data.type };

    const imageUrl = data.background?.full_path
      || (data.background?.image_host && data.background?.file_path
        ? `${data.background.image_host}${data.background.file_path}`
        : null);

    uploadedBackgroundMeta.value = data.background || null;

    const safeZone: SafeZone = data.metadata?.safe_zone || {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    };

    const mappedContents: CertificateContentForm[] = (data.contents || []).map((content, index) => {
      return mapContentPayloadToForm(content, index);
    });

    if (mappedContents.length > 0) {
      const maxId = mappedContents.reduce((max, c) => {
        const match = c.element_id.match(/_(\d+)$/);
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

  function mapContentPayloadToForm(content: CertificateContentPayload, index: number): CertificateContentForm {
    const { type, key, element_id, value, element_value, metadata, variables, id } = content;

    const contentElementId = element_id || key || generateContentKey(type, index + 1);
    const contentKey = type;

    const actualValue = element_value !== undefined ? element_value : value;

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
        id,
        type: 'image',
        key: contentKey,
        element_id: contentElementId,
        value: value || metadata.full_path || null,
        element_value: element_value || value || metadata.full_path || null,
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
        id,
        type: 'sertificate_signee',
        key: contentKey,
        element_id: contentElementId,
        value: value || metadata.full_path || null,
        element_value: element_value || value || metadata.full_path || null,
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
        id,
        type: 'qr_code',
        key: contentKey,
        element_id: contentElementId,
        value: value || '',
        element_value: actualValue || '',
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
        id,
        type: 'certificate_number',
        key: contentKey,
        element_id: contentElementId,
        value: value || '',
        element_value: actualValue || '',
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
        id,
        type: 'location',
        key: contentKey,
        element_id: contentElementId,
        value: null,
        element_value: actualValue || '',
        metadata: {
          ...textMetadata,
          city: metadata.city || '',
          date_format: metadata.date_format || 'DD/MM/YYYY',
        },
      };
    }

    if (type === 'participant_name') {
      return {
        id,
        type: 'participant_name',
        key: contentKey,
        element_id: contentElementId,
        value: null,
        element_value: actualValue || '',
        metadata: textMetadata,
      };
    }

    if (type === 'nik') {
      return {
        id,
        type: 'nik',
        key: contentKey,
        element_id: contentElementId,
        value: null,
        element_value: actualValue || '',
        metadata: textMetadata,
      };
    }

    if (type === 'title') {
      return {
        id,
        type: 'title',
        key: contentKey,
        element_id: contentElementId,
        value: null,
        element_value: actualValue || '',
        metadata: textMetadata,
      };
    }

    if (type === 'valid_thru') {
      return {
        id,
        type: 'valid_thru',
        key: contentKey,
        element_id: contentElementId,
        value: null,
        element_value: actualValue || '',
        metadata: textMetadata,
      };
    }

    return {
      id,
      type: 'text',
      key: contentKey,
      element_id: contentElementId,
      value: null,
      element_value: actualValue || '',
      metadata: textMetadata,
    };
  }

  function bringForward(key: string): void {
    const index = contents.value.findIndex(c => c.key === key);
    if (index === -1 || index >= contents.value.length - 1) {
      return;
    }

    const updatedContents = [...contents.value];
    const temp = updatedContents[index];
    updatedContents[index] = updatedContents[index + 1];
    updatedContents[index + 1] = temp;
    contents.value = updatedContents;
  }

  function sendBackward(key: string): void {
    const index = contents.value.findIndex(c => c.key === key);
    if (index <= 0) {
      return;
    }

    const updatedContents = [...contents.value];
    const temp = updatedContents[index];
    updatedContents[index] = updatedContents[index - 1];
    updatedContents[index - 1] = temp;
    contents.value = updatedContents;
  }

  function bringToFront(key: string): void {
    const index = contents.value.findIndex(c => c.key === key);
    if (index === -1 || index >= contents.value.length - 1) {
      return;
    }

    const updatedContents = [...contents.value];
    const [element] = updatedContents.splice(index, 1);
    updatedContents.push(element);
    contents.value = updatedContents;
  }

  function sendToBack(key: string): void {
    const index = contents.value.findIndex(c => c.key === key);
    if (index <= 0) {
      return;
    }

    const updatedContents = [...contents.value];
    const [element] = updatedContents.splice(index, 1);
    updatedContents.unshift(element);
    contents.value = updatedContents;
  }

  function alignContent(key: string, type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void {
    const index = contents.value.findIndex(c => c.element_id === key);
    if (index === -1) {
      return;
    }

    const content = contents.value[index];

    // Calculate safe zone dimensions
    const safeZoneLeft = safe_zone.value?.left || 0;
    const safeZoneRight = safe_zone.value?.right || 0;
    const safeZoneTop = safe_zone.value?.top || 0;
    const safeZoneBottom = safe_zone.value?.bottom || 0;

    // Safe zone width and height (the actual usable area)
    const safeZoneWidth = CANVAS_WIDTH - safeZoneLeft - safeZoneRight;
    const safeZoneHeight = CANVAS_HEIGHT - safeZoneTop - safeZoneBottom;

    // Determine element dimensions based on content type and mode
    const metadata = content.metadata;
    const widthMode = (metadata as any).width_mode;
    const heightMode = (metadata as any).height_mode;

    // For fill mode or fit-content, we can't do center/right or middle/bottom alignment
    if (widthMode === 'fill' && (type === 'center' || type === 'right')) {
      return;
    }
    if (heightMode === 'fill' && (type === 'middle' || type === 'bottom')) {
      return;
    }
    if (metadata.width === 'fit-content' && (type === 'center' || type === 'right')) {
      return;
    }
    if (metadata.height === 'fit-content' && (type === 'middle' || type === 'bottom')) {
      return;
    }

    const elementWidth = typeof metadata.width === 'number' ? metadata.width : 0;
    const elementHeight = typeof metadata.height === 'number' ? metadata.height : 0;

    const updatedContents = [...contents.value];
    const updatedMetadata = { ...metadata };

    // Positions are RELATIVE to safe zone (0,0 is top-left of safe zone, not canvas)
    switch (type) {
      case 'left':
        updatedMetadata.horizontal = 0;
        break;
      case 'center':
        updatedMetadata.horizontal = Math.max(0, (safeZoneWidth - elementWidth) / 2);
        break;
      case 'right':
        updatedMetadata.horizontal = Math.max(0, safeZoneWidth - elementWidth);
        break;
      case 'top':
        updatedMetadata.vertical = 0;
        break;
      case 'middle':
        updatedMetadata.vertical = Math.max(0, (safeZoneHeight - elementHeight) / 2);
        break;
      case 'bottom':
        updatedMetadata.vertical = Math.max(0, safeZoneHeight - elementHeight);
        break;
      default:
        return;
    }

    updatedContents[index] = {
      ...content,
      metadata: updatedMetadata,
    } as CertificateContentForm;
    contents.value = updatedContents;
  }

  function duplicateContent(key: string): void {
    const index = contents.value.findIndex(c => c.element_id === key);
    if (index === -1) {
      return;
    }

    const originalContent = contents.value[index];
    contentIdCounter.value++;
    const newElementId = generateContentKey(originalContent.type, contentIdCounter.value);

    const clonedContent: CertificateContentForm = JSON.parse(JSON.stringify(originalContent));
    clonedContent.element_id = newElementId;
    clonedContent.id = undefined;
    clonedContent.metadata.horizontal += 10;
    clonedContent.metadata.vertical += 10;

    contents.value = [...contents.value, clonedContent];
    selectedContentKey.value = newElementId;
  }

  function toggleLock(key: string): void {
    const index = contents.value.findIndex(c => c.key === key);
    if (index === -1) {
      return;
    }

    const content = contents.value[index];
    const updatedContents = [...contents.value];
    updatedContents[index] = {
      ...content,
      metadata: {
        ...content.metadata,
        isLocked: !content.metadata.isLocked,
      },
    } as CertificateContentForm;
    contents.value = updatedContents;
  }

  /**
   * Reorder contents array (for drag-and-drop layer ordering)
   * @param newContents - The reordered contents array
   */
  function reorderContents(newContents: CertificateContentForm[]): void {
    contents.value = newContents;
  }

  const $resetAll = () => {
    resetForm();
    detailCertificate.value = undefined;
    certificateResponse.value = undefined;
    contentIdCounter.value = 0;
    selectedContentKey.value = null;
    uploadedBackgroundMeta.value = null;
    deletedContents.value = [];
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
    deletedContents,

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
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    alignContent,
    duplicateContent,
    toggleLock,
    reorderContents,
  };
});
