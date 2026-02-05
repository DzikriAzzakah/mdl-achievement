import type {
  CertificateContentForm,
  CertificateNumberContentForm,
  CityContentForm,
  DateContentForm,
  EventTitleContentForm,
  NIKContentForm,
  ParticipantNameContentForm,
  QRCodeContentForm,
  TextContentForm,
  ValidThruContentForm,
} from '#achievement/config/types.ts';
import { CertificateContentType } from '#achievement/config/constants';

export function isCertificateNumberContent(content: CertificateContentForm): content is CertificateNumberContentForm {
  return content.type === CertificateContentType.CERTIFICATE_NUMBER;
}

export function isQRCodeContent(content: CertificateContentForm): content is QRCodeContentForm {
  return content.type === CertificateContentType.QR_CODE;
}

export function isTextBasedContent(
  content: CertificateContentForm,
): content is
| TextContentForm
| CertificateNumberContentForm
| CityContentForm
| DateContentForm
| ParticipantNameContentForm
| NIKContentForm
| EventTitleContentForm
| ValidThruContentForm {
  return [
    CertificateContentType.TEXT,
    CertificateContentType.CERTIFICATE_NUMBER,
    CertificateContentType.CITY,
    CertificateContentType.DATE,
    CertificateContentType.PARTICIPANT_NAME,
    CertificateContentType.NIK,
    CertificateContentType.TITLE,
    CertificateContentType.VALID_THRU,
  ].includes(content.type as any);
}
