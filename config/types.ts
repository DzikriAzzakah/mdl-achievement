import type { TreeNode } from '#ui/components/molecules/treeview/index.vue';

export interface ICompetencyStructure extends TreeNode {
  level: number;
  parentNames: string[];
  parentId?: number;
}

export enum ProficiencyLevel {
  FUNDAMENTAL = 'fundamental',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  MASTERY = 'mastery',
  DEVELOPING = 'developing',
}

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
  certificate_type: string;
  accessibility: string;
  creator: string;
  created_at: string;
  updated_at: string;
}

export interface ICertificateContentImageMetadata {
  width: number;
  height: number;
  vertical: number;
  horizontal: number;
  originalWidth?: number;
  originalHeight?: number;
}

export interface ICertificateContentTextMetadata {
  width: number;
  height: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  font_size: number;
  font_weight: number;
  font_family: string;
  vertical: number;
  horizontal: number;
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

export type ContentTextField = 'size' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'alignment' | 'fontColor' | 'vertical' | 'horizontal';

export type ICertificateContentForm =
  | ICertificateContentImageForm
  | ICertificateContentTextForm
  | ICertificateContentCertificateNumberForm
  | ICertificateContentLocationForm
  | ICertificateContentFullNameForm
  | ICertificateContentEmployeeIdForm
  | ICertificateContentEventTitleForm
  | ICertificateContentValidThruForm
  | ICertificateContentCertificateSigneeForm;

export interface ICertificateForm {
  title: string;
  description: string;
  certificate_type: string;
  image: File | string | null;
  contents: ICertificateContentForm[];
  safe_zone: ICertificateSafeZone;
}

export interface ICertificateDetail {
  id: number;
  title: string;
  description?: string;
  certificate_type: string;
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
  certificate_type?: string;
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

export interface IMetadata {
  image: string;
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

export interface IBaseOption<T = number | string | null> {
  value?: T;
  label?: string;
}

export type ITags = IBaseOption<number | null>;
export type ITypesOptions = IBaseOption<number>;
export type ITagsOptions = IBaseOption<string>;

export interface IGetListResponse {
  success?: boolean;
  message?: string;
  data?: {
    contents?: any[];
    pagination?: {
      total_row: number;
      per_page: number;
      current_page: number;
      last_page: number;
      is_last_page: boolean;
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

export interface IOrgConfigs {
  id?: number;
}
