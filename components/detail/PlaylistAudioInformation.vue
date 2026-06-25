<template>
  <WebUiLoading
    v-if="isLoading"
    class="h-screen"
  />
  <div
    v-else
    class="flex gap-6 self-stretch items-start justify-between"
  >
    <div class="flex flex-col items-start self-stretch w-full">
      <PlaylistGeneralSection />
      <PlaylistAudioSection />
    </div>

    <Audittrail
      content-type="playlist"
      :content-id="contentId"
    />
  </div>
</template>

<script lang="ts" setup>
import PlaylistAudioSection from '#audio/components/detail/PlaylistAudioSection.vue';
import PlaylistGeneralSection from '#audio/components/detail/PlaylistGeneralSection.vue';
import { useAudioPlaylistStore } from '#audio/stores/playlist.ts';
import Audittrail from '#audit-trail/index.vue';

withDefaults(defineProps<{
  data?: any[];
  isLoading?: boolean;
}>(), {
  data: () => [],
  isLoading: false,
});

const store = useAudioPlaylistStore();
const route = useRoute();

const contentId = computed(() => {
  const id = store?.detailPlaylist?.id || route.params?.id || '';
  return Number(id);
});
</script>
