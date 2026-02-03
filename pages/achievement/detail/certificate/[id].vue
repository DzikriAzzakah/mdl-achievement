<template>
  <TemplateManageLayout
    title="Details"
    class="layout-detail-certificate"
    :breadcrumbs="breadcrumbs"
    :active-stepper="activeTab"
    :stepper="CERTIFICATE_TABS"
    is-tabs
    disable-footer
    @on-change="handleTabsChange"
  >
    <template #content>
      <CertificateConfiguration
        v-if="activeTab === 'certificate-configuration'"
        :loading="isLoadingDetail"
      />
      <CertificatePreview v-if="activeTab === 'certificate-preview'" />
      <AccessibilityInformation v-if="activeTab === 'accessibility'" />
    </template>
  </TemplateManageLayout>
</template>

<script lang="ts" setup>
import type { CertificateDetailResponseData } from '#achievement/config/types.ts';
import { getCertificateDetail } from '#achievement/api/api.ts';
import AccessibilityInformation from '#achievement/components/detail/certificate/AccessibilityInformation.vue';
import CertificateConfiguration from '#achievement/components/detail/certificate/CertificateConfiguration.vue';
import CertificatePreview from '#achievement/components/detail/certificate/CertificatePreview.vue';
import { CERTIFICATE_TABS, TYPE_OPTIONS } from '#achievement/config/constants.ts';
import { PERMISSION_DETAIL, PERMISSION_LIST } from '#achievement/config/featureFlag.ts';
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
const store = useCertificateStore();
const { detailCertificate } = storeToRefs(store);
const certificateId = route.params.id;

const { $toast } = useNuxtApp();
const activeTab = ref('certificate-configuration');
const breadcrumbs = computed(() => [
  { text: 'Master Data', href: '', active: false },
  { text: 'Achievement', href: '/achievement', active: false },
  { text: 'Details', href: `/achievement/detail/certificate/${certificateId}`, active: true },
]);

const { isLoading: isLoadingDetail, refetch } = useQuery({
  queryKey: ['get-detail-certificate', certificateId],
  queryFn: async () => {
    const response = await getCertificateDetail(Number(certificateId)).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to fetch certificate details.',
      });
      return { data: undefined };
    });

    const content = response?.data as CertificateDetailResponseData;
    if (content) {
      const typeOption = TYPE_OPTIONS.find(opt => opt.value === content.type);
      const certificateType = typeOption
        ? { label: typeOption.label, value: typeOption.value }
        : { label: content.type, value: content.type };

      detailCertificate.value = {
        id: content.id,
        title: content.title,
        certificate_type: certificateType,
        image_url: content.preview_url || content.background?.full_path,
      };
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
.base-layout:has(.layout-detail-certificate) {
  @apply !h-screen overflow-hidden;
}

.base-layout:has(.layout-detail-certificate) .base-layout__body {
  @apply overflow-hidden;
}

.base-layout:has(.layout-detail-certificate) .base-layout__body-main {
  @apply h-full overflow-hidden;
}

.base-layout:has(.layout-detail-certificate) .template-manage {
  @apply h-full flex flex-col;
}

.base-layout:has(.layout-detail-certificate) .template-manage__content {
  @apply flex-grow min-h-0 overflow-hidden;
}
</style>
