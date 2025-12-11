<template>
  <TemplateManageLayout
    title="Add Badge"
    :class="activeStepper === 1 ? 'layout-add-badge' : ''"
    :active-stepper="activeStepper"
    :breadcrumbs="[]"
    :stepper="stepper"
    :disable-submit="isDisabledSubmitBtn"
    :disable-cancel="activeStepper === 1"
    :label-cancel="buttonLabelCancel"
    :label-submit="buttonLabelSubmit"
    :is-loading-submit="isLoading"
    :is-loading-cancel="isLoading"
    :fixed-bottom-footer="true"
    :is-use-breadcrumbs="false"
    show-header-button
    disable-footer
    @on-cancel="handleCancel"
    @on-submit="handleSubmit"
  >
    <template #content>
      <BadgeInformation v-if="activeStepper === 1" />
      <Accessibility v-if="activeStepper === 2" />
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import type { IAchievementUploadResponse, IBadgePayload, IBadgeResponse } from '#achievement/config/types.ts';
import { patchEditBadge, postAddBadge, postUploadAchievementFile } from '#achievement/api/api.ts';
import Accessibility from '#achievement/components/form/badge/Accessibility.vue';
import BadgeInformation from '#achievement/components/form/badge/BadgeInformation.vue';
import { CREATE_STEPPER } from '#achievement/config/constants.ts';
import { PERMISSION_CREATE, PERMISSION_LIST } from '#achievement/config/featureFlag.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';

import { useMutation } from '@tanstack/vue-query';

const { $toast } = useNuxtApp();

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_CREATE],
  },
});

const store = useBadgeStore();
const { errors } = storeToRefs(store);
const router = useRouter();
const { showLoading, hideLoading } = useGlobalLoading();
const { preventLeave } = useConfirmLeave();
const { getApiErrorMessage } = useUtility();

const activeStepper = ref<number>(1);
const stepper = CREATE_STEPPER;
const isLoading = ref<boolean>(false);
const badgeId = ref<number | string | null>(null);
const initialImage = ref<string | null>(null);

function isFormDirty(): boolean {
  if (
    store.title
    || store.title?.trim()
    || store.description
    || store.description?.trim()
    || store.image
  ) {
    return true;
  }
  return false;
}

watch(isFormDirty, (value) => {
  preventLeave.value = value;
});

const isDisabledSubmitBtn = computed((): boolean => {
  if (activeStepper.value === 1) {
    return !(
      store.title
      && store.title?.trim()
      && store.description
      && store.description.trim()
      && store.image
    ) || Object.keys(errors.value).length > 0;
  }
  return false;
});

const buttonLabelCancel = computed((): string => {
  return 'Previous';
});

const buttonLabelSubmit = computed((): string => {
  if (activeStepper.value === stepper.length) {
    return 'Done';
  }

  if (activeStepper.value === stepper.length - 1) {
    return 'Add Badge';
  }

  return 'Next';
});

function handleCancel(): void {
  if (activeStepper.value === 1) {
    router.back();
  }
  else {
    activeStepper.value -= 1;
  }
}

const uploadImage = async (file: File): Promise<string | undefined> => {
  try {
    isLoading.value = true;
    showLoading('Uploading image', 'Please wait while we upload the file.');
    const response: IAchievementUploadResponse = await postUploadAchievementFile(file, 'badges');
    hideLoading();

    // Store both the image URL and the upload metadata
    store.image = response?.data?.full_path || null;
    store.uploadedImageMeta = response?.data || null;

    return response?.data?.full_path;
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

// submit form badge (create new)
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
      badgeId.value = data?.id || null;

      preventLeave.value = false;
      activeStepper.value += 1;
      initialImage.value = payload.url;
    }
  },
  onSettled: () => {
    isLoading.value = false;
    hideLoading();
  },
});

// edit badge form (when going back from step 2)
const { mutate: editBadgeForm } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    isLoading.value = true;
    showLoading('Updating badge', 'Please wait while we update the badge.');
    await patchEditBadge(Number(badgeId.value), payload);

    preventLeave.value = false;
    if (badgeId.value) {
      activeStepper.value += 1;
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
  if (activeStepper.value === 1) {
    let imageUrl: string | undefined = '';

    // Upload image if it's a file or use existing URL
    if (store.image instanceof File) {
      imageUrl = await uploadImage(store.image);
    }
    else if (typeof store.image === 'string') {
      imageUrl = store.image;
    }

    if (imageUrl) {
      // If badgeId exists, it means user went back from step 2 - edit instead of create
      if (badgeId.value) {
        const payload: Record<string, any> = {};

        // Only add changed fields
        if (store.image !== initialImage.value) {
          payload.url = imageUrl;
        }
        if (store.title) {
          payload.title = store.title;
        }
        if (store.description) {
          payload.description = store.description;
        }

        editBadgeForm(payload);
      }
      else {
        // Create new badge
        const payload: IBadgePayload = {
          title: store.title,
          description: store.description,
          url: imageUrl,
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
};

onBeforeMount(() => {
  store.$resetAll();
});
</script>

<style lang="postcss">
.empty-layout:has(.layout-add-badge) {
  @apply h-screen w-full !bg-gray-25 !m-0;
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
