export const LIST_COLUMNS = [
  { key: 'title', label: 'Title', width: '384px', sortable: true },
  { key: 'status_enum', label: 'Status', width: '150px', sortable: true },
  { key: 'is_master', label: 'Master Data', width: '150px', sortable: true },
  { key: 'accessibility_type', label: 'Accessibility', sortable: true },
  { key: 'full_name', label: 'Created by', width: '300px', sortable: true },
  { key: 'created_at', label: 'Created', width: '200px', sortable: true },
  { key: 'updated_at', label: 'Last Update', width: '200px', sortable: true },
  { key: 'action', label: 'Action', stickyright: true },
];

export const PLAYLIST_COLUMNS = [
  { key: 'title', label: 'Title', width: '384px', sortable: true },
  { key: 'full_name', label: 'Created by', width: '300px', sortable: true },
  { key: 'created_at', label: 'Created', width: '200px', sortable: true },
  { key: 'updated_at', label: 'Last Updated', width: '200px', sortable: true },
  { key: 'action', label: 'Action', stickyright: true },
];

export const PLAYLIST_CONTENT_COLUMNS = [
  { key: 'title', label: 'Title', width: '384px', sortable: true },
];

export const SELECTED_PLAYLIST_COLUMNS = [
  { key: 'title', label: 'Title', width: '600px', sortable: true },
  { key: 'status_enum', label: 'Status', width: '156px' },
  { key: 'accessibility_type', label: 'Accessibility', width: '156px' },
  { key: 'action', label: 'Action', stickyright: true },
];

export const SECTION_CONTENT_TAG_COLUMNS = [
  { key: 'tag', label: 'Tag', width: '100%', sortable: true },
];

export const AUDIO_TAB_TYPE = {
  AUDIO_LIST: 'audio-list',
  PLAYLIST: 'playlist',
  LANDING_PAGE: 'landing-page',
};

export const AUDIO_LIST_TABS = [
  { label: 'Audio List', value: 'audio-list' },
  { label: 'Playlist', value: 'playlist' },
  { label: 'Landing Page', value: 'landing-page' },
];

export const AUDIO_TABS = [
  { label: 'Audio Information', value: 'audio-information' },
  { label: 'Configuration', value: 'configuration' },
  { label: 'Accessibility', value: 'accessibility' },
];

export const CREATE_STEPPER = [
  { label: 'Audio Information', value: 1 },
  { label: 'Configuration', value: 2 },
  { label: 'Accessibility', value: 3 },
];

export const COMPETENCY_STEPPER = [
  { label: 'Select Competency', value: 1 },
  { label: 'Select Level', value: 2 },
];

export const AUDIO_STATUS_ENUM = {
  PUBLISH: 'publish',
  DRAFT: 'draft',
} as const;

export const ACCESSIBILITY_TYPE_ENUM = {
  UNASSIGNED: 'UNASSIGNED',
  RESTRICTED: 'RESTRICTED',
  PUBLIC: 'PUBLIC',
} as const;

export const AUDIO_STATUS_LABEL = {
  PUBLISH: 'Published',
  DRAFT: 'Not Published',
} as const;

export const ACCESSIBILITY_TYPE_LABEL = {
  UNASSIGNED: 'Unassigned',
  RESTRICTED: 'Selected',
  PUBLIC: 'All Users',
} as const;

export const STATUS_OPTIONS = [
  { value: true, label: 'Published' },
  { value: false, label: 'Not Published' },
];

export const MASTER_DATA_OPTIONS = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

export const ACCESSIBILITY_OPTIONS = [
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'all_user', label: 'All Users' },
  { value: 'selected', label: 'Selected' },
];

export const FEATURED_CONTENT_TYPE_OPTIONS = [
  { label: 'Custom', value: 'custom' },
  { label: 'Latest', value: 'latest' },
  { label: 'Popular', value: 'popular' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Random', value: 'random' },
];

export const LANDING_SECTION_TYPE_OPTIONS = {
  TAGS: 'tag',
  AUDIO: 'audio',
  PLAYLIST_AUDIOS: 'playlist',
  USER_INTERESTS: 'user_interest',
  DEFAULT: 'default',
};

export const LAYOUT_TYPE_OPTIONS = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
];

export const FEATURED_CONTENT_TYPE_ENUM = {
  CUSTOM: 'custom',
  LATEST: 'latest',
  POPULAR: 'popular',
  OLDEST: 'oldest',
  RANDOM: 'random',
};

export const SOURCE_TYPE_OPTIONS = [
  { label: 'Master', value: 'master' },
  { label: 'Playlist', value: 'playlist' },
  { label: 'Tag', value: 'tag' },
];

export const SOURCE_TYPE_ENUM = {
  MASTER: 'master',
  PLAYLIST: 'playlist',
  TAG: 'tag',
} as const;
