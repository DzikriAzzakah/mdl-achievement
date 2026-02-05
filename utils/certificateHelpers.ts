import type { CertificateContentForm, SafeZone } from '#achievement/config/types.ts';

export function adjustTextWidthsForSafeZone(
  contents: CertificateContentForm[],
  newSafeZone: SafeZone,
  oldSafeZone: SafeZone,
  layoutWidth = 842,
): CertificateContentForm[] {
  const newSafeZoneWidth = layoutWidth - (newSafeZone?.left || 0) - (newSafeZone?.right || 0);
  const oldSafeZoneWidth = layoutWidth - (oldSafeZone?.left || 0) - (oldSafeZone?.right || 0);

  if (newSafeZoneWidth === oldSafeZoneWidth) {
    return contents;
  }

  return contents.map((content: CertificateContentForm) => {
    if (content.type !== 'text') {
      return content;
    }

    const currentWidth = content.metadata.width;

    if (currentWidth !== 'fit-content' && typeof currentWidth === 'number' && currentWidth > newSafeZoneWidth) {
      return {
        ...content,
        metadata: {
          ...content.metadata,
          width: newSafeZoneWidth,
        },
      };
    }

    if (currentWidth === oldSafeZoneWidth) {
      return {
        ...content,
        metadata: {
          ...content.metadata,
          width: newSafeZoneWidth,
        },
      };
    }

    return content;
  });
}
