<template>
  <TemplateManageLayout
    title="Edit Badge"
    class="layout-edit-badge"
    :breadcrumbs="breadcrumbs"
    :active-stepper="activeStep"
    :stepper="BADGE_TABS_EDIT"
    is-tabs
    show-header-button
    :show-cancel="false"
    disable-footer
    :disable-submit="isDisabledSubmitBtn"
    :label-submit="buttonLabelSubmit"
    :fixed-bottom-footer="true"
    :show-submit="activeStep !== 'accessibility'"
    @on-submit="handleSubmit"
    @on-change="activeStep = $event"
  >
    <template #content>
      <UiAtomsLoading
        v-if="isLoadingEdit"
        class="h-[calc(100vh-200px)]"
      />
      <template v-else>
        <BadgeInformation v-if="activeStep === 'badge-configuration'" />
        <Accessibility v-if="activeStep === 'accessibility'" />
      </template>
    </template>
  </TemplateManageLayout>
</template>

<script lang="ts" setup>
import type { IAchievementUploadResponse, IBadgeDetail } from '#achievement/config/types.ts';
import { getBadgeDetail, patchEditBadge, postUploadAchievementFile } from '#achievement/api/api.ts';
import Accessibility from '#achievement/components/form/badge/Accessibility.vue';
import BadgeInformation from '#achievement/components/form/badge/BadgeInformation.vue';
import { BADGE_TABS_EDIT } from '#achievement/config/constants.ts';
import { PERMISSION_EDIT, PERMISSION_LIST } from '#achievement/config/featureFlag.ts';
import { useBadgeStore } from '#achievement/stores/badge.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import UiAtomsLoading from '#ui/components/atoms/loading/index.vue';
import { useMutation, useQuery } from '@tanstack/vue-query';

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_EDIT],
  },
});

type TStep = 'badge-configuration' | 'accessibility';

const route = useRoute();
const store = useBadgeStore();
const { detailBadge, errors, getForm } = storeToRefs(store);
const badgeId = route.params.id as string;

const { $toast } = useNuxtApp();
const { showLoading, hideLoading } = useGlobalLoading();
const { preventLeave } = useConfirmLeave();
const { getApiErrorMessage } = useUtility();

const activeStep = ref<TStep>('badge-configuration');
const isFormInitialized = ref(false);
const isLoading = ref<boolean>(false);
const initialForm = ref<Record<string, any>>({});
const initialImage = ref<string | null>(null);

const breadcrumbs = computed(() => [
  { text: 'Master Data', href: '', active: false },
  { text: 'Achievement', href: '/achievement', active: false },
  { text: 'Edit', href: `/achievement/edit/badge/${badgeId}`, active: true },
]);

const isDisabledSubmitBtn = computed((): boolean => {
  const isAllRequiredFilled
    = !!store.title
      && !!store.title.trim()
      && !!store.description
      && !!store.description.trim()
      && !!store.image;

  if (isAllRequiredFilled && isFormChanged()) {
    return false;
  }

  if (Object.keys(errors.value).length > 0) {
    return true;
  }

  return true;
});

const buttonLabelSubmit = computed((): string => {
  return 'Save Badge Information';
});

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

// Fetch detail badge
const { isLoading: isLoadingEdit, refetch, isFetchedAfterMount } = useQuery({
  queryKey: ['get-detail-badge-edit', badgeId],
  queryFn: async () => {
    const response = await getBadgeDetail(Number(badgeId)).catch(() => {
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
  refetchOnMount: 'always',
});

// Upload image
const uploadImage = async (file: File): Promise<string | undefined> => {
  try {
    isLoading.value = true;
    showLoading('Uploading image', 'Please wait while we upload the file.');
    const response: IAchievementUploadResponse = await postUploadAchievementFile(file, 'badge');
    hideLoading();

    store.image = response?.data?.full_path || null;
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

// Edit badge mutation
const { mutate: editBadgeForm } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    await patchEditBadge(Number(badgeId), payload);

    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Badge successfully updated.',
    });

    initialForm.value = JSON.parse(JSON.stringify(getForm.value));
    initialImage.value = store.image as string;
    preventLeave.value = false;

    // Refetch to get updated data
    refetch();
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
  // Only build payload with changed fields
  const payload: Record<string, any> = {};

  // Check if image changed
  if (store.image !== initialImage.value) {
    if (store.image instanceof File) {
      const uploadedUrl = await uploadImage(store.image);
      if (uploadedUrl) {
        payload.url = uploadedUrl;
      }
    }
    else if (typeof store.image === 'string') {
      payload.url = store.image;
    }
  }

  // Check if title changed
  if (store.title !== initialForm.value.title) {
    payload.title = store.title;
  }

  // Check if description changed
  if (store.description !== initialForm.value.description) {
    payload.description = store.description;
  }

  // Only submit if there are changes
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
};

provide('refetch-detail', refetch);

watch(
  () => [getForm.value],
  () => {
    if (!isFetchedAfterMount.value) {
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
.empty-layout:has(.layout-edit-badge) {
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
