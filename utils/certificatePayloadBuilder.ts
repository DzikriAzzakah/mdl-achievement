import type {
  IAchievementUploadResponse,
  ICertificateBackgroundPayload,
  ICertificateContentForm,
  ICertificateContentPayload,
  ICertificateCreatePayload,
  ICertificateMetadataPayload,
  ICertificatePreviewPayload,
  ICertificateSafeZone,
} from '#achievement/config/types';

// Re-export types for backward compatibility
export type {
  ICertificateBackgroundPayload,
  ICertificateContentPayload,
  ICertificateCreatePayload,
  ICertificateMetadataPayload,
  ICertificatePreviewPayload,
} from '#achievement/config/types';

export interface ICertificateContentMetadataPayload {
  width: number | 'fit-content';
  height: number | 'fit-content';
  vertical: number;
  horizontal: number;
  // For image types - upload metadata
  id?: number;
  original_width?: number;
  original_height?: number;
  image_host?: string;
  full_path?: string;
  file_path?: string;
  file_name?: string;
  file_mime?: string;
  folder?: string;
  original_file_name?: string;
  // For text types
  font_family?: string;
  font_size?: number;
  font_weight?: number;
  alignment?: { label: string; value: string; };
  color?: string;
  // For location type
  location?: string;
  date_format?: string;
  // For QR Code type
  background_color?: string;
  background_transparent?: boolean;
  shape?: string;
  shape_color?: string;
  border_style?: string;
  border_color?: string;
  // Common
  width_mode?: string;
  height_mode?: string;
  isAspectRatioLocked?: boolean;
}

export function buildBackgroundPayload(
  uploadedMeta?: IAchievementUploadResponse['data'] | null,
): ICertificateBackgroundPayload {
  if (uploadedMeta) {
    return {
      id: uploadedMeta.id,
      image_host: uploadedMeta.image_host,
      full_path: uploadedMeta.full_path,
      file_path: uploadedMeta.file_path,
      file_name: uploadedMeta.file_name,
      file_mime: uploadedMeta.file_mime,
      folder: uploadedMeta.folder,
      original_file_name: uploadedMeta.original_file_name,
    };
  }

  return {};
}

export function buildPreviewPayload(
  uploadedMeta?: IAchievementUploadResponse['data'] | null,
): ICertificatePreviewPayload {
  if (uploadedMeta) {
    return {
      id: uploadedMeta.id,
      image_host: uploadedMeta.image_host,
      full_path: uploadedMeta.full_path,
      file_path: uploadedMeta.file_path,
      file_name: uploadedMeta.file_name,
      file_mime: uploadedMeta.file_mime,
      folder: uploadedMeta.folder,
      original_file_name: uploadedMeta.original_file_name,
    };
  }

  return {};
}

export function buildMetadataPayload(safeZone: ICertificateSafeZone): ICertificateMetadataPayload {
  return {
    safe_zone: { ...safeZone },
    canvas_width: 842,
    canvas_height: 595,
  };
}

export function buildContentPayload(
  content: ICertificateContentForm,
  uploadedImageUrl?: string | null,
  uploadedImageMeta?: IAchievementUploadResponse['data'] | null,
): ICertificateContentPayload {
  const basePayload: ICertificateContentPayload = {
    type: content.type,
    key: content.key,
    value: uploadedImageUrl || content.value,
    metadata: {
      width: content.metadata.width,
      height: content.metadata.height,
      vertical: content.metadata.vertical || 0,
      horizontal: content.metadata.horizontal || 0,
      width_mode: content.metadata.width_mode,
      height_mode: content.metadata.height_mode,
      isAspectRatioLocked: content.metadata.isAspectRatioLocked,
    },
  };

  if (content.type === 'image' || content.type === 'sertificate_signee') {
    const imageMetadata = content.metadata as { originalWidth?: number; originalHeight?: number; };
    basePayload.metadata.original_width = imageMetadata.originalWidth;
    basePayload.metadata.original_height = imageMetadata.originalHeight;

    if (uploadedImageMeta) {
      basePayload.metadata.id = uploadedImageMeta.id;
      basePayload.metadata.image_host = uploadedImageMeta.image_host;
      basePayload.metadata.full_path = uploadedImageMeta.full_path;
      basePayload.metadata.file_path = uploadedImageMeta.file_path;
      basePayload.metadata.file_name = uploadedImageMeta.file_name;
      basePayload.metadata.file_mime = uploadedImageMeta.file_mime;
      basePayload.metadata.folder = uploadedImageMeta.folder;
      basePayload.metadata.original_file_name = uploadedImageMeta.original_file_name;
    }
  }

  if (content.type === 'qr_code') {
    const qrMetadata = content.metadata as {
      background_color?: string;
      background_transparent?: boolean;
      shape?: string;
      shape_color?: string;
      border_style?: string;
      border_color?: string;
    };
    basePayload.metadata.background_color = qrMetadata.background_color;
    basePayload.metadata.background_transparent = qrMetadata.background_transparent;
    basePayload.metadata.shape = qrMetadata.shape;
    basePayload.metadata.shape_color = qrMetadata.shape_color;
    basePayload.metadata.border_style = qrMetadata.border_style;
    basePayload.metadata.border_color = qrMetadata.border_color;
  }

  if (isTextBasedContent(content.type)) {
    const textMetadata = content.metadata as {
      font_family?: string;
      font_size?: number;
      font_weight?: number;
      alignment?: { label: string; value: string; };
      color?: string;
    };

    basePayload.metadata.font_family = textMetadata.font_family;
    basePayload.metadata.font_size = textMetadata.font_size;
    basePayload.metadata.font_weight = textMetadata.font_weight;
    basePayload.metadata.alignment = textMetadata.alignment;
    basePayload.metadata.color = textMetadata.color;
  }

  if (content.type === 'location') {
    const locationMetadata = content.metadata as {
      location?: string;
      date_format?: string;
    };
    basePayload.metadata.location = locationMetadata.location;
    basePayload.metadata.date_format = locationMetadata.date_format;
  }

  if (content.type === 'certificate_number') {
    const certNumContent = content as {
      variables?: Array<{
        id: string;
        type: string;
        label: string;
        value: string;
        customValue?: string;
      }>;
    };
    if (certNumContent.variables) {
      basePayload.variables = certNumContent.variables;
    }
  }

  return basePayload;
}

export function buildCertificateCreatePayload(options: {
  title: string;
  certificateType: string;
  backgroundMeta?: IAchievementUploadResponse['data'] | null;
  previewMeta?: IAchievementUploadResponse['data'] | null;
  template: string;
  safeZone: ICertificateSafeZone;
  contents: ICertificateContentPayload[];
  status?: string;
}): ICertificateCreatePayload {
  const {
    title,
    certificateType,
    backgroundMeta,
    previewMeta,
    template,
    safeZone,
    contents,
    status = 'published',
  } = options;

  return {
    title,
    type: certificateType,
    status,
    background: buildBackgroundPayload(backgroundMeta),
    preview: buildPreviewPayload(previewMeta),
    template,
    metadata: buildMetadataPayload(safeZone),
    contents,
  };
}

function isTextBasedContent(type: string): boolean {
  return ['text', 'certificate_number', 'location', 'fullname', 'employee_id', 'event_title', 'valid_thru'].includes(type);
}
