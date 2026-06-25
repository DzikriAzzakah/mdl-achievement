<template>
  <TemplateManageLayout
    title="Create New Section"
    class="layout-create-landing"
    :breadcrumbs="[]"
    :disable-submit="isDisabledSubmitBtn"
    label-submit="Create"
    :is-loading-submit="isLoading"
    :fixed-bottom-footer="true"
    :is-use-breadcrumbs="false"
    show-header-button
    :show-cancel="false"
    disable-footer
    @on-cancel="handleCancel"
    @on-submit="handleSubmit"
  >
    <template #content>
      <AddLanding />
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import { postCreateSectionLandingV2 } from '#audio/api/api.ts';
import AddLanding from '#audio/components/form/AddLanding.vue';
import { LANDING_SECTION_TYPE_OPTIONS } from '#audio/config/constant.ts';
import { PERMISSION_CREATE, PERMISSION_LIST } from '#audio/config/featureFlag.ts';
import { useAudioLandingStore } from '#audio/stores/landing.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import { useMutation } from '@tanstack/vue-query';

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_CREATE],
  },
});

// store
const store = useAudioLandingStore();
const {
  featuredContentType,
  sectionTitle,
  sectionDescription,
  sectionType,
  selectedFeaturedContent,
  layoutType,
  sourceType,
  sourcePlaylist,
  sourceTag,
} = storeToRefs(store);

// Utilities
const router = useRouter();
const { $toast } = useNuxtApp();

// Data
const isLoading = ref<boolean>(false);

const isDisabledSubmitBtn = computed(() => {
  const type = sectionType?.value?.value;
  const isCustom = featuredContentType?.value?.value === 'custom';
  const hasTitle = !!(sectionTitle?.value && sectionTitle?.value.trim());
  const hasType = !!type;
  const hasFeatured = !!featuredContentType?.value?.value;
  const hasSelected = selectedFeaturedContent?.value.length > 0;

  if (type === LANDING_SECTION_TYPE_OPTIONS.TAGS) {
    return isCustom
      ? !(hasTitle && hasType && hasFeatured && hasSelected)
      : !(hasTitle && hasType && hasFeatured);
  }
  if (type === LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
    return isCustom
      ? !(hasTitle && hasType && hasFeatured && hasSelected)
      : !(hasTitle && hasType && hasFeatured);
  }
  if (type === LANDING_SECTION_TYPE_OPTIONS.PLAYLIST_AUDIOS) {
    return isCustom
      ? !(hasTitle && hasType && hasFeatured && hasSelected)
      : !(hasTitle && hasType && hasFeatured);
  }
  if (type) {
    return !(hasTitle && hasType && hasFeatured);
  }
  return true;
});

const { mutate: submitSectionLanding } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    isLoading.value = true;
    const response = await postCreateSectionLandingV2(payload).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to create section.',
      });
    });

    if (response) {
      $toast({
        variant: 'success',
        title: 'Success',
        width: '32em',
        text: `Section successfully created.`,
      });
      return router.push({ name: 'audio', query: { tab: 'landing-page' } });
    }
  },
  onSettled: () => {
    isLoading.value = false;
  },
});

function handleCancel() {
  router.back();
}

const handleSubmit = async () => {
  const isCustom = featuredContentType?.value?.value === 'custom';
  const contentType = sectionType?.value?.value;

  // Build items array for custom display rule
  const items = isCustom && selectedFeaturedContent?.value?.length
    ? selectedFeaturedContent.value.map((item: any) => {
        return Number(item.content_id) || Number(item.id);
      })
    : [];

  // Determine source_type and source_id based on content type
  let sourceTypeVal: string | null = null;
  let sourceId: string | number | null = null;

  if (contentType === LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
    // For audio: source_type from sourceType select, source_id from playlist/tag
    const st = sourceType?.value?.value;
    if (st === 'playlist') {
      sourceTypeVal = 'playlist';
      sourceId = sourcePlaylist?.value?.id || sourcePlaylist?.value?.value || null;
    }
    else if (st === 'tag') {
      sourceTypeVal = 'tag';
      sourceId = sourceTag?.value?.id || sourceTag?.value?.value || null;
    }
    else {
      // Master - source_type null means master audio
      sourceTypeVal = null;
      sourceId = null;
    }
  }

  // Determine visible_item_count based on content_type and layout_type
  let visibleItemCount: number | undefined;
  if (contentType === LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
    visibleItemCount = layoutType?.value?.value === 'grid' ? 9 : 10;
  }
  else if (contentType === LANDING_SECTION_TYPE_OPTIONS.TAGS) {
    visibleItemCount = 12;
  }
  else if (contentType === LANDING_SECTION_TYPE_OPTIONS.PLAYLIST_AUDIOS) {
    visibleItemCount = 10;
  }

  const payload = {
    title: sectionTitle?.value,
    description: sectionDescription?.value || null,
    content_type: contentType,
    source_type: sourceTypeVal,
    source_id: sourceId,
    display_rule: featuredContentType?.value?.value || 'latest',
    layout_type: layoutType?.value?.value || 'list',
    items,
    ...(!isCustom && visibleItemCount !== undefined && { visible_item_count: visibleItemCount }),
  };

  submitSectionLanding(payload);
};

onBeforeUnmount(() => {
  store.$resetAll();
});
</script>

<style lang="postcss" scoped>
.layout-create-landing {
  & {
    @apply flex-1 relative items-center gap-y-0;
  }

  :deep(.template-manage__content) {
    @apply p-6;
  }

  :deep(.template-manage__header-row),
  :deep(.template-manage__content) {
    max-width: 1280px;
    margin: 0 auto;
  }

  :deep(.template-manage__header-row) {
    @apply px-6;
  }

  :deep(.template-manage__content) {
    @apply flex-1;
  }
}

:deep(.template-manage__header) {
  @apply py-4 border-b border-gray-100;
}
.layout-create-landing {
  :deep(.ui-tmpl-adjacent__header-content--sticky) {
    top: calc(var(--header-offset, 0) * 1px);
  }
}
</style>
