<template>
  <div class="flex flex-col gap-5 pb-8 h-full">
    <h3 class="text-base font-semibold text-gray-900 flex-shrink-0">
      Badge Image
    </h3>
    <div class="w-full bg-gray-25 rounded-xl border border-solid border-gray-50 p-5 flex-shrink-0 overflow-y-auto h-full">
      <ZoomableContent :controls-disabled="!badgeImageUrl">
        <div>
          <div
            v-if="badgeImageUrl"
            class="w-[500px] h-[500px]"
          >
            <img
              :src="badgeImageUrl"
              class="w-full h-full object-contain object-center"
              alt="Badge preview"
            >
          </div>
          <div v-else>
            <div class="bg-white px-8 aspect-square flex items-center justify-center">
              <p class="text-sm text-gray-400">
                No badge image available
              </p>
            </div>
          </div>
        </div>
      </ZoomableContent>
    </div>
  </div>
</template>

<script setup lang="ts">
import ZoomableContent from '#achievement/components/ZoomableContent.vue';
import { useBadgeStore } from '#achievement/stores/badge.ts';

const store = useBadgeStore();
const { detailBadge } = storeToRefs(store);

const badgeImageUrl = computed(() => {
  return detailBadge.value?.url || detailBadge.value?.image_url || null;
});
</script>
