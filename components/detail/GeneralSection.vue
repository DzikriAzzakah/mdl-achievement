<template>
  <div class="flex flex-col gap-5 border-b border-gray-50 pb-8 self-stretch">
    <h3 class="text-base font-semibold text-gray-900">
      General
    </h3>
    <LabelContent
      title="Audio Title"
      :description="detailAudio?.title || '-'"
    />
    <LabelContent
      title="Audio Description"
      :description="detailAudio?.description || '-'"
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
            {{ typeof item === 'string' ? item : (item as any)?.tag ?? '-' }}
          </WebUiBadge>
        </div>
        <span v-else> - </span>
      </template>
    </LabelContent>
    <LabelContent
      title="Audio"
    >
      <WebUiFileUploadFilesAudio
        :src="buildMediaUrl(detailAudio?.file_url)"
        :files="displayUploadedAudio"
        :enable-remove="false"
      />
    </LabelContent>
    <LabelContent
      title="Audio Thumbnail"
    >
      <div>
        <img
          :src="thumbnail"
          class="aspect-square object-cover object-center h-[252px] rounded-lg"
        >
      </div>
    </LabelContent>
  </div>
</template>

<script lang="ts" setup>
import type { IMetadata } from '#audio/config/types.ts';
import type { IAudioFileItem } from '@mydigilearn-saas/web-ui';
import LabelContent from '#audio/components/LabelContent.vue';
import { buildMediaUrl } from '#audio/helpers/index.ts';
import defaultThumbnail from '#audio/public/img/thumbnail-default.jpeg';

const store = useAudioStore();
const { metadata, detailAudio } = storeToRefs(store);
const thumbnail = computed(() => {
  if (detailAudio.value?.cover_url) {
    return buildMediaUrl(detailAudio.value.cover_url);
  }
  return defaultThumbnail;
});
const displayUploadedAudio = computed<IAudioFileItem[]>(() => {
  const meta = (metadata?.value as IMetadata)?.audio;
  const { title, file_url } = detailAudio?.value || {};

  return [{
    id: '1',
    filename: meta?.name ?? title ?? '',
    src: buildMediaUrl(detailAudio?.value?.file_url) || '',
    extension: file_url?.split('.').pop()?.toLowerCase() ?? 'mp3',
    size: meta?.size as number | undefined,
    link: '',
    isLoading: false,
  }];
});
</script>

<style lang="postcss" scoped>
  @import '#audio/styles/detail.css';
</style>
