<template>
  <AdjacentTemplate
    title="Configuration"
    description=""
    class="landing-configuration"
    sticky
  >
    <div class="landing-configuration__section-wrapper">
      <WebUiFormGroup
        label="Title"
        class="w-full"
      >
        <WebUiInput
          v-model="sectionTitle"
          placeholder="Enter title"
          :error-message="landingSectionErrors.sectionTitle"
        />
      </WebUiFormGroup>
      <WebUiFormGroup
        label="Description"
        optional
      >
        <WebUiInput
          v-model="sectionDescription"
          placeholder="Enter description"
        />
      </WebUiFormGroup>
      <WebUiFormGroup
        label="Section Type"
        class="w-full"
      >
        <div class="select-field--single">
          <WebUiSelect
            key="selectSectionType"
            v-model="sectionType"
            track-by="value"
            label="label"
            :options="sectionTypeOption"
            :select-props="{
              placeholder: 'Select an options',
              internalSearch: false,
              max: 10,
              searchable: true,
              maxHeight: 250,
              loading: isFetchSectionType,
              onSearchChange: (key: string) => searchOptions(key),
              onSelect: (key: any) => handleSelectSectionType(key),
              onRemove: () => handleSelectSectionType(null),
            }"
          >
            <template #tag="{ remove, option }">
              <WebUiBadge
                class="max-w-[70%] flex-wrap text-clip text-wrap"
                variant="outline"
                color="ghost"
                type="pill"
              >
                {{ (option as any)?.label }}
                <template #append>
                  <Icon
                    class="cursor-pointer"
                    title="Remove"
                    name="mdi:close"
                    :width="16"
                    :height="16"
                    mode="svg"
                    @click="remove"
                  />
                </template>
              </WebUiBadge>
            </template>
          </WebUiSelect>
        </div>
      </WebUiFormGroup>

      <!-- Source Type (only for Audio content type) -->
      <WebUiFormGroup
        v-if="isAudioType"
        label="Source Type"
        class="w-full"
      >
        <div class="select-field--single">
          <WebUiSelect
            key="selectSourceType"
            v-model="sourceType"
            track-by="value"
            label="label"
            :options="SOURCE_TYPE_OPTIONS"
            :select-props="{
              placeholder: 'Select source type',
              internalSearch: false,
              searchable: false,
              maxHeight: 250,
              onSelect: (key: any) => handleSelectSourceType(key),
              onRemove: () => handleSelectSourceType(null),
            }"
          />
        </div>
      </WebUiFormGroup>

      <!-- Select Playlist (when Source Type is Playlist and Audio Type) -->
      <WebUiFormGroup
        v-if="isAudioType && isSourcePlaylist"
        label="Select Playlist"
        class="w-full"
      >
        <div class="select-field--single">
          <WebUiSelect
            key="selectSourcePlaylist"
            v-model="sourcePlaylist"
            track-by="value"
            label="label"
            :options="playlistOptions"
            :select-props="{
              placeholder: 'Select playlist',
              internalSearch: false,
              searchable: true,
              max: 10,
              maxHeight: 250,
              loading: isFetchPlaylist,
              onSearchChange: (key: string) => searchPlaylistOptions(key),
              onSelect: (key: any) => handleSelectSourcePlaylist(key),
              onRemove: () => handleSelectSourcePlaylist(null),
            }"
          />
        </div>
      </WebUiFormGroup>

      <!-- Select Tag (when Source Type is Tag and Audio Type) -->
      <WebUiFormGroup
        v-if="isAudioType && isSourceTag"
        label="Select Tag"
        class="w-full"
      >
        <div class="select-field--single">
          <WebUiSelect
            key="selectSourceTag"
            v-model="sourceTag"
            track-by="value"
            label="label"
            :options="tagOptions"
            :select-props="{
              placeholder: 'Select tag',
              internalSearch: false,
              searchable: true,
              max: 10,
              maxHeight: 250,
              loading: isFetchTag,
              onSearchChange: (key: string) => searchTagOptions(key),
              onSelect: (key: any) => handleSelectSourceTag(key),
              onRemove: () => handleSelectSourceTag(null),
            }"
          />
        </div>
      </WebUiFormGroup>

      <!-- Layout View (only for audio type) -->
      <WebUiFormGroup
        v-if="isAudioType"
        label="Layout View"
        class="w-full"
      >
        <div class="select-field--single">
          <WebUiSelect
            key="selectLayoutType"
            v-model="layoutType"
            track-by="value"
            label="label"
            :options="LAYOUT_TYPE_OPTIONS"
            :select-props="{
              placeholder: 'Select layout',
              internalSearch: false,
              searchable: false,
              maxHeight: 250,
            }"
          />
        </div>
      </WebUiFormGroup>

      <!-- Featured Content / Display Rule -->
      <div class="flex flex-col gap-6">
        <div
          v-if="allowSetFeaturedContent"
          class="flex gap-6 pt-2 justify-between"
        >
          <div class="flex flex-col">
            <div class="text-sm font-medium">
              {{ featuredContentTitle }}
            </div>
            <span class="text-xs font-normal text-gray-400">{{ featuredContentSubtitle }}</span>
          </div>
          <div class="flex gap-3 w-1/3 justify-end">
            <WebUiButton
              class=""
              color="primary"
              size="lg"
              icon="mdi-plus-circle"
              variant="outline"
              :disabled="isDisabledAddFeatured"
              @click="showAddAudioModal = true"
            >
              {{ featuredContentBtnTitle }}
            </WebUiButton>
            <div class="select-field--single w-1/2">
              <WebUiSelect
                key="selectFeaturedAudio"
                v-model="featuredContentType"
                :select-props="{
                  placeholder: 'Select an options',
                  internalSearch: false,
                  searchable: true,
                  maxHeight: 250,
                  onSelect: (key: any) => handleSelectFeaturedAudio(key),
                  onRemove: () => handleSelectFeaturedAudio(null),
                }"
                :options="featuredContentTypeOptions"
              />
            </div>
          </div>
        </div>
        <SelectedContentTable
          v-if="selectedFeaturedContent.length > 0"
          content-type="featured-audio"
        />
      </div>
    </div>
  </AdjacentTemplate>
  <AddFeaturedContentModal
    v-model="showAddAudioModal"
    :data="selectedFeaturedContent"
    @on-close="showAddAudioModal = false"
    @on-submit="handleAddFeaturedContent"
  />
</template>

<script lang="ts" setup>
import type { ISectionTypeOptions } from '#audio/config/types.ts';
import { getPlaylist, getSectionTypeOptions, getTagOptions } from '#audio/api/api.ts';
import AddFeaturedContentModal from '#audio/components/AddFeaturedContentModal.vue';
import SelectedContentTable from '#audio/components/SelectedContentTable.vue';
import { FEATURED_CONTENT_TYPE_OPTIONS, LANDING_SECTION_TYPE_OPTIONS, LAYOUT_TYPE_OPTIONS, SOURCE_TYPE_ENUM, SOURCE_TYPE_OPTIONS } from '#audio/config/constant.ts';
import { useAudioLandingStore } from '#audio/stores/landing.ts';
import AdjacentTemplate from '#core/components/templates/Adjacent.vue';
import { useQuery } from '@tanstack/vue-query';

// store
const store = useAudioLandingStore();
const {
  landingSectionErrors,
  sectionTitle,
  sectionDescription,
  sectionType,
  featuredContentType,
  selectedFeaturedContent,
  layoutType,
  sourceType,
  sourcePlaylist,
  sourceTag,
} = storeToRefs(store);

// utilities
const { $toast } = useNuxtApp();
const { debounce } = useUtility();

// data
const keySectionType = ref<string>('');
const showAddAudioModal = ref<boolean>(false);

// playlist search data
const keyPlaylist = ref<string>('');
const debouncedKeyPlaylist = ref<string>('');

// tag search data
const keyTag = ref<string>('');
const debouncedKeyTag = ref<string>('');

// computed section types
const isPlaylistType = computed(() => {
  return sectionType?.value?.value === LANDING_SECTION_TYPE_OPTIONS.PLAYLIST_AUDIOS;
});

const isTagType = computed(() => {
  return sectionType?.value?.value === LANDING_SECTION_TYPE_OPTIONS.TAGS;
});

const isAudioType = computed(() => {
  return sectionType?.value?.value === LANDING_SECTION_TYPE_OPTIONS.AUDIO;
});

// source type computed
const isSourcePlaylist = computed(() => {
  return sourceType?.value?.value === SOURCE_TYPE_ENUM.PLAYLIST;
});

const isSourceTag = computed(() => {
  return sourceType?.value?.value === SOURCE_TYPE_ENUM.TAG;
});

const featuredContentTitle = computed(() => {
  if (isTagType.value) {
    return 'Featured Tag';
  }
  if (isPlaylistType.value) {
    return 'Featured Playlist';
  }
  return 'Featured Audio';
});

const isCustomFeatured = computed(() => {
  return featuredContentType?.value?.value === 'custom';
});

const featuredContentSubtitle = computed(() => {
  if (isTagType.value) {
    if (isCustomFeatured.value) {
      return 'Select up to 12 Tag to highlight in this section.';
    }
    return 'Random Tag to highlight.';
  }
  if (isPlaylistType.value) {
    if (layoutType.value.value === 'grid') {
      return 'Select up to 9 playlists to highlight in this section.';
    }
    return 'Select up to 10 playlists to highlight in this section.';
  }
  // Audio type
  if (isCustomFeatured.value) {
    if (layoutType.value.value === 'grid') {
      return 'Select up to 12 Audio to highlight in this section.';
    }
    return 'Select up to 10 Audio to highlight in this section.';
  }
  return 'Audio to highlight in this section.';
});

const featuredContentBtnTitle = computed(() => {
  if (isTagType.value) {
    return 'Add Tag';
  }
  if (isPlaylistType.value) {
    return 'Add Playlist';
  }
  return 'Add Audio';
});

const featuredContentTypeOptions = computed(() => {
  const val = sectionType.value?.value;
  // tags: only custom + random
  if (val === LANDING_SECTION_TYPE_OPTIONS.TAGS) {
    return FEATURED_CONTENT_TYPE_OPTIONS.filter(
      o => o.value === 'custom' || o.value === 'random',
    );
  }
  // audio: all (latest, oldest, popular, random, custom)
  if (val === LANDING_SECTION_TYPE_OPTIONS.AUDIO) {
    return FEATURED_CONTENT_TYPE_OPTIONS;
  }
  // playlist: all (latest, oldest, popular, random, custom)
  if (val === LANDING_SECTION_TYPE_OPTIONS.PLAYLIST_AUDIOS) {
    return FEATURED_CONTENT_TYPE_OPTIONS;
  }
  // other types: exclude custom
  return FEATURED_CONTENT_TYPE_OPTIONS.filter(
    o => o.value !== 'custom',
  );
});

const isDisabledAddFeatured = computed(() => {
  if (!isCustomFeatured.value) {
    return true;
  }
  if (isAudioType.value && isSourcePlaylist.value && !sourcePlaylist.value) {
    return true;
  }
  if (isAudioType.value && isSourceTag.value && !sourceTag.value) {
    return true;
  }
  return false;
});

const allowSetFeaturedContent = computed(() => {
  return !!sectionType?.value?.value;
});

const handleQueryError = (errorMessage: string) => {
  $toast({
    variant: 'error',
    title: 'Error',
    text: errorMessage,
  });
};

// fetch section type options
const { data: sectionTypeOption, isFetching: isFetchSectionType } = useQuery({
  queryKey: ['get-section-type', keySectionType],
  queryFn: async () => {
    try {
      const response = await getSectionTypeOptions({
        keyword: keySectionType.value || undefined,
      });

      if (response) {
        return response?.data?.contents?.map((item: ISectionTypeOptions) => ({
          label: item?.title,
          value: item?.slug,
        })) || [];
      }
    }
    catch {
      handleQueryError('Failed to fetch section type.');
      return [];
    }
  },
  refetchOnMount: false,
});

const searchOptions = async (key: string) => {
  if (key?.length > 2 || key?.length === 0) {
    keySectionType.value = key;
  }
};

// fetch playlist options (for source type playlist)
const { data: playlistOptions, isFetching: isFetchPlaylist } = useQuery({
  queryKey: ['get-playlist-options', debouncedKeyPlaylist],
  queryFn: async () => {
    try {
      const response = await getPlaylist({
        paginate: false,
        ...(debouncedKeyPlaylist.value ? { keyword: debouncedKeyPlaylist.value } : {}),
      });

      if (response?.data?.contents) {
        return response.data.contents.map((item: any) => ({
          label: item?.title,
          value: item?.id,
        })) || [];
      }
      return [];
    }
    catch {
      handleQueryError('Failed to fetch playlists.');
      return [];
    }
  },
  enabled: computed(() => isSourcePlaylist.value),
  refetchOnMount: false,
});

const handleSearchPlaylist = debounce((value: string) => {
  if (value.length > 2 || value.length === 0) {
    debouncedKeyPlaylist.value = value;
  }
}, 300);

const searchPlaylistOptions = (key: string) => {
  keyPlaylist.value = key;
  handleSearchPlaylist(key);
};

// fetch tag options (for source type tag)
const { data: tagOptions, isFetching: isFetchTag } = useQuery({
  queryKey: ['get-tag-options-source', debouncedKeyTag],
  queryFn: async () => {
    try {
      const response = await getTagOptions({
        ...(debouncedKeyTag.value ? { keyword: debouncedKeyTag.value } : {}),
      });

      if (response?.data?.contents) {
        return response.data.contents.map((item: any) => ({
          label: item?.tag || item?.title,
          value: item?.id,
        })) || [];
      }
      return [];
    }
    catch {
      handleQueryError('Failed to fetch tags.');
      return [];
    }
  },
  enabled: computed(() => isSourceTag.value),
  refetchOnMount: false,
});

const handleSearchTag = debounce((value: string) => {
  if (value.length > 2 || value.length === 0) {
    debouncedKeyTag.value = value;
  }
}, 300);

const searchTagOptions = (key: string) => {
  keyTag.value = key;
  handleSearchTag(key);
};

function handleAddFeaturedContent() {
  showAddAudioModal.value = false;
};

function handleSelectSectionType(data: any) {
  featuredContentType.value = null;
  selectedFeaturedContent.value = [];
  layoutType.value = { label: 'List', value: 'list' };
  sourceType.value = null;
  sourcePlaylist.value = null;
  sourceTag.value = null;
  sectionType.value = data;
}

function handleSelectFeaturedAudio(data: any) {
  store.sectionContent = [];
  featuredContentType.value = data;

  if (data?.value !== 'custom') {
    selectedFeaturedContent.value = [];
  }
}

function handleSelectSourceType(data: any) {
  sourceType.value = data;
  // Reset playlist/tag selection when source type changes
  sourcePlaylist.value = null;
  sourceTag.value = null;
  // Reset selected content when source changes
  selectedFeaturedContent.value = [];
}

function handleSelectSourcePlaylist(data: any) {
  sourcePlaylist.value = data;
  // Reset selected content when playlist changes
  selectedFeaturedContent.value = [];
}

function handleSelectSourceTag(data: any) {
  sourceTag.value = data;
  // Reset selected content when tag changes
  selectedFeaturedContent.value = [];
}
</script>

<style lang="postcss" scoped>
.landing-configuration {
  @apply flex-col;

  &__section-wrapper {
    @apply flex flex-col gap-4 w-full py-8 px-16 border rounded-xl border-gray-50;
  }
}

.select-field--single {
  :deep(.multiselect__tags) {
    width: 100%;
  }

  :deep(.multiselect__content-wrapper) {
    bottom: unset;
  }
}

.select-field--single {
  :deep(.select-field),
  :deep(.select-field-wrapper) {
    height: 100%;
  }
}

:deep(.multiselect__option--highlight) {
  background-color: #E2FEF7 !important;
}

:deep(.multiselect__option--selected) {
  background-color: #E2FEF7 !important;
}
</style>
