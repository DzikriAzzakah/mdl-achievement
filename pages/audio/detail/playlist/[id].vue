<template>
  <TemplateManageLayout
    title="Details"
    class="layout-detail-audio"
    :breadcrumbs="breadcrumbs"
    disable-footer
  >
    <template #content>
      <PlaylistAudioInformation :is-loading="isLoadingDetail" />
    </template>
  </TemplateManageLayout>
</template>

<script lang="ts" setup>
import type { IAudioDetail } from '#audio/config/types.ts';
import { getDetailPlaylist, getSelectedTag } from '#audio/api/api.ts';
import PlaylistAudioInformation from '#audio/components/detail/PlaylistAudioInformation.vue';
import { PERMISSION_DETAIL, PERMISSION_LIST } from '#audio/config/featureFlag.ts';
import { useAudioStore } from '#audio/stores/audio.ts';
import { useAudioPlaylistStore } from '#audio/stores/playlist.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import { useQuery } from '@tanstack/vue-query';

definePageMeta({
  layout: 'full',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_DETAIL],
  },
});

const route = useRoute();
const audioStore = useAudioStore();
const playlistStore = useAudioPlaylistStore();
const { detailPlaylist } = storeToRefs(playlistStore);
const playlistId = route.params.id;
const { $toast } = useNuxtApp();

const breadcrumbs = [
  { text: 'Learning Content', href: '', active: false },
  { text: 'Playlist', href: '/audio?tab=playlist', active: false },
  { text: 'Details', href: `/audio/detail/playlist/${playlistId}`, active: true },
];

const { isLoading: isLoadingDetail, refetch } = useQuery<any>({
  queryKey: ['get-detail-playlist', playlistId],
  queryFn: async () => {
    const response = await getDetailPlaylist(Number(playlistId)).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to fetch detail playlist.',
      });
      return { data: {} };
    });

    const content = response?.data as IAudioDetail;
    const formValues: Record<string, any> = {
      status_enum: content.status_enum || 'draft',
      is_master: content.is_master || false,
    };
    audioStore.setFormValues(formValues, true);
    detailPlaylist.value = content;
    return content;
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

onMounted(async () => {
  const payload = {
    id: Number(playlistId),
    contentType: 'PLAYLIST',
  };

  const response = await getSelectedTag(payload).catch(() => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: 'Failed to fetch selected tags.',
    });
    return { data: {} };
  });

  playlistStore.tags = (response?.data as any) || [];
});

provide('refetch-detail', refetch);
</script>
