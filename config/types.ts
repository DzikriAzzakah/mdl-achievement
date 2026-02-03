export interface SelectOption<T = string> {
  readonly label: string;
  readonly value: T;
}

export interface ApiResponse<T = unknown> {
  readonly success?: boolean;
  readonly message?: string;
  readonly status_code?: number;
  readonly client_code?: string;
  readonly server_code?: string;
  readonly data?: T;
}

export interface PaginationMeta {
  readonly total_pages: number;
  readonly per_page: number;
  readonly current_page: number;
  readonly total_data: number;
  readonly end_of_page: boolean;
}

export interface UploadedFileMeta {
  readonly id?: number;
  readonly image_host?: string;
  readonly full_path?: string;
  readonly file_path?: string;
  readonly file_name?: string;
  readonly file_mime?: string;
  readonly folder?: string;
  readonly original_file_name?: string;
}

export interface AchievementFilter {
  readonly certificateType?: readonly SelectOption[];
  readonly accessibility?: readonly SelectOption[];
  readonly created?: string;
  readonly lastUpdate?: string;
}

export interface UploadedFile {
  readonly id: string;
  readonly filename: string;
  readonly extension: string;
  readonly size?: number;
  readonly link: string;
  readonly isLoading: boolean;
}

export interface BadgePayload {
  readonly title: string;
  readonly description: string;
  readonly image_id: number;
}

export interface Badge {
  readonly id: number;
  readonly title: string;
  readonly accessibility: string;
  readonly creator: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface BadgeDetail {
  readonly id: number;
  readonly title: string;
  readonly description?: string;
  readonly type?: string;
  readonly url?: string;
  readonly image_url?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly created_by_id?: number | string;
  readonly created_by_full_name?: string;
  readonly is_delete?: boolean;
}

export interface BadgeForm {
  title: string;
  description: string;
  image: File | string | null;
}

export interface BadgeResponse {
  readonly id: number;
  readonly title?: string;
  readonly image_url?: string;
}

export interface Certificate {
  readonly id: number;
  readonly title: string;
  readonly certificate_type: SelectOption;
  readonly accessibility: string;
  readonly creator: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface CertificateDetail {
  readonly id: number;
  readonly title: string;
  readonly certificate_type: SelectOption;
  readonly image_url?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly created_by_id?: number | string;
  readonly created_by_full_name?: string;
  readonly is_delete?: boolean;
}

export interface CertificateResponse {
  readonly id: number;
  readonly title?: string;
  readonly certificate_type?: SelectOption;
  readonly image_url?: string;
}

export type SizeMode = 'fix' | 'fill' | 'hug';

export interface SafeZone {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface ContentMetadataBase {
  vertical: number;
  horizontal: number;
  width: number | string;
  height: number | string;
  width_mode?: SizeMode;
  height_mode?: SizeMode;
  isAspectRatioLocked?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
}

export interface ImageContentMetadata extends ContentMetadataBase {
  originalWidth?: number;
  originalHeight?: number;
}

export interface TextContentMetadata extends ContentMetadataBase {
  color: string;
  alignment: SelectOption;
  font_size: number;
  font_weight: number;
  font_family: string;
}

export interface LocationContentMetadata extends TextContentMetadata {
  city: string;
  date_format: string;
}

export type QRCodeShape = 'dots' | 'square';

export type QRCodeBorderStyle = 'square' | 'rounded';

export interface QRCodeContentMetadata extends ContentMetadataBase {
  background_color: string;
  background_transparent: boolean;
  shape: QRCodeShape;
  shape_color: string;
  border_style: QRCodeBorderStyle;
  border_color: string;
}

export interface CertificateNumberVariable {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly value: string;
  customValue?: string;
  uuid?: string;
}

interface ContentFormBase<TType extends string, TMeta> {
  id?: number;
  readonly type: TType;
  readonly key: string;
  element_id: string;
  value: string | null;
  element_value: string | null;
  metadata: TMeta;
}

export interface ImageContentForm extends ContentFormBase<'image', ImageContentMetadata> {
  file?: File | null;
}

export interface TextContentForm extends ContentFormBase<'text', TextContentMetadata> {
  variables?: CertificateNumberVariable[];
}

export interface CertificateNumberContentForm extends ContentFormBase<'certificate_number', TextContentMetadata> {
  variables?: CertificateNumberVariable[];
}

export interface LocationContentForm extends ContentFormBase<'location', LocationContentMetadata> {
  element_value: string;
}

export interface ParticipantNameContentForm extends ContentFormBase<'participant_name', TextContentMetadata> {
  element_value: string;
}

export interface NIKContentForm extends ContentFormBase<'nik', TextContentMetadata> {
  element_value: string;
}

export interface EventTitleContentForm extends ContentFormBase<'title', TextContentMetadata> {
  element_value: string;
}

export interface ValidThruContentForm extends ContentFormBase<'valid_thru', TextContentMetadata> {
  element_value: string;
}

export interface CertificateSigneeContentForm extends ContentFormBase<'sertificate_signee', ImageContentMetadata> {
  file?: File | null;
}

export interface QRCodeContentForm extends ContentFormBase<'qr_code', QRCodeContentMetadata> {
  value: string;
  element_value: string;
}

export type CertificateContentForm =
  | ImageContentForm
  | TextContentForm
  | CertificateNumberContentForm
  | LocationContentForm
  | ParticipantNameContentForm
  | NIKContentForm
  | EventTitleContentForm
  | ValidThruContentForm
  | CertificateSigneeContentForm
  | QRCodeContentForm;

export type ContentTextField = 'size' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'alignment' | 'fontColor' | 'vertical' | 'horizontal';

export interface ContentTypeConfig {
  readonly title: string;
  readonly icon: string;
  readonly fields: readonly ContentTextField[];
  readonly isSource: boolean;
  readonly hasCustomFields: boolean;
}

export interface CertificateForm {
  title: string;
  certificate_type: SelectOption;
  image: File | string | null;
  contents: CertificateContentForm[];
  safe_zone: SafeZone;
}

export interface CertificateContentMetadataPayload {
  width: number | string;
  height: number | string;
  vertical: number;
  horizontal: number;
  width_mode?: string;
  height_mode?: string;
  isAspectRatioLocked?: boolean;
  // Image-specific
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
  // Text-specific
  font_family?: string;
  font_size?: number;
  font_weight?: number;
  alignment?: SelectOption;
  color?: string;
  // Location-specific
  city?: string;
  date_format?: string;
  // QR Code-specific
  background_color?: string;
  background_transparent?: boolean;
  shape?: string;
  shape_color?: string;
  border_style?: string;
  border_color?: string;
}

export interface CertificateContentPayload {
  id?: number;
  deleted?: boolean;
  readonly type: string;
  readonly key: string;
  element_id: string;
  value: string | null;
  element_value: string | null;
  metadata: CertificateContentMetadataPayload;
  variables?: readonly {
    readonly id: string;
    readonly type: string;
    readonly label: string;
    readonly value: string;
    customValue?: string;
  }[];
}

export interface CertificateMetadataPayload {
  safe_zone: SafeZone;
  canvas_width: number;
  canvas_height: number;
}

export interface CertificateCreatePayload {
  title: string;
  type: string;
  status: string;
  background: UploadedFileMeta;
  preview: UploadedFileMeta;
  template: string;
  metadata: CertificateMetadataPayload;
  contents: CertificateContentPayload[];
}

export interface CertificateDetailResponseData extends Omit<CertificateCreatePayload, 'preview'> {
  readonly id: number;
  readonly preview_url?: string;
}

export interface ListResponseData<T = any> {
  readonly contents?: readonly T[];
  readonly pagination?: PaginationMeta;
  readonly [key: string]: any;
}

export type ListResponse<T = any> = ApiResponse<ListResponseData<T>>;

export type CreateResponse = ApiResponse<any>;

export type UploadResponse = ApiResponse<UploadedFileMeta>;

export interface BadgeDetailResponseData {
  readonly id: number;
  readonly title: string;
  readonly type?: string;
  readonly url?: string;
}

export type BadgeDetailResponse = ApiResponse<BadgeDetailResponseData>;

export interface UUIDResponseData {
  readonly uuid: string;
}

export type UUIDResponse = ApiResponse<UUIDResponseData>;

export type CertificateDetailResponse = ApiResponse<CertificateDetailResponseData>;

export interface FetchOptions {
  headers?: Record<string, string>;
  timeout?: number;
  [key: string]: any;
}
