<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to || undefined"
    class="card-audio group"
    @click="!to && handleClick()"
  >
    <div class="card-audio__image-wrapper">
      <img
        :src="thumbnail || defaultThumbnail"
        class="card-audio__image-thumbnail"
      >
      <div class="card-audio__image-duration group-hover:hidden">
        {{ formattedDuration }}
      </div>
      <div class="card-audio__image-overlay" />
      <div class="card-audio__image-play">
        <div class="card-audio__image-play-circle">
          <UiIcon
            v-tooltip="'Play Audio'"
            name="mingcute:play-fill"
            width="40"
            height="40"
            class="card-audio__image-play-icon"
          />
        </div>
      </div>
    </div>

    <div class="card-audio__body">
      <div class="card-audio__stats">
        <span v-if="normalizedPlayCount">{{ normalizedPlayCount }}</span>
        <span
          v-if="normalizedPlayCount && normalizedCreatedAt"
          class="separator"
        />
        <span v-if="normalizedCreatedAt">{{ normalizedCreatedAt }}</span>
      </div>
      <h3 class="card-audio__title">
        {{ title }}
      </h3>
      <p class="card-audio__author">
        {{ author }}
      </p>
    </div>
  </component>
</template>

<script setup lang="ts">
import { formatDuration, formatPlayCount, getTimeAgo } from '#audio/helpers/formatHelper';
import previewThumbnail from '#audio/public/img/checker.png';
import defaultThumbnail from '#audio/public/img/image-default.jpeg';
import { UiIcon } from '@mydigilearn-saas/web-ui';

interface IProps {
  to?: string | object | null;
  author?: string;
  duration?: number;
  durationUnit?: string;
  thumbnail?: string;
  title?: string;
  playCount?: number | null;
  createdAt?: string;
  hideEmptyAudioStats?: boolean;
  audioStats?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  to: null,
  duration: 600,
  durationUnit: 'seconds',
  title: '',
  author: 'Telkom Indonesia',
  thumbnail: previewThumbnail,
  playCount: null,
  createdAt: '',
  hideEmptyAudioStats: false,
  audioStats: () => ['1K', '5'],
});

const emit = defineEmits(['click']);

const { duration, durationUnit, playCount, createdAt } = toRefs(props);

function handleClick() {
  emit('click');
}

const formattedDuration = computed(() => formatDuration(duration.value, durationUnit.value));
const normalizedPlayCount = computed(() => formatPlayCount(playCount.value));
const normalizedCreatedAt = computed(() => getTimeAgo(createdAt.value));
</script>

<style lang="postcss" scoped>
.card-audio {
  @apply cursor-pointer;
}

.card-audio__image-wrapper {
  @apply w-full relative rounded-lg;
}

.card-audio__image-thumbnail {
  @apply w-full aspect-square object-cover object-center rounded-lg;
}

.card-audio__image-duration {
  @apply absolute bottom-2.5 right-2.5 bg-gray-900 px-2.5 py-1.5 rounded-md text-xs text-white font-medium;
}

.card-audio__image-overlay {
  @apply w-full aspect-square left-0 top-0 absolute opacity-0 group-hover:opacity-100 bg-gradient-to-b from-gray-950 to-white rounded-lg transition-all;
}

.card-audio__image-play {
  @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity;
}

.card-audio__image-play-circle {
  @apply relative w-16 h-16 rounded-full bg-primary-950 opacity-80;
}

.card-audio__image-play-icon {
  @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white;
}

.card-audio__body {
  @apply flex flex-col grow gap-[6px] items-start text-sm self-stretch;
}

.card-audio__stats {
  @apply flex gap-2.5 text-xs text-gray-400 overflow-hidden whitespace-nowrap text-ellipsis empty:hidden;
  > .separator {
    @apply border-gray-100 text-gray-100;
    &:before {
      content: '|';
    }
  }
}

.card-audio__title {
  @apply text-sm font-semibold text-gray-900 line-clamp-2;
}

.card-audio__author {
  @apply text-xs text-gray-600;
}
</style>
