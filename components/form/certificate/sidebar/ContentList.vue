<template>
  <div class="flex flex-col flex-grow min-h-0 px-5 mb-12">
    <div
      class="flex justify-between items-center w-full border-b-2 border-gray-50 pb-4 mb-4 cursor-pointer flex-shrink-0"
      @click="isCollapsed = !isCollapsed"
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
          :key="content.key"
        >
          <ContentImage
            v-if="content.type === 'image' || content.type === 'sertificate_signee'"
            :content-item="content"
            :index="idx"
            :is-expanded="isContentExpanded(content.key)"
            :safe-zone-width="safeZoneWidth"
            :safe-zone-height="safeZoneHeight"
            @delete="$emit('deleteContent', idx)"
            @update:content-item="(updated) => $emit('updateContent', idx, updated)"
            @header-click="$emit('contentClick', content.key)"
          />
          <ContentQRCode
            v-else-if="isQRCodeContent(content)"
            :content-item="content"
            :index="idx"
            :is-expanded="isContentExpanded(content.key)"
            :safe-zone-width="safeZoneWidth"
            :safe-zone-height="safeZoneHeight"
            @delete="$emit('deleteContent', idx)"
            @update:content-item="(updated) => $emit('updateContent', idx, updated)"
            @header-click="$emit('contentClick', content.key)"
          />
          <ContentCertificateNumber
            v-else-if="isCertificateNumberContent(content)"
            :content-item="content"
            :index="idx"
            :is-expanded="isContentExpanded(content.key)"
            :safe-zone-width="safeZoneWidth"
            :safe-zone-height="safeZoneHeight"
            @delete="$emit('deleteContent', idx)"
            @update:content-item="(updated) => $emit('updateContent', idx, updated)"
            @header-click="$emit('contentClick', content.key)"
          />
          <ContentTextBase
            v-else-if="isTextBasedContent(content) && !isCertificateNumberContent(content)"
            :content-item="content"
            :index="idx"
            :is-expanded="isContentExpanded(content.key)"
            :safe-zone-width="safeZoneWidth"
            :safe-zone-height="safeZoneHeight"
            @delete="$emit('deleteContent', idx)"
            @update:content-item="(updated) => $emit('updateContent', idx, updated)"
            @header-click="$emit('contentClick', content.key)"
          />
        </template>
      </div>
    </div>
  </div>

  <div class="absolute bottom-0 left-0 w-full bg-white z-50">
    <div class="w-full flex flex-col items-center justify-center border-t border-solid border-gray-50">
      <div
        v-if="isContentListOpen"
        class="w-full flex flex-col gap-1 mb-4 p-2 bg-white rounded-lg shadow-lg"
      >
        <UiButton
          v-for="contentType in availableContentTypes"
          :key="contentType.type"
          color="ghost"
          :icon="contentType.icon"
          variant="transparent"
          class="text-start"
          @click="$emit('addContent', contentType.type)"
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
import type { ICertificateContentForm } from '#achievement/config/types.ts';
import ContentCertificateNumber from '#achievement/components/form/certificate/contents/ContentCertificateNumber.vue';
import ContentImage from '#achievement/components/form/certificate/contents/ContentImage.vue';
import ContentQRCode from '#achievement/components/form/certificate/contents/ContentQRCode.vue';
import ContentTextBase from '#achievement/components/form/certificate/contents/ContentTextBase.vue';
import { isCertificateNumberContent, isQRCodeContent, isTextBasedContent } from '#achievement/config/types.ts';
import UiButton from '#ui/components/atoms/button/index.vue';

interface Props {
  contents: ICertificateContentForm[];
  selectedContentKey: string | null;
  safeZoneWidth: number;
  safeZoneHeight: number;
}

const props = defineProps<Props>();

defineEmits<{
  addContent: [type: string];
  deleteContent: [index: number];
  updateContent: [index: number, updated: ICertificateContentForm];
  contentClick: [key: string];
}>();

const isContentListOpen = defineModel<boolean>('isContentListOpen', { default: false });

const isCollapsed = ref<boolean>(false);

const availableContentTypes = [
  { type: 'image', label: 'Image', icon: 'mdi:image' },
  { type: 'sertificate_signee', label: 'Certificate Signee', icon: 'mdi:image' },
  { type: 'text', label: 'Text Area', icon: 'ic:round-text-fields' },
  { type: 'certificate_number', label: 'Certificate Number', icon: 'mdi:code-tags' },
  { type: 'fullname', label: 'Fullname', icon: 'mdi:code-tags' },
  { type: 'employee_id', label: 'Employee ID (NIK)', icon: 'mdi:code-tags' },
  { type: 'event_title', label: 'Event Title', icon: 'mdi:code-tags' },
  { type: 'location', label: 'Location', icon: 'mdi:code-tags' },
  { type: 'qr_code', label: 'QR Code', icon: 'mdi:qrcode' },
  { type: 'valid_thru', label: 'Certificate Valid Thru', icon: 'mdi:code-tags' },
];

const isContentExpanded = (contentKey: string) => {
  return props.selectedContentKey === contentKey;
};
</script>
