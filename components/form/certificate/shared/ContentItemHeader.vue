<template>
  <div
    class="flex justify-between items-center w-full"
    :class="{ 'border-b-2 border-gray-50 pb-4': !isCollapsed }"
  >
    <div class="flex items-center gap-2">
      <Icon
        :name="icon"
        class="text-gray-500 w-5 h-5"
      />
      <p class="text-sm font-medium">
        {{ title }}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Dropdown
        placement="bottom-end"
        popper-class="experience-more-actions"
      >
        <UiButton
          size="md"
          variant="transparent"
          color="ghost"
          icon="mdi:dots-horizontal"
          square
          @click.stop
        />
        <template #popper>
          <div class="flex flex-col gap-2.5 w-64 items-start shadow-md p-1.5 btn-experiences-user">
            <UiButton
              size="md"
              class="w-full text-left"
              variant="transparent"
              color="ghost"
              icon="mdi-delete"
              @click="emit('delete')"
            >
              Delete
            </UiButton>
          </div>
        </template>
      </Dropdown>
      <Icon
        name="mdi:chevron-down"
        class="transition-transform duration-300 cursor-pointer"
        :class="{ 'rotate-180': isCollapsed }"
        @click="emit('toggleCollapse')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiButton } from '@mydigilearn-saas/web-ui';
import { Dropdown } from 'floating-vue';

interface Props {
  icon: string;
  title: string;
  isCollapsed: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  delete: [];
  toggleCollapse: [];
}>();
</script>
