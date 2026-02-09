import { FormMode } from '#achievement/config/constants';

export function useCertificateForm() {
  const route = useRoute();
  const router = useRouter();
  const { buildReturnUrl } = useQueryUrlParams();

  const store = useCertificateStore();
  const canvas = useCertificateCanvas();
  const { errors, title, certificate_type, image, safe_zone } = storeToRefs(store);
  const contents = toRef(canvas, 'contents');
  const selectedContentKey = toRef(canvas, 'selectedContentKey');

  const formMode = computed(() => route.params.formMode as string);
  const isEditMode = computed(() => formMode.value === FormMode.EDIT);
  const routeId = computed(() => route.params.id as string | undefined);
  const returnUrl = buildReturnUrl('/achievement');

  const activeStepper = ref<number>(1);
  const activeStep = ref<'certificate-configuration'>('certificate-configuration');
  const isLoading = ref<boolean>(false);
  const certificateId = ref<number | string | null>(null);
  const uploadedImageMeta = ref<any>(null);
  const isLoadingDetail = ref<boolean>(false);
  const hasJustSaved = ref<boolean>(false);
  const initialFormState = ref<string>('');
  const initialVisualState = ref<string>('');

  const breadcrumbs = computed(() => {
    if (!isEditMode.value) {
      return [];
    }

    return [
      { text: 'Master Data', href: '', active: false },
      { text: 'Achievement', href: returnUrl.value, active: false },
      { text: 'Edit', href: `/achievement/edit/certificate/${routeId.value}`, active: true },
    ];
  });

  const showCertificateInformation = computed(() => {
    if (!isEditMode.value) {
      return activeStepper.value === 1;
    }
    return activeStep.value === 'certificate-configuration';
  });

  const imagePreview = computed(() => {
    if (store.image instanceof File) {
      return URL.createObjectURL(store.image);
    }
    if (typeof store.image === 'string') {
      return store.image;
    }
    return null;
  });

  const getVisualState = () => ({
    image: store.image instanceof File
      ? { name: store.image.name, size: store.image.size, lastModified: store.image.lastModified }
      : store.image,
    safe_zone: store.safe_zone,
    contents: canvas.contents.value.map((c: any) => {
      const contentFile = (c as any).file;
      return {
        ...c,
        file: contentFile ? { name: contentFile.name, size: contentFile.size } : null,
        metadata: c.metadata,
      };
    }),
  });

  const getFormSnapshot = () => JSON.stringify({
    title: store.title,
    certificate_type: store.certificate_type,
    visual: getVisualState(),
  });

  const isFormChanged = () => {
    return getFormSnapshot() !== initialFormState.value;
  };

  const isDisabledSubmitBtn = computed(() => {
    if (activeStepper.value === 1) {
      const isPrimaryDataInvalid = !(store.title?.trim() && store.certificate_type?.value && store.image);
      if (isPrimaryDataInvalid || Object.keys(errors.value).length > 0 || isLoadingDetail.value) {
        return true;
      }

      if (isEditMode.value) {
        if (hasJustSaved.value) {
          return true;
        }

        if (!isFormChanged()) {
          return true;
        }

        return false;
      }
    }

    return false;
  });

  const buttonLabelCancel = computed(() => {
    return activeStepper.value === 1 ? 'Cancel' : 'Previous';
  });

  const buttonLabelSubmit = computed(() => {
    if (isEditMode.value) {
      if (hasJustSaved.value) {
        return 'Saved';
      }
      return 'Save';
    }
    return 'Add';
  });

  const getVisualSnapshot = () => JSON.stringify(getVisualState());

  const updateInitialState = () => {
    initialFormState.value = getFormSnapshot();
    initialVisualState.value = getVisualSnapshot();
    hasJustSaved.value = false;
  };

  const isFormDirtyLegacy = () => {
    return !!(store.title?.trim() || store.certificate_type || store.image);
  };

  const handleTabChange = (value: string | number): void => {
    if (isEditMode.value) {
      activeStep.value = value as 'certificate-configuration';

      if (value === 'certificate-configuration') {
        activeStepper.value = 1;
      }
    }
  };

  const handleCancel = () => {
    if (activeStepper.value === 1) {
      router.back();
    }
    else {
      activeStepper.value -= 1;
    }
  };

  return {
    // State
    store,
    canvas,
    errors,
    title,
    certificate_type,
    image,
    safe_zone,
    contents,
    selectedContentKey,
    activeStepper,
    activeStep,
    isLoading,
    certificateId,
    uploadedImageMeta,
    isLoadingDetail,
    hasJustSaved,
    initialFormState,
    initialVisualState,

    // Computed
    formMode,
    isEditMode,
    routeId,
    returnUrl,
    breadcrumbs,
    showCertificateInformation,
    imagePreview,
    isDisabledSubmitBtn,
    buttonLabelCancel,
    buttonLabelSubmit,

    // Methods
    getVisualState,
    getFormSnapshot,
    getVisualSnapshot,
    isFormChanged,
    updateInitialState,
    isFormDirtyLegacy,
    handleTabChange,
    handleCancel,
  };
}
