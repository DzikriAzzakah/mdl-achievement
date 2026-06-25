<template>
  <TemplateManageLayout
    title="Edit Playlist"
    class="layout-edit-playlist"
    show-header-button
    disable-footer
    :breadcrumbs="[]"
    :is-use-breadcrumbs="false"
    :disable-submit="isDisabledSubmitBtn"
    :show-cancel="false"
    :label-submit="buttonLabelSubmit"
    :fixed-bottom-footer="true"
    @on-cancel="handleCancel"
    @on-submit="handleSubmit"
  >
    <template #content>
      <WebUiLoading
        v-if="isLoadingEdit"
        class="h-[calc(100vh-200px)]"
      />
      <template v-else>
        <AddPlaylist />
      </template>
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import type { IPlaylistDetail } from '#audio/config/types.ts';
import { editPlaylist, getDetailPlaylist, getSelectedTag } from '#audio/api/api.ts';
import { patchTagPayload } from '#audio/api/tag.ts';
import AddPlaylist from '#audio/components/form/AddPlaylist.vue';
import { PERMISSION_EDIT, PERMISSION_LIST } from '#audio/config/featureFlag.ts';
import { useAudioPlaylistStore } from '#audio/stores/playlist.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import { useMutation, useQuery } from '@tanstack/vue-query';

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_EDIT],
  },
});

// utils
const route = useRoute();
const router = useRouter();
const playlistStore = useAudioPlaylistStore();
const { playlistErrors, getPlaylistForm } = storeToRefs(playlistStore);
const { preventLeave } = useConfirmLeave();
const { $toast } = useNuxtApp();
const { getApiErrorMessage } = useUtility();
const { showLoading, hideLoading } = useGlobalLoading();
const playlistId = route.params.id;

// Data
const buttonLabelSubmit = ref<string>('Save Playlist');
const isLoadingPatchTag = ref<boolean>(false);
const initialForm = ref<Record<string, any>>({});

// Computed
const isDisabledSubmitBtn = computed(() => {
  if (isFormChanged()) {
    return false;
  }

  if (Object.keys(playlistErrors.value).length > 0) {
    return true;
  }
  return true;
});

function isFormChanged() {
  const current = getPlaylistForm.value as Record<string, any>;
  const initial = initialForm.value as Record<string, any>;
  if (!initial || !current) {
    return false;
  }

  for (const key in initial) {
    if (typeof initial[key] === 'object' && initial[key] !== null) {
      if (JSON.stringify(initial[key]) !== JSON.stringify(current[key])) {
        return true;
      }
    }
    else {
      if (initial[key] !== current[key]) {
        return true;
      }
    }
  }
  return false;
}

// Fetch detail playlist
const { isLoading: isLoadingEdit, refetch, isFetchedAfterMount } = useQuery({
  queryKey: ['get-detail-playlist', playlistId],
  queryFn: async () => {
    try {
      const payload = {
        id: Number(playlistId),
        contentType: 'PLAYLIST',
      };
      const getDetail = await getDetailPlaylist(Number(playlistId));
      const getTag = await getSelectedTag(payload);
      const responseDetail = getDetail?.data as IPlaylistDetail;
      const responseTag = (getTag?.data || []) as Array<{ tag_id: string; tag: string; }>;

      const formValues: Record<string, any> = {
        playlistTitle: responseDetail?.title || '-',
        tags: responseTag,
      };
      playlistStore.setPlaylistFormValues(formValues, true);
      playlistStore.tags = responseTag;
      initialForm.value = JSON.parse(JSON.stringify(formValues));
      return responseDetail || {};
    }
    catch (err) {
      $toast({
        variant: 'error',
        title: 'Error',
        text: getApiErrorMessage(err) || 'Failed to fetch detail playlist.',
      });
      return { data: {} };
    }
  },
  refetchOnMount: 'always',
});

provide('refetch-detail', refetch);

// patch tag
const { mutate: submitPatchTag } = useMutation({
  mutationFn: async () => {
    isLoadingPatchTag.value = true;
    showLoading('Submitting tags', 'Please wait while we update the tags.');
    const tagIds = playlistStore?.tags?.map((t: any) => t.tag_id) || [];
    const payload = {
      id: Number(playlistId),
      tags: tagIds,
      contentType: 'PLAYLIST',
    };

    await patchTagPayload(payload);
  },
  onSettled: () => {
    isLoadingPatchTag.value = false;
    hideLoading();
  },
  onError: (err) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || 'Failed to update audio.',
    });
  },
});

const { mutate: editPlaylistById } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    await editPlaylist(Number(playlistId), payload);

    submitPatchTag();
    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Playlist successfully updated.',
    });
    initialForm.value = JSON.parse(JSON.stringify(getPlaylistForm.value));
    preventLeave.value = false;
  },
  onError: (err) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || 'Failed to edit playlist.',
    });
  },
});

// Methods
const handleSubmit = async () => {
  const payload: Record<string, any> = {
    title: playlistStore.playlistTitle,
    type: 'AUDIO',
  };

  editPlaylistById(payload);
};

function handleCancel() {
  router.back();
}

watch(
  () => [getPlaylistForm.value],
  () => {
    if (!isFetchedAfterMount.value) {
      return;
    };
    preventLeave.value = true;
  },
  { flush: 'post' },
);
</script>

<style lang="postcss" scoped>
.layout-edit-playlist {
  & {
    @apply flex-1 relative items-center gap-y-0;
  }

  :deep(.template-manage__content) {
    @apply p-6;
  }

  :deep(.template-manage__header-row),
  :deep(.template-manage__content) {
    max-width: 1280px;
    margin: 0 auto;
  }

  :deep(.template-manage__header-row) {
    @apply px-6;
  }

  :deep(.template-manage__content) {
    @apply flex-1;
  }
}

:deep(.template-manage__header) {
  @apply py-4 border-b border-gray-100;
}
.layout-edit-playlist {
  :deep(.ui-tmpl-adjacent__header-content--sticky) {
    top: calc(var(--header-offset, 0) * 1px);
  }
}
</style>
