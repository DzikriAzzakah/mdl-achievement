<template>
  <div class="instant-pick group">
    <div class="instant-pick__thumbnail">
      <img
        :src="thumbnailUrl || defaultThumbnail"
        class="instant-pick__image w-full aspect-square rounded-lg"
      >
      <div class="instant-pick__overlay" />
      <div class="instant-pick__play-wrapper">
        <div class="instant-pick__play-button">
          <WebUiIcon
            v-tooltip="'Play Audio'"
            name="mingcute:play-fill"
            width="20"
            height="20"
            class="instant-pick__play-icon"
          />
        </div>
      </div>
    </div>
    <div class="instant-pick__content">
      <div class="instant-pick__text">
        <h3 class="instant-pick__title">
          {{ title || placeholderTitle }}
        </h3>
        <p class="instant-pick__subtitle">
          {{ truncatedSubtitle }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import defaultThumbnail from '#audio/public/img/image-default.jpeg';
import { computed } from 'vue';

interface IProps {
  thumbnailUrl?: string;
  title?: string;
  subtitle?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  thumbnailUrl: '',
  title: '',
  subtitle: '',
});

// Placeholder fallbacks
const placeholderTitle = computed(() => props.title || 'Audio Title');

const truncatedSubtitle = computed(() => {
  const sub = props.subtitle || 'Description';
  return `${sub.slice(0, 18)}${sub.length > 18 ? '...' : ''}`;
});
</script>

<style scoped lang="postcss">
.instant-pick {
  @apply flex gap-x-4 cursor-pointer;
}

.instant-pick__thumbnail {
  @apply w-12 h-12 relative rounded-lg flex-shrink-0;
}

.instant-pick__image {
  @apply object-cover object-center h-full w-full rounded-lg;
}

.instant-pick__overlay {
  @apply w-full aspect-square left-0 top-0 absolute opacity-0 group-hover:opacity-100 bg-gradient-to-b from-gray-950 to-transparent rounded-lg transition-all;
}

.instant-pick__play-wrapper {
  @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity;
}

.instant-pick__play-button {
  @apply relative w-8 h-8 rounded-full bg-primary-950 opacity-80;
}

.instant-pick__play-icon {
  @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white;
}

.instant-pick__content {
  @apply relative min-w-0;
}

.instant-pick__text {
  @apply flex flex-col justify-between items-start flex-1 h-full;
}

.instant-pick__title {
  @apply text-sm font-semibold text-gray-900 line-clamp-1;
}

.instant-pick__subtitle {
  @apply text-xs text-gray-600;
}
</style>
