<template>
  <TemplateManageLayout
    title="Edit Section"
    class="layout-edit-landing"
    :breadcrumbs="[]"
    :disable-submit="isDisabledSubmitBtn"
    label-submit="Save"
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
      <WebUiLoading
        v-if="isLoadingDetail"
        class="h-[calc(100vh-200px)]"
      />
      <template v-else>
        <AddLanding />
      </template>
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import { addSectionItem, deleteSectionItem, editLandingSectionV2, getDetailLandingSectionV2 } from '#audio/api/api.ts';
import AddLanding from '#audio/components/form/AddLanding.vue';
import { useSectionDetail } from '#audio/composables/useSectionDetail.ts';
import { FEATURED_CONTENT_TYPE_ENUM, LANDING_SECTION_TYPE_OPTIONS, SOURCE_TYPE_ENUM } from '#audio/config/constant.ts';
import { PERMISSION_EDIT, PERMISSION_LIST } from '#audio/config/featureFlag.ts';
import { useAudioLandingStore } from '#audio/stores/landing.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
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

// Utils
const router = useRouter();
const route = useRoute();
const store = useAudioLandingStore();
const { landingSectionErrors, getLandingSectionForm } = storeToRefs(store);
const { preventLeave } = useConfirmLeave();
const { $toast } = useNuxtApp();
const { getApiErrorMessage } = useUtility();
const sectionId = computed(() => route.params.id);

const { enrichMasterSectionItems, enrichPlaylistSectionItems, enrichTagSectionItems } = useSectionDetail();

// Data
const isLoading = ref<boolean>(false);
const initialForm = ref<Record<string, any>>({});

// Computed
const isDisabledSubmitBtn = computed(() => {
  // Check for validation errors
  if (Object.keys(landingSectionErrors.value).length > 0) {
    return true;
  }

  // Check required fields
  const type = store.sectionType;
  const isCustom = store.featuredContentType?.value === 'custom';
  const hasTitle = !!(store.sectionTitle && store.sectionTitle.trim());
  const hasType = !!type;
  const hasFeatured = !!store.featuredContentType?.value;
  const hasSelected = store.selectedFeaturedContent.length > 0;

  let isFieldsValid = false;

  if (type === LANDING_SECTION_TYPE_OPTIONS.TAGS) {
    isFieldsValid = isCustom
      ? (hasTitle && hasType && hasFeatured && hasSelected)
      : (hasTitle && hasType && hasFeatured);
  }
  else if (type === LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
    isFieldsValid = isCustom
      ? (hasTitle && hasType && hasFeatured && hasSelected)
      : (hasTitle && hasType && hasFeatured);
  }
  else if (type === LANDING_SECTION_TYPE_OPTIONS.PLAYLIST_AUDIOS) {
    isFieldsValid = isCustom
      ? (hasTitle && hasType && hasFeatured && hasSelected)
      : (hasTitle && hasType && hasFeatured);
  }
  else if (type) {
    isFieldsValid = (hasTitle && hasType && hasFeatured);
  }

  if (!isFieldsValid) {
    return true;
  }

  // Check if form has changed
  if (!isFormChanged()) {
    return true;
  }

  return false;
});

function isFormChanged() {
  const current = getLandingSectionForm.value as Record<string, any>;
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

// Fetch detail landing section
const { isLoading: isLoadingDetail, refetch, isFetchedAfterMount } = useQuery({
  queryKey: computed(() => ['get-detail-landing-section', sectionId.value]),
  queryFn: async () => {
    try {
      const response = await getDetailLandingSectionV2(Number(sectionId.value));
      const detail = response?.data || response as any;

      // Map section type, content_type from API
      const sectionTypeValue = detail?.content_type || detail?.section_type || detail?.source_type || null;
      const sectionTypeLabel = detail?.content_type || detail?.section_type || detail?.source_type || null;

      // Map featured content type (display_rule)
      const contentSelectionType = detail?.display_rule || detail?.content_selection_type || FEATURED_CONTENT_TYPE_ENUM.LATEST;

      // Layout type
      const layoutValue = detail?.layout_type;
      const layoutObj = typeof layoutValue === 'string'
        ? { label: layoutValue, value: layoutValue }
        : layoutValue || { label: 'List', value: 'list' };

      // Enrich section_items with actual content details
      let selectedContent: any[] = [];
      const contentItems = (detail?.section_items || detail?.items || []) as any[];

      if (contentItems.length > 0 && detail?.content_type === LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
        const st = detail?.source_type || null;

        if (!st) {
          // Master mode, fetch audio detail per content_id
          const enriched = await enrichMasterSectionItems(contentItems);
          selectedContent = enriched;
          store.sourceType = { label: 'Master', value: 'master' };
          store.sourcePlaylist = null;
          store.sourceTag = null;
        }
        else if (st === SOURCE_TYPE_ENUM.PLAYLIST && detail?.source_id) {
          // Playlist mode, fetch playlist contents and cross-reference
          const playlistId = Number(detail.source_id);
          const { items: enriched, playlistInfo } = await enrichPlaylistSectionItems(contentItems, playlistId);
          selectedContent = enriched;
          store.sourceType = { label: st, value: st };
          store.sourcePlaylist = playlistInfo
            ? { label: playlistInfo.title, value: playlistInfo.id, id: playlistInfo.id, title: playlistInfo.title }
            : null;
          store.sourceTag = null;
        }
        else if (st === SOURCE_TYPE_ENUM.TAG && detail?.source_id) {
          // Tag mode, fetch audio by tag and cross-reference
          const tagId = Number(detail.source_id);
          const { items: enriched, tagInfo } = await enrichTagSectionItems(contentItems, tagId);
          selectedContent = enriched;
          store.sourceType = { label: st, value: st };
          store.sourceTag = tagInfo
            ? { label: tagInfo.title, value: String(tagInfo.id), id: tagInfo.id as any, title: tagInfo.title, tag: tagInfo.title, tag_id: String(tagInfo.id) }
            : null;
          store.sourcePlaylist = null;
        }
        else {
          // Fallback: map from metadata
          selectedContent = contentItems.map((item: any) => ({
            id: item.content_id || item.id,
            content_id: item.content_id || item.id,
            content_type: item.content_type,
            title: item.metadata?.title || item.title || '',
            tag: item.metadata?.tag || item.metadata?.title || item.tag || '',
            thumbnail_url: item.metadata?.thumbnail_url || item.thumbnail_url || '',
            slug: item.metadata?.slug || item.slug || '',
            created_at: item.metadata?.created_at || item.created_at || '',
            updated_at: item.metadata?.updated_at || item.updated_at || '',
            section_item_id: item.id,
          }));
        }
      }
      else if (contentItems.length > 0) {
        // Non-audio type: map from metadata
        selectedContent = contentItems.map((item: any) => ({
          id: item.content_id || item.id,
          content_id: item.content_id || item.id,
          content_type: item.content_type,
          title: item.metadata?.title || item.title || '',
          tag: item.metadata?.tag || item.metadata?.title || item.tag || '',
          thumbnail_url: item.metadata?.thumbnail_url || item.thumbnail_url || '',
          slug: item.metadata?.slug || item.slug || '',
          created_at: item.metadata?.created_at || item.created_at || '',
          updated_at: item.metadata?.updated_at || item.updated_at || '',
          section_item_id: item.id,
        }));
      }

      // Store original section_item IDs for DELETE diff on save
      const originalIds = selectedContent
        .map((item: any) => item.section_item_id)
        .filter((id: any): id is number => typeof id === 'number' && id > 0);
      store.setOriginalSectionItemIds(originalIds);

      // Update store with processed data
      store.setLandingSectionFormValues({ sectionTitle: detail?.title || '' }, true);
      store.sectionDescription = detail?.description || '';
      store.sectionType = sectionTypeValue ? { label: sectionTypeLabel, value: sectionTypeValue } : null;
      store.featuredContentType = contentSelectionType ? { label: contentSelectionType, value: contentSelectionType } : null;
      store.selectedFeaturedContent = selectedContent;
      store.layoutType = layoutObj;

      // Set source type fields if audio type, only if NOT already set during enrichment above.
      if (!store.sourceType && detail?.content_type !== LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
        store.sourceType = null;
      }

      // Store initial form state for change detection
      const initialSourceType = store.sourceType
        ? { label: store.sourceType.label, value: store.sourceType.value }
        : null;
      const initialSourcePlaylist = store.sourcePlaylist
        ? { label: store.sourcePlaylist.label, value: store.sourcePlaylist.value, id: store.sourcePlaylist.id, title: store.sourcePlaylist.title }
        : null;
      const initialSourceTag = store.sourceTag
        ? { label: store.sourceTag.label, value: store.sourceTag.value, id: store.sourceTag.id, title: store.sourceTag.title, tag: store.sourceTag.tag, tag_id: store.sourceTag.tag_id }
        : null;

      initialForm.value = JSON.parse(JSON.stringify({
        sectionTitle: detail?.title || '',
        sectionDescription: detail?.description || '',
        sectionType: store.sectionType,
        featuredContentType: store.featuredContentType,
        selectedFeaturedContent: selectedContent,
        layoutType: layoutObj,
        sourceType: initialSourceType,
        sourcePlaylist: initialSourcePlaylist,
        sourceTag: initialSourceTag,
      }));

      return detail || {};
    }
    catch (err) {
      $toast({
        variant: 'error',
        title: 'Error',
        text: getApiErrorMessage(err) || 'Failed to fetch detail landing section.',
      });
      return { data: {} };
    }
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

provide('refetch-detail', refetch);

const { mutate: editLandingSectionById } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    await editLandingSectionV2(Number(sectionId.value), payload);

    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Section successfully updated.',
    });

    initialForm.value = JSON.parse(JSON.stringify(getLandingSectionForm.value));
    preventLeave.value = false;
  },
  onError: (err) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || 'Failed to edit section.',
    });
    preventLeave.value = false;
  },
});

/**
 * Sync section_items with DELETE for removed items and POST for new items.
 */
async function syncSectionItems(): Promise<void> {
  const originalIds = new Set(store.originalSectionItemIds);
  const currentIds = new Set<number>();
  const newItems: { section_item_id?: number; content_type: string; content_id: number; }[] = [];

  for (const item of store.selectedFeaturedContent) {
    const siid = (item as any).section_item_id;
    if (typeof siid === 'number' && siid > 0) {
      currentIds.add(siid);
    }
    else {
      newItems.push({
        content_type: (item as any).content_type || store.sectionType?.value || 'audio',
        content_id: Number((item as any).content_id) || Number((item as any).id),
      });
    }
  }

  // Compute removed IDs (in original but not in current)
  const removedIds = [...originalIds].filter(id => !currentIds.has(id));

  // DELETE removed items
  const deletePromises = removedIds.map(id =>
    deleteSectionItem(id).catch((err: any) => {
      console.error(`[APP] Failed to delete section item ${id}:`, err);
    }),
  );

  if (deletePromises.length > 0) {
    await Promise.allSettled(deletePromises);
  }

  // POST new items
  const sectionIdNum = Number(sectionId.value);
  const addPromises = newItems.map(item =>
    addSectionItem({
      section_id: sectionIdNum,
      content_type: item.content_type,
      content_id: item.content_id,
    }).catch((err: any) => {
      console.error('[APP] Failed to add section item:', err);
    }),
  );

  if (addPromises.length > 0) {
    await Promise.allSettled(addPromises);
  }
}

// Methods
const handleSubmit = async () => {
  isLoading.value = true;
  try {
    const isCustom = store.featuredContentType?.value === 'custom';
    const contentType = store.sectionType?.value;

    // Only sync section items for custom display_rule (has actual selected content)
    if (isCustom) {
      await syncSectionItems();
    }

    // Build items array for custom display rule
    const items = isCustom && store.selectedFeaturedContent.length
      ? store.selectedFeaturedContent.map((item: any) => {
          return Number(item.content_id) || Number(item.id);
        })
      : [];

    // Determine source_type and source_id based on content type
    let sourceTypeVal: string | null = null;
    let sourceId: string | number | null = null;

    if (contentType === LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
      const st = store.sourceType?.value;
      if (st === 'playlist') {
        sourceTypeVal = 'playlist';
        sourceId = store.sourcePlaylist?.id || store.sourcePlaylist?.value || null;
      }
      else if (st === 'tag') {
        sourceTypeVal = 'tag';
        sourceId = store.sourceTag?.id || store.sourceTag?.value || null;
      }
      else {
        sourceTypeVal = null;
        sourceId = null;
      }
    }

    // Determine visible_item_count based on content_type and layout_type
    let visibleItemCount: number | undefined;
    if (contentType === LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
      visibleItemCount = store.layoutType?.value === 'grid' ? 9 : 10;
    }
    else if (contentType === LANDING_SECTION_TYPE_OPTIONS.TAGS) {
      visibleItemCount = 12;
    }
    else if (contentType === LANDING_SECTION_TYPE_OPTIONS.PLAYLIST_AUDIOS) {
      visibleItemCount = 10;
    }

    const payload = {
      title: store.sectionTitle,
      description: store.sectionDescription || null,
      content_type: contentType,
      source_type: sourceTypeVal,
      source_id: sourceId,
      display_rule: store.featuredContentType?.value || 'latest',
      layout_type: store.layoutType?.value || 'list',
      items,
      ...(!isCustom && visibleItemCount !== undefined && { visible_item_count: visibleItemCount }),
    };

    editLandingSectionById(payload);
  }
  catch (err) {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || 'Failed to save section items.',
    });
  }
  finally {
    isLoading.value = false;
  }
};

function handleCancel() {
  router.back();
}

watch(
  () => [
    store.sectionTitle,
    store.sectionDescription,
    store.sectionType,
    store.featuredContentType,
    store.selectedFeaturedContent,
    store.layoutType,
    store.sourceType,
    store.sourcePlaylist,
    store.sourceTag,
  ],
  () => {
    if (!isFetchedAfterMount.value) {
      return;
    };
    preventLeave.value = true;
  },
  { flush: 'post', deep: true },
);

watch(
  sectionId,
  () => {
    store.sectionTitle = '';
    store.sectionDescription = '';
    store.sectionType = null;
    store.featuredContentType = null;
    store.selectedFeaturedContent = [];
    store.layoutType = { label: 'List', value: 'list' };
    store.sourceType = null;
    store.sourcePlaylist = null;
    store.sourceTag = null;
    store.setOriginalSectionItemIds([]);
    preventLeave.value = false;
  },
  { immediate: false },
);

onBeforeUnmount(() => {
  store.$resetAll();
});
</script>

<style lang="postcss" scoped>
.layout-edit-landing {
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

.layout-edit-landing {
  :deep(.ui-tmpl-adjacent__header-content--sticky) {
    top: calc(var(--header-offset, 0) * 1px);
  }
}
</style>
