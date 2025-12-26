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

// Certificate Content Form Constants
export const CERTIFICATE_IMAGE_FILE_TYPES = ['JPG', 'JPEG', 'PNG', 'WEBP'];

export const CERTIFICATE_IMAGE_MAX_SIZE = 5; // MB

export const CERTIFICATE_IMAGE_MAX_DIMENSIONS = {
  width: 500,
  height: 500,
};

export const CERTIFICATE_NUMBER_VARIABLES = [
  { label: 'NIK', value: '{{NIK}}' },
  { label: 'Participant Name', value: '{{participant_name}}' },
  { label: 'Year', value: '{{year}}' },
  { label: 'Certificate Date', value: '{{certificate_date}}' },
  { label: 'Email', value: '{{email}}' },
  { label: 'Certificate Type', value: '{{certificate_type}}' },
  { label: 'Serial Number', value: '{{serial_number}}' },
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
  { label: 'Great Vibes', value: '\'Great Vibes\', cursive', url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap', weights: [400] },
  { label: 'Dancing Script', value: '\'Dancing Script\', cursive', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap', weights: [400, 500, 600, 700] },
  { label: 'EB Garamond', value: '\'EB Garamond\', serif', url: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700;800&display=swap', weights: [400, 500, 600, 700, 800] },
  { label: 'Playfair Display', value: '\'Playfair Display\', serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap', weights: [400, 500, 600, 700, 800, 900] },
  { label: 'Cormorant Garamond', value: '\'Cormorant Garamond\', serif', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap', weights: [300, 400, 500, 600, 700] },
  { label: 'Libre Baskerville', value: '\'Libre Baskerville\', serif', url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap', weights: [400, 700] },
  { label: 'Merriweather', value: '\'Merriweather\', serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap', weights: [300, 400, 700, 900] },
  { label: 'Cinzel', value: '\'Cinzel\', serif', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap', weights: [400, 500, 600, 700, 800, 900] },
  { label: 'UnifrakturMaguntia', value: '\'UnifrakturMaguntia\', cursive', url: 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap', weights: [400] },
  { label: 'MedievalSharp', value: '\'MedievalSharp\', cursive', url: 'https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap', weights: [400] },
  { label: 'Montserrat', value: '\'Montserrat\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Lato', value: '\'Lato\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap', weights: [100, 300, 400, 700, 900] },
  { label: 'Raleway', value: '\'Raleway\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Times New Roman', value: '\'Times New Roman\', serif', url: '', weights: [400, 700] },
  { label: 'Inter', value: '\'Inter\', sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { label: 'Arial', value: 'Arial, sans-serif', url: '', weights: [400, 700] },
];

export const ALIGNMENT_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
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
