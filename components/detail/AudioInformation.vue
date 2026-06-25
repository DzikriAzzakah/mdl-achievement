<template>
  <WebUiLoading
    v-if="isLoading"
    class="h-screen"
  />
  <div
    v-else
    class="flex gap-6 self-stretch items-start justify-between"
  >
    <div class="flex flex-col items-start self-stretch">
      <GeneralSection />
      <CompetencySection />
    </div>

    <Audittrail
      content-type="AUDIO"
      :content-id="contentId"
    />
  </div>
</template>

<script lang="ts" setup>
import CompetencySection from '#audio/components/detail/CompetencySection.vue';
import GeneralSection from '#audio/components/detail/GeneralSection.vue';
import Audittrail from '#audit-trail/index.vue';

withDefaults(defineProps<{
  data?: any[];
  isLoading?: boolean;
}>(), {
  data: () => [],
  isLoading: false,
});

const store = useAudioStore();
const route = useRoute();

const contentId = computed(() => {
  const id = store?.audioResponse?.id || route.params?.id || '';
  return Number(id);
});
</script>
