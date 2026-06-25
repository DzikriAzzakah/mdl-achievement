<template>
  <ListLayout
    class="selected-playlist-table"
    :breadcrumbs="[]"
  >
    <template #filter-search>
      <WebUiInput
        v-model="search"
        placeholder="Search audio by title"
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
    </template>
    <template #table>
      <WebUiSmartTable
        v-model:sort="sortOrder"
        :columns="dataColumns"
        :rows="dataRowsMapped"
        :loading="isLoadingContent"
        :pagination="pagination"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        enable-numbering
        stickyheader
        @update:page="handlePage"
      >
        <template #body-title="{ item }">
          <div class="flex gap-3 items-center">
            <img
              v-if="sectionType?.value !== LANDING_SECTION_TYPE_OPTIONS.TAGS"
              :src="item.cover_url || defaultThumbnail"
              alt="myDigiLearn thumbnail audio"
              class="h-10 aspect-square rounded-md object-cover"
            >
            {{ titleValue(item) }}
          </div>
        </template>
        <template #body-status_enum="{ item }">
          <template v-if="item.status_enum">
            <WebUiBadge
              :color="item.status_enum?.toLowerCase() === 'publish' ? 'success' : 'ghost'"
              variant="soft"
              size="sm"
              class="capitalize font-medium text-center"
            >
              {{ getTypeLabel(item?.status_enum) }}
            </WebUiBadge>
          </template>
          <template v-else>
            -
          </template>
        </template>
        <template #body-accessibility_type="{ item }">
          <WebUiBadge
            :color="getColorAccessibility(item?.accessibility_type)"
            variant="soft"
            size="sm"
            class="capitalize font-medium text-center"
          >
            {{ getTypeLabel(item?.accessibility_type) }}
          </WebUiBadge>
        </template>
        <template #body-action="{ item }">
          <div class="audio-list__action">
            <WebUiButton
              icon="mdi-delete"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="audio-list__action-button"
              @click="handleDeletePlaylistItem(item)"
            />
          </div>
        </template>
      </WebUiSmartTable>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import type { ISmartTableSortData } from '@mydigilearn-saas/web-ui';
import { deletePlaylistContent, getPlaylistContent } from '#audio/api/api.ts';
import { AUDIO_TAB_TYPE, LANDING_SECTION_TYPE_OPTIONS, SELECTED_PLAYLIST_COLUMNS } from '#audio/config/constant.ts';
import defaultThumbnail from '#audio/public/img/image-default.jpeg';
import { useAudioLandingStore } from '#audio/stores/landing.ts';
import { useAudioPlaylistStore } from '#audio/stores/playlist.ts';
import { getColorAccessibility, getTypeLabel } from '#audio/utils/getColorAndLabel.ts';
import ListLayout from '#core/components/templates/ListLayout.vue';
import { useMutation, useQuery } from '@tanstack/vue-query';

interface IProps {
  contentType?: 'playlist' | 'featured-audio' | 'featured-tag';
}

const props = withDefaults(defineProps<IProps>(), {
  contentType: 'playlist',
});

const { contentType } = toRefs(props);

// Utilities
const { debounce } = useUtility();
const route = useRoute();
const { showLoading, hideLoading } = useGlobalLoading();
const { $toast } = useNuxtApp();
const { getApiErrorMessage } = useUtility();

// Data
const playlistStore = useAudioPlaylistStore();
const landingStore = useAudioLandingStore();
const { sectionType } = storeToRefs(landingStore);
const dataRows = ref<Record<any, string>[]>([]);
const isDetailPage = route.name === 'audio-detail-playlist-id';
const isEditPage = route.name === 'audio-edit-playlist-id';
const playlistId = route.params.id;
const enabledGetPlaylistContent = ref<boolean>(false);

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 10,
  totalPages: 1,
  totalData: 0,
});

// Search
const search = ref<string>('');
const debouncedSearch = ref<string>('');
const sortOrder = ref<ISmartTableSortData>({});

function handlePage(page = 1) {
  pagination.value.currentPage = page;
}

// Computed
const dataColumns = computed(() => {
  if (sectionType?.value?.value === LANDING_SECTION_TYPE_OPTIONS.TAGS) {
    return SELECTED_PLAYLIST_COLUMNS.filter((item: any) => ['title', 'action'].includes(item.key));
  }

  return isDetailPage
    ? SELECTED_PLAYLIST_COLUMNS.filter((item: any) => item.key !== 'action')
    : SELECTED_PLAYLIST_COLUMNS;
});
const filteredRows = computed(() => {
  if (!debouncedSearch.value) {
    return dataRows.value;
  }

  return dataRows.value.filter((item: any) => {
    const RowTitle = item?.title || '';
    return RowTitle.toLowerCase().includes(debouncedSearch.value.toLowerCase());
  });
});

const dataRowsMapped = computed(() => {
  return filteredRows.value.slice(
    (pagination.value.currentPage - 1) * pagination.value.perPage,
    pagination.value.currentPage * pagination.value.perPage,
  );
});

const rawData = computed(() => {
  if (contentType.value === 'playlist') {
    return playlistStore.playlistContent || [];
  }

  return landingStore.selectedFeaturedContent || [];
});

const handleSearch = debounce((value: string) => {
  if (value.length >= 3 || value.length === 0) {
    debouncedSearch.value = value;
    pagination.value.currentPage = 1;
  }
}, 1000);

watch(filteredRows, () => {
  pagination.value.totalData = filteredRows.value.length;
  pagination.value.totalPages = Math.ceil(filteredRows.value.length / pagination.value.perPage);

  if (pagination.value.currentPage > pagination.value.totalPages && pagination.value.totalPages > 0) {
    pagination.value.currentPage = pagination.value.totalPages;
  }
});

watch(search, (newVal: any) => handleSearch(newVal));

// Empty State
const emptyTitle = computed(() => {
  if (search.value) {
    return 'We couldn’t find anything';
  }

  return '';
});

const emptyDescription = computed(() => {
  if (search.value) {
    return 'Perhaps consider using a different keyword for better results.';
  }

  return '';
});

// Methods
function mapStatusEnum(items: any[]) {
  return items.map((item: any) => ({
    ...item,
    status_enum: item.status_enum ?? (item.is_published ? 'publish' : 'draft'),
  }));
}

function updateDataRows() {
  dataRows.value = mapStatusEnum(rawData.value);
  pagination.value.totalData = dataRows.value.length;
  pagination.value.totalPages = Math.ceil(dataRows.value.length / pagination.value.perPage);

  if (pagination.value.currentPage > pagination.value.totalPages && pagination.value.totalPages > 0) {
    pagination.value.currentPage = pagination.value.totalPages;
  }
}

const { isLoading: isLoadingContent, refetch: refetchGetPlaylistContent } = useQuery({
  queryKey: ['get-playlist-content'],
  queryFn: async () => {
    try {
      const response = await getPlaylistContent(Number(playlistId));

      if (response) {
        playlistStore.setPlaylistContent(response?.data?.contents);
      }
      return response || {};
    }
    catch {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to fetch playlist contents.',
      });
      return [];
    }
  },
  enabled: enabledGetPlaylistContent.value,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

const { mutate: deletePlaylistContentById } = useMutation({
  mutationFn: async (id: number) => {
    const payload = {
      playlistId,
      contentId: id,
    };
    return await deletePlaylistContent(payload);
  },
  onSuccess: () => {
    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Playlist content successfully deleted.',
    });
    enabledGetPlaylistContent.value = true;
    refetchGetPlaylistContent();
  },
  onError: (error) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(error) || 'Failed to delete playlist content.',
    });
  },
  onMutate: () => {
    showLoading();
  },
  onSettled: () => {
    hideLoading();
  },
});

function handleDeletePlaylistItem(item: any) {
  if (isEditPage) {
    return deletePlaylistContentById(Number(item.id));
  }

  if (contentType.value === AUDIO_TAB_TYPE.PLAYLIST) {
    playlistStore.removePlaylistContent(item.id);
  }
  else {
    landingStore.removeSelectedFeaturedContent(item.id);
  }
  updateDataRows();
}

function titleValue(item: any) {
  return item?.title || '-';
}

watch(() => playlistStore.playlistContent, () => {
  updateDataRows();
});

watch(() => landingStore.selectedFeaturedContent, () => {
  updateDataRows();
}, { deep: true });

// Mounted
onMounted(() => {
  updateDataRows();
});
</script>

<style lang="postcss" scoped>
@import '../styles/list.css';

.selected-playlist-table__action-button {
  color: var(--color-gray-300);
}

.selected-playlist-table.template-list {
  @apply py-0 gap-6;

  :deep(.template-list__header) {
    @apply hidden;
  }
}
</style>
