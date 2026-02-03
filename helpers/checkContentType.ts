import type {
  CertificateContentForm,
  CertificateNumberContentForm,
  EventTitleContentForm,
  LocationContentForm,
  NIKContentForm,
  ParticipantNameContentForm,
  QRCodeContentForm,
  TextContentForm,
  ValidThruContentForm,
} from '#achievement/config/types.ts';

export function isLocationContent(content: CertificateContentForm): content is LocationContentForm {
  return content.type === 'location';
}

export function isCertificateNumberContent(content: CertificateContentForm): content is CertificateNumberContentForm {
  return content.type === 'certificate_number';
}

export function isQRCodeContent(content: CertificateContentForm): content is QRCodeContentForm {
  return content.type === 'qr_code';
}

export function isTextBasedContent(
  content: CertificateContentForm,
): content is
| TextContentForm
| CertificateNumberContentForm
| LocationContentForm
| ParticipantNameContentForm
| NIKContentForm
| EventTitleContentForm
| ValidThruContentForm {
  return ['text', 'certificate_number', 'location', 'participant_name', 'nik', 'title', 'valid_thru'].includes(content.type);
}
