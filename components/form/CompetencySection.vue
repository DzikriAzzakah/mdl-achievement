<template>
  <Manager
    v-model="selectedCompetencies"
    :lang="{
      sectionDesc: 'Add directory competency for this audio',
    }"
  />
</template>

<script setup lang="ts">
import type { ICompetencySelectedItem } from '#competency/types/feature.ts';
import { useAudioStore } from '#audio/stores/audio.ts';
import Manager from '#competency/components/Manager.vue';

const store = useAudioStore();
const { competencies } = storeToRefs(store);

const mapToSelectedItem = (item: any): ICompetencySelectedItem => {
  return {
    id: item?.id,
    text: item?.text,
    level_id: item?.competencyLevel?.id,
    level_behavior: item?.competencyLevel?.behaviours,
  };
};

const mapToAudioCompetencyNode = (item: ICompetencySelectedItem) => {
  return {
    id: item?.id,
    text: item?.text,
    level: 3,
    isActive: true,
    parentNames: [],
    competencyLevel: {
      id: item?.level_id,
      behaviours: Array.isArray(item?.level_behavior)
        ? item.level_behavior
        : [],
    },
  };
};

const extractActiveCompetencies = (nodes: any[]): any[] => {
  let result: any[] = [];

  nodes.forEach((node) => {
    if (node?.level === 3 && node?.isActive === true) {
      result.push(node);
    }

    if (Array.isArray(node?.children) && node.children.length > 0) {
      result = result.concat(extractActiveCompetencies(node.children));
    }
  });

  return result;
};

const selectedCompetencies = computed<ICompetencySelectedItem[]>({
  get: () => {
    const current = Array.isArray(competencies.value) ? competencies.value : [];

    if (current.some(item => (item as any)?.level || Array.isArray((item as any)?.children) || (item as any)?.isActive !== undefined)) {
      return extractActiveCompetencies(current as any[]).map(mapToSelectedItem);
    }

    return (current as any[]).map(item => ({
      id: item?.id,
      text: item?.text,
      level_id: item?.level_id,
      level_behavior: item?.level_behavior,
    }));
  },
  set: (value) => {
    const mapped = (Array.isArray(value) ? value : []).map(mapToAudioCompetencyNode);
    competencies.value = mapped as unknown as typeof competencies.value;
    store.isNewCompetencyAdded = true;
  },
});
</script>
