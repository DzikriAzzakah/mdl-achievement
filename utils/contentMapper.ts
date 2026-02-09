import type {
  CertificateContentForm,
  CertificateContentPayload,
  QRCodeBorderStyle,
  QRCodeShape,
  SizeMode,
} from '#achievement/config/types';
import { CertificateContentType } from '#achievement/config/constants';
import { generateContentKey } from '#achievement/utils/contentFactory';

export function mapContentPayloadToForm(content: CertificateContentPayload, index: number): CertificateContentForm {
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

  if (type === CertificateContentType.IMAGE) {
    return {
      id,
      type: CertificateContentType.IMAGE,
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

  if (type === CertificateContentType.CERTIFICATE_SIGNEE) {
    return {
      id,
      type: CertificateContentType.CERTIFICATE_SIGNEE,
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

  if (type === CertificateContentType.QR_CODE) {
    return {
      id,
      type: CertificateContentType.QR_CODE,
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

  if (type === CertificateContentType.CERTIFICATE_NUMBER) {
    return {
      id,
      type: CertificateContentType.CERTIFICATE_NUMBER,
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

  if (type === CertificateContentType.CITY) {
    return {
      id,
      type: CertificateContentType.CITY,
      key: contentKey,
      element_id: contentElementId,
      value: null,
      element_value: actualValue || '',
      metadata: textMetadata,
    };
  }

  if (type === CertificateContentType.DATE) {
    return {
      id,
      type: CertificateContentType.DATE,
      key: contentKey,
      element_id: contentElementId,
      value: null,
      element_value: actualValue || '',
      metadata: {
        ...textMetadata,
        format: metadata.format || 'DD/MM/YYYY',
      },
    };
  }

  if (type === CertificateContentType.PARTICIPANT_NAME) {
    return {
      id,
      type: CertificateContentType.PARTICIPANT_NAME,
      key: contentKey,
      element_id: contentElementId,
      value: null,
      element_value: actualValue || '',
      metadata: textMetadata,
    };
  }

  if (type === CertificateContentType.MODULE_TYPE) {
    return {
      id,
      type: CertificateContentType.MODULE_TYPE,
      key: contentKey,
      element_id: contentElementId,
      value: null,
      element_value: actualValue || '',
      metadata: textMetadata,
    };
  }

  if (type === CertificateContentType.NIK) {
    return {
      id,
      type: CertificateContentType.NIK,
      key: contentKey,
      element_id: contentElementId,
      value: null,
      element_value: actualValue || '',
      metadata: textMetadata,
    };
  }

  if (type === CertificateContentType.TITLE) {
    return {
      id,
      type: CertificateContentType.TITLE,
      key: contentKey,
      element_id: contentElementId,
      value: null,
      element_value: actualValue || '',
      metadata: textMetadata,
    };
  }

  if (type === CertificateContentType.VALID_THRU) {
    return {
      id,
      type: CertificateContentType.VALID_THRU,
      key: contentKey,
      element_id: contentElementId,
      value: null,
      element_value: actualValue || '',
      metadata: textMetadata,
    };
  }

  return {
    id,
    type: CertificateContentType.TEXT,
    key: contentKey,
    element_id: contentElementId,
    value: null,
    element_value: actualValue || '',
    metadata: textMetadata,
  };
}
