<template>
  <WebUiModal
    v-model="showModal"
    prevent-close
    position="center"
    size="lg"
    :divider="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <template #header-title>
      <div class="flex flex-col gap-3 w-full text-xl font-semibold">
        {{ modalTitle }}
      </div>
    </template>
    <div class="flex flex-col gap-5">
      <section class="flex flex-col gap-4 max-h-[30.25rem]">
        <!-- Search -->
        <div class="flex justify-between items-center gap-3">
          <WebUiInput
            v-model="search"
            :placeholder="modalPlaceholder"
            icon="mdi-search"
            class="flex-1"
          >
            <template
              v-if="search"
              #trailing
            >
              <Icon
                name="mdi-close"
                width="20"
                height="20"
                mode="svg"
                class="text-gray-500 cursor-pointer"
                @click="search = ''"
              />
            </template>
          </WebUiInput>
        </div>

        <WebUiSmartTable
          v-model="dataSelected"
          v-model:sort="sortOrder"
          :columns="columns"
          :rows="itemsWithSelectionState"
          :pagination="pagination"
          :empty-title="emptyTitle"
          :empty-description="emptyDescription"
          :loading="isLoading"
          enable-numbering
          enable-selection
          stickyheader
          @update:page="handlePage"
        >
          <template #body-title="{ item }">
            <div class="flex gap-3 items-center">
              <img
                v-if="!isPlaylistContent && !isTagContent"
                :src="getThumbnailUrl(item)"
                alt="thumbnail"
                class="h-10 aspect-square rounded-md object-cover"
              >
              {{ item?.title }}
            </div>
          </template>
          <template #body-tag="{ item }">
            <div class="flex gap-3 items-center">
              {{ item?.title }}
            </div>
          </template>
        </WebUiSmartTable>
      </section>
      <section class="w-full justify-between flex gap-3">
        <span class="text-sm font-medium self-center">
          Selected ({{ selectedCount }}/{{ maxItems }})
        </span>
        <div class="flex gap-3">
          <WebUiButton
            size="lg"
            color="ghost"
            variant="outline"
            class="w-32"
            @click="handleCancel"
          >
            Cancel
          </WebUiButton>
          <WebUiButton
            size="lg"
            color="primary"
            variant="solid"
            class="w-32"
            :disabled="isDisabledBtn"
            @click="handleSubmit"
          >
            Add
          </WebUiButton>
        </div>
      </section>
    </div>
  </WebUiModal>
</template>

<script setup lang="ts">
import type { ISmartTableSortData } from '@mydigilearn-saas/web-ui';
import { getAudioList, getPlaylist, getPlaylistContent, getTagOptionsWithId } from '#audio/api/api.ts';
import { LANDING_SECTION_TYPE_OPTIONS, PLAYLIST_CONTENT_COLUMNS, SECTION_CONTENT_TAG_COLUMNS, SOURCE_TYPE_ENUM } from '#audio/config/constant.ts';
import { buildMediaUrl } from '#audio/helpers';
import defaultThumbnail from '#audio/public/img/image-default.jpeg';
import { useAudioLandingStore } from '#audio/stores/landing.ts';
import { useQuery } from '@tanstack/vue-query';

// props & emits
const props = withDefaults(defineProps<IAddFeaturedContent>(), {});
const emit = defineEmits(['update:modelValue', 'onClose', 'onSubmit', 'ok']);

const defaultThumbnailSrc: string = defaultThumbnail as unknown as string;

function getThumbnailUrl(item: any): string {
  return buildMediaUrl(item.cover_url) || item.thumbnail_url || defaultThumbnailSrc;
}

interface IAddFeaturedContent {
  modelValue: boolean;
  data?: Record<any, string>[];
}

// Utilities
const { debounce } = useUtility();

// Data
const store = useAudioLandingStore();
const {
  sectionType,
  layoutType,
  sourceType,
  sourcePlaylist,
  sourceTag,
} = storeToRefs(store);

const { $toast } = useNuxtApp();

const search = ref<string>('');
const debouncedSearch = ref<string>('');
const sortOrder = ref<ISmartTableSortData>({});
const dataSelected = ref<Record<any, string>[]>([]);
const currentPage = ref<number>(1);
const requestId = ref<number>(0);

const selectedContentMap = ref<Record<string, Record<any, string>>>({});
const selectedOnCurrentPage = ref<string[]>([]);
const isSyncingSelection = ref<boolean>(false);

const pagination = ref({
  currentPage: 1,
  perPage: 5,
  totalPages: 1,
  totalData: 0,
});

// Constants
const AUDIO_LIST_COLUMNS = [
  { key: 'title', label: 'Title', width: '100%', sortable: true },
];

// Computed
const isTagContent = computed(() => sectionType.value?.value === LANDING_SECTION_TYPE_OPTIONS.TAGS);
const isAudioContent = computed(() => sectionType.value?.value === LANDING_SECTION_TYPE_OPTIONS.AUDIO);
const isPlaylistContent = computed(() => sectionType.value?.value === LANDING_SECTION_TYPE_OPTIONS.PLAYLIST_AUDIOS);

const isSourcePlaylistSource = computed(() => sourceType?.value?.value === SOURCE_TYPE_ENUM.PLAYLIST);
const isSourceTagSource = computed(() => sourceType?.value?.value === SOURCE_TYPE_ENUM.TAG);

const maxItems = computed(() => {
  if (isTagContent.value) {
    return 12;
  }
  if (isPlaylistContent.value && layoutType.value.value === 'grid') {
    return 9;
  }
  if (isAudioContent.value && layoutType.value.value === 'grid') {
    return 12;
  }
  return 10;
});

const modalTitle = computed(() => {
  if (isTagContent.value) {
    return 'Add Tag';
  }
  if (isAudioContent.value) {
    return 'Add Audio';
  }
  if (isPlaylistContent.value) {
    return 'Add Playlist';
  }
  return 'Add Content';
});

const modalPlaceholder = computed(() => {
  if (isTagContent.value) {
    return 'Search tag';
  }
  if (isAudioContent.value) {
    return 'Search audio by title';
  }
  if (isPlaylistContent.value) {
    return 'Search playlist by title';
  }
  return 'Search content';
});

const columns = computed(() => {
  if (isTagContent.value) {
    return SECTION_CONTENT_TAG_COLUMNS;
  }
  if (isPlaylistContent.value) {
    return PLAYLIST_CONTENT_COLUMNS;
  }
  return AUDIO_LIST_COLUMNS;
});

const showModal = computed({
  get: () => props.modelValue,
  set: newValue => emit('update:modelValue', newValue),
});

const selectedCount = computed(() => Object.keys(selectedContentMap.value).length);

const isSelectionLimitReached = computed(() => selectedCount.value >= maxItems.value);

const isDisabledBtn = computed(() => {
  return selectedCount.value < 1;
});

// Empty State
const emptyTitle = computed(() => {
  if (search.value) {
    return 'We couldn\'t find anything';
  }
  return '';
});

const emptyDescription = computed(() => {
  if (search.value) {
    return 'Perhaps consider using a different keyword for better results.';
  }
  return '';
});

const queryKey = computed(() => {
  const sortEntry = Object.entries(sortOrder.value).find(([, v]) => v !== undefined);
  return [
    'featured-content-modal',
    requestId.value,
    {
      contentType: sectionType.value?.value,
      currentPage: currentPage.value,
      perPage: 5,
      keyword: debouncedSearch.value || undefined,
      sortKey: sortEntry?.[0] || undefined,
      sortType: sortEntry?.[1] || undefined,
      sourceTypeValue: sourceType?.value?.value,
      sourcePlaylistId: sourcePlaylist?.value?.id || sourcePlaylist?.value?.value,
      sourceTagId: sourceTag?.value?.id || sourceTag?.value?.value,
    },
  ];
});

const { data: queryData, error: queryError, isError, isLoading } = useQuery({
  queryKey,
  queryFn: async ({ queryKey: qk }) => {
    const [, , paramsRaw] = qk;
    const params = paramsRaw as any;
    const page = params.currentPage;
    const searchValue = params.keyword;
    const sort = params.sortKey && params.sortType ? `${params.sortKey}-${params.sortType}` : '';

    // Tags
    if (isTagContent.value) {
      const response = await getTagOptionsWithId();

      if (response?.data?.contents) {
        const allTags = response.data.contents.map((item: any) => ({
          id: item.id,
          title: item.tag,
        })) || [];

        let filteredTags = allTags;
        if (searchValue) {
          filteredTags = allTags.filter((tag: any) =>
            tag.title.toLowerCase().includes(searchValue.toLowerCase()),
          );
        }

        const perPage = 5;
        const totalData = filteredTags.length;
        const totalPages = Math.ceil(totalData / perPage);
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;

        return {
          contents: filteredTags.slice(startIndex, endIndex),
          pagination: {
            current_page: page,
            per_page: perPage,
            total_pages: totalPages,
            total_data: totalData,
          },
        };
      }
    }
    // Audio - source: Playlist
    else if (isAudioContent.value && isSourcePlaylistSource.value) {
      const playlistId = sourcePlaylist?.value?.id || sourcePlaylist?.value?.value;
      if (!playlistId) {
        return { contents: [], pagination: null };
      }

      const response = await getPlaylistContent(Number(playlistId), {
        params: {
          page,
          limit: 5,
          ...(sort && { sort }),
          ...(searchValue && { search: searchValue }),
        },
      });

      const contents = (response?.data?.contents || []).map((item: any) => ({
        ...item,
        title: item.title || '',
        id: item.content_id || item.id,
      }));

      return {
        contents,
        pagination: {
          current_page: response?.data?.pagination?.current_page || page,
          per_page: response?.data?.pagination?.per_page || 5,
          total_pages: response?.data?.pagination?.total_pages || 1,
          total_data: response?.data?.pagination?.total_data || 0,
        },
      };
    }
    // Audio - source: Tag
    else if (isAudioContent.value && isSourceTagSource.value) {
      const tagId = sourceTag?.value?.id || sourceTag?.value?.value;
      const response = await getAudioList({
        page,
        limit: 5,
        ...(sort && { sort }),
        ...(searchValue && { search: searchValue }),
        ...(tagId && { 'filter[tag_ids]': tagId }),
      });

      return {
        contents: response?.data?.contents || response?.data || [],
        pagination: response?.data?.pagination,
      };
    }
    // Audio - source: Master (default)
    else if (isAudioContent.value) {
      const response = await getAudioList({
        page,
        limit: 5,
        ...(sort && { sort }),
        ...(searchValue && { search: searchValue }),
      });

      return {
        contents: response?.data?.contents || response?.data || [],
        pagination: response?.data?.pagination,
      };
    }
    else if (isPlaylistContent.value) {
      const response = await getPlaylist({
        'paginate': true,
        'page': page,
        'limit': 5,
        'filter[type]': 'audio',
        ...(sort && { sort }),
        ...(searchValue && { search: searchValue }),
      });

      const contents = (response?.data?.contents || []).map((item: any) => ({
        ...item,
        title: item.title || item.label || '',
        thumbnail_url: buildMediaUrl(item.cover_url),
      }));

      return {
        contents,
        pagination: response?.data?.pagination,
      };
    }

    return { contents: [], pagination: null };
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
});

// Derived rows for the table
const items = computed(() => {
  const data = queryData.value;
  if (!data) {
    return [];
  };
  return data.contents || [];
});

// Augment rows with hideSelection flag when limit reached
// ponytail: WebUiSmartTable has no max/maxSelectable prop; using hideSelection
// to hide checkboxes on rows that cannot be added (not already selected + limit reached).
const itemsWithSelectionState = computed(() => {
  return items.value.map((item: Record<string, any>) => {
    const key = getItemKey(item);
    const isAlreadySelected = key ? !!selectedContentMap.value[key] : false;
    const shouldHide = !isAlreadySelected && isSelectionLimitReached.value;
    return {
      ...item,
      hideSelection: shouldHide,
    };
  });
});

watch(() => queryData.value?.pagination, (newPagination) => {
  if (newPagination) {
    pagination.value.totalData = newPagination.total_data;
    pagination.value.totalPages = newPagination.total_pages;
  }
});

watch(items, () => {
  syncPageSelectionFromMap();
}, { deep: true });

watch(currentPage, (page) => {
  pagination.value.currentPage = page;
}, { immediate: true });

watch(isError, (val) => {
  if (val && queryError.value) {
    $toast({
      variant: 'error',
      title: 'Error',
      text: 'Failed to fetch content.',
    });
  }
});

// Methods
const handleSearch = debounce((value: string) => {
  if (value.length >= 3 || value.length === 0) {
    debouncedSearch.value = value;
    currentPage.value = 1;
  }
}, 1000);

function getItemKey(item: Record<string, any>): string {
  const id = item?.id ?? item?.content_id;
  return id !== undefined && id !== null ? String(id) : '';
}

function initSelectedContentMap() {
  const map: Record<string, Record<any, string>> = {};

  (props.data || []).forEach((item: Record<string, any>) => {
    const key = getItemKey(item);
    if (!key) {
      return;
    }
    map[key] = { ...item };
  });

  selectedContentMap.value = map;
}

function syncPageSelectionFromMap() {
  const rows = itemsWithSelectionState.value || [];
  const selectedRows = rows.filter((item: Record<string, any>) => {
    const key = getItemKey(item);
    return !!key && !!selectedContentMap.value[key];
  }) as Record<any, string>[];

  isSyncingSelection.value = true;
  dataSelected.value = selectedRows;
  selectedOnCurrentPage.value = selectedRows
    .map((item: Record<string, any>) => getItemKey(item))
    .filter(Boolean);
  nextTick(() => {
    isSyncingSelection.value = false;
  });
}

function handleCancel() {
  initSelectedContentMap();
  syncPageSelectionFromMap();
  emit('onClose');
}

function handlePage(page = 1) {
  currentPage.value = page;
}

function handleSubmit() {
  emit('onSubmit');
  store.setSelectedFeaturedContent(Object.values(selectedContentMap.value));
  selectedContentMap.value = {};
  selectedOnCurrentPage.value = [];
  dataSelected.value = [];
}

// Watchers
watch(search, (newVal: any) => handleSearch(newVal));

watch(dataSelected, (newSelected) => {
  if (isSyncingSelection.value) {
    return;
  }

  // Detect removals: keys that were on this page but are no longer selected
  const nextSelectedKeys = new Set(
    (newSelected || [])
      .map((item: Record<string, any>) => getItemKey(item))
      .filter(Boolean),
  );

  // Find which keys are being added (not already in map)
  const keysBeingAdded: string[] = [];
  nextSelectedKeys.forEach((key) => {
    if (!(key in selectedContentMap.value)) {
      keysBeingAdded.push(key);
    }
  });

  // Enforce cross-page selection limit
  let availableSlots = maxItems.value - selectedCount.value;
  if (keysBeingAdded.length > availableSlots) {
    // Cap additions to fill remaining slots (e.g., "Select All" on a full page)
    $toast({
      variant: 'warning',
      title: 'Selection Limit',
      text: `You can only select up to ${maxItems.value} items. Only the first ${availableSlots} item(s) were added.`,
    });

    // Build capped selection: keep previously-selected items + first N new ones
    const cappedSelected = (newSelected || []).filter((item: Record<string, any>) => {
      const key = getItemKey(item);
      if (!key) {
        return false;
      }
      // Already in map? Keep it
      if (key in selectedContentMap.value) {
        return true;
      }
      // New item? Only keep if within available slots
      if (availableSlots > 0) {
        availableSlots--;
        return true;
      }
      return false;
    });

    // Sync capped set back to table and skip further processing this tick
    isSyncingSelection.value = true;
    dataSelected.value = cappedSelected;

    // Add the capped new items to the map
    cappedSelected.forEach((item: Record<string, any>) => {
      const key = getItemKey(item);
      if (!key || key in selectedContentMap.value) {
        return;
      }
      selectedContentMap.value[key] = item;
    });

    // Update on-page tracking
    selectedOnCurrentPage.value = cappedSelected
      .map((item: Record<string, any>) => getItemKey(item))
      .filter(Boolean);

    nextTick(() => {
      isSyncingSelection.value = false;
    });
    return;
  }

  // Process removals
  selectedOnCurrentPage.value.forEach((key) => {
    if (!nextSelectedKeys.has(key)) {
      delete selectedContentMap.value[key];
    }
  });

  // Add new selections to map
  (newSelected || []).forEach((item: Record<string, any>) => {
    const key = getItemKey(item);
    if (!key) {
      return;
    }
    selectedContentMap.value[key] = item;
  });

  selectedOnCurrentPage.value = Array.from(nextSelectedKeys);
}, { deep: true });

watch(() => props.modelValue, (newVal: boolean) => {
  if (newVal) {
    search.value = '';
    debouncedSearch.value = '';
    currentPage.value = 1;
    sortOrder.value = {};
    requestId.value++;

    initSelectedContentMap();
  }
});
</script>

<style lang="postcss" scoped>
:deep(.smarttable__container) {
  overflow-y: hidden;
}
</style>
