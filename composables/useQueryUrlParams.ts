import type { AchievementFilter } from '#achievement/config/types';
import { TYPE_OPTIONS } from '#achievement/config/constants';

export function useQueryUrlParams() {
  const route = useRoute();

  const buildReturnUrl = (basePath: string = '/achievement') => {
    return computed(() => {
      const query: Record<string, any> = {};

      if (route.query.returnTab) {
        query.tab = route.query.returnTab;
      }
      if (route.query.returnSearch) {
        query.search = route.query.returnSearch;
      }
      if (route.query.returnPage) {
        query.page = route.query.returnPage;
      }
      if (route.query.returnSortKey) {
        query.sortKey = route.query.returnSortKey;
      }
      if (route.query.returnSortType) {
        query.sortType = route.query.returnSortType;
      }
      if (route.query.returnTypes) {
        query.types = route.query.returnTypes;
      }
      if (route.query.returnCreatedFrom) {
        query.createdFrom = route.query.returnCreatedFrom;
      }
      if (route.query.returnCreatedTo) {
        query.createdTo = route.query.returnCreatedTo;
      }
      if (route.query.returnLastUpdateFrom) {
        query.lastUpdateFrom = route.query.returnLastUpdateFrom;
      }
      if (route.query.returnLastUpdateTo) {
        query.lastUpdateTo = route.query.returnLastUpdateTo;
      }

      const queryString = new URLSearchParams(query).toString();
      return `${basePath}${queryString ? `?${queryString}` : ''}`;
    });
  };

  const buildReturnQuery = (options: {
    tab?: string;
    search?: string;
    page?: number;
    sortKey?: string;
    sortType?: 'asc' | 'desc';
    filter?: AchievementFilter;
  }) => {
    const query: Record<string, any> = {};

    if (options.tab) {
      query.returnTab = options.tab;
    }
    if (options.search) {
      query.returnSearch = options.search;
    }
    if (options.page && options.page > 1) {
      query.returnPage = options.page;
    }
    if (options.sortKey) {
      query.returnSortKey = options.sortKey;
    }
    if (options.sortType) {
      query.returnSortType = options.sortType;
    }

    if (options.filter?.certificateType?.length) {
      query.returnTypes = options.filter.certificateType
        .map((item: any) => item.value)
        .join(',');
    }
    if (options.filter?.created?.[0]) {
      query.returnCreatedFrom = options.filter.created[0];
    }
    if (options.filter?.created?.[1]) {
      query.returnCreatedTo = options.filter.created[1];
    }
    if (options.filter?.lastUpdate?.[0]) {
      query.returnLastUpdateFrom = options.filter.lastUpdate[0];
    }
    if (options.filter?.lastUpdate?.[1]) {
      query.returnLastUpdateTo = options.filter.lastUpdate[1];
    }

    return query;
  };

  const restoreFiltersFromQuery = (): Partial<AchievementFilter> => {
    const query = route.query;
    const filter: Partial<AchievementFilter> = {};

    if (query.types) {
      const types = (query.types as string).split(',');
      filter.certificateType = TYPE_OPTIONS.filter(opt => types.includes(opt.value));
    }

    if (query.createdFrom && query.createdTo) {
      filter.created = [
        new Date(query.createdFrom as string),
        new Date(query.createdTo as string),
      ] as any;
    }

    if (query.lastUpdateFrom && query.lastUpdateTo) {
      filter.lastUpdate = [
        new Date(query.lastUpdateFrom as string),
        new Date(query.lastUpdateTo as string),
      ] as any;
    }

    return filter;
  };

  const getInitialQueryValues = () => {
    return {
      tab: (route.query.tab as string) || 'certificates',
      search: (route.query.search as string) || '',
      page: Number(route.query.page) || 1,
      sortKey: route.query.sortKey as string | undefined,
      sortType: route.query.sortType as 'asc' | 'desc' | undefined,
    };
  };

  return {
    buildReturnUrl,
    buildReturnQuery,
    restoreFiltersFromQuery,
    getInitialQueryValues,
  };
}
