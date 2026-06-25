<template>
  <div
    v-for="(data, idx) in selectedCompetency"
    :key="idx"
    class="select-level__wrapper"
  >
    <div class="select-level__competency-title">
      <span>{{ idx + 1 }}. </span> <span>{{ data?.text }}</span>
    </div>
    <div
      class="select-field--single"
    >
      <WebUiSelect
        :key="`selectLevel-${data.id}`"
        v-model="data.competencyLevel"
        :select-props="{
          placeholder: 'Select Level',
        }"
        :options="levelOptions"
        @update:model-value="onLevelChange(idx, data.id)"
      />
    </div>
    <!-- Key Behaviour -->
    <div
      v-if="Array.isArray(data?.competencyLevel?.behaviours) && data?.competencyLevel?.behaviours.length"
      class="select-level__key-behaviour"
    >
      <span class="select-level__key-behaviour-title">Key Behaviour</span>
      <ul
        class="select-level__key-behaviour-desc"
        :class="!isExpanded[idx] && needViewMore(data?.competencyLevel?.behaviours) ? 'line-clamp-2' : ''"
      >
        <li
          v-for="(point, i) in data.competencyLevel?.behaviours"
          :key="i"
        >
          {{ point }}
        </li>
      </ul>
      <div
        v-if="needViewMore(data.competencyLevel?.behaviours)"
        class="text-primary-500 font-medium text-sm"
      >
        <span
          class="cursor-pointer"
          @click="toggleExpand(idx)"
        >
          {{ isExpanded[idx] ? 'View Less' : 'View More' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProficiencyLevel } from '#audio/config/types.ts';
import { getKeyBehaviours, getLevelList } from '#audio/api/api.ts';
import { getCompetencyOnly } from '#audio/composables/useCompetencyTree.ts';
import { useAudioStore } from '#audio/stores/audio.ts';
import { useQuery } from '@tanstack/vue-query';

const store = useAudioStore();
const { $toast } = useNuxtApp();
const { getApiErrorMessage } = useUtility();

// data
const selectedCompetency = ref<any[]>(getCompetencyOnly(store.competencies));
const isExpanded = ref<boolean[]>(selectedCompetency.value.map(() => false));
const selectedIndex = ref<number | null>(null);
const currentCompId = ref<number | string | null>(null);
const currentLevelId = ref<number | string | null>(null);
// Fetch Level List
const { data: levelOptions } = useQuery({
  queryKey: ['get-level'],
  queryFn: async () => {
    const response = await getLevelList();
    const level = response?.data?.map((item: any) => ({
      id: item.id,
      value: item.value as ProficiencyLevel,
      label: item.title,
    }));
    return level;
  },
});

const { refetch: refetchKeyBehaviour } = useQuery({
  queryKey: ['get-key-behaviour'],
  queryFn: async () => {
    if (selectedIndex.value === null) {
      return [];
    }

    const params = {
      competencyId: currentCompId.value,
      levelId: currentLevelId.value,
    };
    const response = await getKeyBehaviours(params)
      .catch((err: any) => {
        $toast({
          variant: 'error',
          title: 'Error',
          text: getApiErrorMessage(err) || 'Failed to fetch behaviour.',
        });
      });

    const { competencyLevel } = selectedCompetency.value[selectedIndex.value];

    if (response) {
      selectedCompetency.value[selectedIndex.value].competencyLevel = {
        ...competencyLevel,
        behaviours: response?.data || [],
      };
    }
    else {
      selectedCompetency.value[selectedIndex.value].competencyLevel = competencyLevel
        ? { ...competencyLevel, behaviours: [] }
        : null;
    }
    return response || [];
  },
  enabled: false,
  retry: false,
});

const onLevelChange = async (idx: number, competencyId: any) => {
  // guarding this func if level is unselected
  if (!selectedCompetency.value[idx]?.competencyLevel?.id) {
    return;
  }
  selectedIndex.value = idx;
  currentCompId.value = competencyId;
  currentLevelId.value = selectedCompetency.value[idx]?.competencyLevel?.id;
  refetchKeyBehaviour();
};

const toggleExpand = (idx: number) => {
  isExpanded.value[idx] = !isExpanded.value[idx];
};

const needViewMore = (keyBehaviour: string[]) => {
  return keyBehaviour.length > 2 || keyBehaviour.some(point => point.length > 120);
};
</script>

<style scoped lang="postcss">
.select-field--single {
  :deep(.multiselect__tags) {
    height: 100%;
    @apply shadow-sm;
  }

  :deep(.select-field__trailing) {
    height: 20px;
  }

  :deep(.multiselect__content-wrapper) {
    bottom: unset;
  }
}

.select-level {
  &__wrapper {
    @apply flex flex-col gap-[10px] border border-gray-50 rounded-lg p-3
  }

  &__competency-title {
    @apply text-gray-900 text-sm font-semibold;
  }

  &__key-behaviour > &__key-behaviour-title {
    @apply text-sm text-gray-400;
  }

  &__key-behaviour-desc {
    @apply list-disc list-outside pl-7;
  }
}
</style>
