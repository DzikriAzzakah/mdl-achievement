export interface ISelectedFilter {
  label: string;
  value: string;
}

export interface IFilterAchievement {
  certificateType?: ISelectedFilter[];
  accessibility?: ISelectedFilter[];
  created?: string;
  lastUpdate?: string;
}

export interface IUploadedFile {
  id: string;
  filename: string;
  extension: string;
  size?: number;
  link: string;
  isLoading: boolean;
}

export interface IUploadedImageMetadata {
  image_host?: string;
  full_path?: string;
  file_path?: string;
  file_name?: string;
  file_mime?: string;
  folder?: string;
  original_file_name?: string;
}

export interface IBadgePayload {
  title: string;
  description: string;
  url: string;
}

export interface ICertificate {
  id: number;
  title: string;
  certificate_type: { label: string; value: string; };
  accessibility: string;
  creator: string;
  created_at: string;
  updated_at: string;
}

interface IContentMetadataBase {
  vertical: number;
  width: number;
  height: number;
  horizontal: number;
  isAspectRatioLocked?: boolean;
  width_mode?: SizeMode;
  height_mode?: SizeMode;
}

export type SizeMode = 'fix' | 'fill' | 'hug';

export interface ICertificateContentImageMetadata extends IContentMetadataBase {
  originalWidth?: number;
  originalHeight?: number;
}

export interface ICertificateContentTextMetadata extends IContentMetadataBase {
  color: string;
  alignment: { label: string; value: string; };
  date_format?: string;
  font_size: number;
  font_weight: number;
  font_family: string;
}

export interface ICertificateContentLocationMetadata extends ICertificateContentTextMetadata {
  location: string;
  date_format: string;
}

export interface ICertificateSafeZone {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type QRCodeShape = 'dots' | 'square';
export type QRCodeBorderStyle = 'square' | 'rounded';

export interface ICertificateContentQRCodeMetadata extends IContentMetadataBase {
  background_color: string;
  background_transparent: boolean;
  shape: QRCodeShape;
  shape_color: string;
  border_style: QRCodeBorderStyle;
  border_color: string;
}

export interface ICertificateNumberVariable {
  id: string;
  type: string;
  label: string;
  value: string;
  customValue?: string;
  uuid?: string; // UUID for serial_number type
}

export interface ICertificateContentImageForm {
  type: 'image';
  key: string;
  value: string | null;
  metadata: ICertificateContentImageMetadata;
  file?: File | null;
}

export interface ICertificateContentTextForm {
  type: 'text';
  key: string;
  value: string;
  metadata: ICertificateContentTextMetadata;
}

export interface ICertificateContentCertificateNumberForm {
  type: 'certificate_number';
  key: string;
  value: string;
  metadata: ICertificateContentTextMetadata;
  variables?: ICertificateNumberVariable[];
}

export interface ICertificateContentLocationForm {
  type: 'location';
  key: string;
  value: string;
  metadata: ICertificateContentLocationMetadata;
}

export interface ICertificateContentFullNameForm {
  type: 'fullname';
  key: string;
  value: string;
  metadata: ICertificateContentTextMetadata;
}

export interface ICertificateContentEmployeeIdForm {
  type: 'employee_id';
  key: string;
  value: string;
  metadata: ICertificateContentTextMetadata;
}

export interface ICertificateContentEventTitleForm {
  type: 'event_title';
  key: string;
  value: string;
  metadata: ICertificateContentTextMetadata;
}

export interface ICertificateContentValidThruForm {
  type: 'valid_thru';
  key: string;
  value: string;
  metadata: ICertificateContentTextMetadata;
}

export interface ICertificateContentCertificateSigneeForm {
  type: 'sertificate_signee';
  key: string;
  value: string | null;
  metadata: ICertificateContentImageMetadata;
  file?: File | null;
}

export interface ICertificateContentQRCodeForm {
  type: 'qr_code';
  key: string;
  value: string;
  metadata: ICertificateContentQRCodeMetadata;
}

export type ContentTextField = 'size' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'alignment' | 'fontColor' | 'vertical' | 'horizontal';

export interface IContentTypeConfig {
  title: string;
  icon: string;
  fields: ContentTextField[];
  isSource: boolean;
  hasCustomFields: boolean;
}

export const CONTENT_TYPE_CONFIGS: Record<string, IContentTypeConfig> = {
  text: {
    title: 'Text',
    icon: 'material-symbols:text-fields-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor'],
    isSource: false,
    hasCustomFields: false,
  },
  certificate_number: {
    title: 'Certificate Number',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: true,
  },
  fullname: {
    title: 'Full Name',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: false,
  },
  employee_id: {
    title: 'Employee ID',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: false,
  },
  event_title: {
    title: 'Event Title',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: false,
  },
  location: {
    title: 'Location',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: true,
  },
  valid_thru: {
    title: 'Valid Thru',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: false,
  },
};


export function isLocationContent(content: ICertificateContentForm): content is ICertificateContentLocationForm {
  return content.type === 'location';
}

export function isCertificateNumberContent(content: ICertificateContentForm): content is ICertificateContentCertificateNumberForm {
  return content.type === 'certificate_number';
}

export function isQRCodeContent(content: ICertificateContentForm): content is ICertificateContentQRCodeForm {
  return content.type === 'qr_code';
}

export function isTextBasedContent(
  content: ICertificateContentForm,
): content is
| ICertificateContentTextForm
| ICertificateContentCertificateNumberForm
| ICertificateContentLocationForm
| ICertificateContentFullNameForm
| ICertificateContentEmployeeIdForm
| ICertificateContentEventTitleForm
| ICertificateContentValidThruForm {
  return ['text', 'certificate_number', 'location', 'fullname', 'employee_id', 'event_title', 'valid_thru'].includes(content.type);
}

export type ICertificateContentForm =
  | ICertificateContentImageForm
  | ICertificateContentTextForm
  | ICertificateContentCertificateNumberForm
  | ICertificateContentLocationForm
  | ICertificateContentFullNameForm
  | ICertificateContentEmployeeIdForm
  | ICertificateContentEventTitleForm
  | ICertificateContentValidThruForm
  | ICertificateContentCertificateSigneeForm
  | ICertificateContentQRCodeForm;

export interface ICertificateForm {
  title: string;
  description: string;
  certificate_type: { label: string; value: string; };
  image: File | string | null;
  contents: ICertificateContentForm[];
  safe_zone: ICertificateSafeZone;
}

export interface ICertificateDetail {
  id: number;
  title: string;
  description?: string;
  certificate_type: { label: string; value: string; };
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  created_by_id?: number | string;
  created_by_full_name?: string;
  is_delete?: boolean;
}

export interface ICertificateResponse {
  id: number;
  title?: string;
  certificate_type?: { label: string; value: string; };
  image_url?: string;
}

export interface IBadge {
  id: number;
  title: string;
  accessibility: string;
  creator: string;
  created_at: string;
  updated_at: string;
}

export interface ISortData {
  key: string;
  type: string;
}

export interface IBadgeForm {
  title: string;
  description: string;
  image: File | string | null;
}

export interface IBadgeDetail {
  id: number;
  title: string;
  description?: string;
  type?: string;
  url?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  created_by_id?: number | string;
  created_by_full_name?: string;
  is_delete?: boolean;
}

export interface IBadgeResponse {
  id: number;
  title?: string;
  image_url?: string;
}

export interface IGetListResponse {
  success?: boolean;
  message?: string;
  data?: {
    contents?: any[];
    pagination?: {
      total_pages: number;
      per_page: number;
      current_page: number;
      total_data: number;
      end_of_page: boolean;
    };
    [key: string]: any;
  };
}

export interface ICreateResponse {
  success?: boolean;
  message?: string;
  data?: any;
  status_code?: number;
}

export interface IAchievementUploadResponse {
  success?: boolean;
  message?: string;
  status_code?: number;
  client_code?: string;
  server_code?: string;
  data?: {
    id?: number;
    image_host?: string;
    full_path?: string;
    file_path?: string;
    file_name?: string;
    file_mime?: string;
    folder?: string;
    original_file_name?: string;
  };
}

export interface FetchOptions {
  headers?: Record<string, string>;
  timeout?: number;
  [key: string]: any;
}
