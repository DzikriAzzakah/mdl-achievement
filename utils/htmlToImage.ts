import { toPng } from 'html-to-image';

/**
 * Load Google Fonts dynamically
 */
async function loadGoogleFonts(fontUrls: string[]): Promise<void> {
  const loadPromises = fontUrls.map((url) => {
    return new Promise<void>((resolve) => {
      const existingLink = document.querySelector(`link[href="${url}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
  });

  await Promise.all(loadPromises);

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
}

/**
 * Extract Google Font URLs from CSS content
 */
function extractGoogleFontUrls(cssContent: string): string[] {
  const urls: string[] = [];
  const importRegex = /@import\s+url\(['"]?(https:\/\/fonts\.googleapis\.com[^'")\s]+)['"]?\)/g;
  const matches = cssContent.matchAll(importRegex);
  for (const match of matches) {
    urls.push(match[1]);
  }
  return urls;
}

/**
 * Convert an image URL to base64 data URL to avoid CORS issues
 */
async function imageUrlToBase64(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    return url;
  }

  if (url.includes('{{') && url.includes('}}')) {
    return url;
  }

  try {
    const response = await fetch(url, { 
      mode: 'cors',
      credentials: 'omit',
    });
    if (response.ok) {
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    throw new Error(`HTTP ${response.status}`);
  }
  catch (error) {
    console.warn(`Failed to convert image to base64: ${url}`, error);
    return url;
  }
}

/**
 * Convert all image URLs in an HTML element to base64 data URLs
 */
async function convertImagesToBase64(element: HTMLElement): Promise<void> {
  // Convert img src attributes
  const images = element.querySelectorAll('img');
  for (const img of Array.from(images)) {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:') && !src.includes('{{')) {
      const base64 = await imageUrlToBase64(src);
      if (base64.startsWith('data:')) {
        img.setAttribute('src', base64);
      }
    }
    else if (src?.includes('{{')) {
      img.remove();
    }
  }

  // Convert background-image using getComputedStyle
  const computedBg = window.getComputedStyle(element).backgroundImage;
  if (computedBg && computedBg !== 'none') {
    const urlMatch = computedBg.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:') && !urlMatch[1].includes('{{')) {
      const base64 = await imageUrlToBase64(urlMatch[1]);
      if (base64.startsWith('data:')) {
        element.style.backgroundImage = `url('${base64}')`;
      }
    }
  }
}

/**
 * Convert HTML string to a PNG image file
 * Uses an iframe to isolate rendering and avoid affecting the main page
 */
export async function htmlToImageFile(
  htmlString: string,
  fileName: string = 'certificate-preview.png',
): Promise<File> {
  // Create an invisible iframe to isolate the rendering
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-10000px';
  iframe.style.top = '-10000px';
  iframe.style.width = '842px';
  iframe.style.height = '595px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  
  document.body.appendChild(iframe);
  
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Could not access iframe document');
    }
    
    iframeDoc.open();
    iframeDoc.write(htmlString);
    iframeDoc.close();
    
    // Wait for iframe to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Load Google Fonts
    const styleContent = iframeDoc.querySelector('style')?.textContent || '';
    const googleFontUrls = extractGoogleFontUrls(styleContent);
    if (googleFontUrls.length > 0) {
      await loadGoogleFonts(googleFontUrls);
    }
    
    const certificateContainer = iframeDoc.querySelector('.certificate-container') as HTMLElement;
    if (!certificateContainer) {
      throw new Error('Certificate container not found in HTML');
    }
    
    // Convert images to base64
    await convertImagesToBase64(certificateContainer);
    
    // Wait for images to load
    const images = certificateContainer.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }),
    );
    
    // Wait for fonts and rendering
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Capture PNG
    const dataUrl = await toPng(certificateContainer, {
      width: 842,
      height: 595,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: '#ffffff',
    });
    
    // Convert to File
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: 'image/png' });
  }
  finally {
    document.body.removeChild(iframe);
  }
}
