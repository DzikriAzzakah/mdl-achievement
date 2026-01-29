import type { ICertificateContentQRCodeForm } from '#achievement/config/types';

export function generateQRCodeDataUrl(content: ICertificateContentQRCodeForm, _value: string = 'https://example.com'): string {
  const { shape, shape_color } = content.metadata;

  // For template preview, we'll generate a simple placeholder QR code pattern
  // In production, the actual QR code will be generated server-side with real data
  const size = 200;
  const modules = 25;
  const moduleSize = size / modules;

  const isDots = shape === 'dots';
  const fillColor = `#${shape_color || '000000'}`;

  // Generate a simple QR-like pattern for preview
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svgContent += `<rect width="${size}" height="${size}" fill="transparent"/>`;

  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      // Create a checkerboard-like pattern
      const shouldFill = (row + col) % 3 === 0
        || (row < 7 && col < 7) // Top-left corner
        || (row < 7 && col >= modules - 7) // Top-right corner
        || (row >= modules - 7 && col < 7); // Bottom-left corner

      if (shouldFill) {
        const x = col * moduleSize;
        const y = row * moduleSize;

        if (isDots) {
          const cx = x + moduleSize / 2;
          const cy = y + moduleSize / 2;
          const r = moduleSize / 2.5;
          svgContent += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fillColor}"/>`;
        }
        else {
          svgContent += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${fillColor}"/>`;
        }
      }
    }
  }

  svgContent += '</svg>';

  const base64 = btoa(unescape(encodeURIComponent(svgContent)));
  return `data:image/svg+xml;base64,${base64}`;
}
