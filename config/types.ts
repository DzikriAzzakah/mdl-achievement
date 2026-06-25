import type { ITreeviewNode } from '@mydigilearn-saas/web-ui';

export interface ICompetencyStructure extends ITreeviewNode {
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

export interface ICompetencyAudioDetail {
  title?: string;
  level?: ICompetencyLevel;
}

export interface ICompetencyLevel {
  behaviours?: string[];
  id?: number;
  label?: string;
  title?: string;
  value?: string;
}

export interface FetchOptions {
  headers?: Record<string, string>;
  timeout?: number;
  [key: string]: any;
}

export interface IGetListResponse {
  success?: boolean;
  message?: string;
  data?: {
    [key: string]: any;
  };
}

export interface ISortData {
  key: string;
  type: string;
}

export interface ICreateResponse {
  success?: boolean;
  message?: string;
  data?: any;
  status_code?: number;
}

export interface IOrgConfigs {
  id?: number;
}

export interface IGetListCompetency {
  data: Record<string, any>[];
}

export interface ISelectedFilter {
  label: string;
  value: string | boolean;
}

export interface IFilterAudio {
  status?: ISelectedFilter[];
  masterData?: ISelectedFilter[];
  accessibility?: ISelectedFilter[];
  created?: Date[] | null;
  lastUpdate?: Date[] | null;

}

export interface IListAudio {
  id: number | string;
  title: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_delete: boolean;
  status_enum?: string;
  accessibility_type?: string;
  // New API fields
  slug?: string;
  file_url?: string;
  cover_url?: string;
  level?: string;
  duration_in_seconds?: number;
  is_published?: boolean;
  is_master?: boolean;
  created_by_user?: {
    id: number;
    full_name: string;
    picture: string;
    position: string;
    user_tag: string;
  };
  tags?: string[] | { id: number; tag: string; types: string; }[];
  competencies?: {
    id: number;
    category_id: number;
    title: string;
    code: string;
    level: {
      id: number;
      title: string;
      value: string;
    };
  }[];
};

export interface IAudioDetail {
  id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  audio_url?: string | null;
  audio_url_original?: string | null;
  status_enum?: string;
  status?: string;
  category_id?: number | string;
  category_name?: string;
  created_at?: string;
  updated_at?: string;
  created_by_id?: number | string;
  created_by_full_name?: string;
  created_by_profile_picture_url?: string;
  is_delete?: boolean;
  image_desktop?: string;
  level?: string;
  category?: Record<string, any>[];
  competencies: ICompetencyStructure[] | string[];
  tags?: string[];
  metadata?: any;
  // New API fields
  slug?: string;
  file_url?: string;
  cover_url?: string;
  duration_in_seconds?: number;
  is_published?: boolean;
  is_master?: boolean;
  accessibility_type?: string;
  ref_id?: string;
  created_by_user?: {
    id: number;
    full_name: string;
    picture: string;
    position: string;
    user_tag: string;
  };
}

export interface IAudioForm {
  title: string;
  description?: string;
  tags?: string[];
  audioContent: File | null;
  thumbnail: File | string | null;
  competencies: ICompetencyStructure[] | string[];
  status_enum: string;
  is_master: boolean;
  meta_data_audio: Record<string, any>;
  meta_data_thumbnail: Record<string, any>;
  metadata: IMetadata;
}

export interface IMetadata {
  thumbnail: IMetaDetail;
  audio: IMetaDetail;
}

export interface IMetaDetail {
  name: string;
  size: number | string;
  type: string;
  lastModified: number;
}

export interface IAudioResponse {
  id: number;
}

export interface IBaseOption<T = number | string | null> {
  value?: T;
  label?: string;
  name?: string;
  slug?: string;
  id?: number;
  title?: string;
  tag?: string;
  tag_id?: string;
}

export type ITagsOptions = IBaseOption<string>;
export type ISectionTypeOptions = IBaseOption<string>;
export type IPlaylistOptions = IBaseOption<number>;
export type IFeaturedContentOptions = IBaseOption<string>;
export type ISourceTypeOptions = IBaseOption<string>;

export interface IPlaylistDetail {
  id: number;
  title: string;
  is_active?: boolean;
  platform_id?: number;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IPlaylistForm {
  playlistTitle: string;
  playlistContent?: any[];
  tagContent?: any[];
}

export interface ILandingSectionForm {
  sectionTitle: string;
  sectionDescription?: string;
  sectionType?: ISectionTypeOptions | null;
  sectionPlaylist?: IPlaylistOptions | null;
  featuredContentType?: IFeaturedContentOptions | null;
  selectedFeaturedContent?: Record<any, string>[];
  layoutType?: string;
  sourceType?: ISourceTypeOptions | null;
  sourcePlaylist?: IPlaylistOptions | null;
  sourceTag?: ITagsOptions | null;
}

export interface ISectionItem {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number;
  ref_id: string;
  section_id: number;
  content_type: string;
  content_id: number;
  position: number;
  is_pinned: boolean;
  metadata: Record<string, any>;
}

export interface ILandingSectionDetail {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number;
  ref_id: string;
  page_id: number;
  title: string;
  description?: string | null;
  content_type: string;
  display_rule: string;
  layout_type: string;
  item_style: string;
  position: number;
  visible_item_count: number;
  is_active: boolean;
  metadata: Record<string, any>;
  page?: Record<string, any>;
  section_items?: ISectionItem[];
  created_by_user?: Record<string, any>;
  source_type?: string;
  source_id?: number | null;
  items?: any[];
}

export interface IGetLandingSectionDetail {
  success?: boolean;
  message?: string;
  data?: ILandingSectionDetail;
}

export interface IPlaylist {
  id?: number;
  title?: string;
  thumbnail_url?: string;
}

export interface IFetchParams {
  page: number;
  sort: ISortData | null;
  search: string;
}
