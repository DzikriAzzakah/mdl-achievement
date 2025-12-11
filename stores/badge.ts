import type { IBadgeDetail, IBadgeForm, IBadgeResponse, IUploadedImageMetadata } from '#achievement/config/types.ts';
import { badgeValidationSchema } from '#achievement/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm, useIsFormValid } from 'vee-validate';

export const useBadgeStore = defineStore('badge', () => {
  // state
  const detailBadge = ref<IBadgeDetail>();
  const uploadedImageMeta = ref<IUploadedImageMetadata | null>(null);

  const { errors, defineField, handleSubmit, resetForm, values, setValues: setFormValues } = useForm({
    validationSchema: badgeValidationSchema,
    initialValues: {
      title: '',
      description: '',
      image: null,
    } as unknown as IBadgeForm,
  });

  const getForm = computed(() => ({
    ...values,
  }));

  const isValid = useIsFormValid();
  const badgeResponse = ref<IBadgeResponse>();

  // form fields
  const [title] = defineField('title');
  const [description] = defineField('description');
  const [image] = defineField('image');

  const $resetAll = () => {
    resetForm();
    detailBadge.value = undefined;
    badgeResponse.value = undefined;
    uploadedImageMeta.value = null;
  };

  return {
    detailBadge,
    errors,
    title,
    description,
    image,
    uploadedImageMeta,
    handleSubmit,
    $resetAll,
    resetForm,
    getForm,
    setFormValues,
    isValid,
    badgeResponse,
  };
});
