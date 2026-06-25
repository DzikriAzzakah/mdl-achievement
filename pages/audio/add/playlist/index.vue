<template>
  <TemplateManageLayout
    title="Create Playlist"
    class="layout-create-playlist"
    :breadcrumbs="[]"
    :disable-submit="isDisabledSubmitBtn"
    :label-submit="buttonLabelSubmit"
    :is-loading-submit="isLoading"
    :fixed-bottom-footer="true"
    :is-use-breadcrumbs="false"
    show-header-button
    :show-cancel="false"
    disable-footer
    @on-cancel="handleCancel"
    @on-submit="handleSubmit"
  >
    <template #content>
      <AddPlaylist />
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import { postCreatePlaylist } from '#audio/api/api.ts';
import { patchTagPayload } from '#audio/api/tag.ts';
import AddPlaylist from '#audio/components/form/AddPlaylist.vue';
import { PERMISSION_CREATE, PERMISSION_LIST } from '#audio/config/featureFlag.ts';
import { useAudioPlaylistStore } from '#audio/stores/playlist.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import { useMutation } from '@tanstack/vue-query';

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_CREATE],
  },
});

// Utilities
const router = useRouter();
const playlistStore = useAudioPlaylistStore();
const { $toast } = useNuxtApp();
const { showLoading, hideLoading } = useGlobalLoading();
const { getApiErrorMessage } = useUtility();

// Data
const isLoading = ref<boolean>(false);
const buttonLabelSubmit = ref<string>('Create');
const playlistId = ref<number | null>(null);

// Computed
const isDisabledSubmitBtn = computed(() => {
  if (playlistStore.playlistTitle && playlistStore.playlistContent.length > 0) {
    return false;
  }
  return true;
});

// Method
// Patch tag
const { mutate: submitPatchTag } = useMutation({
  mutationFn: async () => {
    if (!playlistStore?.tags || playlistStore.tags.length < 1) {
      return;
    }
    isLoading.value = true;
    showLoading('Submitting tags', 'Please wait while we update the tags.');

    const payload = {
      id: Number(playlistId.value),
      tags: playlistStore?.tags,
      contentType: 'PLAYLIST',
    };

    await patchTagPayload(payload);
  },
  onSettled: () => {
    isLoading.value = false;
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

const { mutate: submitPlaylist } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    isLoading.value = true;
    const response = await postCreatePlaylist(payload).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to create playlist.',
      });
    });

    if (response) {
      playlistId.value = response?.data?.id || null;
      $toast({
        variant: 'success',
        title: 'Success',
        width: '32em', // overriding width value from css to its default value
        text: `Playlist successfully created.`,
      });
      submitPatchTag();
      router.replace({ name: 'audio', query: { tab: 'playlist' } });
    }
  },
  onSettled: () => {
    isLoading.value = false;
    hideLoading();
  },
});

const handleSubmit = async () => {
  const contents = playlistStore?.playlistContent.map((item: any) => {
    return {
      content_id: item?.id,
      content_type: 'AUDIO', // Static
    };
  });

  const payload = {
    contents,
    title: playlistStore?.playlistTitle,
    type: 'AUDIO',
  };

  submitPlaylist(payload);
};

function handleCancel() {
  router.back();
}

onBeforeMount(() => {
  playlistStore.$resetAll();
});
</script>

<style lang="postcss" scoped>
.layout-create-playlist {
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
.layout-create-playlist {
  :deep(.ui-tmpl-adjacent__header-content--sticky) {
    top: calc(var(--header-offset, 0) * 1px);
  }
}
</style>
