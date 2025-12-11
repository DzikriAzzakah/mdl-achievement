import type { ICertificateDetail, ICertificateForm, ICertificateResponse } from '#achievement/config/types.ts';
import { certificateValidationSchema } from '#achievement/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm, useIsFormValid } from 'vee-validate';

export const useCertificateStore = defineStore('certificate', () => {
  // state
  const detailCertificate = ref<ICertificateDetail>();

  const { errors, defineField, handleSubmit, resetForm, values, setValues: setFormValues } = useForm({
    validationSchema: certificateValidationSchema,
    initialValues: {
      title: '',
      description: '',
      certificate_type: '',
      image: null,
      contents: [],
      safe_zone: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
    } as unknown as ICertificateForm,
  });

  const getForm = computed(() => ({
    ...values,
  }));

  const isValid = useIsFormValid();
  const certificateResponse = ref<ICertificateResponse>();

  // form fields
  const [title] = defineField('title');
  const [description] = defineField('description');
  const [certificate_type] = defineField('certificate_type');
  const [image] = defineField('image');
  const [contents] = defineField('contents');
  const [safe_zone] = defineField('safe_zone');

  const $resetAll = () => {
    resetForm();
    detailCertificate.value = undefined;
    certificateResponse.value = undefined;
  };

  return {
    detailCertificate,
    errors,
    title,
    description,
    certificate_type,
    image,
    contents,
    safe_zone,
    handleSubmit,
    $resetAll,
    resetForm,
    getForm,
    setFormValues,
    isValid,
    certificateResponse,
  };
});
