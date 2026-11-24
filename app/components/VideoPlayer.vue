<script setup lang="ts">
const props = defineProps<{
  url?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const embedUrl = computed(() => {
  if (!props.url) return undefined

  try {
    const url = new URL(props.url)
    const [, firstPathSegment, secondPathSegment] = url.pathname.split('/')
    let videoId: string | null | undefined
    if (url.hostname === 'youtu.be') {
      videoId = firstPathSegment
    } else if (url.pathname === '/watch') {
      videoId = url.searchParams.get('v')
    } else if (['shorts', 'live', 'embed'].includes(firstPathSegment ?? '')) {
      videoId = secondPathSegment
    }

    return videoId && /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : undefined
  } catch {
    return undefined
  }
})

const open = computed({
  get: () => Boolean(props.url),
  set: () => emit('close')
})
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'max-w-min' }"
  >
    <template #content>
      <div class="relative w-[min(90vw,64rem)] aspect-video">
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="solid"
          class="absolute right-3 top-3 z-10"
          aria-label="Videó bezárása"
          @click="emit('close')"
        />
        <iframe
          v-if="embedUrl"
          :src="embedUrl"
          :title="`YouTube videó: ${url}`"
          class="size-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        />
        <UAlert
          v-else
          title="A videó linkje érvénytelen"
          color="error"
          variant="subtle"
        />
      </div>
    </template>
  </UModal>
</template>
