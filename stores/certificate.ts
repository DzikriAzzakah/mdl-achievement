import type {
  CertificateCreatePayload,
  CertificateDetail,
  CertificateForm,
  CertificateResponse,
  LayoutGuideline,
  SafeZone,
  UploadedFileMeta,
} from '#achievement/config/types.ts';
import { TYPE_OPTIONS } from '#achievement/config/constants.ts';
import { certificateValidationSchema } from '#achievement/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm } from 'vee-validate';

export const useCertificateStore = defineStore('certificate', () => {
  const detailCertificate = ref<CertificateDetail>();
  const certificateResponse = ref<CertificateResponse>();
  const uploadedBackgroundMeta = ref<UploadedFileMeta | null>(null);
  const layoutGuideline = ref<LayoutGuideline>({
    enabled: false,
    type: 'grid',
    count: 12,
    gutter: 20,
    color: '#FF0080',
  });

  const { errors, defineField, resetForm, values, setValues: setFormValues } = useForm({
    validationSchema: certificateValidationSchema,
    initialValues: {
      title: '',
      certificate_type: { label: '', value: '' },
      image: null,
      contents: [],
      safe_zone: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
    } as CertificateForm,
  });

  const getForm = computed(() => ({
    ...values,
  }));

  const [title] = defineField('title');
  const [certificate_type] = defineField('certificate_type');
  const [image] = defineField('image');
  const [contents] = defineField('contents');
  const [safe_zone] = defineField('safe_zone');

  function setFormFromDetail(data: Omit<CertificateCreatePayload, 'preview'> & { id?: number; preview_url?: string; }): void {
    const typeOption = TYPE_OPTIONS.find(opt => opt.value === data.type);
    const certificateType = typeOption
      ? { label: typeOption.label, value: typeOption.value }
      : { label: data.type, value: data.type };

    const imageUrl = data.background?.full_path
      || (data.background?.image_host && data.background?.file_path
        ? `${data.background.image_host}${data.background.file_path}`
        : null);

    uploadedBackgroundMeta.value = data.background || null;

    const safeZone: SafeZone = data.metadata?.safe_zone || {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    };

    setFormValues({
      title: data.title || '',
      certificate_type: certificateType,
      image: imageUrl,
      contents: values.contents,
      safe_zone: safeZone,
    });

    if (data.id) {
      detailCertificate.value = {
        id: data.id,
        title: data.title,
        certificate_type: certificateType,
      };
    }
  }

  function updateSafeZone(zone: SafeZone): void {
    safe_zone.value = { ...zone };
  }

  function updateLayoutGuideline(guideline: LayoutGuideline): void {
    layoutGuideline.value = { ...guideline };
  }

  const $resetAll = () => {
    resetForm();
    detailCertificate.value = undefined;
    certificateResponse.value = undefined;
    uploadedBackgroundMeta.value = null;
    layoutGuideline.value = {
      enabled: false,
      type: 'grid',
      count: 12,
      gutter: 20,
      color: '#FF0080',
    };
  };

  return {
    detailCertificate,
    errors,
    title,
    certificate_type,
    image,
    contents,
    safe_zone,
    certificateResponse,
    uploadedBackgroundMeta,
    layoutGuideline,

    getForm,

    resetForm,
    setFormValues,
    $resetAll,
    setFormFromDetail,
    updateSafeZone,
    updateLayoutGuideline,
  };
});
