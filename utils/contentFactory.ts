import type {
  CertificateContentForm,
  CertificateNumberContentForm,
  CertificateSigneeContentForm,
  CityContentForm,
  DateContentForm,
  EventTitleContentForm,
  ImageContentForm,
  ModuleTypeContentForm,
  NIKContentForm,
  ParticipantNameContentForm,
  QRCodeContentForm,
  TextContentForm,
  ValidThruContentForm,
} from '#achievement/config/types';
import {
  CertificateContentType,
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
  [CertificateContentType.IMAGE]: {
    createNew(key: string): ImageContentForm {
      return {
        type: CertificateContentType.IMAGE,
        key: CertificateContentType.IMAGE,
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

  [CertificateContentType.CERTIFICATE_SIGNEE]: {
    createNew(key: string): CertificateSigneeContentForm {
      return {
        type: CertificateContentType.CERTIFICATE_SIGNEE,
        key: CertificateContentType.CERTIFICATE_SIGNEE,
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

  [CertificateContentType.TEXT]: {
    createNew(key: string): TextContentForm {
      const defaultText = 'Input Text Here';
      return {
        type: CertificateContentType.TEXT,
        key: CertificateContentType.TEXT,
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<TextContentForm>,

  [CertificateContentType.CERTIFICATE_NUMBER]: {
    createNew(key: string): CertificateNumberContentForm {
      return {
        type: CertificateContentType.CERTIFICATE_NUMBER,
        key: CertificateContentType.CERTIFICATE_NUMBER,
        element_id: key,
        value: '',
        element_value: '',
        metadata: createTextMetadata(''),
      };
    },
  } as ContentFactory<CertificateNumberContentForm>,

  [CertificateContentType.MODULE_TYPE]: {
    createNew(key: string): ModuleTypeContentForm {
      const defaultText = '{{ module_type }}';
      return {
        type: CertificateContentType.MODULE_TYPE,
        key: CertificateContentType.MODULE_TYPE,
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ModuleTypeContentForm>,

  [CertificateContentType.PARTICIPANT_NAME]: {
    createNew(key: string): ParticipantNameContentForm {
      const defaultText = '{{ participant_name }}';
      return {
        type: CertificateContentType.PARTICIPANT_NAME,
        key: CertificateContentType.PARTICIPANT_NAME,
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ParticipantNameContentForm>,

  [CertificateContentType.NIK]: {
    createNew(key: string): NIKContentForm {
      const defaultText = '{{ nik }}';
      return {
        type: CertificateContentType.NIK,
        key: CertificateContentType.NIK,
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<NIKContentForm>,

  [CertificateContentType.TITLE]: {
    createNew(key: string): EventTitleContentForm {
      const defaultText = '{{ title }}';
      return {
        type: CertificateContentType.TITLE,
        key: CertificateContentType.TITLE,
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<EventTitleContentForm>,

  [CertificateContentType.CITY]: {
    createNew(key: string): CityContentForm {
      const defaultText = 'Bandung';
      return {
        type: CertificateContentType.CITY,
        key: CertificateContentType.CITY,
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<CityContentForm>,

  [CertificateContentType.DATE]: {
    createNew(key: string): DateContentForm {
      const defaultText = '{{ date }}';
      return {
        type: CertificateContentType.DATE,
        key: CertificateContentType.DATE,
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: {
          ...createTextMetadata(defaultText),
          format: 'DD/MM/YYYY',
        },
      };
    },
  } as ContentFactory<DateContentForm>,

  [CertificateContentType.VALID_THRU]: {
    createNew(key: string): ValidThruContentForm {
      const defaultText = '{{ valid_thru }}';
      return {
        type: CertificateContentType.VALID_THRU,
        key: CertificateContentType.VALID_THRU,
        element_id: key,
        value: null,
        element_value: defaultText,
        metadata: createTextMetadata(defaultText),
      };
    },
  } as ContentFactory<ValidThruContentForm>,

  [CertificateContentType.QR_CODE]: {
    createNew(key: string): QRCodeContentForm {
      return {
        type: CertificateContentType.QR_CODE,
        key: CertificateContentType.QR_CODE,
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
