<template>
  <WebUiModal
    v-model="showModal"
    prevent-close
    position="center"
    size="lg"
    :divider="true"
    padding="15px"
    :ui="{
    }"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <template #header-title>
      <div class="flex flex-col gap-3 w-full text-xl font-semibold">
        Add Audio
      </div>
    </template>

    <template #default>
      <div class="flex flex-col gap-4">
        <!-- Search and Tree -->
        <div class="flex justify-between items-center gap-3">
          <WebUiInput
            v-model="search"
            placeholder="Search audio by title"
            icon="mdi-search"
            class="flex-1"
          />
        </div>

        <WebUiSmartTable
          v-model="dataSelected"
          v-model:sort="sortOrder"
          :columns="columns"
          :rows="existData"
          :loading="isLoadingAudioList"
          :pagination="pagination"
          :empty-title="emptyTitle"
          :empty-description="emptyDescription"
          enable-numbering
          enable-selection
          stickyheader
          @update:page="handlePage"
        >
          <template #body-title="{ item }">
            <div class="flex gap-3 items-center">
              <img
                :src="item.thumbnail_url || defaultThumbnail"
                alt="myDigiLearn thumbnail audio"
                class="h-10 aspect-square rounded-md object-cover"
              >
              {{ item?.title }}
            </div>
          </template>
        </WebUiSmartTable>
      </div>
    </template>
    <template #footer>
      <div class="w-full flex gap-3 justify-end">
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
    </template>
  </WebUiModal>
</template>

<script setup lang="ts">
import type { IListAudio, IPlaylist } from '#audio/config/types.ts';
import type { ISmartTableSortData } from '@mydigilearn-saas/web-ui';
import { getAudioList, getAudioListNotInPlaylist } from '#audio/api/api.ts';
import { PLAYLIST_CONTENT_COLUMNS } from '#audio/config/constant.ts';
import { buildMediaUrl } from '#audio/helpers';
import defaultThumbnail from '#audio/public/img/image-default.jpeg';
import { useQuery } from '@tanstack/vue-query';

interface IAddPlaylist {
  modelValue: boolean;
  data?: IPlaylist[];
  playlistId?: number | string | undefined;
};

// props & emits
const props = defineProps<IAddPlaylist>();
const emit = defineEmits(['update:modelValue', 'onClose', 'onSubmit', 'ok']);

// Utilities
const { debounce, getApiErrorMessage } = useUtility();
const { $toast } = useNuxtApp();
const route = useRoute();

// Data
const existData = ref<any[]>([]);
const columns = PLAYLIST_CONTENT_COLUMNS;
const search = ref<string>('');
const debouncedSearch = ref<string>('');
const sortOrder = ref<ISmartTableSortData>({});
const currentSortKey = ref<string>('');
const currentSortType = ref<string>('');
const dataSelected = ref<IPlaylist[]>([]);
const selectedContentMap = ref<Record<string, IPlaylist>>({});
const selectedOnCurrentPage = ref<string[]>([]);
const isSyncingSelection = ref<boolean>(false);
const isEditPage = route.name === 'audio-edit-playlist-id';

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 5,
  totalPages: 1,
  totalData: 0,
});

// computed
const showModal = computed({
  get: () => props.modelValue,
  set: newValue => emit('update:modelValue', newValue),
});

const selectedContent = computed(() => Object.values(selectedContentMap.value));

const isDisabledBtn = computed(() => {
  return selectedContent.value.length < 1;
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

// Method
const handleSearch = debounce((key: string) => {
  if (key?.length > 2 || key?.length === 0) {
    debouncedSearch.value = key;
    pagination.value.currentPage = 1;
  }
}, 1000);

const resetSelected = () => {
  dataSelected.value = [];
  selectedContentMap.value = {};
  selectedOnCurrentPage.value = [];
};

const resetModal = () => {
  resetSelected();
  pagination.value = {
    currentPage: 1,
    perPage: 5,
    totalPages: 1,
    totalData: 0,
  };
  search.value = '';
  debouncedSearch.value = '';
  sortOrder.value = {};
  currentSortKey.value = '';
  currentSortType.value = '';
};

function handleCancel() {
  resetModal();
  emit('onClose');
}

function handlePage(page = 1) {
  pagination.value.currentPage = page;
}

function getItemKey(item: Partial<IPlaylist> & Record<string, any>) {
  const id = item?.id ?? item?.content_id;
  return id !== undefined && id !== null ? String(id) : '';
}

function initSelectedContentMap() {
  const map: Record<string, IPlaylist> = {};

  (props.data || []).forEach((item) => {
    const key = getItemKey(item as Record<string, any>);

    if (!key) {
      return;
    }

    map[key] = item;
  });

  selectedContentMap.value = map;
}

function syncPageSelectionFromMap() {
  const rows = existData.value || [];
  const selectedRows = rows.filter((item: Record<string, any>) => {
    const key = getItemKey(item);
    return !!key && !!selectedContentMap.value[key];
  }) as IPlaylist[];

  isSyncingSelection.value = true;
  dataSelected.value = selectedRows;
  selectedOnCurrentPage.value = selectedRows
    .map((item: Record<string, any>) => getItemKey(item))
    .filter(Boolean);
  isSyncingSelection.value = false;
}

const queryKey = computed(() => {
  const sortEntry = Object.entries(sortOrder.value).find(([, v]) => v !== undefined);
  return [
    'audio-list-get',
    {
      currentPage: pagination?.value?.currentPage,
      perPage: pagination?.value?.perPage,
      keyword: debouncedSearch?.value || undefined,
      sortKey: sortEntry?.[0] || undefined,
      sortType: sortEntry?.[1] || undefined,
    },
  ];
},
);

const { error, isError, isLoading: isLoadingAudioList } = useQuery({
  queryKey,
  queryFn: async ({ queryKey }) => {
    const [, paramsRaw] = queryKey;
    const params = paramsRaw as unknown as {
      currentPage: number;
      perPage: number;
      keyword?: string;
      sortKey?: string;
      sortType?: string;
    };
    const sort = params?.sortType ? `${params?.sortKey}-${params?.sortType}` : undefined;

    let response;

    // Edit page
    if (isEditPage && props.playlistId) {
      response = await getAudioListNotInPlaylist({
        page: params?.currentPage,
        limit: params?.perPage,
        search: params?.keyword,
        sort,
      }, props.playlistId);
    }
    // Add page
    else {
      response = await getAudioList({
        paginate: true,
        page: params?.currentPage,
        limit: params?.perPage,
        search: params?.keyword,
        sort,
      });
    }

    // Set pagination
    pagination.value.totalData = response?.data?.pagination?.total_data;
    pagination.value.totalPages = response?.data?.pagination?.total_pages;

    const newData = response?.data?.contents?.map((item: any) => {
      const thumbnail_url = buildMediaUrl(item.cover_url);

      return {
        ...item,
        id: item?.id ?? item?.content_id,
        thumbnail_url,
        thumbnail: thumbnail_url,
      };
    }) as IListAudio[];

    existData.value = structuredClone(newData);
    syncPageSelectionFromMap();

    return newData;
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  enabled: showModal,
});

const handleSubmit = () => {
  emit('onSubmit', selectedContent.value);
  resetModal();
};

watch(dataSelected, (newSelected) => {
  if (isSyncingSelection.value) {
    return;
  }

  const nextSelectedKeys = new Set(
    (newSelected || [])
      .map((item: Record<string, any>) => getItemKey(item))
      .filter(Boolean),
  );

  selectedOnCurrentPage.value.forEach((key) => {
    if (!nextSelectedKeys.has(key)) {
      delete selectedContentMap.value[key];
    }
  });

  (newSelected || []).forEach((item: Record<string, any>) => {
    const key = getItemKey(item);

    if (!key) {
      return;
    }

    selectedContentMap.value[key] = item;
  });

  selectedOnCurrentPage.value = Array.from(nextSelectedKeys);
}, { deep: true });

watch(isError, (value: any) => {
  if (value) {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(error?.value as Error) || 'An error occurred',
    });
  }
});

watch(() => showModal.value, (modalOpen) => {
  if (modalOpen) {
    initSelectedContentMap();
    syncPageSelectionFromMap();
    return;
  }

  if (!modalOpen) {
    resetModal();
  }
}, { immediate: true });

watch(search, (newVal: any) => handleSearch(newVal));
</script>
