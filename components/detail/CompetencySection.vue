<template>
  <div class="flex flex-col gap-5 pt-8 self-stretch">
    <h3 class="text-base font-semibold text-gray-900">
      Directory Competency
    </h3>
    <LabelContent
      title="Competency"
    >
      <template #default>
        <div
          class="flex flex-wrap gap-2"
        >
          <WebUiBadge
            v-for="(item, idx) in competencyList"
            :key="idx"
            class="max-w-[70%] flex-wrap text-clip text-wrap"
            variant="soft"
            color="ghost"
            type="pill"
          >
            {{ item?.text }} ({{ (item?.competencyLevel as ICompetencyLevel)?.title }})
          </WebUiBadge>
        </div>
      </template>
    </LabelContent>
  </div>
</template>

<script lang="ts" setup>
import type { ICompetencyAudioDetail, ICompetencyLevel } from '#audio/config/types';
import LabelContent from '#audio/components/LabelContent.vue';

const store = useAudioStore();

const competencyList = computed(() => {
  const list = store.competencies as ICompetencyAudioDetail[] | undefined;
  if (Array.isArray(list) && list.length > 0) {
    return list.map((item: ICompetencyAudioDetail) => ({
      text: item.title,
      competencyLevel: item.level,
    }));
  }
  return [];
});
</script>
