<template>
  <WebUiEmptyState
    v-if="!isLoading && sectionList.length === 0"
    title="No sections configured"
  >
    <template
      #empty-image
    >
      <div class="text-gray-300 border border-gray-50 p-4 rounded-[0.625rem]">
        <img
          alt="Brand"
          src="/brand/logo-mini.svg"
          class="max-h-[32px] max-w-[26px]"
        >
      </div>
    </template>
    <template #empty-description>
      <div class="flex flex-col gap-5 justify-center">
        <div class="text-sm text-gray-400">
          If you don’t add any sections, your landing page will automatically display the latest audios.
        </div>
        <WebUiButton
          size="lg"
          icon="mdi-plus"
          class="max-w-[154px] mx-auto"
          @click="handleAddSection"
        >
          Create Section
        </WebUiButton>
      </div>
    </template>
  </WebUiEmptyState>

  <TransitionGroup
    v-else
    name="drag"
    tag="div"
    class="landing-list__draggable"
  >
    <div
      v-for="(item, index) in sectionList"
      :key="item.id"
      class="draggable-item-wrapper"
    >
      <div
        class="landing-list__item"
        draggable="true"
        :class="{
          'is-dragging': dragIndex === index,
          'is-hovered': hoverIndex === index && dragIndex !== index,
        }"
        @dragstart="handleDragStart(index, $event)"
        @dragover.prevent="handleDragOver(index, $event)"
        @dragleave="handleDragLeave"
        @drop="handleDrop(index as number, $event)"
        @dragend="handleDragEnd"
      >
        <div class="landing-list__item-left">
          <Icon
            name="ic:round-drag-indicator"
            size="24"
            class="shrink-0"
          />

          <div class="landing-list__item-text">
            <div class="landing-list__item-title">
              {{ item?.title }}
            </div>

            <div
              v-if="item?.description"
              class="landing-list__item-description"
            >
              {{ item?.description }}
            </div>
          </div>
        </div>

        <div class="landing-list__item-actions">
          <WebUiButton
            icon="mdi-pencil"
            color="ghost"
            variant="transparent"
            size="md"
            square
            class="landing-list__action-button"
            @click.stop="handleEdit(item)"
          />
          <WebUiButton
            icon="mdi-delete"
            color="ghost"
            variant="transparent"
            size="md"
            square
            class="landing-list__action-button"
            @click.stop="handleDelete(item)"
          />
        </div>
      </div>

      <!-- Drop indicator -->
      <div
        v-if="hoverIndex === index && dragIndex !== null && dragIndex !== index"
        class="drop-indicator active"
      />
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { deleteSectionLandingList, getSectionLandingList, postReorderSection } from '#audio/api/api.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

// Utilities
const router = useRouter();
const { $toast, $popup } = useNuxtApp();
const queryClient = useQueryClient();

// Drag state
const dragIndex = ref<number | null>(null);
const hoverIndex = ref<number | null>(null);

function handleAddSection() {
  return router.push({ name: 'audio-add-landing' });
}

function handleEdit(item: any) {
  router.push({ name: 'audio-edit-landing-id', params: { id: item.id } });
}

// Fetch section list
const { data: sectionList, isLoading, refetch } = useQuery({
  queryKey: ['get-section-list'],
  queryFn: async () => {
    const params = {
      paginate: false,
    };

    try {
      const response = await getSectionLandingList(params);

      if (response) {
        const contents = response?.data?.contents || [];
        return contents.sort((a: any, b: any) => a.position - b.position);
      }

      return [];
    }
    catch {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to fetch section list.',
      });
      return [];
    }
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  placeholderData: prev => prev ?? [],
});

const refetchSectionList = () => {
  refetch();
};

// Delete section mutation
const deleteSectionMutation = useMutation({
  mutationFn: async (sectionId: number | string) => {
    const response = await deleteSectionLandingList(sectionId as number);
    return response;
  },
  onSuccess: () => {
    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Section successfully deleted.',
    });
    refetchSectionList();
  },
  onError: () => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: 'Failed to delete section.',
    });
  },
});

async function handleDelete(item: any) {
  $popup({
    title: 'Delete Section',
    html: `Do you want to delete this section ? <br /> <b><i>${item?.title}</i></b>`,
    showCancelButton: true,
    confirmButtonText: 'Delete',
    icon: 'error',
  }).then((result) => {
    if (result.isConfirmed) {
      deleteSectionMutation.mutate(item.id as number);
    }
  });
}

// Update section order mutation (optimistic)
const updateOrderMutation = useMutation({
  mutationFn: async (payload: any) => {
    const response = await postReorderSection(payload);
    return response;
  },
  onMutate: async (payload: any) => {
    await queryClient.cancelQueries({ queryKey: ['get-section-list'] });
    const previousItems = queryClient.getQueryData(['get-section-list']);

    queryClient.setQueryData(['get-section-list'], (old: any) => {
      if (!old || payload.position === undefined) {
        return old;
      };

      const movedIndex = (old as any[]).findIndex((item: any) => item.id === payload.id);
      if (movedIndex === -1) {
        return old;
      };

      const newItems = [...(old as any[])];
      const [moved] = newItems.splice(movedIndex, 1);
      newItems.splice(payload.position - 1, 0, moved);
      return newItems;
    });

    return { previousItems };
  },
  onSuccess: () => {
    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Section order updated successfully.',
    });
    refetchSectionList();
  },
  onError: (_err, _payload, context: any) => {
    if (context?.previousItems) {
      queryClient.setQueryData(['get-section-list'], context.previousItems);
    }
    $toast({
      variant: 'error',
      title: 'Error',
      text: 'Failed to update section order.',
    });
  },
});

function handleDragStart(index: any, event: DragEvent) {
  dragIndex.value = index;

  // Create ghost preview
  const target = event.target as HTMLElement;
  const ghost = target.cloneNode(true) as HTMLElement;
  ghost.style.opacity = '0.5';
  ghost.style.position = 'absolute';
  ghost.style.top = '-9999px';
  ghost.style.transform = 'rotate(3deg)';
  document.body.appendChild(ghost);
  event.dataTransfer?.setDragImage(ghost, 0, 0);

  setTimeout(() => document.body.removeChild(ghost), 0);

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
}

// Handle drag over event
function handleDragOver(index: any, event: DragEvent) {
  if (dragIndex.value === null || dragIndex.value === index) {
    hoverIndex.value = index;
    return;
  }

  // Get precise drop position based on cursor
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const mouseY = event.clientY;
  const itemMiddle = rect.top + rect.height / 2;

  if (mouseY < itemMiddle) {
    hoverIndex.value = index;
  }
  else {
    hoverIndex.value = index;
  }

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

// Handle drag leave event
function handleDragLeave() {
  hoverIndex.value = null;
}

// Handle drop event
function handleDrop(dropIndex: number, event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();

  if (dragIndex.value === null) {
    return;
  }

  const draggedItem = sectionList.value[dragIndex.value];
  const targetPosition = dropIndex + 1;

  dragIndex.value = null;
  hoverIndex.value = null;

  updateOrderMutation.mutate({ id: draggedItem.id, position: targetPosition });
}

// Handle drag end event
function handleDragEnd() {
  dragIndex.value = null;
  hoverIndex.value = null;
}
</script>

<style lang="postcss" scoped>
.landing-list__draggable {
  @apply w-full flex flex-col gap-4;
}

.draggable-item-wrapper {
  position: relative;
}

.landing-list__item {
  @apply cursor-move flex gap-[10px] p-5 items-center rounded-xl border border-gray-50 justify-between transition-all duration-200 ease-in-out;
}

.landing-list__item:hover {
  @apply border-primary-500;
}

/* Ghost preview styling */
.landing-list__item.is-dragging {
  opacity: 1;
  transform: scale(0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #00A3B5;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.1);
}

/* Drop-hover highlight */
.landing-list__item.is-hovered {
  background: rgba(0, 163, 181, 0.05);
  border-radius: 12px;
  transition: background 0.15s ease-out;
}

.landing-list__item-left {
  @apply flex items-center gap-[10px] min-w-0 flex-1;
}

.landing-list__item-text {
  @apply flex flex-col gap-1 overflow-hidden;
}

.landing-list__item-title {
  @apply text-gray-900 font-medium truncate;
}

.landing-list__item-description {
  @apply text-sm text-gray-400 truncate;
}

.landing-list__item-actions {
  @apply flex gap-1 shrink-0 text-gray-300;
}

.landing-list__action-button {
  color: var(--color-gray-300);
}

/* Drop indicator styling */
.drop-indicator {
  height: 3px;
  margin: -1.5px 0;
  border-radius: 2px;
  background: transparent;
  transition: all 0.15s ease-out;
  position: relative;
  pointer-events: none;
}

.drop-indicator.active {
  background: linear-gradient(90deg, #00A3B5 0%, #00BCD4 100%);
  box-shadow: 0 0 8px rgba(0, 163, 181, 0.4);
  animation: pulse 1.5s ease-in-out infinite;
}

.drop-indicator.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #00A3B5;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(0, 163, 181, 0.6);
}

.drop-indicator.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #00A3B5;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(0, 163, 181, 0.6);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

/* Smooth springy movement */
.drag-move {
  transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Fade and slide when entering/leaving */
.drag-enter-active,
.drag-leave-active {
  transition: all 0.25s ease;
}

.drag-enter-from,
.drag-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.drag-leave-active {
  position: absolute;
  width: 100%;
}
</style>
