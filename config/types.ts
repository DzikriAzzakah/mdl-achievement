// ==========================================
// 1. COMMON / SHARED TYPES
// ==========================================

export interface ISelectedFilter {
  label: string;
  value: string;
}

// Generic API Response Wrapper
export interface IApiResponse<T = any> {
  success?: boolean;
  message?: string;
  status_code?: number;
  client_code?: string;
  server_code?: string;
  data?: T;
}

// Pagination Structure
export interface IPagination {
  total_pages: number;
  per_page: number;
  current_page: number;
  total_data: number;
  end_of_page: boolean;
}

export interface IUploadedFile {
  id: string;
  filename: string;
  extension: string;
  size?: number;
  link: string;
  isLoading: boolean;
}

// Base structure for Image Metadata (Used in Uploads, Backgrounds, Previews)
export interface IImageFileMetadata {
  id?: number;
  image_host?: string;
  full_path?: string;
  file_path?: string;
  file_name?: string;
  file_mime?: string;
  folder?: string;
  original_file_name?: string;
}

export interface ICertificateNumberVariable {
  id: string;
  type: string;
  label: string;
  value: string;
  customValue?: string;
  uuid?: string;
}

// ==========================================
// 2. CONTENT METADATA HIERARCHY
// ==========================================

export type SizeMode = 'fix' | 'fill' | 'hug';

// Base Metadata for all content types
export interface IContentMetadataBase {
  vertical: number;
  horizontal: number;
  width: number | 'fit-content';
  height: number | 'fit-content';
  width_mode?: SizeMode;
  height_mode?: SizeMode;
  isAspectRatioLocked?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
}

// Metadata for Image-based content
export interface ICertificateContentImageMetadata extends IContentMetadataBase {
  originalWidth?: number;
  originalHeight?: number;
}

// Metadata for Text-based content
export interface ICertificateContentTextMetadata extends IContentMetadataBase {
  color: string;
  alignment: ISelectedFilter; // Reused {label, value}
  font_size: number;
  font_weight: number;
  font_family: string;
  date_format?: string; // Optional because not all text needs date
  city?: string; // Optional, specific to location
}

// Metadata for QR Code
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

// ==========================================
// 3. CERTIFICATE CONTENT FORMS
// ==========================================

// Base Content Form Interface (Generic)
interface IBaseContentForm<TType extends string, TMetadata> {
  id?: number;
  key: string;
  element_id: string;
  type: TType;
  value: string | null;
  element_value: string | null;
  metadata: TMetadata;
}

// Specific Content Types
export interface ICertificateContentImageForm extends IBaseContentForm<'image' | 'sertificate_signee', ICertificateContentImageMetadata> {
  file?: File | null;
}

export interface ICertificateContentTextForm extends IBaseContentForm<
  'text' | 'participant_name' | 'nik' | 'title' | 'valid_thru',
  ICertificateContentTextMetadata
> {
  element_value: string; // Override to be strictly string if needed
  variables?: ICertificateNumberVariable[]; // Only some text fields have variables, but optional is safe
}

export interface ICertificateContentCertificateNumberForm extends IBaseContentForm<'certificate_number', ICertificateContentTextMetadata> {
  element_value: string;
  variables?: ICertificateNumberVariable[];
}

export interface ICertificateContentLocationForm extends IBaseContentForm<'location', ICertificateContentTextMetadata> {
  element_value: string;
  // Location uses TextMetadata but relies on specific fields like `city`
}

export interface ICertificateContentQRCodeForm extends IBaseContentForm<'qr_code', ICertificateContentQRCodeMetadata> {
  element_value: string;
}

// Discriminated Union for all Content Forms
export type ICertificateContentForm =
  | ICertificateContentImageForm
  | ICertificateContentTextForm
  | ICertificateContentCertificateNumberForm
  | ICertificateContentLocationForm
  | ICertificateContentQRCodeForm;

// ==========================================
// 4. ENTITY PAYLOADS & RESPONSES
// ==========================================

// --- Shared Entity Properties ---
interface IEntityBase {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ICreatorInfo {
  created_by_id?: number | string;
  created_by_full_name?: string;
}

// --- Badge Types ---
export interface IBadgePayload {
  title: string;
  description: string;
  image_id: number;
}

export interface IBadgeForm extends Omit<IBadgePayload, 'image_id'> {
  image: File | string | null;
}

export interface IBadge extends IEntityBase {
  accessibility: string;
  creator: string;
}

export interface IBadgeDetail extends Omit<IBadge, 'creator' | 'accessibility'>, ICreatorInfo {
  description?: string;
  type?: string;
  url?: string;
  image_url?: string;
  is_delete?: boolean;
}

// --- Certificate Types ---

export interface ICertificateSafeZone {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ICertificate extends IEntityBase {
  certificate_type: ISelectedFilter;
  accessibility: string;
  creator: string;
}

export interface ICertificateForm {
  title: string;
  certificate_type: ISelectedFilter;
  image: File | string | null;
  contents: ICertificateContentForm[];
  safe_zone: ICertificateSafeZone;
}

// Consolidating Payload Metadata (Flattened for API)
export interface ICertificateContentMetadataPayload extends Partial<ICertificateContentTextMetadata>, Partial<ICertificateContentImageMetadata>, Partial<ICertificateContentQRCodeMetadata> {
  // Explicitly adding upload fields which might not be in the Base Metadata classes
  image_host?: string;
  full_path?: string;
  file_path?: string;
  file_name?: string;
  file_mime?: string;
  folder?: string;
  original_file_name?: string;
}

export interface ICertificateContentPayload {
  id?: number;
  deleted?: boolean;
  type: string;
  key: string;
  element_id: string;
  value: string | null;
  element_value: string | null;
  metadata: ICertificateContentMetadataPayload;
  variables?: ICertificateNumberVariable[];
}

export interface ICertificateCreatePayload {
  title: string;
  type: string;
  status: string;
  background: IImageFileMetadata;
  preview: IImageFileMetadata;
  template: string;
  metadata: {
    safe_zone: ICertificateSafeZone;
    canvas_width: number;
    canvas_height: number;
  };
  contents: ICertificateContentPayload[];
}

export interface ICertificateDetailResponseData extends Omit<ICertificateCreatePayload, 'preview'> {
  id: number;
  preview_url?: string;
}

// ==========================================
// 5. HELPER TYPES & GUARDS
// ==========================================

export type ContentTextField = 'size' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'alignment' | 'fontColor' | 'vertical' | 'horizontal';

export interface IContentTypeConfig {
  title: string;
  icon: string;
  fields: ContentTextField[];
  isSource: boolean;
  hasCustomFields: boolean;
}

// Type Guards (Simplified)
export function isLocationContent(content: ICertificateContentForm): content is ICertificateContentLocationForm {
  return content.type === 'location';
}

export function isCertificateNumberContent(content: ICertificateContentForm): content is ICertificateContentCertificateNumberForm {
  return content.type === 'certificate_number';
}

export function isQRCodeContent(content: ICertificateContentForm): content is ICertificateContentQRCodeForm {
  return content.type === 'qr_code';
}

export function isTextBasedContent(content: ICertificateContentForm): content is ICertificateContentTextForm | ICertificateContentLocationForm {
  const textTypes = ['text', 'certificate_number', 'location', 'participant_name', 'nik', 'title', 'valid_thru'];
  return textTypes.includes(content.type);
}

// ==========================================
// 6. SPECIFIC API RESPONSES
// ==========================================

export type IGetListResponse = IApiResponse<{
  contents?: any[];
  pagination?: IPagination;
}>;

export type ICreateResponse = IApiResponse<any>;
export type IAchievementUploadResponse = IApiResponse<IImageFileMetadata>;
export type IBadgeDetailResponse = IApiResponse<Pick<IBadgeDetail, 'id' | 'title' | 'type' | 'url'>>;
export type ICertificateDetailResponse = IApiResponse<ICertificateDetailResponseData>;
export type IUUIDResponse = IApiResponse<{ uuid: string; }>;
