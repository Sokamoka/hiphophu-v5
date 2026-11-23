<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import { useSortable } from '@vueuse/integrations/useSortable'

const videoUrl = ref<string>('')
const videos = ref<{ id: string, url: string, title: string, description: string, duration: string, image?: string }[]>([])
const VIDEO_DESCRIPTION_MAX_LENGTH = 256
const schema = z.object({
  videoUrl: z.string().trim().pipe(z.url('Adj meg egy érvényes YouTube-linket.'))
})

const form = useTemplateRef('form')
const el = useTemplateRef('el')

useSortable(el, videos, {
  handle: '[data-drag-handle]',
  animation: 320
} as Parameters<typeof useSortable>[2])

function videoDurationLabel(duration: string) {
  const match = /^P(?:(\d+)D)?(?:T(?=\d)(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(duration)
  if (!match || duration === 'P') return 'Ismeretlen időtartam'

  const [, days = '0', hours = '0', minutes = '0', seconds = '0'] = match
  const totalHours = Number(days) * 24 + Number(hours)
  const clock = totalHours > 0
    ? `${totalHours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
    : `${minutes}:${seconds.padStart(2, '0')}`

  return `Időtartam: ${clock}`
}

function videoDescription(description: string, url: string) {
  const text = description || url
  const characters = Array.from(text)

  return characters.length > VIDEO_DESCRIPTION_MAX_LENGTH
    ? `${characters.slice(0, VIDEO_DESCRIPTION_MAX_LENGTH - 3).join('')}...`
    : text
}

async function onAddVideo({ data }: FormSubmitEvent<z.output<typeof schema>>) {
  try {
    const video = await $fetch('/api/youtube/video', {
      method: 'POST',
      body: { url: data.videoUrl }
    })

    if (videos.value.some(item => item.id === video.id)) {
      form.value?.setErrors([{ name: 'videoUrl', message: 'Ez a videó már hozzá van adva.' }])
      return
    }

    videos.value.push(video)
    videoUrl.value = ''
  } catch (error) {
    const status = error instanceof Error && 'statusCode' in error ? error.statusCode : undefined
    const message = status === 400
      ? 'Adj meg egy érvényes YouTube-videólinket.'
      : status === 404
        ? 'A videó nem található vagy nem érhető el.'
        : 'Nem sikerült lekérni a videó adatait.'
    form.value?.setErrors([{ name: 'videoUrl', message }])
  }
}
</script>

<template>
  <UForm
    ref="form"
    v-slot="{ loading }"
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
        description="Illeszd be a hozzáadni kívánt YouTube-videó linkjét."
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
            :loading="loading"
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
        :title="video.title"
        :description="videoDescription(video.description, video.url)"
        :image="video.image"
        :badge="videoDurationLabel(video.duration)"
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
