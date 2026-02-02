import type {
  ICertificateContentCertificateNumberForm,
  ICertificateContentCertificateSigneeForm,
  ICertificateContentEventTitleForm,
  ICertificateContentForm,
  ICertificateContentImageForm,
  ICertificateContentLocationForm,
  ICertificateContentNIKForm,
  ICertificateContentParticipantNameForm,
  ICertificateContentQRCodeForm,
  ICertificateContentTextForm,
  ICertificateContentValidThruForm,
} from '#achievement/config/types';
import {
  DEFAULT_IMAGE_DIMENSIONS,
  DEFAULT_TEXT_CONFIG,
  DEFAULT_TEXT_DIMENSIONS,
  QR_CODE_DEFAULT_CONFIG,
} from '#achievement/config/constants';

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
  return DEFAULT_TEXT_DIMENSIONS;
}

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
    width_mode: 'fix' as const,
    height_mode: 'fix' as const,
  };
}

export interface ContentFactory<T extends ICertificateContentForm = ICertificateContentForm> {
  createNew: (key: string) => T;
}

export const contentFactories: Record<string, ContentFactory<any>> = {
  image: {
    createNew(key: string): ICertificateContentImageForm {
      return {
        type: 'image',
        key: 'image',
        element_id: key,
        value: null,
        element_value: null,
        metadata: {
          ...DEFAULT_IMAGE_DIMENSIONS,
          vertical: 0,
          horizontal: 0,
          width_mode: 'fix' as const,
          height_mode: 'fix' as const,
        },
        file: null,
      };
    },
  } as ContentFactory<ICertificateContentImageForm>,

  sertificate_signee: {
    createNew(key: string): ICertificateContentCertificateSigneeForm {
      return {
        type: 'sertificate_signee',
        key: 'sertificate_signee',
        element_id: key,
        value: null,
        element_value: null,
        metadata: {
          ...DEFAULT_IMAGE_DIMENSIONS,
          vertical: 0,
          horizontal: 0,
          width_mode: 'fix' as const,
          height_mode: 'fix' as const,
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
        key: 'text',
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentTextForm>,

  certificate_number: {
    createNew(key: string): ICertificateContentCertificateNumberForm {
      return {
        type: 'certificate_number',
        key: 'certificate_number',
        element_id: key,
        value: '',
        element_value: '',
        metadata: createTextMetadata(''),
      };
    },
  } as ContentFactory<ICertificateContentCertificateNumberForm>,

  participant_name: {
    createNew(key: string): ICertificateContentParticipantNameForm {
      const defaultText = '{{ participant_name }}';
      return {
        type: 'participant_name',
        key: 'participant_name',
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentParticipantNameForm>,

  nik: {
    createNew(key: string): ICertificateContentNIKForm {
      const defaultText = '{{ nik }}';
      return {
        type: 'nik',
        key: 'nik',
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentNIKForm>,

  title: {
    createNew(key: string): ICertificateContentEventTitleForm {
      const defaultText = '{{ title }}';
      return {
        type: 'title',
        key: 'title',
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentEventTitleForm>,

  location: {
    createNew(key: string): ICertificateContentLocationForm {
      const defaultText = '{{ location }}';
      return {
        type: 'location',
        key: 'location',
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: {
          ...createTextMetadata(defaultText),
          city: '',
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
        key: 'valid_thru',
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ICertificateContentValidThruForm>,

  qr_code: {
    createNew(key: string): ICertificateContentQRCodeForm {
      return {
        type: 'qr_code',
        key: 'qr_code',
        element_id: key,
        value: '{{qr_code_url}}',
        element_value: '{{qr_code_url}}',
        metadata: {
          width: QR_CODE_DEFAULT_CONFIG.width,
          height: QR_CODE_DEFAULT_CONFIG.height,
          vertical: 0,
          horizontal: 0,
          background_color: QR_CODE_DEFAULT_CONFIG.background_color,
          background_transparent: QR_CODE_DEFAULT_CONFIG.background_transparent,
          shape: QR_CODE_DEFAULT_CONFIG.shape,
          shape_color: QR_CODE_DEFAULT_CONFIG.shape_color,
          border_style: QR_CODE_DEFAULT_CONFIG.border_style,
          border_color: QR_CODE_DEFAULT_CONFIG.border_color,
          width_mode: 'fix' as const,
          height_mode: 'fix' as const,
        },
      };
    },
  } as ContentFactory<ICertificateContentQRCodeForm>,
};

export function createContent(type: string, key: string): ICertificateContentForm | null {
  const factory = contentFactories[type];
  return factory ? factory.createNew(key) : null;
}

export function generateContentKey(type: string, counter: number): string {
  return `${type}_${counter}`;
}
