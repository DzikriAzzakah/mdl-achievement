<template>
  <div class="achievement-form-layout">
    <div class="achievement-form-layout__sidebar">
      <slot name="sidebar-content" />
    </div>
    <div class="achievement-form-layout__main">
      <slot name="main-content" />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.achievement-form-layout {
  @apply bg-gray-25 flex gap-5 h-full;
  &__sidebar {
    @apply w-1/3 bg-white border border-solid border-gray-50 shadow-sm rounded-xl max-h-full overflow-y-auto;
  }
  &__main {
    @apply w-2/3 bg-white border border-solid border-gray-50 shadow-sm rounded-xl max-h-full overflow-y-auto;
  }
}
</style>
