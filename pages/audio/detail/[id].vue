<template>
  <TemplateManageLayout
    title="Details"
    class="layout-detail-audio"
    :breadcrumbs="breadcrumbs"
    :active-stepper="activeTab"
    :stepper="AUDIO_TABS"
    is-tabs
    disable-footer
    @on-change="handleTabsChange"
  >
    <template #content>
      <AudioInformation
        v-if="activeTab === 'audio-information'"
        :is-loading="isLoadingDetail"
      />
      <Configuration v-if="activeTab === 'configuration'" />
      <Accessibility v-if="activeTab === 'accessibility'" />
    </template>
  </TemplateManageLayout>
</template>

<script lang="ts" setup>
import type { IAudioDetail } from '#audio/config/types.ts';
import { getAudioDetail } from '#audio/api/api.ts';
import Accessibility from '#audio/components/detail/Accessibility.vue';
import AudioInformation from '#audio/components/detail/AudioInformation.vue';
import Configuration from '#audio/components/detail/Configuration.vue';
import { AUDIO_TABS } from '#audio/config/constant.ts';
import { PERMISSION_DETAIL, PERMISSION_LIST } from '#audio/config/featureFlag.ts';
import { useAudioStore } from '#audio/stores/audio.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import { useQuery } from '@tanstack/vue-query';

definePageMeta({
  layout: 'full',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_DETAIL],
  },
});

const route = useRoute();
const store = useAudioStore();
const { detailAudio } = storeToRefs(store);
const audioId = route.params.id;

const { $toast } = useNuxtApp();
const activeTab = ref('audio-information');
const breadcrumbs = [
  { text: 'Learning Content', href: '', active: false },
  { text: 'Audio', href: '/audio', active: false },
  { text: 'Details', href: `/audio/detail/${audioId}`, active: true },
];

const { isLoading: isLoadingDetail, refetch } = useQuery({
  queryKey: ['get-detail-audio', audioId],
  queryFn: async () => {
    const response = await getAudioDetail(Number(audioId)).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to fetch detail audio.',
      });
      return { data: {} };
    });

    const content = response?.data as IAudioDetail;
    detailAudio.value = content;
    store.thumbnail_url = content.cover_url || '';

    // Map new API fields to store
    const formValues: Record<string, any> = {
      status_enum: content.is_published ? 'publish' : (content.status_enum || 'draft'),
      is_master: content.is_master ?? content.is_master ?? false,
      metadata: content.metadata ? (typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata) : {},
    };
    store.setFormValues(formValues, true);

    // Tags now embedded in detail response
    if (Array.isArray(content.tags)) {
      store.tags = content.tags;
    }

    // Competencies now embedded in detail response
    if (Array.isArray(content.competencies)) {
      store.competencies = content.competencies as any;
    }

    return content;
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

provide('refetch-detail', refetch);

const handleTabsChange = (value: string) => {
  if (value !== activeTab.value) {
    activeTab.value = value;
  }
};

onBeforeMount(() => {
  store.$resetAll();
});
</script>

<style lang="postcss" scoped>
:deep(.template-adjacent--border) {
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
}

.empty-layout:has(.layout-detail-audio) {
  margin: auto;
  max-width: 1280px;
  padding: 24px 0px;
}

.template-manage__header {
  padding-top: 0px;
}
</style>
