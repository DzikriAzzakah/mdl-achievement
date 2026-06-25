<template>
  <div class="flex flex-col gap-5 pt-8 self-stretch">
    <h3 class="text-base font-semibold text-gray-900">
      Audios
    </h3>
    <div>
      <SelectedContentTableApi
        :items="playlistContent"
        :pagination="pagination"
        :loading="isLoading"
        content-type="playlist"
        @on-fetch="handleFetchContent"
        @on-delete="handleDeleteContent"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IFetchParams } from '#audio/config/types.ts';
import { getPlaylistContent } from '#audio/api/api.ts';
import SelectedContentTableApi from '#audio/components/SelectedContentTableApi.vue';
import { normalizePlaylistContents } from '#audio/helpers';
import { useAudioPlaylistStore } from '#audio/stores/playlist.ts';
import { useQuery } from '@tanstack/vue-query';

const route = useRoute();
const { $toast } = useNuxtApp();

const store = useAudioPlaylistStore();
const playlistId = Number(route.params.id);
const pagination = ref({
  currentPage: 1,
  perPage: 10,
  totalPages: 1,
  totalData: 0,
});

const playlistContent = ref<any[]>([]);
const sortOrder = ref({ key: '', type: '' });
const searchQuery = ref('');

async function fetchPlaylistContent() {
  try {
    const sort = sortOrder.value.key && sortOrder.value.type ? `${sortOrder.value.key}-${sortOrder.value.type}` : undefined;

    const params: any = {
      page: pagination.value.currentPage,
      limit: pagination.value.perPage,
      sort,
    };

    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    if (sortOrder.value.key && sortOrder.value.type) {
      params.sort_by = sortOrder.value.key;
      params.sort_order = sortOrder.value.type;
    }

    const response = await getPlaylistContent(Number(playlistId), {
      params,
    });

    if (response?.data) {
      const contents = normalizePlaylistContents(response.data?.contents || []);
      playlistContent.value = contents;

      if (response.data?.pagination) {
        pagination.value = {
          ...pagination.value,
          currentPage: response.data?.pagination?.current_page || 1,
          totalPages: response.data?.pagination?.total_pages || 1,
          totalData: response.data?.pagination?.total_data || 0,
        };
      }

      store.setPlaylistContent(contents);
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
}

const { refetch, isLoading } = useQuery({
  queryKey: ['get-playlist-content-detail', playlistId],
  queryFn: fetchPlaylistContent,
  enabled: true,
  refetchOnMount: true,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

function handleFetchContent(params: IFetchParams) {
  pagination.value.currentPage = params.page;
  const sortEntry = params.sort
    ? Object.entries(params.sort).find(([, value]) => value !== undefined && value !== '')
    : undefined;
  sortOrder.value = {
    key: sortEntry?.[0] || params.sort?.key || '',
    type: sortEntry?.[1] || params.sort?.type || '',
  };
  searchQuery.value = params.search || '';
  refetch();
}

function handleDeleteContent(_item: any) {
  pagination.value.currentPage = 1;
  refetch();
}
</script>

<style lang="postcss" scoped>
@import '#audio/styles/detail.css';
</style>
