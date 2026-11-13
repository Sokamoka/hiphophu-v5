<script setup lang="ts">
defineProps<{ title?: string }>()

const container = useTemplateRef<HTMLDivElement>('container')
const canScroll = ref(false)

function updateCanScroll() {
  const element = container.value
  canScroll.value = !!element && element.scrollWidth > element.clientWidth
}

useResizeObserver(container, updateCanScroll)
useMutationObserver(container, updateCanScroll, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true
})

function scroll(direction: number) {
  const element = container.value
  if (!element) return
  const childElement = container.value?.children[0]
  element.scrollBy({
    left: direction * (childElement?.clientWidth || 0),
    behavior: 'smooth'
  })
}
</script>

<template>
  <UPageCard
    :title
    variant="naked"
    orientation="horizontal"
    :ui="{ title: 'text-xl' }"
  >
    <div
      v-if="canScroll"
      class="w-fit lg:ms-auto flex gap-1"
    >
      <UButton
        aria-label="Scroll left"
        color="neutral"
        variant="soft"
        icon="lucide-arrow-left"
        @click="scroll(-1)"
      />
      <UButton
        aria-label="Scroll right"
        color="neutral"
        variant="soft"
        icon="lucide-arrow-right"
        @click="scroll(1)"
      />
    </div>
  </UPageCard>
  <div
    ref="container"
    class="grid grid-flow-col gap-3 overflow-x-auto auto-cols-[100%] sm:auto-cols-[25%] lg:auto-cols-[15%] py-2 snap-x snap-mandatory scrollbar-none scroll-px-6 sm:scroll-px-8 lg:scroll-px-24 px-6 sm:px-8 lg:px-16 -mx-6 sm:-mx-8 lg:-mx-16"
  >
    <slot />
  </div>
</template>
