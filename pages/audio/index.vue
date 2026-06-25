<template>
  <TemplateListLayout
    :title="title"
    :description="description"
    :breadcrumbs="breadcrumbs"
    :tab="AUDIO_LIST_TABS"
    :active-tab="activeTab"
    @on-change-tab="handleTabsChange"
  >
    <template #header-action>
      <WebUiButton
        v-if="access.create"
        size="lg"
        icon="mdi-plus"
        tag="router-link"
        :to="addPageRoute"
      >
        {{ buttonCreateLabel }}
      </WebUiButton>
    </template>

    <template
      v-if="!isLandingList"
      #filter-search
    >
      <WebUiInput
        v-model="search"
        placeholder="Search by title or created by"
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

    <template
      v-if="!isLandingList"
      #filter-advance
    >
      <WebUiAdvanceFilter
        v-model="filter"
        :auto-hide="false"
        @reset="handleResetFilter"
        @apply="handleApplyFilter"
        @show="onFilterShow(filter)"
        @cancel="handleCancelFilter"
      >
        <div class="flex flex-col gap-4" />
        <WebUiFormGroup
          v-if="isAudioList"
          label="Status"
        >
          <WebUiSelect
            v-model="filter.status"
            :options="optionStatus"
            :select-props="{
              contentWrapperClass: '!z-[10000]',
              closeOnSelect: false,
            }"
            :hide-selected="true"
            option-label="label"
            option-value="value"
            multiple
          >
            <template #select-option="{ option }">
              <div
                class="select-field__option-checkbox"
              >
                <WebUiCheckbox
                  :id="`status-option-${option.value}`"
                  :label="option.label"
                  :value="option.value"
                  :checked="Array.isArray(filter.status) && filter.status.some((item) => item.value === option.value)"
                />
              </div>
            </template>
          </WebUiSelect>
        </WebUiFormGroup>
        <WebUiFormGroup
          v-if="isAudioList"
          label="Master Data"
        >
          <WebUiSelect
            key="selectMasterData"
            v-model="filter.masterData"
            :options="optionMasterData"
            :show-labels="false"
            :hide-selected="true"
            :select-props="{
              contentWrapperClass: '!z-[10000]',
              closeOnSelect: false,
            }"
            multiple
          >
            <template #select-option="{ option }">
              <div
                class="select-field__option-checkbox"
              >
                <WebUiCheckbox
                  :id="`master-data-option-${option.value}`"
                  :label="option.label"
                  :value="option.value"
                  :checked="Array.isArray(filter.masterData) && filter.masterData.some(item => item.value === option.value)"
                />
              </div>
            </template>
          </WebUiSelect>
        </WebUiFormGroup>
        <WebUiFormGroup
          v-if="isAudioList"
          label="Accessibility"
        >
          <WebUiSelect
            key="selectAccessibility"
            v-model="filter.accessibility"
            :options="optionAccessibility"
            :show-labels="false"
            :hide-selected="true"
            :select-props="{
              contentWrapperClass: '!z-[10000]',
              closeOnSelect: false,
            }"
            multiple
          >
            <template #select-option="{ option }">
              <div
                class="select-field__option-checkbox"
              >
                <WebUiCheckbox
                  :id="`accessibility-option-${option.value}`"
                  :label="option.label"
                  :value="option.value"
                  :checked="Array.isArray(filter.accessibility) && filter.accessibility.some(item => item.value === option.value)"
                />
              </div>
            </template>
          </WebUiSelect>
        </WebUiFormGroup>
        <WebUiFormGroup
          label="Created"
          class="mb-2"
        >
          <WebUiDatepicker
            v-model="filter.created"
            teleport
            update-teleport-pos-on-scroll
            :date-picker-options="{
              range: true,
              autoApply: true,
              multiCalendars: true,
              monthChangeOnScroll: false,
              actionRow: {},
              placeholder: 'Select date time',
            }"
          />
        </WebUiFormGroup>
        <WebUiFormGroup label="Last Update">
          <WebUiDatepicker
            v-model="filter.lastUpdate"
            teleport
            update-teleport-pos-on-scroll
            :date-picker-options="{
              range: true,
              autoApply: true,
              multiCalendars: true,
              monthChangeOnScroll: false,
              actionRow: {},
              placeholder: 'Select date time',
            }"
          />
        </WebUiFormGroup>
      </WebUiAdvanceFilter>
    </template>

    <template #table>
      <LandingList v-if="isLandingList" />
      <WebUiSmartTable
        v-else
        v-model:sort="sortOrder"
        :columns="tableColumns"
        :rows="existData"
        :loading="isLoadingTable"
        :pagination="pagination"
        enable-numbering
        stickyheader
        @update:page="handlePage"
      >
        <template #table-empty="{ show }">
          <WebUiEmptyState
            v-if="show"
            :title="emptyState?.title || emptyTitle"
            :description="emptyState?.description || emptyDescription"
            class="ui-smarttable__empty"
          >
            <template #empty-image>
              <div class="text-gray-300 border border-gray-50 p-4 rounded-[0.625rem]">
                <WebUiIcon
                  v-if="debouncedSearch?.trim()?.length"
                  name="mdi-search"
                  width="28"
                />
                <img
                  v-else
                  alt="Brand"
                  src="/brand/logo-mini.svg"
                  class="max-h-[32px] max-w-[26px]"
                >
              </div>
            </template>
            <template #append>
              <WebUiButton
                v-if="emptyState?.createButton"
                size="lg"
                variant="solid"
                color="primary"
                icon="mdi:plus"
                tag="router-link"
                :to="addPageRoute"
              >
                {{ emptyState?.buttonLabel }}
              </WebUiButton>
              <WebUiButton
                v-if="emptyState?.retryButton"
                size="lg"
                variant="transparent"
                color="primary"
                icon="mdi:sync"
                @click="refetchQuery"
              >
                Retry
              </WebUiButton>
            </template>
          </WebUiEmptyState>
        </template>
        <template #body-status_enum="{ item }">
          <WebUiBadge
            v-if="item.status_enum"
            :color="item.status_enum?.toLowerCase() === 'publish' ? 'success' : 'ghost'"
            variant="soft"
            size="sm"
            class="capitalize font-medium text-center"
          >
            {{ getTypeLabel(item.status_enum) }}
          </WebUiBadge>
        </template>
        <template #body-is_master="{ item }">
          <div
            v-if="item.is_master === null"
            class="flex items-center justify-center"
          >
            -
          </div>
          <WebUiBadge
            v-else
            :color="item.is_master ? 'success' : 'ghost'"
            variant="soft"
            size="sm"
            class="capitalize font-medium text-center"
          >
            {{ item.is_master ? 'Active' : 'Inactive' }}
          </WebUiBadge>
        </template>
        <template #body-accessibility_type="{ item }">
          <WebUiBadge
            :color="getColorAccessibility(item.accessibility_type)"
            variant="soft"
            size="sm"
            class="capitalize font-medium text-center"
          >
            {{ getTypeLabel(item.accessibility_type) }}
          </WebUiBadge>
        </template>
        <template #body-created_at="{ item }">
          {{ dayjs(item.created_at).format('DD MMM YYYY, HH:mm') }}
        </template>
        <template #body-updated_at="{ item }">
          {{ dayjs(item.updated_at).format('DD MMM YYYY, HH:mm') }}
        </template>
        <template #body-action="{ item }">
          <div class="audio-list__action">
            <WebUiButton
              v-if="access.detail"
              icon="mdi-eye"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="audio-list__action-button"
              @click="handleDetail(item)"
            />
            <WebUiButton
              v-if="access.edit"
              icon="mdi-pencil"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="audio-list__action-button"
              @click="handleEdit(item)"
            />
            <WebUiButton
              v-if="access.delete"
              icon="mdi-delete"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="audio-list__action-button"
              @click="handleDelete(item)"
            />
          </div>
        </template>
      </WebUiSmartTable>
    </template>
  </TemplateListLayout>
</template>

<script setup lang="ts">
import type { IFilterAudio, IListAudio } from '#audio/config/types.ts';
import type { ISmartTableSortData } from '@mydigilearn-saas/web-ui';
import { deleteAudioList, deletePlaylist, getAudioList, getPlaylist } from '#audio/api/api.ts';
import LandingList from '#audio/components/list/LandingList.vue';
import { ACCESSIBILITY_OPTIONS, AUDIO_LIST_TABS, AUDIO_TAB_TYPE, LIST_COLUMNS, MASTER_DATA_OPTIONS, PLAYLIST_COLUMNS, STATUS_OPTIONS } from '#audio/config/constant.ts';
import { PERMISSION_CREATE, PERMISSION_DELETE, PERMISSION_DETAIL, PERMISSION_EDIT, PERMISSION_LIST } from '#audio/config/featureFlag.ts';
import { getColorAccessibility, getTypeLabel } from '#audio/utils/getColorAndLabel.ts';
import TemplateListLayout from '#core/components/templates/ListLayout.vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
definePageMeta({
  layout: 'full',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [
      PERMISSION_CREATE,
      PERMISSION_EDIT,
      PERMISSION_DETAIL,
      PERMISSION_DELETE,
    ],
  },
});

let oldFilters: Record<string, any> = {};
// Data
const optionStatus = ref(STATUS_OPTIONS);
const optionMasterData = ref(MASTER_DATA_OPTIONS);
const optionAccessibility = ref(ACCESSIBILITY_OPTIONS);

// Utilities
const route = useRoute();
const router = useRouter();
const { $toast, $popup } = useNuxtApp();
const { showLoading, hideLoading } = useGlobalLoading();
const { debounce, getApiErrorMessage } = useUtility();
const { access } = useAccessAudio();

type TTab = 'audio-list' | 'playlist' | 'landing-page';
const activeTab = ref<TTab>(AUDIO_TAB_TYPE.AUDIO_LIST as TTab);
const isPlaylist = computed(() => route.query.tab === AUDIO_TAB_TYPE.PLAYLIST);
const isAudioList = computed(() => !route.query.tab || route.query.tab === AUDIO_TAB_TYPE.AUDIO_LIST);
const isLandingList = computed(() => route.query.tab === AUDIO_TAB_TYPE.LANDING_PAGE);

const tabInfo = computed(() => {
  const map = {
    [AUDIO_TAB_TYPE.AUDIO_LIST]: {
      title: 'Audio List',
      description: 'Add and manage your audio collection',
      buttonCreateLabel: 'Add Audio',
    },
    [AUDIO_TAB_TYPE.PLAYLIST]: {
      title: 'Playlist',
      description: 'Create and manage your audio playlists',
      buttonCreateLabel: 'Create Playlist',
    },
    [AUDIO_TAB_TYPE.LANDING_PAGE]: {
      title: 'Landing Page',
      description: 'Configure landing sections for audio content',
      buttonCreateLabel: 'Create Section',
    },
  };

  return map[activeTab.value as keyof typeof map] ?? map[AUDIO_TAB_TYPE.AUDIO_LIST];
});

const title = computed(() => tabInfo.value.title);
const description = computed(() => tabInfo.value.description);
const buttonCreateLabel = computed(() => tabInfo.value.buttonCreateLabel);
const tableColumns = computed(() => isPlaylist.value ? PLAYLIST_COLUMNS : LIST_COLUMNS);

// Filter
const search = ref<string>('');
const debouncedSearch = ref<string>('');
const filter = ref<IFilterAudio>({
  status: [],
  masterData: [],
  accessibility: [],
  created: null,
  lastUpdate: null,
});
const filterKey = ref<string>('');
const sortOrder = ref<ISmartTableSortData>({});

const breadcrumbs = [
  { text: 'Learning Content', href: '', active: false },
  { text: 'Audio', href: '/audio', active: true },
];

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 10,
  totalPages: 1,
  totalData: 0,
});

const queryKey = computed(() => {
  const sortEntry = Object.entries(sortOrder.value).find(([, v]) => v !== undefined);
  return [
    'audio-list-get',
    {
      currentPage: pagination.value.currentPage,
      perPage: pagination.value.perPage,
      keyword: debouncedSearch.value || undefined,
      sortKey: sortEntry?.[0] || undefined,
      sortType: sortEntry?.[1] || undefined,
      filterKey: filterKey.value,
    },
  ];
});

// Debounce search
const handleSearch = debounce((value: string) => {
  if (value.length >= 3 || value.length === 0) {
    debouncedSearch.value = value;
    pagination.value.currentPage = 1;
  }
}, 1000);

watch(search, (newVal: any) => handleSearch(newVal));

const formatDateRange = (range?: Date[] | null) => {
  if (!range || !range.length) {
    return [undefined, undefined];
  }
  return [
    range[0] ? dayjs(range[0]).startOf('day').utc().toISOString() : undefined,
    range[1] ? dayjs(range[1]).endOf('day').utc().toISOString() : undefined,
  ];
};

const audioQueryKey = computed(() => ['audio-list', ...queryKey.value.slice(1)]);

const { data: audioQueryData, error: audioError, isError: isAudioError, isLoading: isLoadingAudioList, refetch: refetchAudio } = useQuery({
  queryKey: audioQueryKey,
  queryFn: async ({ queryKey }) => {
    const [, paramsRaw] = queryKey;
    const params = paramsRaw as any;
    const [startUpdated, endUpdated] = formatDateRange(filter?.value?.lastUpdate as any);
    const [startDate, endDate] = formatDateRange(filter?.value?.created as any);

    const sortKeyMap: Record<string, string> = {
      full_name: 'created_by',
      status_enum: 'is_published',
    };
    const sortKey = params?.sortKey ? (sortKeyMap[params.sortKey] || params.sortKey) : undefined;
    const sort = params?.sortType && sortKey ? `${sortKey}-${params?.sortType}` : undefined;

    const statusEnum = filter?.value?.status?.map((item: any) => String(item.value)).join(',') || undefined;
    const masterDataEnum = filter?.value?.masterData?.map((item: any) => String(item.value)).join(',') || undefined;
    const accessibilityType = filter?.value?.accessibility?.map((item: any) => item.value).join(',') || undefined;

    const response = await getAudioList({
      'paginate': true,
      'page': params.currentPage,
      'limit': params.perPage,
      'search': params.keyword,
      sort,
      // Flatten the nested object using bracket notation keys
      'filter[is_published]': statusEnum,
      'filter[is_master]': masterDataEnum,
      'filter[accessibility_type]': accessibilityType,
      'filter[created_at_from]': startDate,
      'filter[created_at_to]': endDate,
      'filter[updated_at_from]': startUpdated,
      'filter[updated_at_to]': endUpdated,
    });

    return {
      contents: response?.data?.contents.map((item: any) => ({
        ...item,
        full_name: item.created_by_user?.full_name || '',
        status_enum: item.is_published ? 'publish' : 'draft',
        is_master: item.is_master,
        accessibility_type: item.accessibility_type,
      })) as IListAudio[],
      pagination: response?.data?.pagination,
    };
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  enabled: isAudioList,
});

const playlistQueryKey = computed(() => ['playlist-list', ...queryKey.value.slice(1)]);

const { data: playlistQueryData, error: playlistError, isError: isPlaylistError, isLoading: isLoadingPlaylist, refetch: refetchPlaylist } = useQuery({
  queryKey: playlistQueryKey,
  queryFn: async ({ queryKey }) => {
    const [, paramsRaw] = queryKey;
    const params = paramsRaw as any;
    const [startUpdated, endUpdated] = formatDateRange(filter?.value?.lastUpdate as any);
    const [startDate, endDate] = formatDateRange(filter?.value?.created as any);
    const sort = params?.sortType ? `${params?.sortKey}-${params?.sortType}` : undefined;

    const response = await getPlaylist({
      'paginate': true,
      'page': params.currentPage,
      'limit': params.perPage,
      'search': params.keyword,
      sort,
      'filter[type]': 'audio',
      // Flatten the nested object using bracket notation keys
      'filter[created_at_from]': startDate,
      'filter[created_at_to]': endDate,
      'filter[updated_at_from]': startUpdated,
      'filter[updated_at_to]': endUpdated,
    });

    return {
      contents: response?.data?.contents?.map((item: any) => ({
        ...item,
        full_name: item.created_by_user?.full_name || item.full_name || '',
      })) as IListAudio[],
      pagination: response?.data?.pagination,
    };
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  enabled: isPlaylist,
});

const emptyState = computed(() => {
  if (isAudioError.value || isPlaylistError.value) {
    return {
      title: 'An error occurred',
      description: getApiErrorMessage(audioError?.value) || getApiErrorMessage(playlistError?.value) || '-',
      retryButton: true,
      buttonLabel: 'Retry',
    };
  }

  if (debouncedSearch.value) {
    return {
      title: 'We couldn\'t find anything',
      description: 'Perhaps consider using a different keyword for better results.',
    };
  }

  if (pagination.value.currentPage === 1) {
    return {
      title: 'Let\'s add your first audio!',
      description: 'Add an audio to start building your content library.',
      createButton: true,
      buttonLabel: 'Create Audio',
    };
  }

  return undefined;
});

const queryData = computed(() => isPlaylist.value ? playlistQueryData.value : audioQueryData.value);
const isLoadingTable = computed(() => isPlaylist.value ? isLoadingPlaylist.value : isLoadingAudioList.value);
const existData = computed(() => queryData.value?.contents || []);

watch(() => queryData.value?.pagination, (newPagination) => {
  if (newPagination) {
    pagination.value.totalData = newPagination.total_data;
    pagination.value.totalPages = newPagination.total_pages;
  }
}, { immediate: true });

watch([isAudioError, isPlaylistError], ([audioErr, playlistErr]) => {
  const value = audioErr || playlistErr;
  if (value) {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage((audioError?.value || playlistError?.value) as Error) || 'An error occurred',
    });
  }
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

// Methods
const onFilterShow = (value: Record<string, any>) => {
  try {
    oldFilters = JSON.parse(JSON.stringify(toRaw(value)));
  }
  catch (err) {
    console.error('Failed to clone filter:', err);
    oldFilters = {};
  }
};

const handleCancelFilter = () => {
  if (oldFilters && Object.keys(oldFilters).length) {
    filter.value = JSON.parse(JSON.stringify(oldFilters));
  }
};

function handlePage(page = 1) {
  pagination.value.currentPage = page;
}

const addPageRoute = computed(() => {
  if (activeTab.value === AUDIO_TAB_TYPE.LANDING_PAGE) {
    return { name: 'audio-add-landing' };
  }

  if (activeTab.value === AUDIO_TAB_TYPE.PLAYLIST) {
    return { name: 'audio-add-playlist' };
  }

  return { name: 'audio-add' };
});

const resetPagination = () => {
  pagination.value.currentPage = 1;
};

const refetchQuery = () => {
  if (pagination.value.currentPage === 1) {
    if (isPlaylist.value) {
      refetchPlaylist();
    }
    else {
      refetchAudio();
    }
  }
  else {
    resetPagination();
  }
};

function handleResetFilter() {
  filter.value = {
    status: [],
    masterData: [],
    accessibility: [],
    created: null,
    lastUpdate: null,
  };
  pagination.value.currentPage = 1;
  filterKey.value = '';
}

function handleApplyFilter() {
  filterKey.value = JSON.stringify({
    status: filter.value?.status,
    masterData: filter.value?.masterData,
    accessibility: filter.value?.accessibility,
    created: filter.value?.created,
    lastUpdate: filter.value?.lastUpdate,
  });
  pagination.value.currentPage = 1;
}

function handleDetail(item: any) {
  if (isPlaylist.value) {
    router.push({ name: 'audio-detail-playlist-id', params: { id: item.id } });
    return;
  }
  router.push({ name: 'audio-detail-id', params: { id: item.id } });
}

function handleEdit(item: Record<string, any>) {
  if (isPlaylist.value) {
    router.push({ name: 'audio-edit-playlist-id', params: { id: item.id } });
    return;
  }
  router.push({ name: 'audio-edit-id', params: { id: item.id } });
}

const mutation = useMutation({
  mutationFn: async ({ id }: { id: number; }) => {
    if (isPlaylist.value) {
      return await deletePlaylist(id);
    }
    return await deleteAudioList(id);
  },
  onSuccess: () => {
    $toast({
      variant: 'success',
      title: 'Success',
      text: isPlaylist.value ? 'Playlist successfully deleted.' : 'Audio successfully deleted.',
    });

    refetchQuery();
  },
  onError: (error) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(error) || 'An error occurred',
    });
  },
  onMutate: () => {
    showLoading();
  },
  onSettled: () => {
    hideLoading();
  },
});

function handleDelete(item: any) {
  $popup({
    title: isPlaylist.value ? 'Delete Playlist?' : 'Delete Audio?',
    html: `Do you want to delete this ${isPlaylist.value ? 'playlist' : 'audio'}? <br /> <b><i>${item.title}</i></b>`,
    showCancelButton: true,
    confirmButtonText: 'Delete',
    icon: 'error',
  }).then((result) => {
    if (result.isConfirmed) {
      mutation.mutateAsync({ id: item.id });
    }
  });
}

const handleTabsChange = async (value: string) => {
  if (value === activeTab.value) {
    return;
  }

  activeTab.value = value as TTab;
  search.value = '';
  debouncedSearch.value = '';
  sortOrder.value = {};
  resetPagination();
  handleResetFilter();

  await router.replace({
    query: {
      ...route.query,
      tab: value,
    },
  });
};

onMounted(async () => {
  const tab = (route.query.tab as TTab) || (AUDIO_TAB_TYPE.AUDIO_LIST as TTab);
  activeTab.value = tab;

  if (!route.query.tab) {
    await router.replace({ query: { ...route.query, tab } });
  }
});

watch(() => route.query.tab, (newTab) => {
  activeTab.value = (newTab as TTab) || (AUDIO_TAB_TYPE.AUDIO_LIST as TTab);
});
</script>

<style lang="postcss" scoped>
@import '#audio/styles/list.css';

:deep(.multiselect__option--highlight) {
  background-color: #E2FEF7 !important;
}

:deep(.multiselect__option--selected){
  background-color: #E2FEF7 !important;
}
</style>
