import type { CertificateDetailResponseData } from '#achievement/config/types';
import { getCertificateDetail } from '#achievement/api/api';

export function useCertificateDetailLoader() {
  const { $toast } = useNuxtApp();
  const router = useRouter();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { getApiErrorMessage } = useUtility();

  const loadCertificateDetail = async (
    routeId: string,
    store: any,
    canvas: any,
    uploadedImageMetaRef: Ref<any>,
    certificateIdRef: Ref<number | string | null>,
    updateInitialState: () => void,
  ) => {
    showLoading('Loading certificate', 'Please wait while we load the certificate data.');

    try {
      const response = await getCertificateDetail(Number(routeId));
      const data = response?.data as CertificateDetailResponseData;

      if (data) {
        store.setFormFromDetail(data);

        if (data.contents && data.contents.length > 0) {
          canvas.loadContentsFromPayload(data.contents);
        }

        certificateIdRef.value = data.id;
        uploadedImageMetaRef.value = store.uploadedBackgroundMeta;
        updateInitialState();
      }

      return data;
    }
    catch (err) {
      $toast({
        variant: 'error',
        title: 'Error',
        text: getApiErrorMessage(err as Error) || 'Failed to fetch certificate details.',
      });
      router.push({ name: 'achievement' });
      return null;
    }
    finally {
      hideLoading();
    }
  };

  return {
    loadCertificateDetail,
  };
}
