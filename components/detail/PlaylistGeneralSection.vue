<template>
  <div class="flex flex-col gap-5 border-b border-gray-50 pb-8 self-stretch">
    <h3 class="text-base font-semibold text-gray-900">
      General
    </h3>
    <LabelContent
      title="Playlist Title"
      :description="detailPlaylist?.title || '-'"
    />
    <LabelContent
      title="Tags"
    >
      <template #default>
        <div
          v-if="store?.tags?.length "
          class="flex flex-wrap gap-2"
        >
          <WebUiBadge
            v-for="(item, idx) in store?.tags"
            :key="idx"
            class="max-w-[70%] flex-wrap text-clip text-wrap"
            variant="soft"
            color="ghost"
            type="pill"
          >
            {{ item?.tag as string }}
          </WebUiBadge>
        </div>
        <span v-else> - </span>
      </template>
    </LabelContent>
  </div>
</template>

<script lang="ts" setup>
import LabelContent from '#audio/components/LabelContent.vue';
import { useAudioPlaylistStore } from '#audio/stores/playlist.ts';

const store = useAudioPlaylistStore();
const { detailPlaylist } = storeToRefs(store);
</script>

<style lang="postcss" scoped>
  @import '#audio/styles/detail.css';
</style>
