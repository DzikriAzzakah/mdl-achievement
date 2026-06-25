<template>
  <AdjacentTemplate
    title="General"
    description="Provide basic information and upload your audio"
    class="border-b border-gray-50 pb-6"
    sticky
  >
    <div class="flex flex-col gap-6 w-full">
      <WebUiFormGroup
        label="Audio Title"
        class="w-full"
      >
        <WebUiInput
          v-model="title"
          placeholder="Enter audio title"
          :error-message="errors.title"
        />
      </WebUiFormGroup>
      <WebUiFormGroup
        label="Audio Description"
      >
        <WebUiTextarea
          v-model="description"
          placeholder="Enter audio description"
          :max-length="1000"
          :error-message="errors.description"
        />
      </WebUiFormGroup>

      <WebUiFormGroup
        label="Tags"
        class="w-full"
        optional
      >
        <div class="select-field--multi-select">
          <WebUiSelect
            key="selectTags"
            v-model="selectedTags"
            :options="tagsOption"
            :select-props="{
              id: 'ajax',
              placeholder: 'Select an options',
              internalSearch: false,
              max: 10,
              searchable: true,
              maxHeight: 250,
              loading: isFetchTags,
              onSearchChange: (key: string) => searchOptions(key),
            }"
            multiple
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
          <span
            v-if="selectedTags.length === 0"
            class="text-xs font-normal"
          >
            You can add up to 10 Tags.
          </span>
        </div>
      </WebUiFormGroup>
      <WebUiFormGroup label="Upload Audio">
        <WebUiFileUploadFilesAudio
          v-if="displayUploadedAudio.length"
          :files="displayUploadedAudio"
          :enable-remove="true"
          @remove-file="handleRemoveAudio"
          @cancel-fetch="handleCancelFetchAudio"
        />
        <WebUiFileUploadCompact
          v-else
          id="upload-audio"
          :supported-file-types="['MP3']"
          :max-file-size="500"
          :multiple="false"
          :custom-error-messages="{
            fileType: 'The Uploaded file type is not supported.',
            fileSize: 'The File size exceeds limit of 500 MB.',
          }"
          @modified="handleUploadAudio"
        >
          <template #content>
            <div class="ui-upload-compact__content">
              <div class="text-gray-900">
                Upload File
              </div>
              <div class="text-gray-400">
                MP3 (up to 500 MB)
              </div>
            </div>
          </template>
        </WebUiFileUploadCompact>
      </WebUiFormGroup>
      <WebUiFormGroup
        label="Upload Thumbnail"
        class="flex flex-col gap-3 w-full"
      >
        <WebUiFileUploadFiles
          v-if="displayUploadedThumbnail.length"
          :files="displayUploadedThumbnail"
          :enable-remove="true"
          @remove-file="handleRemoveThumbnail"
          @cancel-fetch="handleCancelFetchThumbnail"
        />

        <WebUiFileUploadCompact
          v-else
          id="upload-thumbnail"
          :supported-file-types="['JPG', 'JPEG', 'PNG', 'WEBP']"
          :max-file-size="5"
          :multiple="false"
          :custom-error-messages="{
            fileType: 'The Uploaded file type is not supported.',
            fileSize: 'The File size exceeds limit of 5 MB.',
          }"
          @modified="handleChangeThumbnail"
        >
          <template #content>
            <div class="ui-upload-compact__content">
              <div class="text-gray-900">
                Upload File
              </div>
              <div class="text-gray-400">
                Maximum file size: Up To 5 MB
              </div>
            </div>
          </template>
        </WebUiFileUploadCompact>
      </WebUiFormGroup>
      <div v-if="thumbnailPreview">
        <img
          :src="thumbnailPreview"
          class="aspect-square object-cover object-center h-[252px] rounded-lg"
        >
      </div>
    </div>
  </AdjacentTemplate>
</template>

<script setup lang="ts">
import type { IAudioDetail } from '#audio/config/types.ts';
import type { IAudioFileItem } from '@mydigilearn-saas/web-ui';
import { getTagOptions } from '#audio/api/api.ts';
import { buildMediaUrl } from '#audio/helpers/index.ts';
import { useAudioStore } from '#audio/stores/audio.ts';
import AdjacentTemplate from '#core/components/templates/Adjacent.vue';
import { useQuery } from '@tanstack/vue-query';

// store
const store = useAudioStore();
const {
  detailAudio,
  audioContent,
  description,
  errors,
  metadata,
  tags,
  thumbnail,
  title,
} = storeToRefs(store);

// utilities
const { $toast } = useNuxtApp();
const { debounce } = useUtility();

// data
const keyTags = ref<string>('');
const debouncedKeyTags = ref<string>('');
const selectedTags = ref<{ value: string; label: string; }[]>([]);
const thumbnailPreview = ref<IAudioDetail['thumbnail_url']>('');

watch(
  () => store.thumbnail_url,
  (thumbnailUrl) => {
    // Keep local file preview if user has selected a new thumbnail.
    if (thumbnail.value instanceof File) {
      return;
    }
    thumbnailPreview.value = thumbnailUrl || '';
  },
  { immediate: true },
);

// for showing preview audio
const audioSrc = computed(() => {
  if (detailAudio?.value?.file_url) {
    return buildMediaUrl(detailAudio.value.file_url);
  }
  else if (audioContent.value instanceof File) {
    const file = audioContent.value;
    const fileBlob = new Blob([file], { type: file.type });

    return ({
      src: fileBlob,
      type: 'audio/object',
    });
  }
  return '';
});

const displayUploadedAudio = computed<IAudioFileItem[]>(() => {
  if (!audioContent.value) {
    return [];
  }

  const meta = metadata?.value?.audio as any;
  const file = audioContent.value as File;

  // when edit mode and after success create audio then go back to step 1 (need retest)
  if (detailAudio?.value?.file_url) {
    return [{
      id: '1',
      filename: meta?.name ?? title ?? '',
      src: buildMediaUrl(detailAudio?.value?.file_url) || '',
      extension: detailAudio?.value?.file_url?.split('.').pop()?.toLowerCase() ?? 'mp3',
      size: meta?.size as number | undefined,
      link: '',
      isLoading: false,
    }];
  }
  // when add mode before submit form
  else {
    return [{
      id: '1',
      filename: file.name ?? '',
      src: audioSrc.value || {},
      extension: file.name?.split('.').pop()?.toLowerCase() ?? 'mp4',
      size: file.size,
      link: '',
      isLoading: false,
    }];
  }
});

const displayUploadedThumbnail = computed(() => {
  if (!thumbnail.value && !store.thumbnail_url) {
    return [];
  }

  const meta = metadata?.value?.thumbnail as any;
  const file = thumbnail.value as File;

  // when edit mode and after success create audio then go back to step 1
  if (store.thumbnail_url) {
    return [{
      id: '1',
      filename: meta?.name ?? '',
      extension: meta?.name?.split('.').pop()?.toLowerCase() ?? 'png',
      size: meta?.size as number | undefined,
      link: '',
      isLoading: false,
    }];
  }
  // when add mode before submit form
  else {
    return [{
      id: '1',
      filename: file.name ?? '',
      extension: file.name?.split('.').pop()?.toLowerCase() ?? 'mp4',
      size: file.size,
      link: '',
      isLoading: false,
    }];
  }
});

// fetch tag options
const { data: tagsOption, isFetching: isFetchTags } = useQuery({
  queryKey: ['get-tags-audio', debouncedKeyTags],
  queryFn: async () => {
    try {
      const response = await getTagOptions({
        keyword: debouncedKeyTags.value || undefined,
      });

      const contents = response?.data?.contents;
      if (!Array.isArray(contents)) {
        return [];
      }

      return contents
        .map((item: any) => {
          const tag = item?.tag;

          if (typeof tag !== 'string' || !tag.trim()) {
            return null;
          }

          return {
            label: tag,
            value: tag,
          };
        })
        .filter(Boolean);
    }
    catch {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to fetch tags.',
      });
      return [];
    }
  },
  refetchOnMount: 'always',
});

const handleSearchTag = debounce((value: string) => {
  if (value.length > 2 || value.length === 0) {
    debouncedKeyTags.value = value;
  }
}, 300);

const searchOptions = (key: string) => {
  keyTags.value = key;
  handleSearchTag(key);
};

watch(
  [() => tagsOption.value, () => store.tags],
  ([options, selected]) => {
    if (Array.isArray(options) && Array.isArray(selected)) {
      const optionMap = new Map(
        options.map((item: any) => [item.value, item]),
      );
      const normalizedSelected: string[] = [...new Set(selected.filter((item): item is string => typeof item === 'string' && item.length > 0))];
      const mappedSelected: { value: string; label: string; }[] = normalizedSelected.map(value => optionMap.get(value) || { value, label: value });

      const isSame = mappedSelected.length === selectedTags.value.length
        && mappedSelected.every((item: any, idx: number) => item.value === selectedTags.value[idx]?.value);
      if (!isSame) {
        selectedTags.value = mappedSelected;
      }
    }
  },
  { immediate: true },
);

// assign selected tags to store.tags
watch(selectedTags, (opt) => {
  const nextTagsRaw = (opt || [])
    .map(item => item?.value)
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
  const nextTags = Array.from(new Set<string>(nextTagsRaw));
  const currentTagsRaw = Array.isArray(tags.value) ? tags.value : [];
  const currentTags = Array.from(new Set(currentTagsRaw)).filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
  const isSame = nextTags.length === currentTags.length && nextTags.every(item => currentTags.includes(item));

  if (!isSame) {
    tags.value = nextTags;
  }
});

const handleUploadAudio = (uploadedFiles: File[]) => {
  if (uploadedFiles.length > 0) {
    store.meta_data_audio = {
      name: uploadedFiles[0].name,
      size: uploadedFiles[0].size,
      type: uploadedFiles[0].type,
    };
    audioContent.value = uploadedFiles[0];
  }
};

const handleRemoveAudio = () => {
  audioContent.value = null;
  store.audio_url = '';
};

const handleCancelFetchAudio = () => {
  handleRemoveAudio();
};

const handleCancelFetchThumbnail = () => {
  handleRemoveThumbnail();
};

const handleChangeThumbnail = async (uploadedFile: File[]) => {
  if (uploadedFile.length > 0) {
    const file = uploadedFile[0];
    store.meta_data_thumbnail = {
      name: file.name,
      size: file.size,
      type: file.type,
    };

    thumbnailPreview.value = URL.createObjectURL(file);
    thumbnail.value = file;
  }
};

function handleRemoveThumbnail() {
  thumbnailPreview.value = '';
  thumbnail.value = null;
  store.thumbnail_url = '';
}
</script>

<style lang="postcss" scoped>
.ui-upload-compact {
  &__content {
    @apply text-xs font-medium;
  }
}

:deep(.template-adjacent__header-content--sticky ){
  top: calc(1.5rem + 120px);
}
</style>
