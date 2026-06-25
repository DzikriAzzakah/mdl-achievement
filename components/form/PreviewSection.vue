<template>
  <AdjacentTemplate
    title="Preview"
    description=""
    class="preview"
    sticky
  >
    <div class="preview__section-wrapper">
      <div class="flex justify-between gap-4">
        <div class="flex-col gap-1">
          <div class="text-gray-900 font-semibold text-lg">
            {{ sectionTitle || 'Title' }}
          </div>
          <div class="text-gray-400">
            {{ sectionDescription || 'Description' }}
          </div>
        </div>
        <div class="flex gap-[10px] text-primary-500 items-center">
          {{ viewLabel }}
          <WebUiButton
            v-if="isAllowUseSlideBtn"
            class="breadcrumb__back"
            color="ghost"
            variant="soft"
            icon="mdi-chevron-left"
            :disabled="isBackDisabled"
            :square="true"
            @click="handleBack"
          />
          <WebUiButton
            v-if="isAllowUseSlideBtn"
            class="breadcrumb__back"
            color="ghost"
            variant="soft"
            icon="mdi-chevron-right"
            :disabled="isNextDisabled"
            :square="true"
            @click="handleNext"
          />
        </div>
      </div>
      <!-- wrapper card list -->
      <div
        v-if="sectionType?.value === LANDING_SECTION_TYPE_OPTIONS.TAGS"
        class="grid-tags"
      >
        <TagCard
          v-for="(item, i) in tagRenderContent"
          :key="i"
          :title="(item?.title as any) || 'Tag Title'"
        />
      </div>
      <!-- Playlist card preview -->
      <div
        v-else-if="sectionType?.value === LANDING_SECTION_TYPE_OPTIONS.PLAYLIST_AUDIOS"
        class="grid grid-cols-6 gap-6 w-full"
      >
        <PlaylistCardStacked
          v-for="(item, idx) in displayContent"
          :key="idx"
          :title="(item as any)?.title || `Playlist ${idx + 1}`"
          :thumbnails="getThumbnails(item)"
          :created-at="(item as any)?.created_at || ''"
          :creator-name="(item as any)?.created_by_name || ''"
        />
      </div>
      <!-- Audio Grid layout -->
      <div
        v-else-if="sectionType?.value === LANDING_SECTION_TYPE_OPTIONS.AUDIO && layoutType?.value === 'grid'"
        class="grid-audio-grid"
      >
        <GridCard
          v-for="(item, idx) in gridDisplayContent"
          :key="idx"
          :thumbnail-url="getThumbnailUrl(item)"
          :title="(item as any)?.title"
          :subtitle="(item as any)?.created_by_name || (item as any)?.author || ''"
        />
      </div>
      <!-- Audio List layout (default) -->
      <div
        v-else
        class="grid grid-cols-6 gap-6 w-full"
      >
        <DefaultCard
          v-for="(item, idx) in displayContent"
          :key="idx"
          :title="(item as any)?.title || `Audio ${idx + 1}`"
          :thumbnail="getThumbnailUrl(item)"
          :author="(item as any)?.created_by_name"
        />
      </div>
    </div>
  </AdjacentTemplate>
</template>

<script setup lang="ts">
import DefaultCard from '#audio/components/DefaultCard.vue';
import GridCard from '#audio/components/GridCard.vue';
import PlaylistCardStacked from '#audio/components/PlaylistCardStacked.vue';
import TagCard from '#audio/components/TagCard.vue';
import { LANDING_SECTION_TYPE_OPTIONS } from '#audio/config/constant.ts';
import { buildMediaUrl } from '#audio/helpers';
import { useAudioLandingStore } from '#audio/stores/landing.ts';
import AdjacentTemplate from '#core/components/templates/Adjacent.vue';

// store
const store = useAudioLandingStore();
const {
  sectionTitle,
  sectionType,
  sectionDescription,
  selectedFeaturedContent,
  layoutType,
  featuredContentType,
  sourceType,
} = storeToRefs(store);

// data
const currentIndex = ref(0);
const pageSize = 6;
const gridPageSize = 9;

// computed
const tagRenderContent = computed(() => {
  if (selectedFeaturedContent.value && selectedFeaturedContent.value.length > 0) {
    return selectedFeaturedContent.value.slice(0, 9);
  }
  return Array.from({ length: 9 }, () => ({ title: '' }));
});
const maxIndex = computed(() => {
  const size = layoutType?.value?.value === 'grid' ? gridPageSize : pageSize;
  return Math.max(0, Math.ceil((selectedFeaturedContent.value?.length || 0) / size) - 1);
});
const isBackDisabled = computed(() => currentIndex.value === 0);
const isNextDisabled = computed(() => currentIndex.value === maxIndex.value);
const viewLabel = computed(() => {
  const type = sectionType.value?.value;

  if (type === LANDING_SECTION_TYPE_OPTIONS.TAGS) {
    return '';
  }

  if (type === LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
    const isCustomFromMaster = featuredContentType.value?.value === 'custom' && (!sourceType.value?.value || sourceType.value?.value === 'master');
    return isCustomFromMaster ? '' : 'Explore';
  }

  return 'Explore';
});
const isAllowUseSlideBtn = computed(() => {
  const type = sectionType.value?.value;
  const isPaginatable = type !== LANDING_SECTION_TYPE_OPTIONS.TAGS;

  return isPaginatable
    && (selectedFeaturedContent.value?.length || 0) > (layoutType?.value?.value === 'grid' ? gridPageSize : pageSize);
});
const displayContent = computed(() => {
  if (!selectedFeaturedContent.value?.length) {
    return Array.from({ length: pageSize }, (_, i) => ({ placeholder: true, idx: i }));
  }

  const start = currentIndex.value * pageSize;
  const end = start + pageSize;
  return selectedFeaturedContent.value.slice(start, end);
});
const gridDisplayContent = computed(() => {
  if (!selectedFeaturedContent.value?.length) {
    return Array.from({ length: gridPageSize }, (_, i) => ({ placeholder: true, idx: i }));
  }

  const start = currentIndex.value * gridPageSize;
  const end = start + gridPageSize;
  return selectedFeaturedContent.value.slice(start, end);
});

function getThumbnailUrl(item: any): string {
  if (item?.placeholder) {
    return '';
  }
  return buildMediaUrl(item?.cover_url) || item?.thumbnail_url || '';
}

function getThumbnails(item: any) {
  if (item?.placeholder) {
    return [];
  }
  if (item?.thumbnails?.length) {
    return item.thumbnails;
  }
  if (item?.thumbnail_url) {
    return [item.thumbnail_url];
  }
  if (item?.thumbnail) {
    return [item.thumbnail];
  }
  return [];
}

function handleBack() {
  if (!isBackDisabled.value) {
    currentIndex.value--;
  }
}
function handleNext() {
  if (!isNextDisabled.value) {
    currentIndex.value++;
  }
}
</script>

<style lang="postcss" scoped>
.preview {
  @apply flex-col;

  &__section-wrapper {
    @apply flex flex-col gap-4 w-full py-8 px-16 border rounded-xl border-gray-50;
  }
}

.grid-tags {
  @apply grid grid-cols-3 gap-x-5 gap-y-5 w-full;
}

.grid-audio-grid {
  @apply grid grid-cols-3 gap-x-6 gap-y-4 w-full;
}
</style>
