<template>
  <TemplateListLayout
    :title="templateTitle"
    :description="templateDescription"
    :breadcrumbs="breadcrumbs"
    :tab="computedTabs"
    :active-tab="activeTab"
    @on-change-tab="onChangeTab"
  >
    <!-- Header Action -->
    <template #header-action>
      <UiButton
        size="lg"
        icon="mdi-plus"
        @click="handleAddAchievement"
      >
        Add {{ buttonAddLabel }}
      </UiButton>
    </template>

    <!-- Filter Search -->
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

    <!-- Filter Advance -->
    <template #filter-advance>
      <UiAdvanceFilter
        v-model="filter"
        @reset="handleResetFilter"
        @apply="handleApplyFilter"
      >
        <UiFormGroup
          v-if="isCertificates"
          label="Certificate Type"
        >
          <UiSelect
            key="selectCertificateType"
            v-model="filter.certificateType"
            :select-props="{
              placeholder: 'Select an options',
              internalSearch: false,
              searchable: true,
              maxHeight: 250,
            }"
            :show-labels="false"
            multiple
            :options="TYPE_OPTIONS"
            :hide-selected="true"
          >
            <template #select-option="{ option }">
              <div class="select-field__option-checkbox">
                <UiCheckbox
                  :id="`certificate-type-option-${option.value}`"
                  :label="option.label"
                  :value="option.value"
                  :checked="Array.isArray(filter.certificateType)
                    && filter.certificateType.some((item:any) => item.value === option.value)"
                />
              </div>
            </template>
          </UiSelect>
        </UiFormGroup>

        <UiFormGroup label="Accessibility">
          <UiSelect
            key="selectAccessibility"
            v-model="filter.accessibility"
            :select-props="{
              placeholder: 'Select an options',
              internalSearch: false,
              searchable: true,
              maxHeight: 250,
            }"
            :show-labels="false"
            multiple
            :options="optionAccessibility"
            :hide-selected="true"
          >
            <template #select-option="{ option }">
              <div class="select-field__option-checkbox">
                <UiCheckbox
                  :id="`accessibility-option-${option.value}`"
                  :label="option.label"
                  :value="option.value"
                  :checked="Array.isArray(filter.accessibility)
                    && filter.accessibility.some((item:any) => item.value === option.value)"
                />
              </div>
            </template>
          </UiSelect>
        </UiFormGroup>

        <UiFormGroup
          label="Created"
          class="mb-2"
        >
          <UiDatePicker
            v-model="filter.created"
            :date-picker-options="{
              placeholder: 'Select date time',
            }"
            range
            multi-calendars
          />
        </UiFormGroup>

        <UiFormGroup label="Last Updated">
          <UiDatePicker
            v-model="filter.lastUpdate"
            :date-picker-options="{
              placeholder: 'Select date time',
            }"
            range
            multi-calendars
          />
        </UiFormGroup>
      </UiAdvanceFilter>
    </template>

    <!-- Table -->
    <template #table>
      <UiSmarttable
        :columns="columns"
        :rows="tableData"
        :loading="isLoadingData"
        :pagination="pagination"
        :sort="sortOrder"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        enable-numbering
        stickyheader
        @on-page="handlePage"
        @on-sort="handleSort"
      >
        <template
          v-if="isCertificates"
          #body-certificate_type="{ item }"
        >
          <p class="capitalize">
            {{ item.certificate_type }}
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
              icon="mdi-eye"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="achievement-list__action-button"
              @click="handleDetailItem(item as ICertificate | IBadge)"
            />
            <UiButton
              icon="mdi-pencil"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="achievement-list__action-button"
              @click="handleEditItem(item as ICertificate | IBadge)"
            />
            <UiButton
              icon="mdi-delete"
              variant="transparent"
              color="ghost"
              size="md"
              square
              class="achievement-list__action-button"
              @click="handleDeleteItem(item as ICertificate | IBadge)"
            />
          </div>
        </template>
      </UiSmarttable>
    </template>
  </TemplateListLayout>
</template>

<script setup lang="ts">
import type { IBadge, ICertificate, IFilterAchievement, ISortData } from '#achievement/config/types.ts';
import type { TabItem } from '#ui/components/molecules/tabs/index.vue';

import { getBadgeList, getCertificateList } from '#achievement/api/api.ts';

import { ACCESSIBILITY_OPTIONS, BADGE_COLUMNS, CERTIFICATE_COLUMNS, TYPE_OPTIONS } from '#achievement/config/constants.ts';
import { PERMISSION_CREATE, PERMISSION_DELETE, PERMISSION_DETAIL, PERMISSION_EDIT, PERMISSION_LIST } from '#achievement/config/featureFlag.ts';

import TemplateListLayout from '#core/components/templates/ListLayout.vue';
import UiBadge from '#ui/components/atoms/badge/index.vue';
import UiButton from '#ui/components/atoms/button/index.vue';
import UiCheckbox from '#ui/components/atoms/checkbox/index.vue';
import UiInput from '#ui/components/atoms/input/index.vue';
import UiAdvanceFilter from '#ui/components/molecules/advance-filter/index.vue';
import UiDatePicker from '#ui/components/molecules/datepicker/index.vue';
import UiFormGroup from '#ui/components/molecules/form-group/index.vue';
import UiSelect from '#ui/components/molecules/select/index.vue';
import UiSmarttable from '#ui/components/molecules/smart-table/index.vue';

import { useQuery } from '@tanstack/vue-query';
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

const router = useRouter();
const { $toast } = useNuxtApp();
const { debounce, getApiErrorMessage } = useUtility();

const breadcrumbs = [
  { text: 'Master Data', href: '', active: false },
  { text: 'Achievement', href: '/achievement', active: true },
];

const TABS_CONFIG: TabItem[] = [
  { label: 'Certificates', value: 'certificates' },
  { label: 'Badges', value: 'badges' },
];

const activeTab = ref<string>('certificates');
const search = ref<string>('');
const debouncedSearch = ref<string>('');

const filter = ref<IFilterAchievement>({
  certificateType: [],
  accessibility: [],
  created: '',
  lastUpdate: '',
});

const sortOrder = ref<ISortData>({
  key: '',
  type: '',
});

const pagination = ref({
  currentPage: 1,
  perPage: 10,
  totalPages: 1,
  totalData: 0,
});

const optionAccessibility = ref(ACCESSIBILITY_OPTIONS);

const isCertificates = computed(() => activeTab.value === 'certificates');

const columns = computed(() => {
  return isCertificates.value ? CERTIFICATE_COLUMNS : BADGE_COLUMNS;
});

const queryKey = computed(() => [
  `${activeTab.value}-list-get`,
  {
    currentPage: pagination?.value?.currentPage,
    perPage: pagination?.value?.perPage,
    keyword: debouncedSearch?.value || undefined,
    sortKey: sortOrder?.value?.key || undefined,
    sortType: sortOrder?.value?.type || undefined,
    filters: filter.value,
  },
]);

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
  return search.value ? 'We couldn\'t find anything' : 'No data available';
});

const emptyDescription = computed(() => {
  return search.value ? 'Perhaps consider using a different keyword for better results.' : 'There is no data to show at the moment.';
});

const { data, error, isError, isLoading: isLoadingData, refetch } = useQuery({
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

    const startUpdated = filter?.value?.lastUpdate?.[0] ? dayjs(filter.value.lastUpdate[0]).utc().startOf('day').toISOString() : undefined;
    const endUpdated = filter?.value?.lastUpdate?.[1] ? dayjs(filter.value.lastUpdate[1]).utc().endOf('day').toISOString() : undefined;
    const startDate = filter?.value?.created?.[0] ? dayjs(filter.value.created[0]).startOf('day').utc().toISOString() : undefined;
    const endDate = filter?.value?.created?.[1] ? dayjs(filter.value.created[1]).utc().endOf('day').toISOString() : undefined;
    const sort = params?.sortType ? `${params?.sortKey}-${params?.sortType}` : undefined;

    const apiParams: any = {
      page: params?.currentPage,
      page_size: params?.perPage,
      keyword: params?.keyword,
      accessibilities: filter?.value?.accessibility?.length ? filter?.value?.accessibility?.map((item: any) => item.value).join(',') : undefined,
      created_at_from: startDate,
      created_at_to: endDate,
      updated_at_from: startUpdated,
      updated_at_to: endUpdated,
      sort,
    };

    if (isCertificates.value) {
      apiParams.certificate_types = filter?.value?.certificateType?.length ? filter?.value?.certificateType?.map((item: any) => item.value).join(',') : undefined;
    }

    const response = isCertificates.value
      ? await getCertificateList(apiParams)
      : await getBadgeList(apiParams);

    // Update pagination
    pagination.value.totalData = response?.data?.pagination?.total_row || 0;
    pagination.value.totalPages = response?.data?.pagination?.last_page || 1;

    return (response?.data?.contents || []) as (ICertificate | IBadge)[];
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
});

const computedTabs = computed(() => {
  return TABS_CONFIG.map(tab => ({
    ...tab,
    disabled: isLoadingData.value,
  }));
});

const tableData = computed(() => data.value ?? []);

const handleSearch = debounce((value: string) => {
  if (value.length >= 3 || value.length === 0) {
    debouncedSearch.value = value;
    pagination.value.currentPage = 1;
  }
}, 1000);

watch(search, (newVal: string) => handleSearch(newVal));

watch(isError, (value: boolean) => {
  if (value) {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(error?.value as Error) || 'An error occurred',
    });
  }
});

function handleResetFilter() {
  filter.value = {
    certificateType: [],
    accessibility: [],
    created: '',
    lastUpdate: '',
  };
  refetch();
}

function handleApplyFilter() {
  pagination.value.currentPage = 1;
  refetch();
}

function handleAddAchievement() {
  if (isCertificates.value) {
    router.push({ name: 'achievement-add-certificate' });
    return;
  }
  router.push({ name: 'achievement-add-badge' });
}

function onChangeTab(value: string) {
  activeTab.value = value;
  pagination.value.currentPage = 1;

  filter.value = {
    certificateType: [],
    accessibility: [],
    created: '',
    lastUpdate: '',
  };
}

function handlePage(page = 1) {
  pagination.value.currentPage = page;
}

function handleSort(sort: ISortData) {
  sortOrder.value = sort;
}

function handleDetailItem(item: ICertificate | IBadge) {
  if (isCertificates.value) {
    console.warn('Detail certificate:', item);
    // router.push(`/achievement/certificates/${item.id}`);
  }
  else {
    console.warn('Detail badge:', item);
    router.push(`/achievement/detail/badge/${item.id}`);
  }
}

function handleEditItem(item: ICertificate | IBadge) {
  console.warn('Edit item:', item);
  if (isCertificates.value) {
    // router.push(`/achievement/certificates/edit/${item.id}`);
  }
  else {
    router.push(`/achievement/edit/badge/${item.id}`);
  }
}

function handleDeleteItem(item: ICertificate | IBadge) {
  console.warn('Delete item:', item);
  // Implement delete functionality
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
