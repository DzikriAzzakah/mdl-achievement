import type {
  CertificateContentForm,
  CertificateNumberContentForm,
  CertificateSigneeContentForm,
  EventTitleContentForm,
  ImageContentForm,
  LocationContentForm,
  NIKContentForm,
  ParticipantNameContentForm,
  QRCodeContentForm,
  TextContentForm,
  ValidThruContentForm,
} from '#achievement/config/types';
import {
  DEFAULT_IMAGE_DIMENSIONS,
  DEFAULT_TEXT_CONFIG,
  QR_CODE_DEFAULT_CONFIG,
} from '#achievement/config/constants';

function createTextMetadata(text: string, customConfig: Partial<typeof DEFAULT_TEXT_CONFIG> = {}) {
  const config = { ...DEFAULT_TEXT_CONFIG, ...customConfig };

  return {
    width: 'fit-content',
    height: 'fit-content',
    font_family: config.font,
    font_size: config.size,
    font_weight: config.weight,
    alignment: config.alignment,
    color: config.color,
    vertical: 0,
    horizontal: 0,
    width_mode: 'hug' as const,
    height_mode: 'hug' as const,
  };
}

export interface ContentFactory<T extends CertificateContentForm = CertificateContentForm> {
  createNew: (key: string) => T;
}

export const contentFactories: Record<string, ContentFactory<any>> = {
  image: {
    createNew(key: string): ImageContentForm {
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
  } as ContentFactory<ImageContentForm>,

  sertificate_signee: {
    createNew(key: string): CertificateSigneeContentForm {
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
  } as ContentFactory<CertificateSigneeContentForm>,

  text: {
    createNew(key: string): TextContentForm {
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
  } as ContentFactory<TextContentForm>,

  certificate_number: {
    createNew(key: string): CertificateNumberContentForm {
      return {
        type: 'certificate_number',
        key: 'certificate_number',
        element_id: key,
        value: '',
        element_value: '',
        metadata: createTextMetadata(''),
      };
    },
  } as ContentFactory<CertificateNumberContentForm>,

  participant_name: {
    createNew(key: string): ParticipantNameContentForm {
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
  } as ContentFactory<ParticipantNameContentForm>,

  nik: {
    createNew(key: string): NIKContentForm {
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
  } as ContentFactory<NIKContentForm>,

  title: {
    createNew(key: string): EventTitleContentForm {
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
  } as ContentFactory<EventTitleContentForm>,

  location: {
    createNew(key: string): LocationContentForm {
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
  } as ContentFactory<LocationContentForm>,

  valid_thru: {
    createNew(key: string): ValidThruContentForm {
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
  } as ContentFactory<ValidThruContentForm>,

  qr_code: {
    createNew(key: string): QRCodeContentForm {
      return {
        type: 'qr_code',
        key: 'qr_code',
        element_id: key,
        value: '{{qr_code}}',
        element_value: '{{qr_code}}',
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
  } as ContentFactory<QRCodeContentForm>,
};

export function createContent(type: string, key: string): CertificateContentForm | null {
  const factory = contentFactories[type];
  return factory ? factory.createNew(key) : null;
}

export function generateContentKey(type: string, counter: number): string {
  return `${type}_${counter}`;
}
