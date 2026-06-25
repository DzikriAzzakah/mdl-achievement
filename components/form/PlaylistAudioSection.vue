<template>
  <AdjacentTemplate
    title="Audios"
    description="Manage audios to add to your playlist"
    sticky
  >
    <div>
      <WebUiButton
        color="primary"
        variant="outline"
        size="lg"
        icon="mdi-plus-circle"
        @click="showAddPlaylistContentModal = true"
      >
        Add Audio
      </WebUiButton>
    </div>
  </AdjacentTemplate>
  <AddPlaylistContentModal
    v-model="showAddPlaylistContentModal"
    :data="selectedContentsForModal"
    :playlist-id="playlistId"
    @on-close="showAddPlaylistContentModal = false"
    @on-submit="handleAddPlaylist"
  />
  <SelectedContentTable
    v-if="isAnySelectedPlaylist && isAddPage"
    content-type="playlist"
  />
  <SelectedContentTableApi
    v-if="isAnySelectedPlaylist && isEditPage"
    :items="playlistContent"
    :pagination="pagination"
    :loading="isLoading"
    content-type="playlist"
    @on-fetch="handleFetchContent"
    @on-delete="handleDeleteContent"
  />
</template>

<script setup lang="ts">
import type { IFetchParams, IPlaylist } from '#audio/config/types.ts';
import { deletePlaylistContent, getPlaylistContent, postCreatePlaylistContent } from '#audio/api/api.ts';
import AddPlaylistContentModal from '#audio/components/AddPlaylistContentModal.vue';
import SelectedContentTable from '#audio/components/SelectedContentTable.vue';
import SelectedContentTableApi from '#audio/components/SelectedContentTableApi.vue';
import { normalizePlaylistContents } from '#audio/helpers';
import { useAudioPlaylistStore } from '#audio/stores/playlist.ts';
import AdjacentTemplate from '#core/components/templates/Adjacent.vue';
import { useMutation, useQuery } from '@tanstack/vue-query';

// Type for modal submission data
interface IPlaylistSubmission {
  selected: IPlaylist[];
  initial: IPlaylist[];
}

// Utilities
const route = useRoute();
const { $toast } = useNuxtApp();
const { showLoading, hideLoading } = useGlobalLoading();
const { getApiErrorMessage } = useUtility();

// Data
const store = useAudioPlaylistStore();
const showAddPlaylistContentModal = ref<boolean>(false);
const isEditPage = route.name === 'audio-edit-playlist-id';
const isAddPage = route.name === 'audio-add-playlist';
const playlistId = Number(route.params.id);
const isAnySelectedPlaylist = computed(() => {
  return store?.playlistContent?.length > 0;
});

const pagination = ref({
  currentPage: 1,
  perPage: 10,
  totalPages: 1,
  totalData: 0,
});

const playlistContent = ref<any[]>([]);
const sortOrder = ref({ key: '', type: '' });
const searchQuery = ref('');

const selectedContentsForModal = computed(() => {
  return isAddPage ? store.playlistContent : [];
});

// Methods
async function fetchPlaylistContent() {
  try {
    const params: any = {
      page: pagination.value.currentPage,
      limit: pagination.value.perPage,
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
      const contents = normalizePlaylistContents(response.data.contents || []);
      playlistContent.value = contents;

      if (response.data?.pagination) {
        pagination.value = {
          currentPage: response.data?.pagination?.current_page || 1,
          perPage: response.data?.pagination?.per_page || 10,
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
  queryKey: ['get-playlist-content', playlistId],
  queryFn: fetchPlaylistContent,
  enabled: !isAddPage,
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

const { mutate: submitPlaylistContent } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    await postCreatePlaylistContent(payload, playlistId).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to create playlist.',
      });
    });

    refetch();
    $toast({
      variant: 'success',
      title: 'Success',
      text: `Playlist content successfully created.`,
    });
  },
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
    pagination.value.currentPage = 1;
    refetch();
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

function handleSubmitPlaylistContent(data: IPlaylistSubmission) {
  const { selected, initial } = data;

  // Detect newly added items (in selected but not in initial)
  const addedItems = selected.filter((selectedItem: any) =>
    !initial.some((initialItem: any) => initialItem.id === selectedItem.id),
  );

  // Detect removed items (in initial but not in selected)
  const removedItems = initial.filter((initialItem: any) =>
    !selected.some((selectedItem: any) => selectedItem.id === initialItem.id),
  );

  // Handle additions
  if (addedItems.length > 0) {
    const payload = addedItems.map((item: any) => ({
      content_id: item.id,
      content_type: 'AUDIO', // Static
    }));
    submitPlaylistContent(payload);
  }

  // Handle removals
  if (removedItems.length > 0) {
    removedItems.forEach((item: any) => {
      deletePlaylistContentById(Number(item.id));
    });
  }
}

function handleAddPlaylist(data: IPlaylist[] | IPlaylistSubmission) {
  // Always close modal first
  showAddPlaylistContentModal.value = false;

  // Check if data is object with selected/initial or just array
  if (data && typeof data === 'object' && 'selected' in data) {
    // New format with selected and initial
    if (isEditPage) {
      handleSubmitPlaylistContent(data as IPlaylistSubmission);
      return;
    }
    // In add mode, use selected items
    store.setPlaylistContent(normalizePlaylistContents(data.selected as any[]));
  }
  else {
    // Legacy format - just array (shouldn't happen with new modal)
    if (isEditPage) {
      // Convert to new format
      handleSubmitPlaylistContent({ selected: data as IPlaylist[], initial: [] });
    }
    else {
      store.setPlaylistContent(normalizePlaylistContents(data as any[]));
    }
  }
}

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
  deletePlaylistContentById(Number(_item?.id ?? _item?.content_id));
}
</script>
