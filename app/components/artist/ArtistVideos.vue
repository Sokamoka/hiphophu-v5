<script setup lang="ts">
import * as z from 'zod'
import { useSortable } from '@vueuse/integrations/useSortable'

const videoUrl = ref<string>('')
const videos = ref<{ id: string, url: string, image: string }[]>([])
const schema = z.object({
  videoUrl: z.url('Invalid url')
}).refine(
  ({ videoUrl }) => !videos.value.some(video => video.url === videoUrl),
  {
    path: ['videoUrl'],
    message: 'Ez a videó már hozzá van adva.'
  }
)

const el = useTemplateRef('el')

useSortable(el, videos, {
  handle: '[data-drag-handle]',
  animation: 320
} as Parameters<typeof useSortable>[2])

function onAddVideo() {
  videos.value.push({ id: Math.random().toString(), url: videoUrl.value, image: `https://picsum.photos/512/512/?r=${Math.random()}` })
  videoUrl.value = ''
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="{ videoUrl }"
    @submit="onAddVideo"
  >
    <UPageCard
      variant="subtle"
      class="mb-10"
    >
      <UFormField
        name="videoUrl"
        label="YouTube Video URL"
        description="Will appear on receipts, invoices, and other communication."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UFieldGroup>
          <UInput
            v-model="videoUrl"
            autocomplete="off"
            class="w-96"
          />
          <UButton
            variant="subtle"
            label="Hozzáadás"
            type="submit"
          />
        </UFieldGroup>
      </UFormField>
    </UPageCard>
  </UForm>

  <UEmpty
    v-if="videos.length === 0"
    icon="i-ph-video"
    title="No video added"
    description="It looks like you haven't added any projects. Create one to get started."
  />

  <UPageCard
    v-else
    title="Beállított videók"
    variant="naked"
    orientation="horizontal"
    class="mb-4"
  />

  <ul
    ref="el"
    class="space-y-4"
  >
    <li
      v-for="(video, index) in videos"
      :key="video.id"
    >
      <UBlogPost
        orientation="horizontal"
        variant="outline"
        :title="video.url"
        :description="video.url"
        :image="video.image"
        :ui="{ root: 'items-center lg:flex lg:flex-row', header: 'lg:w-64 shrink-0', body: 'flex-1' }"
      >
        <template #footer>
          <UButton
            icon="i-lucide-grip-vertical"
            color="neutral"
            variant="ghost"
            class="cursor-grab active:cursor-grabbing me-3"
            data-drag-handle
            aria-label="Átrendezés"
          />
        </template>

        <template #authors>
          <UButton
            icon="i-ph-trash"
            color="error"
            label="Törlés"
            size="xs"
            @click="videos.splice(index, 1)"
          />
        </template>
      </UBlogPost>
    </li>
  </ul>
</template>
