<template>
  <TemplateManageLayout
    title="Details"
    class="layout-detail-badge"
    :breadcrumbs="breadcrumbs"
    :active-stepper="activeTab"
    :stepper="BADGE_TABS"
    is-tabs
    disable-footer
    @on-change="handleTabsChange"
  >
    <template #content>
      <BadgeConfiguration
        v-if="activeTab === 'badge-configuration'"
        :loading="isLoadingDetail"
      />
      <BadgeImage v-if="activeTab === 'badge-image'" />
      <AccessibilityInformation v-if="activeTab === 'accessibility'" />
    </template>
  </TemplateManageLayout>
</template>

<script lang="ts" setup>
import type { IBadgeDetail } from '#achievement/config/types.ts';
import { getBadgeDetail } from '#achievement/api/api.ts';
import AccessibilityInformation from '#achievement/components/detail/badge/AccessibilityInformation.vue';
import BadgeConfiguration from '#achievement/components/detail/badge/BadgeConfiguration.vue';
import BadgeImage from '#achievement/components/detail/badge/BadgeImage.vue';
import { BADGE_TABS } from '#achievement/config/constants.ts';
import { PERMISSION_DETAIL, PERMISSION_LIST } from '#achievement/config/featureFlag.ts';
import { useBadgeStore } from '#achievement/stores/badge.ts';
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
const store = useBadgeStore();
const { detailBadge } = storeToRefs(store);
const badgeId = route.params.id;

const { $toast } = useNuxtApp();
const activeTab = ref('badge-configuration');
const breadcrumbs = computed(() => [
  { text: 'Master Data', href: '', active: false },
  { text: 'Achievement', href: '/achievement', active: false },
  { text: 'Details', href: `/achievement/detail/badge/${badgeId}`, active: true },
]);

const { isLoading: isLoadingDetail, refetch } = useQuery({
  queryKey: ['get-detail-badge', badgeId],
  queryFn: async () => {
    const response = await getBadgeDetail(Number(badgeId)).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to fetch badge details.',
      });
      return { data: undefined };
    });

    const content = response?.data as IBadgeDetail;
    if (content) {
      detailBadge.value = {
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        url: content.url,
      };

      const formValues = {
        title: content.title || '',
        description: content.description || '',
        image: content.url || null,
      };
      store.setFormValues(formValues, true);
    }
    return content;
  },
  refetchOnMount: 'always',
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

<style lang="postcss">
.base-layout:has(.layout-detail-badge) {
  @apply !h-screen overflow-hidden;
}

.base-layout:has(.layout-detail-badge) .base-layout__body {
  @apply overflow-hidden;
}

.base-layout:has(.layout-detail-badge) .base-layout__body-main {
  @apply h-full overflow-hidden;
}

.base-layout:has(.layout-detail-badge) .template-manage {
  @apply h-full flex flex-col;
}

.base-layout:has(.layout-detail-badge) .template-manage__content {
  @apply flex-grow min-h-0 overflow-hidden;
}
</style>
