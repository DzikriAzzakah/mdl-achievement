import { postUploadAchievementFile } from '#achievement/api/api';
import { buildContentPayload } from '#achievement/utils/certificatePayloadBuilder';
import { generateCertificateTemplate } from '#achievement/utils/certificateTemplateGenerator';
import { htmlToImageFile } from '#achievement/utils/htmlToImage';

export function useCertificateUpload() {
  const { $toast } = useNuxtApp();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { getApiErrorMessage } = useUtility();

  const uploadBackgroundImage = async (file: File) => {
    try {
      showLoading('Uploading image', 'Please wait while we upload the file.');
      const response = await postUploadAchievementFile(file, 'certificate_background');

      return {
        url: response?.data?.full_path || null,
        meta: response?.data,
      };
    }
    catch (err) {
      $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Image upload failed.' });
      throw err;
    }
    finally {
      hideLoading();
    }
  };

  const uploadContentImage = async (file: File) => {
    try {
      const response = await postUploadAchievementFile(file, 'certificate_custom_image');
      return {
        url: response?.data?.full_path || null,
        meta: response?.data,
      };
    }
    catch (err) {
      $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Content image upload failed.' });
      throw err;
    }
  };

  const uploadPreviewImage = async (file: File) => {
    try {
      const response = await postUploadAchievementFile(file, 'certificate_template_preview');
      return {
        url: response?.data?.full_path || null,
        meta: response?.data,
      };
    }
    catch (err) {
      $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Preview image upload failed.' });
      throw err;
    }
  };

  const generatePreviewImage = async (
    backgroundUrl: string,
    contents: any[],
    safeZone: any,
    contentImageUrls: Record<string, { url: string; originalFileName?: string; }>,
    title: string,
  ) => {
    try {
      showLoading('Generating preview', 'Please wait while we generate the certificate preview.');

      const sanitizedTitle = (title || 'certificate').replace(/[^a-z0-9]/gi, '-').substring(0, 30);
      const timestamp = Date.now();
      const uniqueFileName = `preview-${sanitizedTitle}-${timestamp}.png`;

      const previewTemplate = generateCertificateTemplate({
        backgroundUrl,
        contents,
        safeZone,
        contentImageUrls,
        useActualUrls: true,
      });

      const previewFile = await htmlToImageFile(previewTemplate, uniqueFileName);
      const previewUploadResult = await uploadPreviewImage(previewFile);

      return previewUploadResult?.meta;
    }
    catch (err) {
      console.error('[App] Could not generate/upload preview image:', err);
      $toast({ variant: 'warning', title: 'Warning', text: 'Preview image generation failed' });
      throw err;
    }
    finally {
      hideLoading();
    }
  };

  const processContentImages = async (contents: any[]) => {
    const contentImageUrls: Record<string, { url: string; originalFileName?: string; }> = {};

    const uploadedContents = await Promise.all(
      contents.map(async (content: any) => {
        if (content.type === 'image' || content.type === 'sertificate_signee') {
          if (content.file) {
            const uploadResult = await uploadContentImage(content.file);
            if (uploadResult?.url) {
              contentImageUrls[content.element_id] = {
                url: uploadResult.url,
                originalFileName: uploadResult.meta?.original_file_name || content.file.name,
              };
            }
            return buildContentPayload(content, uploadResult?.url, uploadResult?.meta);
          }
          else if (content.value) {
            const contentMeta = content.metadata as Record<string, any>;
            contentImageUrls[content.element_id] = {
              url: content.value,
              originalFileName: contentMeta?.original_file_name,
            };
            return buildContentPayload(content);
          }
        }
        return buildContentPayload(content);
      }),
    );

    return { uploadedContents, contentImageUrls };
  };

  return {
    uploadBackgroundImage,
    uploadContentImage,
    uploadPreviewImage,
    generatePreviewImage,
    processContentImages,
  };
}
