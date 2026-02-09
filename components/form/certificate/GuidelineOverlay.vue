<template>
  <div
    v-if="guideline.enabled"
    class="absolute inset-0 pointer-events-none"
    data-guideline-overlay="true"
  >
    <template v-if="guideline.type === 'grid'">
      <svg
        class="absolute inset-0 w-full h-full"
        :style="{ top: `${safeZone.top}px`, left: `${safeZone.left}px` }"
      >
        <line
          v-for="i in guideline.count"
          :key="`v-${i}`"
          :x1="getGridPosition(i, safeZoneWidth, guideline.count, guideline.gutter)"
          y1="0"
          :x2="getGridPosition(i, safeZoneWidth, guideline.count, guideline.gutter)"
          :y2="safeZoneHeight"
          :stroke="guideline.color"
          stroke-width="1"
          stroke-dasharray="4,4"
        />
        <line
          v-for="i in guideline.count"
          :key="`h-${i}`"
          x1="0"
          :y1="getGridPosition(i, safeZoneHeight, guideline.count, guideline.gutter)"
          :x2="safeZoneWidth"
          :y2="getGridPosition(i, safeZoneHeight, guideline.count, guideline.gutter)"
          :stroke="guideline.color"
          stroke-width="1"
          stroke-dasharray="4,4"
        />
      </svg>
    </template>

    <template v-if="guideline.type === 'column'">
      <svg
        class="absolute inset-0 w-full h-full"
        :style="{ top: `${safeZone.top}px`, left: `${safeZone.left}px` }"
      >
        <line
          v-for="i in guideline.count + 1"
          :key="`col-${i}`"
          :x1="getColumnPosition(i - 1, safeZoneWidth, guideline.count, guideline.gutter)"
          y1="0"
          :x2="getColumnPosition(i - 1, safeZoneWidth, guideline.count, guideline.gutter)"
          :y2="safeZoneHeight"
          :stroke="guideline.color"
          stroke-width="1"
          :stroke-dasharray="i === 1 || i === guideline.count + 1 ? '0' : '4,4'"
          :opacity="i === 1 || i === guideline.count + 1 ? '0.3' : '1'"
        />
      </svg>
    </template>

    <template v-if="guideline.type === 'row'">
      <svg
        class="absolute inset-0 w-full h-full"
        :style="{ top: `${safeZone.top}px`, left: `${safeZone.left}px` }"
      >
        <line
          v-for="i in guideline.count + 1"
          :key="`row-${i}`"
          x1="0"
          :y1="getRowPosition(i - 1, safeZoneHeight, guideline.count, guideline.gutter)"
          :x2="safeZoneWidth"
          :y2="getRowPosition(i - 1, safeZoneHeight, guideline.count, guideline.gutter)"
          :stroke="guideline.color"
          stroke-width="1"
          :stroke-dasharray="i === 1 || i === guideline.count + 1 ? '0' : '4,4'"
          :opacity="i === 1 || i === guideline.count + 1 ? '0.3' : '1'"
        />
      </svg>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { LayoutGuideline, SafeZone } from '#achievement/config/types.ts';

interface Props {
  guideline: LayoutGuideline;
  safeZone: SafeZone;
  canvasWidth: number;
  canvasHeight: number;
}

const props = defineProps<Props>();

const safeZoneWidth = computed(() => {
  return props.canvasWidth - props.safeZone.left - props.safeZone.right;
});

const safeZoneHeight = computed(() => {
  return props.canvasHeight - props.safeZone.top - props.safeZone.bottom;
});

function getGridPosition(index: number, totalSize: number, count: number, _gutter: number): number {
  const spacing = totalSize / count;
  return spacing * index;
}

function getColumnPosition(index: number, totalWidth: number, count: number, gutter: number): number {
  if (index === 0) {
    return 0;
  }
  if (index === count) {
    return totalWidth;
  }

  const totalGutterSpace = gutter * (count - 1);
  const availableSpace = totalWidth - totalGutterSpace;
  const columnWidth = availableSpace / count;

  return (columnWidth + gutter) * index;
}

function getRowPosition(index: number, totalHeight: number, count: number, gutter: number): number {
  if (index === 0) {
    return 0;
  }
  if (index === count) {
    return totalHeight;
  }

  const totalGutterSpace = gutter * (count - 1);
  const availableSpace = totalHeight - totalGutterSpace;
  const rowHeight = availableSpace / count;

  return (rowHeight + gutter) * index;
}
</script>
