import type { BadgeDetail, BadgeForm, BadgeResponse, UploadedFileMeta } from '#achievement/config/types.ts';
import { badgeValidationSchema } from '#achievement/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm } from 'vee-validate';

export const useBadgeStore = defineStore('badge', () => {
  const detailBadge = ref<BadgeDetail>();
  const uploadedImageMeta = ref<UploadedFileMeta | null>(null);
  const createdBadgeId = ref<number | null>(null);

  const { errors, defineField, resetForm, values, setValues: setFormValues } = useForm({
    validationSchema: badgeValidationSchema,
    initialValues: {
      title: '',
      description: '',
      image: null,
    } as unknown as BadgeForm,
  });

  const getForm = computed(() => ({
    ...values,
  }));

  const badgeResponse = ref<BadgeResponse>();

  const [title] = defineField('title');
  const [description] = defineField('description');
  const [image] = defineField('image');

  const $resetAll = () => {
    resetForm();
    detailBadge.value = undefined;
    badgeResponse.value = undefined;
    uploadedImageMeta.value = null;
    createdBadgeId.value = null;
  };

  return {
    detailBadge,
    errors,
    title,
    description,
    image,
    uploadedImageMeta,
    createdBadgeId,
    $resetAll,
    resetForm,
    getForm,
    setFormValues,
    badgeResponse,
  };
});
