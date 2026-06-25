<template>
  <AdjacentTemplate
    title="General"
    description="Provide basic information of the playlist"
    class="border-b border-gray-50 pb-6"
    sticky
  >
    <div class="flex flex-col gap-6 w-full">
      <WebUiFormGroup
        :label="FieldLabel.TITLE"
        class="w-full"
      >
        <WebUiInput
          v-model="playlistTitle"
          :placeholder="FieldPlaceholder.TITLE"
          :error-message="playlistErrors.playlistTitle"
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
            :options="tagsOption"
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
            v-if="selectedTags?.length === 0"
            class="text-xs font-normal"
          >
            You can add up to 10 Tags.
          </span>
        </div>
      </WebUiFormGroup>
    </div>
  </AdjacentTemplate>
</template>

<script setup lang="ts">
import type { ITagsOptions } from '#audio/config/types.ts';
import { getTagOptionsWithId } from '#audio/api/api.ts';
import { useAudioPlaylistStore } from '#audio/stores/playlist.ts';
import AdjacentTemplate from '#core/components/templates/Adjacent.vue';
import { useQuery } from '@tanstack/vue-query';

const playlistStore = useAudioPlaylistStore();
const {
  playlistTitle,
  playlistErrors,
  tags,
} = storeToRefs(playlistStore);

const { $toast } = useNuxtApp();

const keyTags = ref<string>('');

const { data: tagsOption, isFetching: isFetchTags } = useQuery({
  queryKey: ['get-tags-audio', keyTags],
  queryFn: async () => {
    try {
      const response = await getTagOptionsWithId({
        keyword: keyTags.value || undefined,
      });

      if (response?.data?.contents) {
        return response.data.contents.map((item: ITagsOptions) => ({
          label: item.tag,
          value: item.id,
        })) || [];
      }
      return [];
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

const selectedTags = computed({
  get: () => {
    if (!tagsOption.value || !Array.isArray(playlistStore.tags)) {
      return [];
    };
    const storeTagIds = playlistStore?.tags?.map((t: any) => t?.tag_id) || [];
    const storeTagsSet = new Set(storeTagIds);
    return tagsOption.value.filter((opt: any) => storeTagsSet.has(opt.value));
  },
  set: (newTags) => {
    if (!Array.isArray(newTags) || newTags.length === 0) {
      tags.value = [];
      return;
    }

    tags.value = newTags.map((item: any) => ({
      tag: item.label,
      tag_id: item.value,
    }));
  },
});

const FieldLabel = {
  TITLE: 'Title',
};

const FieldPlaceholder = {
  TITLE: 'Enter playlist title',
};

const searchOptions = async (key: string) => {
  if (key?.length > 2 || key?.length === 0) {
    keyTags.value = key;
  }
};
</script>
