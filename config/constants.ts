export const REMOTE_FEAT_FLAG_KEY = 'achievement';

export const ACCESSIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'All Company' },
  { value: 'RESTRICTED', label: 'Selected' },
];

export const TYPE_OPTIONS = [
  { value: 'attendance', label: 'Attendance' },
  { value: 'recognition', label: 'Recognition' },
  { value: 'completion', label: 'Completion' },
];

const COMMON_COLUMNS = [
  { key: 'title', label: 'Title', width: '300px', sortable: true },
  { key: 'accessibility', label: 'Accessibility', width: '150px', sortable: true },
  { key: 'creator', label: 'Created by', width: '250px', sortable: true },
  { key: 'created_at', label: 'Created', width: '200px', sortable: true },
  { key: 'updated_at', label: 'Last Updated', width: '200px', sortable: true },
  { key: 'action', label: 'Action', stickyright: true },
];

export const CERTIFICATE_COLUMNS = [
  COMMON_COLUMNS[0],
  { key: 'certificate_type', label: 'Certificate Type', width: '150px', sortable: true },
  ...COMMON_COLUMNS.slice(1),
];

export const BADGE_COLUMNS = [...COMMON_COLUMNS];

export const CREATE_STEPPER = [
  { label: 'Configuration', value: 1 },
  { label: 'Accessibility', value: 2 },
];

export const BADGE_TABS = [
  { label: 'Configuration', value: 'badge-configuration' },
  { label: 'Badge', value: 'badge-image' },
  { label: 'Accessibility', value: 'accessibility' },
];

export const BADGE_TABS_EDIT = [
  { label: 'Configuration', value: 'badge-configuration' },
  { label: 'Accessibility', value: 'accessibility' },
];

export const CERTIFICATE_TABS = [
  { label: 'Certificate Information', value: 'certificatex-information' },
  { label: 'Accessibility', value: 'accessibility' },
];
