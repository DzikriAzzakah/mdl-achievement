import type { ContentTypeConfig } from '#achievement/config/types.ts';

export const CertificateContentType = {
  TEXT: 'text',
  IMAGE: 'image',
  CERTIFICATE_NUMBER: 'certificate_number',
  PARTICIPANT_NAME: 'participant_name',
  NIK: 'nik',
  TITLE: 'title',
  CITY: 'city',
  DATE: 'date',
  VALID_THRU: 'valid_thru',
  CERTIFICATE_SIGNEE: 'sertificate_signee',
  QR_CODE: 'qr_code',
} as const;

export type CertificateContentTypeValue = typeof CertificateContentType[keyof typeof CertificateContentType];

export const REMOTE_FEAT_FLAG_KEY = 'achievement';

export const CANVAS_WIDTH = 842;
export const CANVAS_HEIGHT = 595;

export const DEFAULT_FONT_FAMILY = '\'Montserrat\', sans-serif';

export const DEFAULT_TEXT_CONFIG = {
  font: DEFAULT_FONT_FAMILY,
  size: 16,
  weight: 400,
  color: '000000',
  alignment: { label: 'Center', value: 'center' as const },
  padding: 20,
};

export const DEFAULT_IMAGE_DIMENSIONS = {
  width: 200,
  height: 100,
};

export const ACCESSIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', color: 'success' },
  { value: 'COMPANY', label: 'Company', color: 'info' },
  { value: 'COMPANY_STRUCTURE', label: 'Company Structure', color: 'info' },
  { value: 'USER', label: 'User', color: 'info' },
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

export const CERTIFICATE_TABS_EDIT = [
  { label: 'Configuration', value: 'certificate-configuration' },
  { label: 'Accessibility', value: 'accessibility' },
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
  { label: 'Configuration', value: 'certificate-configuration' },
  { label: 'Preview', value: 'certificate-preview' },
  { label: 'Accessibility', value: 'accessibility' },
];

export const FormMode = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view',
};

export const CERTIFICATE_IMAGE_FILE_TYPES = ['JPG', 'JPEG', 'PNG', 'WEBP'];

export const CERTIFICATE_IMAGE_MAX_SIZE = 5; // MB

export const CERTIFICATE_NUMBER_VARIABLES = [
  { key: 'text_area', label: 'Text Area', value: '' },
  { key: 'nik', label: 'NIK', value: '{{nik}}' },
  { key: 'serial_number', label: 'Serial Number', value: '' },
  { key: 'date', label: 'Date', value: '{{date}}' },
  { key: 'year', label: 'Year', value: '{{year}}' },
  { key: 'title', label: 'Title', value: '{{title}}' },
  { key: 'certified_at', label: 'Certified At (Timestamp)', value: '{{certified_at}}' },
  { key: 'certificate_type', label: 'Certificate Type', value: '{{certificate_type}}' },
  { key: 'module_type', label: 'Module Type', value: '{{module_type}}' },
  { key: 'participant_name', label: 'Participant Name', value: '{{participant_name}}' },
  { key: 'email', label: 'Email', value: '{{email}}' },
];

export const DATE_FORMAT_OPTIONS = [
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
  { label: 'MM-DD-YYYY', value: 'MM-DD-YYYY' },
  { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
  { label: 'DD MMM YYYY', value: 'DD MMM YYYY' },
  { label: 'MMM DD, YYYY', value: 'MMM DD, YYYY' },
  { label: 'MMMM DD, YYYY', value: 'MMMM DD, YYYY' },
  { label: 'DD MMMM YYYY', value: 'DD MMMM YYYY' },
];

export const FONT_OPTIONS = [
  { label: 'Montserrat', value: '\'Montserrat\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Lato', value: '\'Lato\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap', weights: [100, 300, 400, 700, 900] },
  { label: 'Raleway', value: '\'Raleway\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Times New Roman', value: '\'Times New Roman\', serif', url: '', weights: [400, 700] },
  { label: 'Inter', value: '\'Inter\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Arial', value: 'Arial, sans-serif', url: '', weights: [400, 700] },
  { label: 'Great Vibes', value: '\'Great Vibes\', cursive', url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap', weights: [400] },
  { label: 'EB Garamond', value: '\'EB Garamond\', serif', url: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700;800&display=swap', weights: [400, 500, 600, 700, 800] },
  { label: 'Playfair Display', value: '\'Playfair Display\', serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap', weights: [400, 500, 600, 700, 800, 900] },
  { label: 'Cormorant Garamond', value: '\'Cormorant Garamond\', serif', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap', weights: [300, 400, 500, 600, 700] },
  { label: 'Libre Baskerville', value: '\'Libre Baskerville\', serif', url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap', weights: [400, 700] },
  { label: 'Merriweather', value: '\'Merriweather\', serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap', weights: [300, 400, 700, 900] },
  { label: 'Cinzel', value: '\'Cinzel\', serif', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap', weights: [400, 500, 600, 700, 800, 900] },
  { label: 'UnifrakturMaguntia', value: '\'UnifrakturMaguntia\', cursive', url: 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap', weights: [400] },
  { label: 'MedievalSharp', value: '\'MedievalSharp\', cursive', url: 'https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap', weights: [400] },
];

export const ALIGNMENT_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

export const SIZE_MODE_OPTIONS = [
  { label: 'Fix', value: 'fix' },
  { label: 'Fill', value: 'fill' },
  { label: 'Hug', value: 'hug' },
];

export const FONT_WEIGHT_LABELS: Record<number, string> = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black',
};

export const IMAGE_ERROR_MESSAGES = {
  fileType: 'The Uploaded file type is not supported.',
  fileSize: 'The File size exceeds limit of 5 MB.',
};

export const QR_CODE_SHAPE_OPTIONS = [
  { label: 'Dots', value: 'dots', icon: 'mdi:dots-grid' },
  { label: 'Square', value: 'square', icon: 'mdi:view-grid' },
];

export const QR_CODE_BORDER_OPTIONS = [
  { label: 'Square', value: 'square', icon: 'mdi:square-outline' },
  { label: 'Rounded', value: 'rounded', icon: 'mdi:rounded-corner' },
];

export const QR_CODE_DEFAULT_CONFIG = {
  width: 100,
  height: 100,
  background_color: 'FFFFFF',
  background_transparent: false,
  shape: 'square' as const,
  shape_color: '000000',
  border_style: 'rounded' as const,
  border_color: 'FFFFFF',
};

export const CONTENT_TYPE_CONFIGS: Readonly<Record<string, ContentTypeConfig>> = {
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
  participant_name: {
    title: 'Full Name',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: false,
  },
  nik: {
    title: 'NIK',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: false,
  },
  title: {
    title: 'Event Title',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: false,
  },
  city: {
    title: 'City',
    icon: 'material-symbols:code-rounded',
    fields: ['size', 'fontFamily', 'fontSize', 'fontWeight', 'alignment', 'fontColor', 'vertical', 'horizontal'],
    isSource: true,
    hasCustomFields: true,
  },
  date: {
    title: 'Date',
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
} as const;
