<template>
  <TemplateManageLayout
    :title="pageTitle"
    :class="[
      isCreateMode ? 'layout-add-badge' : 'layout-edit-badge',
      activeStepper === 2 ? 'layout-badge--accessibility' : '',
    ]"
    :active-stepper="isCreateMode ? activeStepper : activeStep"
    :breadcrumbs="breadcrumbs"
    :stepper="isCreateMode ? CREATE_STEPPER : BADGE_TABS_EDIT"
    :is-tabs="isEditMode"
    :disable-submit="isDisabledSubmitBtn"
    :disable-cancel="isCreateMode && activeStepper === 1"
    :label-cancel="buttonLabelCancel"
    :label-submit="buttonLabelSubmit"
    :is-loading-submit="isLoading"
    :is-loading-cancel="isLoading"
    :fixed-bottom-footer="true"
    :is-use-breadcrumbs="isEditMode"
    :show-cancel="isCreateMode"
    :show-submit="isCreateMode || activeStep !== 'accessibility'"
    show-header-button
    disable-footer
    @on-cancel="handleCancel"
    @on-submit="handleSubmit"
    @on-change="handleTabChange"
  >
    <template #content>
      <UiAtomsLoading
        v-if="isLoadingEdit"
        class="h-[calc(100vh-200px)]"
      />
      <template v-else>
        <BadgeInformation v-if="showBadgeInformation" />
        <Accessibility v-if="showAccessibility" />
      </template>
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import type { IAchievementUploadResponse, IBadgeDetail, IBadgePayload, IBadgeResponse } from '#achievement/config/types.ts';
import { getBadgeDetail, patchEditBadge, postAddBadge, postUploadAchievementFile } from '#achievement/api/api.ts';
import Accessibility from '#achievement/components/form/badge/Accessibility.vue';
import BadgeInformation from '#achievement/components/form/badge/BadgeInformation.vue';
import { BADGE_TABS_EDIT, CREATE_STEPPER, FormMode } from '#achievement/config/constants.ts';
import { PERMISSION_CREATE, PERMISSION_EDIT, PERMISSION_FEATURE_KEY, PERMISSION_LIST } from '#achievement/config/featureFlag.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import { PermissionsCoreSegmentKey } from '#core/config/constants.ts';
import { CMS_LIVE_EVENT_v2 } from '#core/config/permissions.ts';
import UiAtomsLoading from '#ui/components/atoms/loading/index.vue';

import { useMutation, useQuery } from '@tanstack/vue-query';

import { type RouteLocationNormalized, useRouter } from 'vue-router';

type TStep = 'badge-configuration' | 'accessibility';

const { $toast } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const store = useBadgeStore();
const { detailBadge, errors, getForm, createdBadgeId } = storeToRefs(store);
const { showLoading, hideLoading } = useGlobalLoading();
const { preventLeave } = useConfirmLeave();
const { getApiErrorMessage } = useUtility();

const formMode = route.params.formMode as string;
const badgeId = computed(() => route.params.id as string | undefined);

const isCreateMode = computed(() => formMode === 'create');
const isEditMode = computed(() => formMode === 'edit');

const activeStepper = ref<number>(1);

const activeStep = ref<TStep>('badge-configuration');
const isFormInitialized = ref(false);

const isLoading = ref<boolean>(false);
const initialImage = ref<string | null>(null);
const initialForm = ref<Record<string, any>>({});

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  validate: async (route) => {
    const formMode = route.params.formMode as string;
    const id = route.params.id;

    if (formMode === 'create' && id) {
      return false;
    }
    if (formMode === 'edit' && !id) {
      return false;
    }
    return ['create', 'edit'].includes(formMode);
  },
  rbac: {
    feature: PERMISSION_FEATURE_KEY,
    permissions: [PermissionsCoreSegmentKey.CREATE, PermissionsCoreSegmentKey.EDIT],
    matchFn: (permissions: string[], to: RouteLocationNormalized) => {
      const set = new Set(permissions);

      if (to?.params?.formMode === FormMode.CREATE) {
        return set.has([CMS_LIVE_EVENT_v2, PermissionsCoreSegmentKey.CREATE].join(':'));
      }

      if (to?.params?.formMode === FormMode.EDIT) {
        return set.has([CMS_LIVE_EVENT_v2, PermissionsCoreSegmentKey.EDIT].join(':'));
      }

      return false;
    },
  },
});

const rbacPermissions = computed(() => {
  return isCreateMode.value ? [PERMISSION_CREATE] : [PERMISSION_EDIT];
});

const { checkPermission } = useRBAC();
watch(() => rbacPermissions.value, (permissions) => {
  if (!checkPermission(PERMISSION_LIST, permissions)) {
    router.push('/');
  }
}, { immediate: true });

const pageTitle = computed(() => isCreateMode.value ? 'Add Badge' : 'Edit Badge');

const breadcrumbs = computed(() => {
  if (isCreateMode.value) {
    return [];
  }

  return [
    { text: 'Master Data', href: '', active: false },
    { text: 'Achievement', href: '/achievement', active: false },
    { text: 'Edit', href: `/achievement/edit/badge/${badgeId.value}`, active: true },
  ];
});

const showBadgeInformation = computed(() => {
  if (isCreateMode.value) {
    return activeStepper.value === 1;
  }
  return activeStep.value === 'badge-configuration';
});

const showAccessibility = computed(() => {
  if (isCreateMode.value) {
    return activeStepper.value === 2;
  }
  return activeStep.value === 'accessibility';
});

const isDisabledSubmitBtn = computed((): boolean => {
  const isAllRequiredFilled = !!(
    store.title
    && store.title?.trim()
    && store.description
    && store.description?.trim()
    && store.image
  );

  if (isCreateMode.value) {
    if (activeStepper.value === 1) {
      return !isAllRequiredFilled || Object.keys(errors.value).length > 0;
    }
    return false;
  }

  if (isAllRequiredFilled && isFormChanged()) {
    return false;
  }

  if (Object.keys(errors.value).length > 0) {
    return true;
  }

  return true;
});

const buttonLabelCancel = computed((): string => {
  return 'Previous';
});

const buttonLabelSubmit = computed((): string => {
  if (isCreateMode.value) {
    if (activeStepper.value === CREATE_STEPPER.length) {
      return 'Done';
    }
    if (activeStepper.value === CREATE_STEPPER.length - 1) {
      return 'Add Badge';
    }
    return 'Next';
  }

  return 'Save Badge Information';
});

function isFormDirty(): boolean {
  if (isCreateMode.value) {
    return !!(
      store.title
      || store.title?.trim()
      || store.description
      || store.description?.trim()
      || store.image
    );
  }
  return isFormChanged();
}

function isFormChanged(): boolean {
  const current = getForm.value as Record<string, any>;
  const initial = initialForm.value as Record<string, any>;

  if (!initial || !current) {
    return false;
  }

  for (const key in initial) {
    if (typeof initial[key] === 'object' && initial[key] !== null) {
      if (JSON.stringify(initial[key]) !== JSON.stringify(current[key])) {
        return true;
      }
    }
    else {
      if (initial[key] !== current[key]) {
        return true;
      }
    }
  }
  return false;
}

watch(isFormDirty, (value) => {
  preventLeave.value = value;
});

function handleCancel(): void {
  if (isCreateMode.value && activeStepper.value === 1) {
    router.back();
  }
  else if (isCreateMode.value) {
    activeStepper.value -= 1;
  }
}

function handleTabChange(value: string | number): void {
  if (isEditMode.value) {
    activeStep.value = value as TStep;
  }
}

const uploadImage = async (file: File): Promise<{ imageUrl: string; imageId: number; } | undefined> => {
  try {
    isLoading.value = true;
    showLoading('Uploading image', 'Please wait while we upload the file.');
    const response: IAchievementUploadResponse = await postUploadAchievementFile(file, 'badges');
    hideLoading();

    store.image = response?.data?.full_path || null;
    store.uploadedImageMeta = response?.data || null;

    return {
      imageUrl: response?.data?.full_path || '',
      imageId: response?.data?.id || 0,
    };
  }
  catch (err) {
    hideLoading();
    $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Image upload failed.' });
    throw err;
  }
  finally {
    isLoading.value = false;
  }
};

const { mutate: submitBadgeForm } = useMutation({
  mutationFn: async (payload: IBadgePayload) => {
    isLoading.value = true;
    showLoading('Creating badge', 'Please wait while we create the badge.');
    const response = await postAddBadge(payload).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to add badge.',
      });
    });

    if (response) {
      const data = response.data as IBadgeResponse;
      store.badgeResponse = data;

      if (data?.id) {
        store.createdBadgeId = data.id;
      }

      preventLeave.value = false;
      activeStepper.value += 1;
    }
  },
  onSettled: () => {
    isLoading.value = false;
    hideLoading();
  },
});

const { mutate: updateCreatedBadge } = useMutation({
  mutationFn: async ({ id, payload }: { id: number; payload: Record<string, any>; }) => {
    isLoading.value = true;
    showLoading('Updating badge', 'Please wait while we update the badge.');
    await patchEditBadge(id, payload);

    preventLeave.value = false;
    activeStepper.value += 1;
  },
  onSettled: () => {
    isLoading.value = false;
    hideLoading();
  },
  onError: (err) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || 'Failed to update badge.',
    });
  },
});

const { isLoading: isLoadingEdit, refetch, isFetchedAfterMount } = useQuery({
  queryKey: ['get-detail-badge-edit', badgeId],
  queryFn: async () => {
    if (!badgeId.value) {
      return undefined;
    }

    const response = await getBadgeDetail(Number(badgeId.value)).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to fetch badge details.',
      });
      return { data: undefined };
    });

    const content = response?.data as IBadgeDetail;
    if (content) {
      detailBadge.value = {
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        url: content.url,
      };

      initialImage.value = content.url || null;

      const formValues = {
        title: content.title || '',
        description: content.description || '',
        image: content.url || null,
      };

      store.setFormValues(formValues, true);
      initialForm.value = JSON.parse(JSON.stringify(formValues));
    }
    return content;
  },
  enabled: isEditMode.value && !!badgeId.value,
  refetchOnMount: 'always',
});

const { mutate: editBadgeForm } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    if (!badgeId.value) {
      return;
    }

    isLoading.value = true;
    showLoading('Updating badge', 'Please wait while we update the badge.');
    await patchEditBadge(Number(badgeId.value), payload);

    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Badge successfully updated.',
    });

    initialForm.value = JSON.parse(JSON.stringify(getForm.value));
    initialImage.value = store.image as string;
    preventLeave.value = false;

    if (isEditMode.value) {
      refetch();
    }
  },
  onSettled: () => {
    isLoading.value = false;
    hideLoading();
  },
  onError: (err) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || 'Failed to update badge.',
    });
  },
});

const handleSubmit = async (): Promise<void> => {
  if (isCreateMode.value) {
    if (activeStepper.value === 1) {
      let imageId: number | undefined;

      if (store.image instanceof File) {
        const uploadResult = await uploadImage(store.image);
        imageId = uploadResult?.imageId;
      }
      else if (typeof store.image === 'string' && store.uploadedImageMeta?.id) {
        imageId = store.uploadedImageMeta.id;
      }

      if (imageId) {
        if (createdBadgeId.value) {
          const payload: Record<string, any> = {
            title: store.title,
            description: store.description,
            image_id: imageId,
          };

          updateCreatedBadge({ id: createdBadgeId.value, payload });
        }
        else {
          const payload: IBadgePayload = {
            title: store.title,
            description: store.description,
            image_id: imageId,
          };

          submitBadgeForm(payload);
        }
      }
    }
    else {
      $toast({
        variant: 'success',
        title: 'Success',
        text: 'Badge successfully added.',
      });
      router.push({ name: 'achievement' });
    }
  }
  else {
    const payload: Record<string, any> = {};

    if (store.image !== initialImage.value) {
      if (store.image instanceof File) {
        const uploadResult = await uploadImage(store.image);
        if (uploadResult?.imageId) {
          payload.image_id = uploadResult.imageId;
        }
      }
      else if (typeof store.image === 'string' && store.uploadedImageMeta?.id) {
        payload.image_id = store.uploadedImageMeta.id;
      }
    }

    if (store.title !== initialForm.value.title) {
      payload.title = store.title;
    }

    if (store.description !== initialForm.value.description) {
      payload.description = store.description;
    }

    if (Object.keys(payload).length > 0) {
      editBadgeForm(payload);
    }
    else {
      $toast({
        variant: 'info',
        title: 'No Changes',
        text: 'No changes detected to save.',
      });
    }
  }
};

if (isEditMode.value) {
  provide('refetch-detail', refetch);
}

watch(
  () => [getForm.value],
  () => {
    if (!isEditMode.value || !isFetchedAfterMount.value) {
      return;
    }

    if (!isFormInitialized.value) {
      isFormInitialized.value = true;
    }
    else {
      preventLeave.value = true;
    }
  },
  { flush: 'post' },
);

onBeforeMount(() => {
  store.$resetAll();
});
</script>

<style lang="postcss">
.empty-layout:has(.layout-add-badge) {
  @apply h-screen w-full !bg-gray-25 !m-0;
}

.empty-layout:has(.layout-add-badge.layout-badge--accessibility) {
  @apply !bg-white;
}

.empty-layout:has(.layout-edit-badge) {
  @apply m-0 h-screen w-full !bg-gray-25;
}

.empty-layout:has(.layout-edit-badge.layout-badge--accessibility) {
  @apply !bg-white;
}

.template-manage {
  @apply h-full flex flex-col;
}

.template-manage__content {
  @apply flex-grow min-h-0 max-w-[1280px] m-auto w-full;
}

.template-manage__header {
  @apply py-4 flex-shrink-0;
}

.template-manage__header > div {
  @apply max-w-[1280px] m-auto;
}

.ui-upload-compact {
  &__content {
    @apply flex flex-col text-xs font-medium gap-[2px];
  }
}
</style>
