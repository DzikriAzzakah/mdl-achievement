<template>
  <div
    class="tag-wrapper"
  >
    <div
      class="tag-content"
    >
      <div class="tag-content__title">
        {{ title }}
      </div>
      <Icon
        name="mdi:chevron-right"
        width="20"
        height="20"
        mode="svg"
        class="tag-content__icon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  title: string;
}

const props = withDefaults(defineProps<IProps>(), {
  title: '',
});

const { title } = toRefs(props);
</script>

<style lang="postcss" scoped>
  .tag-wrapper{
    @apply bg-gray-25 relative rounded-lg p-4;
  }

  .tag-content {
    @apply flex gap-1 w-full items-center;
  }

  .tag-content__title {
    @apply grow text-gray-800 font-medium truncate;
  }

  .tag-content__icon {
    @apply text-gray-300;
  }
</style>
