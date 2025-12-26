import type {
  ICertificateContentCertificateNumberForm,
  ICertificateContentCertificateSigneeForm,
  ICertificateContentEmployeeIdForm,
  ICertificateContentEventTitleForm,
  ICertificateContentForm,
  ICertificateContentFullNameForm,
  ICertificateContentImageForm,
  ICertificateContentLocationForm,
  ICertificateContentTextForm,
  ICertificateContentValidThruForm,
} from '#achievement/config/types';

const DEFAULT_TEXT_CONFIG = {
  font: '\'Montserrat\', sans-serif',
  size: 16,
  weight: 400,
  color: '000000',
  alignment: { label: 'Center', value: 'center' as const },
  padding: 20,
};

const DEFAULT_IMAGE_DIMENSIONS = {
  width: 200,
  height: 100,
};

/**
 * Calculate text dimensions using canvas measurement
 */
function getTextDimensions(text: string, font: string, fontSize: number, fontWeight: number) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = `${fontWeight} ${fontSize}px ${font}`;
    const metrics = context.measureText(text);
    return {
      width: Math.ceil(metrics.width),
      height: Math.ceil(fontSize * 1.5),
    };
  }
  return { width: 200, height: 50 };
}

/**
 * Create text metadata with calculated dimensions
 */
function createTextMetadata(text: string, customConfig: Partial<typeof DEFAULT_TEXT_CONFIG> = {}) {
  const config = { ...DEFAULT_TEXT_CONFIG, ...customConfig };
  const dims = getTextDimensions(text, config.font, config.size, config.weight);

  return {
    width: dims.width + config.padding,
    height: dims.height,
    font_family: config.font,
    font_size: config.size,
    font_weight: config.weight,
    alignment: config.alignment,
    color: config.color,
    vertical: 0,
    horizontal: 0,
  };
}

/**
 * Content factory interface for type safety
 */
export interface ContentFactory<T extends ICertificateContentForm = ICertificateContentForm> {
  createNew: (key: string) => T;
}

/**
 * Centralized content factories for all content types
 * This provides a single source of truth for creating new content items
 */
export const contentFactories: Record<string, ContentFactory<any>> = {
  image: {
    createNew(key: string): ICertificateContentImageForm {
      return {
        type: 'image',
        key,
        value: null,
        metadata: {
          ...DEFAULT_IMAGE_DIMENSIONS,
          vertical: 0,
          horizontal: 0,
        },
        file: null,
      };
    },
  } as ContentFactory<ICertificateContentImageForm>,

  sertificate_signee: {
    createNew(key: string): ICertificateContentCertificateSigneeForm {
      return {
        type: 'sertificate_signee',
        key,
        value: null,
        metadata: {
          ...DEFAULT_IMAGE_DIMENSIONS,
          vertical: 0,
          horizontal: 0,
        },
        file: null,
      };
    },
  } as ContentFactory<ICertificateContentCertificateSigneeForm>,

  text: {
    createNew(key: string): ICertificateContentTextForm {
      const defaultText = 'Input Text Here';
      return {
        type: 'text',
        key,
        value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentTextForm>,

  certificate_number: {
    createNew(key: string): ICertificateContentCertificateNumberForm {
      return {
        type: 'certificate_number',
        key,
        value: '',
        metadata: createTextMetadata(''),
      };
    },
  } as ContentFactory<ICertificateContentCertificateNumberForm>,

  fullname: {
    createNew(key: string): ICertificateContentFullNameForm {
      const defaultText = '{{ fullname }}';
      return {
        type: 'fullname',
        key,
        value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentFullNameForm>,

  employee_id: {
    createNew(key: string): ICertificateContentEmployeeIdForm {
      const defaultText = '{{ nik }}';
      return {
        type: 'employee_id',
        key,
        value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentEmployeeIdForm>,

  event_title: {
    createNew(key: string): ICertificateContentEventTitleForm {
      const defaultText = '{{ event_title }}';
      return {
        type: 'event_title',
        key,
        value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentEventTitleForm>,

  location: {
    createNew(key: string): ICertificateContentLocationForm {
      const defaultText = '{{ location }}';
      return {
        type: 'location',
        key,
        value: defaultText,
        metadata: {
          ...createTextMetadata(defaultText),
          location: '',
          date_format: 'DD/MM/YYYY',
        },
      };
    },
  } as ContentFactory<ICertificateContentLocationForm>,

  valid_thru: {
    createNew(key: string): ICertificateContentValidThruForm {
      const defaultText = '{{ valid_thru }}';
      return {
        type: 'valid_thru',
        key,
        value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentValidThruForm>,
};

/**
 * Create a new content item by type
 * @param type - The content type
 * @param key - Unique key for the content item
 * @returns New content item or null if type is invalid
 */
export function createContent(type: string, key: string): ICertificateContentForm | null {
  const factory = contentFactories[type];
  return factory ? factory.createNew(key) : null;
}

/**
 * Generate a unique key for content items
 */
export function generateContentKey(type: string, counter: number): string {
  return `${type}_${counter}`;
}
