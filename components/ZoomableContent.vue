<script setup lang="ts">
import UiButton from '#ui/components/atoms/button/index.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  controlsDisabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:zoom']);

const zoomContainer = ref<HTMLDivElement | null>(null);
const zoomContent = ref<HTMLDivElement | null>(null);
const zoomWrapper = ref<HTMLDivElement | null>(null);
const zoomLevelText = ref<HTMLSpanElement | null>(null);

const currentZoom = ref(1);
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;
const PADDING = 100;

const canZoomIn = computed(() => !props.controlsDisabled && currentZoom.value < MAX_ZOOM);
const canZoomOut = computed(() => !props.controlsDisabled && currentZoom.value > MIN_ZOOM);

const canDrag = computed(() => {
  if (!zoomContainer.value || !zoomWrapper.value) {
    return false;
  }
  const container = zoomContainer.value;
  const wrapper = zoomWrapper.value;
  return (
    wrapper.scrollWidth > container.clientWidth
    || wrapper.scrollHeight > container.clientHeight
  );
});

let isDragging = false;
let startX = 0;
let startY = 0;
let scrollLeft = 0;
let scrollTop = 0;

watch(currentZoom, (val) => {
  emit('update:zoom', val);
});

const updateZoomDisplay = () => {
  if (zoomLevelText.value) {
    zoomLevelText.value.textContent = `${Math.round(currentZoom.value * 100)}%`;
  }
};

const getContentDimensions = () => {
  if (!zoomContent.value) {
    return { width: 0, height: 0 };
  }

  const firstChild = zoomContent.value.children[0] as HTMLElement | undefined;
  if (firstChild) {
    return {
      width: firstChild.offsetWidth,
      height: firstChild.offsetHeight,
    };
  }

  return {
    width: zoomContent.value.offsetWidth,
    height: zoomContent.value.offsetHeight,
  };
};

const applyZoom = (mouseX: number | null = null, mouseY: number | null = null) => {
  if (!zoomContainer.value || !zoomContent.value || !zoomWrapper.value) {
    return;
  }

  const container = zoomContainer.value;
  const content = zoomContent.value;
  const wrapper = zoomWrapper.value;

  let scrollXRatio = 0.5;
  let scrollYRatio = 0.5;

  if (mouseX !== null && mouseY !== null) {
    const rect = container.getBoundingClientRect();
    const offsetX = mouseX - rect.left;
    const offsetY = mouseY - rect.top;

    const contentX = (container.scrollLeft + offsetX) / (wrapper.scrollWidth || 1);
    const contentY = (container.scrollTop + offsetY) / (wrapper.scrollHeight || 1);

    scrollXRatio = contentX;
    scrollYRatio = contentY;
  }
  else {
    if (wrapper.scrollWidth > container.clientWidth) {
      scrollXRatio = (container.scrollLeft + container.clientWidth / 2) / wrapper.scrollWidth;
    }
    if (wrapper.scrollHeight > container.clientHeight) {
      scrollYRatio = (container.scrollTop + container.clientHeight / 2) / wrapper.scrollHeight;
    }
  }

  content.style.transform = `scale(${currentZoom.value})`;

  const contentDimensions = getContentDimensions();
  const scaledWidth = contentDimensions.width * currentZoom.value;
  const scaledHeight = contentDimensions.height * currentZoom.value;

  wrapper.style.width = `${scaledWidth + PADDING * 2}px`;
  wrapper.style.height = `${scaledHeight + PADDING * 2}px`;

  updateZoomDisplay();

  nextTick(() => {
    if (mouseX !== null && mouseY !== null) {
      const rect = container.getBoundingClientRect();
      const offsetX = mouseX - rect.left;
      const offsetY = mouseY - rect.top;
      container.scrollLeft = scrollXRatio * wrapper.scrollWidth - offsetX;
      container.scrollTop = scrollYRatio * wrapper.scrollHeight - offsetY;
    }
    else {
      container.scrollLeft = scrollXRatio * wrapper.scrollWidth - container.clientWidth / 2;
      container.scrollTop = scrollYRatio * wrapper.scrollHeight - container.clientHeight / 2;
    }
  });
};

const centerContent = () => {
  if (!zoomContainer.value || !zoomWrapper.value) {
    return;
  }
  const container = zoomContainer.value;
  const wrapper = zoomWrapper.value;
  container.scrollLeft = (wrapper.scrollWidth - container.clientWidth) / 2;
  container.scrollTop = (wrapper.scrollHeight - container.clientHeight) / 2;
};

const calculateZoomToFit = () => {
  if (!zoomContainer.value || !zoomContent.value) {
    return 1;
  }

  const container = zoomContainer.value;
  const contentDimensions = getContentDimensions();

  const availableWidth = container.clientWidth - PADDING * 2;
  const availableHeight = container.clientHeight - PADDING * 2;

  const zoomX = availableWidth / contentDimensions.width;
  const zoomY = availableHeight / contentDimensions.height;
  const fitZoom = Math.min(zoomX, zoomY, 1);
  return Math.max(fitZoom, MIN_ZOOM);
};

const zoomIn = () => {
  if (props.controlsDisabled || currentZoom.value >= MAX_ZOOM) {
    return;
  }
  currentZoom.value = Number.parseFloat(Math.min(currentZoom.value + ZOOM_STEP, MAX_ZOOM).toFixed(2));
  applyZoom();
};

const zoomOut = () => {
  if (props.controlsDisabled || currentZoom.value <= MIN_ZOOM) {
    return;
  }
  currentZoom.value = Number.parseFloat(Math.max(currentZoom.value - ZOOM_STEP, MIN_ZOOM).toFixed(2));
  applyZoom();
};

const resetZoom = () => {
  if (props.controlsDisabled) {
    return;
  }
  const fitZoom = calculateZoomToFit();
  currentZoom.value = Number.parseFloat(fitZoom.toFixed(2));
  applyZoom();
  nextTick(centerContent);
};

const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0 || !canDrag.value || !zoomContainer.value) {
    return;
  }

  isDragging = true;
  zoomContainer.value.classList.add('dragging');
  startX = e.clientX;
  startY = e.clientY;
  scrollLeft = zoomContainer.value.scrollLeft;
  scrollTop = zoomContainer.value.scrollTop;
  e.preventDefault();
};

const handleMouseUp = () => {
  if (!isDragging || !zoomContainer.value) {
    return;
  }
  isDragging = false;
  zoomContainer.value.classList.remove('dragging');
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging || !zoomContainer.value) {
    return;
  }
  e.preventDefault();
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  zoomContainer.value.scrollLeft = scrollLeft - dx;
  zoomContainer.value.scrollTop = scrollTop - dy;
};

const handleWheel = (e: WheelEvent) => {
  if (props.controlsDisabled) {
    return;
  }
  e.preventDefault();
  const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
  const newZoom = currentZoom.value + delta;
  if (newZoom < MIN_ZOOM || newZoom > MAX_ZOOM) {
    return;
  }
  currentZoom.value = Number.parseFloat(newZoom.toFixed(2));
  applyZoom(e.clientX, e.clientY);
};

const handleResize = () => {
  const fitZoom = calculateZoomToFit();
  if (currentZoom.value === 1 || Math.abs(currentZoom.value - fitZoom) < 0.01) {
    currentZoom.value = Number.parseFloat(fitZoom.toFixed(2));
    applyZoom();
    nextTick(centerContent);
  }
  else {
    applyZoom();
  }
};

onMounted(() => {
  const container = zoomContainer.value;
  if (!container) {
    return;
  }

  container.addEventListener('mousedown', handleMouseDown);
  container.addEventListener('mouseup', handleMouseUp);
  container.addEventListener('mouseleave', handleMouseUp);
  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('wheel', handleWheel, { passive: false });

  window.addEventListener('resize', handleResize);

  nextTick(() => {
    const fitZoom = calculateZoomToFit();
    currentZoom.value = Number.parseFloat(fitZoom.toFixed(2));
    applyZoom();
    nextTick(centerContent);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="w-full h-full relative">
    <div
      ref="zoomContainer"
      class="w-full h-full rounded-lg overflow-auto"
      :class="{ 'cursor-grab': canDrag, 'cursor-default': !canDrag }"
    >
      <div
        ref="zoomWrapper"
        class="relative"
        style="min-width: 100%; min-height: 100%;"
      >
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            ref="zoomContent"
            class="transform origin-center"
            style="will-change: transform;"
          >
            <slot />
          </div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-4 right-4">
      <div class="flex flex-col gap-2.5">
        <UiButton
          color="ghost"
          variant="outline"
          class="zoom-to-fit"
          :disabled="props.controlsDisabled"
          @click="resetZoom"
        >
          Zoom to fit
        </UiButton>
        <div class="bg-white px-4 py-2 flex gap-2 items-center text-sm rounded-[0.375rem] border border-solid border-gray-50 text-gray-700">
          <UiButton
            square
            size="sm"
            class="!rounded-full"
            icon="mdi-minus"
            :disabled="!canZoomOut"
            @click="zoomOut"
          />
          <span
            ref="zoomLevelText"
            class="text-sm font-medium text-gray-900 w-12 text-center"
            :class="{ 'text-gray-200': props.controlsDisabled }"
          >
            100%
          </span>
          <UiButton
            square
            size="sm"
            class="!rounded-full"
            icon="mdi-plus"
            :disabled="!canZoomIn"
            @click="zoomIn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dragging {
  cursor: grabbing !important;
  user-select: none;
}

.dragging * {
  cursor: grabbing !important;
}

.zoom-to-fit {
  @apply bg-white px-6 py-4 w-full;
}
</style>
