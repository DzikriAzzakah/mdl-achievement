<template>
  <div
    class="card-playlist"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Stacked Images Container -->
    <div
      ref="containerRef"
      class="thumbnail-container"
      :class="{ 'is-hovered': isHovered }"
      :style="containerHeightStyle"
    >
      <!-- Stacked/Grid Images -->
      <div
        v-for="(thumbnail, index) in displayThumbnails"
        :key="`image-${index}`"
        class="thumbnail-item"
        :class="{ 'in-grid': isHovered }"
        :style="getThumbnailStyle(index)"
      >
        <img
          :src="thumbnail"
          class="thumbnail-image"
        >
        <!-- Overlay for +N count (only on 4th item when hovered) -->
        <div
          v-if="isHovered && index === 3 && remainingCount > 0"
          class="grid-overlay"
        >
          <div class="overlay-background" />
          <span class="overlay-text">+{{ remainingCount }}</span>
        </div>
      </div>
    </div>

    <!-- Card Info -->
    <div class="card-info">
      <div class="flex gap-2.5 items-center text-xs text-gray-400">
        <p>Playlist</p>
        <div class="w-px h-4 bg-gray-300" />
        <p>Updated {{ formatCreatedAt(createdAt) }}</p>
      </div>
      <h3 class="font-medium text-base line-clamp-2">
        {{ title }}
      </h3>
      <p class="text-xs text-gray-400">
        {{ creatorName || 'User' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import defaultThumbnail from '#audio/public/img/image-default.jpeg';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  thumbnails: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Playlist Title',
  },
  description: {
    type: String,
    default: 'Playlist Description',
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: String,
    default: '',
  },
  creatorName: {
    type: String,
    default: '',
  },
});

const containerRef = ref(null);
const isHovered = ref(false);
const containerWidth = ref(0);
const updateContainerWidth = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth;
  }
};

onMounted(() => {
  updateContainerWidth();
  window.addEventListener('resize', updateContainerWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateContainerWidth);
});

const displayThumbnails = computed(() => {
  const sliced = props.thumbnails.slice(0, 4);
  while (sliced.length < 4) {
    sliced.push(defaultThumbnail);
  }
  return sliced;
});

const remainingCount = computed(() => {
  return Math.max(0, props.thumbnails.length - 4);
});

const thumbnailSize = computed(() => {
  return containerWidth.value * 0.7;
});

const calculateOffset = computed(() => {
  const count = displayThumbnails.value.length;
  if (count <= 1) {
    return 0;
  }

  const baseOffset = thumbnailSize.value * 0.15;
  return baseOffset / (count - 1);
});

const stackedHeight = computed(() => {
  const count = displayThumbnails.value.length;
  return thumbnailSize.value + (calculateOffset.value * (count - 1));
});

const containerHeightStyle = computed(() => {
  return {
    height: `${stackedHeight.value}px`,
  };
});

const gridSize = computed(() => {
  return (stackedHeight.value - 10) / 2;
});

const getThumbnailStyle = (index) => {
  const maxIndex = displayThumbnails.value.length - 1;
  const zIndex = maxIndex - index;

  if (!isHovered.value) {
    const leftOffset = index * calculateOffset.value;
    const topOffset = (maxIndex - index) * calculateOffset.value;

    return {
      position: 'absolute',
      left: `${leftOffset}px`,
      top: `${topOffset}px`,
      width: `${thumbnailSize.value}px`,
      height: `${thumbnailSize.value}px`,
      zIndex,
    };
  }
  else {
    const count = displayThumbnails.value.length;
    const size = gridSize.value;

    if (count === 2) {
      if (index === 0) {
        return {
          position: 'absolute',
          left: '0px',
          top: '0px',
          width: `${size}px`,
          height: `${size}px`,
          zIndex,
        };
      }
      else {
        return {
          position: 'absolute',
          left: `${size + 10}px`,
          top: `${size + 10}px`,
          width: `${size}px`,
          height: `${size}px`,
          zIndex,
        };
      }
    }
    else if (count === 3) {
      if (index === 0) {
        const centerOffset = (containerWidth.value - size) / 2;
        return {
          position: 'absolute',
          left: `${centerOffset}px`,
          top: '0px',
          width: `${size}px`,
          height: `${size}px`,
          zIndex,
        };
      }
      else {
        const col = index - 1;
        return {
          position: 'absolute',
          left: `${col * (size + 10)}px`,
          top: `${size + 10}px`,
          width: `${size}px`,
          height: `${size}px`,
          zIndex,
        };
      }
    }
    else {
      const row = Math.floor(index / 2);
      const col = index % 2;

      return {
        position: 'absolute',
        left: `${col * (size + 10)}px`,
        top: `${row * (size + 10)}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex,
      };
    }
  }
};

const formatCreatedAt = (dateString) => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }
  if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  }
  return date.toLocaleDateString();
};
</script>

<style lang="postcss" scoped>
.card-playlist {
  @apply flex flex-col gap-2 cursor-pointer;
}

.thumbnail-container {
  @apply w-full relative;
}

.thumbnail-item {
  @apply rounded-lg overflow-hidden shadow-md;
  transition: all 300ms ease-in-out;
}

.thumbnail-image {
  @apply w-full h-full object-cover object-center rounded-lg;
}

.thumbnail-item.in-grid {
  @apply shadow-sm;
}

.grid-overlay {
  @apply absolute inset-0 flex items-center justify-center rounded-lg;
}

.overlay-background {
  @apply absolute inset-0 bg-gray-900 opacity-60;
}

.overlay-text {
  @apply text-white text-sm font-medium relative z-10;
}

.card-info {
  @apply space-y-2;
}
</style>
