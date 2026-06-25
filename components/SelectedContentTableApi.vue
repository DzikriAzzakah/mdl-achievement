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
        :rows="items"
        :loading="loading"
        :pagination="pagination"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        enable-numbering
        stickyheader
        @on-page="handlePage"
      >
        <template #body-title="{ item }">
          <div class="flex gap-3 items-center">
            <img
              v-if="sectionType && sectionType.value !== LANDING_SECTION_TYPE_OPTIONS.TAGS"
              :src="thumbnailValue(item)"
              alt="myDigiLearn thumbnail audio"
              class="h-10 aspect-square rounded-md object-cover"
            >
            {{ titleValue(item) }}
          </div>
        </template>
        <template #body-status_enum="{ item }">
          <WebUiBadge
            v-if="item.status_enum"
            :color="item.status_enum?.toLowerCase() === AUDIO_STATUS_ENUM.PUBLISH ? 'success' : 'ghost'"
            variant="soft"
            size="sm"
            class="capitalize font-medium text-center"
          >
            {{ getTypeLabel(item?.status_enum) }}
          </WebUiBadge>
        </template>
        <template #body-accessibility_type="{ item }">
          <WebUiBadge
            :color="getColorAccessibility(item)"
            variant="soft"
            size="sm"
            class="capitalize font-medium text-center"
          >
            {{ getTypeLabel(item?.accessibility_type) }}
          </WebUiBadge>
        </template>
        <template
          v-if="!isDetailPage"
          #body-action="{ item }"
        >
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
import {
  ACCESSIBILITY_TYPE_ENUM,
  ACCESSIBILITY_TYPE_LABEL,
  AUDIO_STATUS_ENUM,
  AUDIO_STATUS_LABEL,
  LANDING_SECTION_TYPE_OPTIONS,
  SELECTED_PLAYLIST_COLUMNS,
} from '#audio/config/constant.ts';
import defaultThumbnail from '#audio/public/img/image-default.jpeg';
import { useAudioLandingStore } from '#audio/stores/landing.ts';
import ListLayout from '#core/components/templates/ListLayout.vue';

interface IProps {
  items?: Record<any, string>[];
  pagination?: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalData: number;
  };
  loading?: boolean;
  contentType?: 'playlist' | 'featured-audio' | 'featured-tag';
}

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  pagination: () => ({
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalData: 0,
  }),
  loading: false,
  contentType: 'playlist',
});

const emit = defineEmits(['onFetch', 'onDelete']);
const { items, pagination, loading } = toRefs(props);

const { debounce } = useUtility();
const route = useRoute();

const landingStore = useAudioLandingStore();
const { sectionType } = storeToRefs(landingStore);
const isDetailPage = route.name === 'audio-detail-playlist-id';

const search = ref<string>('');
const debouncedSearch = ref<string>('');
const sortOrder = ref<ISmartTableSortData>({});
const currentPage = ref<number>(1);

watch(() => pagination.value.currentPage, (newPage) => {
  if (newPage !== currentPage.value) {
    currentPage.value = newPage;
  }
}, { immediate: true });

function handlePage(page = 1) {
  if (currentPage.value === page) {
    return;
  }
  currentPage.value = page;
  emit('onFetch', { page, sort: sortOrder.value, search: debouncedSearch.value });
}

watch(sortOrder, () => {
  emit('onFetch', { page: currentPage.value, sort: sortOrder.value, search: debouncedSearch.value });
}, { deep: true });

const handleSearch = debounce((value: string) => {
  if (value.length >= 3 || value.length === 0) {
    debouncedSearch.value = value;
    currentPage.value = 1;
    emit('onFetch', { page: 1, sort: sortOrder.value, search: value });
  }
}, 1000);

watch(search, (newVal: any) => handleSearch(newVal));

const dataColumns = computed(() => {
  if (sectionType?.value?.value === LANDING_SECTION_TYPE_OPTIONS.TAGS) {
    return SELECTED_PLAYLIST_COLUMNS.filter((item: any) => ['title', 'action'].includes(item.key));
  }

  return isDetailPage
    ? SELECTED_PLAYLIST_COLUMNS.filter((item: any) => item.key !== 'action')
    : SELECTED_PLAYLIST_COLUMNS;
});

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

function handleDeletePlaylistItem(item: any) {
  emit('onDelete', item);
}

function getTypeLabel(data: string) {
  switch (data) {
    case AUDIO_STATUS_ENUM.PUBLISH:
      return AUDIO_STATUS_LABEL.PUBLISH;
    case AUDIO_STATUS_ENUM.DRAFT:
      return AUDIO_STATUS_LABEL.DRAFT;
    case ACCESSIBILITY_TYPE_ENUM.UNASSIGNED:
      return ACCESSIBILITY_TYPE_LABEL.UNASSIGNED;
    case ACCESSIBILITY_TYPE_ENUM.RESTRICTED:
      return ACCESSIBILITY_TYPE_LABEL.RESTRICTED;
    case ACCESSIBILITY_TYPE_ENUM.PUBLIC:
      return ACCESSIBILITY_TYPE_LABEL.PUBLIC;
    default:
      return '-';
  }
}

function getColorAccessibility(data: any) {
  switch (data?.accessibility_type) {
    case 'UNASSIGNED':
      return 'ghost';
    case 'RESTRICTED':
      return 'info';
    default:
      return 'success';
  }
}

function titleValue(item: any) {
  return item?.title || '-';
}

function thumbnailValue(item: any) {
  return item?.thumbnail || defaultThumbnail;
}
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
