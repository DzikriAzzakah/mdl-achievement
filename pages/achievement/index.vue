<template>
  <TemplateListLayout
    :title="templateTitle"
    :description="templateDescription"
    :breadcrumbs="breadcrumbs"
    :tab="computedTabsWithPermissions"
    :active-tab="activeTab"
    @on-change-tab="onChangeTab"
  >
    <template #header-action>
      <UiButton
        v-if="showAddButton"
        size="lg"
        icon="mdi-plus"
        @click="handleAddAchievement"
      >
        Add {{ buttonAddLabel }}
      </UiButton>
    </template>

    <template #filter-search>
      <UiInput
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
      </UiInput>
    </template>

    <template #filter-advance>
      <UiAdvanceFilter
        v-model="filters"
        :auto-hide="false"
        @reset="handleResetFilter"
        @apply="handleApplyFilter"
        @show="onFilterShow(filters)"
        @cancel="handleCancelFilter"
      >
        <UiFormGroup
          v-if="isCertificates"
          label="Certificate Type"
        >
          <UiSelect
            key="selectCertificateType"
            v-model="filters.certificateType"
            :options="TYPE_OPTIONS"
            option-label="label"
            option-value="value"
            multiple
            :close-on-select="false"
            :select-props="{ contentWrapperClass: '!z-[10000]' }"
          />
        </UiFormGroup>

        <UiFormGroup label="Accessibility">
          <UiSelect
            v-model="filters.accessibility"
            :options="optionAccessibility"
            option-label="label"
            option-value="value"
            multiple
            :close-on-select="false"
            :select-props="{ contentWrapperClass: '!z-[10000]' }"
          />
        </UiFormGroup>

        <UiFormGroup
          label="Created"
          class="mb-2"
        >
          <UiDatepicker
            v-model="filters.created"
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
        </UiFormGroup>

        <UiFormGroup label="Last Updated">
          <UiDatepicker
            v-model="filters.lastUpdate"
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
        </UiFormGroup>
      </UiAdvanceFilter>
    </template>

    <template #table>
      <UiSmartTable
        v-model:sort="listSort"
        :columns="columns"
        :rows="tableData"
        :loading="isLoadingData"
        :pagination="pagination"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        enable-numbering
        enable-pagination
        stickyheader
        @update:page="handlePage"
      >
        <template
          v-if="isCertificates"
          #body-certificate_type="{ item }"
        >
          <p class="capitalize">
            {{ (item as Certificate).certificate_type }}
          </p>
        </template>

        <template #body-accessibility="{ item }">
          <UiBadge
            :color="getAccessibilityColor(item.accessibility)"
            variant="soft"
            size="sm"
            class="capitalize font-medium text-center"
          >
            {{ getAccessibilityLabel(item.accessibility) }}
          </UiBadge>
        </template>

        <template #body-created_at="{ item }">
          {{ dayjs(item.created_at).format('DD MMM YYYY, HH:mm') }}
        </template>

        <template #body-updated_at="{ item }">
          {{ dayjs(item.updated_at).format('DD MMM YYYY, HH:mm') }}
        </template>

        <template #body-action="{ item }">
          <div class="achievement-list__action">
            <UiButton
              v-if="showDetailButton"
              icon="mdi-eye"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="achievement-list__action-button"
              @click="handleDetailItem(item as Certificate | Badge)"
            />
            <UiButton
              v-if="showEditButton"
              icon="mdi-pencil"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="achievement-list__action-button"
              @click="handleEditItem(item as Certificate | Badge)"
            />
            <UiButton
              v-if="showDeleteButton"
              icon="mdi-delete"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="achievement-list__action-button"
              @click="handleDeleteItem(item as Certificate | Badge)"
            />
          </div>
        </template>
      </UiSmartTable>
    </template>
  </TemplateListLayout>
</template>

<script setup lang="ts">
import type { AchievementFilter, Badge, Certificate } from '#achievement/config/types.ts';

import { deleteBadge, deleteCertificate, getBadgeList, getCertificateList } from '#achievement/api/api.ts';

import { ACCESSIBILITY_OPTIONS, BADGE_COLUMNS, CERTIFICATE_COLUMNS, TYPE_OPTIONS } from '#achievement/config/constants.ts';
import {
  PERMISSION_BADGE_LIST,
  PERMISSION_CERTIFICATE_LIST,
  PERMISSION_FEATURE_KEY,
} from '#achievement/config/featureFlag.ts';

import TemplateListLayout from '#core/components/templates/ListLayout.vue';
import {
  type ISmartTableSortData,
  UiAdvanceFilter,
  UiBadge,
  UiButton,
  UiDatepicker,
  UiFormGroup,
  UiInput,
  UiSelect,
  UiSmartTable,
} from '@mydigilearn-saas/web-ui';

import { useMutation, useQuery } from '@tanstack/vue-query';
import { watchDebounced } from '@vueuse/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

definePageMeta({
  layout: 'full',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_FEATURE_KEY,
    permissions: [PERMISSION_CERTIFICATE_LIST, PERMISSION_BADGE_LIST],
    matchFn: (permissions: string[]) => {
      return permissions.some(p =>
        p === `cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_CERTIFICATE_LIST}`
        || p === `cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_BADGE_LIST}`,
      );
    },
  },
});

const router = useRouter();
const { $toast, $popup } = useNuxtApp();
const { getApiErrorMessage } = useUtility();
const { showLoading, hideLoading } = useGlobalLoading();
const { buildReturnQuery, restoreFiltersFromQuery, getInitialQueryValues } = useQueryUrlParams();
const { access } = useAchievementsAccess();

const breadcrumbs = [
  { text: 'Master Data', href: '', active: false },
  { text: 'Achievement', href: '/achievement', active: true },
];

const TABS_CONFIG = [
  { label: 'Certificates', value: 'certificates' },
  { label: 'Badges', value: 'badges' },
];

const MIN_SEARCH_LEN = 3;

const initialValues = getInitialQueryValues();

const getInitialTab = () => {
  const urlTab = initialValues.tab;
  const hasCertificateAccess = access.value.certificateList;
  const hasBadgeAccess = access.value.badgeList;

  if (urlTab === 'certificates' && hasCertificateAccess) {
    return 'certificates';
  }
  if (urlTab === 'badges' && hasBadgeAccess) {
    return 'badges';
  }

  if (hasCertificateAccess) {
    return 'certificates';
  }
  if (hasBadgeAccess) {
    return 'badges';
  }

  return 'certificates';
};

const restoredFilters = restoreFiltersFromQuery();

const activeTab = ref<string>(getInitialTab());
const currentPage = ref<number>(initialValues.page);
const perPage = ref<number>(10);
const totalData = ref<number>(0);
const totalPages = ref<number>(0);
const search = shallowRef<string>(initialValues.search);
const debouncedSearch = ref<string>(initialValues.search);
const initialSort = ref<ISmartTableSortData>({});
if (initialValues.sortKey && initialValues.sortType) {
  initialSort.value[initialValues.sortKey] = initialValues.sortType;
}
const listSort = ref<ISmartTableSortData>(initialSort.value);

const filters = ref<AchievementFilter>({
  certificateType: restoredFilters.certificateType || [],
  accessibility: restoredFilters.accessibility || [],
  created: restoredFilters.created || '',
  lastUpdate: restoredFilters.lastUpdate || '',
});
const initialFilterKey = (
  restoredFilters.certificateType?.length
  || restoredFilters.accessibility?.length
  || restoredFilters.created
  || restoredFilters.lastUpdate
)
  ? JSON.stringify({
      certificateType: restoredFilters.certificateType || [],
      accessibility: restoredFilters.accessibility || [],
      created: restoredFilters.created || '',
      lastUpdate: restoredFilters.lastUpdate || '',
    })
  : '';

const filterKey = ref<string>(initialFilterKey);

let oldFilters: AchievementFilter = {
  certificateType: [],
  accessibility: [],
  created: '',
  lastUpdate: '',
};

const isCertificates = computed(() => activeTab.value === 'certificates');

const columns = computed(() => {
  return isCertificates.value ? CERTIFICATE_COLUMNS : BADGE_COLUMNS;
});

const templateTitle = computed(() => {
  return isCertificates.value ? 'Certificate List' : 'Badge List';
});

const templateDescription = computed(() => {
  return isCertificates.value ? 'Create and manage Certificate Theme' : 'Create and manage Badge';
});

const buttonAddLabel = computed(() => {
  return isCertificates.value ? 'Certificate' : 'Badge';
});

const emptyTitle = computed(() => {
  return debouncedSearch.value ? 'We couldn\'t find anything' : 'No data available';
});

const emptyDescription = computed(() => {
  return debouncedSearch.value ? 'Perhaps consider using a different keyword for better results.' : 'There is no data to show at the moment.';
});

const { data, error, isError, isLoading: isLoadingData, refetch } = useQuery({
  queryKey: ['get-achievement-list', activeTab, currentPage, perPage, debouncedSearch, filterKey, listSort],
  queryFn: async ({ signal }) => {
    let created: Array<string | undefined> = [];
    let updated: Array<string | undefined> = [];

    try {
      created = [
        filters?.value?.created?.[0] ? dayjs(filters?.value?.created[0])?.startOf('day')?.toISOString() : undefined,
        filters?.value?.created?.[1] ? dayjs(filters?.value?.created[1])?.endOf('day')?.toISOString() : undefined,
      ];

      updated = [
        filters?.value?.lastUpdate?.[0] ? dayjs(filters?.value?.lastUpdate[0])?.startOf('day')?.toISOString() : undefined,
        filters?.value?.lastUpdate?.[1] ? dayjs(filters?.value?.lastUpdate[1])?.endOf('day')?.toISOString() : undefined,
      ];
    }
    catch (err) {
      console.warn('[App] Unable to parse selected date', err);
    }

    const apiParams: any = {
      page: currentPage.value,
      page_size: perPage.value,
      keyword: search.value?.trim() || undefined,
      accessibilities: filters?.value?.accessibility?.map((e: Record<string, any>) => e?.value)?.filter((e: any) => !!e)?.join(','),
      created_at_from: created?.includes(undefined) ? undefined : created[0],
      created_at_to: created?.includes(undefined) ? undefined : created[1],
      updated_at_from: updated?.includes(undefined) ? undefined : updated[0],
      updated_at_to: updated?.includes(undefined) ? undefined : updated[1],
    };

    if (Object.keys(listSort.value).length > 0) {
      const sortValue = Object.keys(listSort.value)
        .filter(key => key && listSort.value[key] !== undefined)
        .map((key) => {
          return `${key}-${listSort.value[key]}`;
        })
        .join(',');

      if (sortValue) {
        apiParams.sort = sortValue;
      }
    }

    if (isCertificates.value) {
      apiParams.types = filters?.value?.certificateType?.map((e: Record<string, any>) => e?.value)?.filter((e: any) => !!e)?.join(',');
    }

    const response = isCertificates.value
      ? await getCertificateList(apiParams, { signal })
      : await getBadgeList(apiParams, { signal });

    totalData.value = response?.data?.pagination?.total_data || 0;
    totalPages.value = response?.data?.pagination?.total_pages || 1;

    return (response?.data?.contents || []) as (Certificate | Badge)[];
  },
  refetchOnMount: true,
  refetchOnWindowFocus: false,
});

const computedTabsWithPermissions = computed(() => {
  return TABS_CONFIG.filter((tab) => {
    if (tab.value === 'certificates') {
      return access.value.certificateList;
    }
    if (tab.value === 'badges') {
      return access.value.badgeList;
    }
    return false;
  }).map(tab => ({
    ...tab,
    disabled: isLoadingData.value,
  }));
});

const tableData = computed(() => data.value ?? []);

const showAddButton = computed(() => {
  return isCertificates.value ? access.value.certificateCreate : access.value.badgeCreate;
});

const showDetailButton = computed(() => {
  return isCertificates.value ? access.value.certificateDetail : access.value.badgeDetail;
});

const showEditButton = computed(() => {
  return isCertificates.value ? access.value.certificateEdit : access.value.badgeEdit;
});

const showDeleteButton = computed(() => {
  return isCertificates.value ? access.value.certificateDelete : access.value.badgeDelete;
});

const pagination = computed(() => {
  return {
    currentPage: currentPage.value,
    perPage: perPage.value,
    totalData: totalData.value,
    totalPages: totalPages.value,
  };
});

const optionAccessibility = computed(() => ACCESSIBILITY_OPTIONS);

const deleteMutation = useMutation({
  mutationFn: async ({ id, type }: { id: number; type: 'certificate' | 'badge'; }) => {
    if (type === 'certificate') {
      return await deleteCertificate(id);
    }
    return await deleteBadge(id);
  },
  onSuccess: () => {
    $toast({
      variant: 'success',
      title: 'Success',
      text: `${isCertificates.value ? 'Certificate' : 'Badge'} successfully deleted.`,
    });
    refetch();
  },
  onError: (error: any) => {
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

function updateUrlQuery() {
  const query: Record<string, any> = {
    tab: activeTab.value,
  };

  if (search.value) {
    query.search = search.value;
  }

  if (currentPage.value > 1) {
    query.page = currentPage.value;
  }

  const sortKeys = Object.keys(listSort.value);
  if (sortKeys.length > 0 && listSort.value[sortKeys[0]]) {
    query.sortKey = sortKeys[0];
    query.sortType = listSort.value[sortKeys[0]];
  }

  if (filters.value.certificateType?.length) {
    query.types = filters.value.certificateType.map((item: any) => item.value).join(',');
  }

  if (filters.value.accessibility?.length) {
    query.accessibility = filters.value.accessibility.map((item: any) => item.value).join(',');
  }

  if (filters.value.created && filters.value.created[0] && filters.value.created[1]) {
    query.createdFrom = dayjs(filters.value.created[0]).toISOString();
    query.createdTo = dayjs(filters.value.created[1]).toISOString();
  }

  if (filters.value.lastUpdate && filters.value.lastUpdate[0] && filters.value.lastUpdate[1]) {
    query.lastUpdateFrom = dayjs(filters.value.lastUpdate[0]).toISOString();
    query.lastUpdateTo = dayjs(filters.value.lastUpdate[1]).toISOString();
  }

  router.replace({ query });
}

watchDebounced(search, (value: string) => {
  const cleanValue = value?.trim();
  if (cleanValue.length >= MIN_SEARCH_LEN || cleanValue.length <= 0) {
    currentPage.value = 1;
    debouncedSearch.value = cleanValue;
    updateUrlQuery();
  }
}, {
  debounce: 500,
});

watch(() => currentPage.value, () => {
  updateUrlQuery();
});

watch(listSort, () => {
  updateUrlQuery();
}, { deep: true });

watch(isError, (value: boolean) => {
  if (value) {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(error?.value as Error) || 'An error occurred',
    });
  }
});

const onFilterShow = (value: AchievementFilter) => {
  let oldValue;

  if (window && window.structuredClone) {
    oldValue = window.structuredClone(toRaw(value));
  }
  else {
    try {
      oldValue = JSON.parse(JSON.stringify(value));
    }
    catch (err) {
      console.warn('[App] Cannot deep clone', err);
    }
  }

  oldFilters = oldValue;
};

const handleCancelFilter = () => {
  filters.value = Object.assign({}, oldFilters);
};

function handleResetFilter() {
  filters.value = {
    certificateType: [],
    accessibility: [],
    created: '',
    lastUpdate: '',
  };
  currentPage.value = 1;
  filterKey.value = '';
  updateUrlQuery();
}

function handleApplyFilter() {
  filterKey.value = JSON.stringify({
    certificateType: filters.value?.certificateType,
    accessibility: filters.value?.accessibility,
    created: filters.value?.created,
    lastUpdate: filters.value?.lastUpdate,
  });
  currentPage.value = 1;
  updateUrlQuery();
}

const handlePage = (page: number) => {
  currentPage.value = page;
};

function handleAddAchievement() {
  const sortKeys = Object.keys(listSort.value);
  const returnQuery = buildReturnQuery({
    tab: activeTab.value,
    search: search.value,
    page: currentPage.value,
    sortKey: sortKeys.length > 0 ? sortKeys[0] : undefined,
    sortType: sortKeys.length > 0 ? listSort.value[sortKeys[0]] : undefined,
    filter: filters.value,
  });

  if (isCertificates.value) {
    router.push({ path: '/achievement/create/certificate', query: returnQuery });
    return;
  }
  router.push({ path: '/achievement/create/badge', query: returnQuery });
}

function onChangeTab(value: string) {
  activeTab.value = value;
  currentPage.value = 1;

  filters.value = {
    certificateType: [],
    accessibility: [],
    created: '',
    lastUpdate: '',
  };

  filterKey.value = '';
  listSort.value = {};
  updateUrlQuery();
}

function handleDetailItem(item: Certificate | Badge) {
  const sortKeys = Object.keys(listSort.value);
  const returnQuery = buildReturnQuery({
    tab: activeTab.value,
    search: search.value,
    page: currentPage.value,
    sortKey: sortKeys.length > 0 ? sortKeys[0] : undefined,
    sortType: sortKeys.length > 0 ? listSort.value[sortKeys[0]] : undefined,
    filter: filters.value,
  });

  if (isCertificates.value) {
    router.push({ path: `/achievement/detail/certificate/${item.id}`, query: returnQuery });
  }
  else {
    router.push({ path: `/achievement/detail/badge/${item.id}`, query: returnQuery });
  }
}

function handleEditItem(item: Certificate | Badge) {
  const sortKeys = Object.keys(listSort.value);
  const returnQuery = buildReturnQuery({
    tab: activeTab.value,
    search: search.value,
    page: currentPage.value,
    sortKey: sortKeys.length > 0 ? sortKeys[0] : undefined,
    sortType: sortKeys.length > 0 ? listSort.value[sortKeys[0]] : undefined,
    filter: filters.value,
  });

  if (isCertificates.value) {
    router.push({ path: `/achievement/edit/certificate/${item.id}`, query: returnQuery });
  }
  else {
    router.push({ path: `/achievement/edit/badge/${item.id}`, query: returnQuery });
  }
}

function handleDeleteItem(item: Certificate | Badge) {
  const itemType = isCertificates.value ? 'certificate' : 'badge';
  const itemTitle = item.title;

  $popup({
    title: `Delete ${isCertificates.value ? 'Certificate' : 'Badge'}?`,
    html: `Do you want to delete this ${itemType}? <br /> <b><i>${itemTitle}</i></b>`,
    showCancelButton: true,
    confirmButtonText: 'Delete',
    icon: 'error',
  }).then((result) => {
    if (result.isConfirmed) {
      deleteMutation.mutateAsync({
        id: item.id,
        type: itemType,
      });
    }
  });
}

function getAccessibilityColor(accessibility: string) {
  switch (accessibility) {
    case 'all_company':
      return 'success';
    case 'selected':
      return 'info';
    default:
      return 'ghost';
  }
}

function getAccessibilityLabel(accessibility: string) {
  switch (accessibility) {
    case 'all_company':
      return 'All Company';
    case 'selected':
      return 'Selected';
    default:
      return accessibility;
  }
}
</script>

<style lang="postcss" scoped>
  @import '#achievement/styles/list.css';

  :deep(.multiselect__option--highlight) {
   background-color: #E2FEF7 !important;
  }

  :deep(.multiselect__option--selected){
   background-color: #E2FEF7 !important;
  }
</style>
