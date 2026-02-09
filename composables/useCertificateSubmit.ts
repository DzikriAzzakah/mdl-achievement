import { patchEditCertificate, postAddCertificate } from '#achievement/api/api';
import { buildCertificateCreatePayload, buildContentPayload } from '#achievement/utils/certificatePayloadBuilder';
import { generateCertificateTemplate } from '#achievement/utils/certificateTemplateGenerator';
import { useCertificateUpload } from './useCertificateUpload';

export function useCertificateSubmit() {
  const { $toast } = useNuxtApp();
  const router = useRouter();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { getApiErrorMessage } = useUtility();
  const { preventLeave } = useConfirmLeave();

  const {
    uploadBackgroundImage,
    processContentImages,
    generatePreviewImage,
  } = useCertificateUpload();

  const saveCertificate = async (
    payload: any,
    isEditMode: boolean,
    certificateId: number | string | null,
    updateInitialState: () => void,
    hasJustSaved: Ref<boolean>,
    returnUrl: string,
  ) => {
    const loadingMessage = isEditMode ? 'Updating certificate' : 'Creating certificate';
    showLoading(loadingMessage, 'Please wait while we process the certificate.');

    try {
      let response;
      if (isEditMode && certificateId) {
        response = await patchEditCertificate(Number(certificateId), payload as any);
      }
      else {
        response = await postAddCertificate(payload);
      }

      if (response) {
        const { data } = response;

        if (!isEditMode) {
          preventLeave.value = false;
          $toast({
            variant: 'success',
            title: 'Success',
            text: 'Certificate successfully added.',
          });
          router.push(returnUrl);
        }
        else {
          $toast({
            variant: 'success',
            title: 'Success',
            text: 'Certificate successfully updated.',
          });
          updateInitialState();
          hasJustSaved.value = true;
          preventLeave.value = false;
        }

        return data;
      }
    }
    catch (err) {
      const errorMessage = isEditMode ? 'Failed to update certificate.' : 'Failed to add certificate.';
      $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || errorMessage });
      throw err;
    }
    finally {
      hideLoading();
    }
  };

  const submitCertificate = async (options: {
    isEditMode: boolean;
    certificateId: number | string | null;
    store: any;
    canvas: any;
    uploadedImageMeta: any;
    getVisualSnapshot: () => string;
    initialVisualState: string;
    updateInitialState: () => void;
    hasJustSaved: Ref<boolean>;
    returnUrl: string;
  }) => {
    const {
      isEditMode,
      certificateId,
      store,
      canvas,
      uploadedImageMeta,
      getVisualSnapshot,
      initialVisualState,
      updateInitialState,
      hasJustSaved,
      returnUrl,
    } = options;

    try {
      showLoading('Processing certificate', 'Please wait while we prepare the certificate.');

      const isVisualChanged = getVisualSnapshot() !== initialVisualState;

      // If in edit mode and only metadata changed (no visual changes)
      if (isEditMode && !isVisualChanged) {
        const payload: any = {};
        if (store.title !== store.detailCertificate?.title) {
          payload.title = store.title;
        }
        if (store.certificate_type?.value !== store.detailCertificate?.certificate_type?.value) {
          payload.type = store.certificate_type?.value;
        }

        if (Object.keys(payload).length > 0) {
          return await saveCertificate(payload, isEditMode, certificateId, updateInitialState, hasJustSaved, returnUrl);
        }
        return;
      }

      // Process background image
      let backgroundUrl: string = '';
      let backgroundMeta: any = uploadedImageMeta || store.uploadedBackgroundMeta;

      if (store.image instanceof File) {
        const uploadResult = await uploadBackgroundImage(store.image);
        backgroundUrl = uploadResult?.url || '';
        backgroundMeta = uploadResult?.meta;
      }
      else if (typeof store.image === 'string') {
        backgroundUrl = store.image;
      }

      if (!backgroundUrl) {
        $toast({ variant: 'error', title: 'Error', text: 'Background image is required.' });
        return;
      }

      // Process content images
      const { uploadedContents, contentImageUrls } = await processContentImages(canvas.contents.value);

      // Add deleted contents to payload
      const deletedContentsPayload = canvas.deletedContents.value.map((content: any) =>
        buildContentPayload(content, null, null, true),
      );

      const finalContentsPayload = [...uploadedContents, ...deletedContentsPayload];

      // Generate template
      const template = generateCertificateTemplate({
        backgroundUrl,
        contents: canvas.contents.value,
        safeZone: store.safe_zone,
        contentImageUrls,
      });

      // Generate preview image
      let previewMeta: any = null;
      try {
        previewMeta = await generatePreviewImage(
          backgroundUrl,
          canvas.contents.value,
          store.safe_zone,
          contentImageUrls,
          store.title,
        );
      }
      catch (err) {
        console.error('[App] Could not generate/upload preview image:', err);
        // Continue without preview
      }

      // Build payload
      const payload = buildCertificateCreatePayload({
        title: store.title,
        certificateType: store.certificate_type?.value || '',
        backgroundMeta,
        previewMeta,
        template,
        safeZone: store.safe_zone,
        contents: finalContentsPayload,
      });

      const finalPayload: any = { ...payload };

      // Remove unchanged fields in edit mode
      if (isEditMode) {
        if (store.title === store.detailCertificate?.title) {
          delete finalPayload.title;
        }

        if (store.certificate_type?.value === store.detailCertificate?.certificate_type?.value) {
          delete finalPayload.type;
        }
      }

      return await saveCertificate(finalPayload, isEditMode, certificateId, updateInitialState, hasJustSaved, returnUrl);
    }
    catch (err) {
      console.error('Error processing certificate:', err);
      $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Failed to process certificate.' });
      throw err;
    }
    finally {
      hideLoading();
    }
  };

  return {
    submitCertificate,
  };
}
