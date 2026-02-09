<template>
  <div class="flex flex-col flex-grow min-h-0 px-5 mb-12">
    <div
      class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-4 mb-4 cursor-pointer flex-shrink-0"
      @click="emit('toggle')"
    >
      <h2 class="text-base font-semibold">
        Contents
      </h2>
      <Icon
        name="mdi:chevron-down"
        class="transition-transform duration-300"
        :class="{ 'rotate-180': isCollapsed }"
      />
    </div>

    <WebUiEmptyState
      v-if="contents.length === 0"
      title="No contents added yet."
      description=" Click ''Add Content'' to get started."
      class="overflow-hidden transition-all duration-300 ease-in-out flex-grow min-h-0 overflow-y-auto"
      :class="isCollapsed ? 'max-h-0' : ''"
    >
      <template #empty-image>
        <div />
      </template>
    </WebUiEmptyState>

    <div
      v-else
      class="overflow-hidden transition-all duration-300 ease-in-out flex-grow min-h-0 overflow-y-auto"
      :class="isCollapsed ? 'max-h-0' : ''"
    >
      <div class="flex flex-col gap-4 w-full">
        <template
          v-for="(content, idx) in contents"
          :key="content.element_id"
        >
          <component
            :is="getContentComponent(content.type)"
            :content-item="content"
            :index="idx"
            :is-expanded="isContentExpanded(content.element_id)"
            :safe-zone-width="safeZoneWidth"
            :safe-zone-height="safeZoneHeight"
            @delete="emit('deleteContent', idx)"
            @update:content-item="(updated: CertificateContentForm) => emit('updateContent', idx, updated)"
            @header-click="emit('contentClick', content.element_id)"
          />
        </template>
      </div>
    </div>
  </div>

  <div
    v-if="!isCollapsed"
    class="absolute bottom-0 left-0 w-full bg-white z-50"
  >
    <div class="w-full flex flex-col items-center justify-center border-t border-solid border-gray-50">
      <div
        v-if="isContentListOpen"
        class="w-full flex flex-col gap-1 mb-4 p-2 bg-white rounded-lg shadow-lg"
      >
        <UiButton
          v-for="contentType in AVAILABLE_CONTENT_TYPES"
          :key="contentType.type"
          color="ghost"
          :icon="contentType.icon"
          variant="transparent"
          class="text-start"
          @click="emit('addContent', contentType.type)"
        >
          {{ contentType.label }}
        </UiButton>
      </div>
      <UiButton
        class="w-full py-4 !rounded-t-none"
        icon="mdi:plus"
        @click="isContentListOpen = !isContentListOpen"
      >
        Add Content
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CertificateContentForm } from '#achievement/config/types.ts';
import ContentCertificateNumber from '#achievement/components/form/certificate/contents/ContentCertificateNumber.vue';
import ContentImage from '#achievement/components/form/certificate/contents/ContentImage.vue';
import ContentQRCode from '#achievement/components/form/certificate/contents/ContentQRCode.vue';
import ContentTextBase from '#achievement/components/form/certificate/contents/ContentTextBase.vue';
import { AVAILABLE_CONTENT_TYPES } from '#achievement/config/constants.ts';
import { UiButton } from '@mydigilearn-saas/web-ui';

interface Props {
  contents: CertificateContentForm[];
  selectedContentKey: string | null;
  safeZoneWidth: number;
  safeZoneHeight: number;
  isCollapsed: boolean;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  addContent: [type: string];
  deleteContent: [index: number];
  updateContent: [index: number, updated: CertificateContentForm];
  contentClick: [key: string];
  toggle: [];
}>();

const isContentListOpen = defineModel<boolean>('isContentListOpen', { default: false });

const COMPONENT_MAP: Record<string, any> = {
  image: ContentImage,
  sertificate_signee: ContentImage,
  qr_code: ContentQRCode,
  certificate_number: ContentCertificateNumber,
  text: ContentTextBase,
  module_type: ContentTextBase,
  participant_name: ContentTextBase,
  nik: ContentTextBase,
  title: ContentTextBase,
  city: ContentTextBase,
  date: ContentTextBase,
  valid_thru: ContentTextBase,
};

const getContentComponent = (type: string) => {
  return COMPONENT_MAP[type] || ContentTextBase;
};

const isContentExpanded = (contentKey: string) => {
  return props.selectedContentKey === contentKey;
};
</script>
