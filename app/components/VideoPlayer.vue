<script setup lang="ts">
// const props = defineProps<{
//   videos: string[]
// }>()

const videoId = defineModel<string>('video-id', { required: true })

const open = computed({
  get: () => Boolean(videoId.value),
  set: () => videoId.value = ''
})
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'max-w-min' }"
  >
    <template #content="{ close }">
      <div class="relative w-[min(90vw,64rem)] aspect-video">
        <Teleport to="body">
          <UButton
            icon="i-ph-x"
            color="neutral"
            variant="solid"
            class="fixed right-1 top-1 z-10"
            aria-label="Videó bezárása"
            @click="close"
          />
        </Teleport>
        <ScriptYouTubePlayer
          v-if="/^[\w-]{11}$/.test(videoId)"
          :key="videoId"
          :video-id="videoId"
          trigger="immediate"
          :player-vars="{ autoplay: 1 }"
          :root-attrs="{ class: 'size-full rounded-lg' }"
          :placeholder-attrs="{ class: 'rounded-lg' }"
        >
          <template #error>
            <UAlert
              title="A YouTube-lejátszó nem tölthető be"
              color="error"
              variant="subtle"
            />
          </template>
        </ScriptYouTubePlayer>
        <UAlert
          v-else
          title="A videó azonosítója érvénytelen"
          color="error"
          variant="subtle"
        />
      </div>
    </template>
  </UModal>
</template>
