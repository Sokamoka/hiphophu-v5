<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import { useSortable } from '@vueuse/integrations/useSortable'
import type { StreamMedia } from '~~/shared/types/media'

type ArtistVideo = Pick<StreamMedia, 'id' | 'type' | 'sourceId' | 'thumbnail' | 'title' | 'description' | 'duration' | 'sortOrder'>
type YouTubeVideo = Pick<ArtistVideo, 'title' | 'description' | 'duration'> & { id: string, image?: string }

const videoUrl = ref<string>('')
const videos = ref<ArtistVideo[]>([])
const VIDEO_DESCRIPTION_MAX_LENGTH = 256
const schema = z.object({
  videoUrl: z.string().trim().pipe(z.url('Adj meg egy érvényes YouTube-linket.'))
})

const form = useTemplateRef('form')
const el = useTemplateRef('el')
const route = useRoute()
const artistId = typeof route.params.id === 'string' ? route.params.id : ''
const toast = useToast()
const loadingVideos = ref(true)
const deletingVideoId = ref<string>()
let orderSave = Promise.resolve()

useSortable(el, videos, {
  handle: '[data-drag-handle]',
  animation: 320,
  onUpdate: saveVideoOrder
} as Parameters<typeof useSortable>[2])

async function fetchVideos() {
  if (!artistId) throw createError({ statusCode: 400, statusMessage: 'Artist ID is required' })

  return await $fetch<ArtistVideo[]>(`/api/artists/${encodeURIComponent(artistId)}/media`, {
    query: { type: 'video' }
  })
}

async function loadVideos() {
  try {
    videos.value = await fetchVideos()
  } catch (error) {
    toast.add({
      title: 'Sikertelen betöltés',
      description: error instanceof Error ? error.message : 'A videók betöltése nem sikerült.',
      color: 'error'
    })
  } finally {
    loadingVideos.value = false
  }
}

function saveVideoOrder() {
  if (!artistId) return

  const mediaIds = videos.value.map(video => video.id)
  orderSave = orderSave.then(async () => {
    try {
      await $fetch(`/api/artists/${encodeURIComponent(artistId)}/media/reorder`, {
        method: 'PATCH',
        body: { mediaIds }
      })
    } catch (error) {
      toast.add({
        title: 'Sikertelen mentés',
        description: error instanceof Error ? error.message : 'A videók sorrendjét nem sikerült menteni.',
        color: 'error'
      })
      await loadVideos()
    }
  })

  return orderSave
}

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

function videoDescription(description: string, sourceId: string) {
  const text = description || `https://www.youtube.com/watch?v=${sourceId}`
  const characters = Array.from(text)

  return characters.length > VIDEO_DESCRIPTION_MAX_LENGTH
    ? `${characters.slice(0, VIDEO_DESCRIPTION_MAX_LENGTH - 3).join('')}...`
    : text
}

async function deleteVideo(video: ArtistVideo) {
  if (!artistId || deletingVideoId.value) return
  deletingVideoId.value = video.id

  try {
    await $fetch(`/api/artists/${encodeURIComponent(artistId)}/media/${encodeURIComponent(video.id)}`, {
      method: 'DELETE'
    })
    videos.value = videos.value.filter(item => item.id !== video.id)
    toast.add({ title: 'Videó eltávolítva', color: 'success' })
  } catch (error) {
    toast.add({
      title: 'Sikertelen törlés',
      description: error instanceof Error ? error.message : 'A videót nem sikerült eltávolítani.',
      color: 'error'
    })
  } finally {
    deletingVideoId.value = undefined
  }
}

async function onAddVideo({ data }: FormSubmitEvent<z.output<typeof schema>>) {
  let video: YouTubeVideo
  try {
    video = await $fetch<YouTubeVideo>('/api/youtube/video', {
      method: 'POST',
      body: { url: data.videoUrl }
    })
  } catch (error) {
    const status = error instanceof Error && 'statusCode' in error ? error.statusCode : undefined
    const message = status === 400
      ? 'Adj meg egy érvényes YouTube-videólinket.'
      : status === 404
        ? 'A videó nem található vagy nem érhető el.'
        : 'Nem sikerült lekérni a videó adatait.'
    form.value?.setErrors([{ name: 'videoUrl', message }])
    return
  }

  if (videos.value.some(item => item.sourceId === video.id)) {
    form.value?.setErrors([{ name: 'videoUrl', message: 'Ez a videó már hozzá van adva.' }])
    return
  }

  if (!video.image) {
    form.value?.setErrors([{ name: 'videoUrl', message: 'A videóhoz nem érhető el bélyegkép.' }])
    return
  }

  try {
    const saved = await $fetch<{ id: string }>('/api/media', {
      method: 'POST',
      body: {
        type: 'video',
        sourceId: video.id,
        thumbnail: video.image,
        title: video.title,
        duration: video.duration,
        description: video.description,
        artists: [{ artistId, role: 'primary' }]
      }
    })

    videos.value.unshift({
      id: saved.id,
      type: 'video',
      sourceId: video.id,
      thumbnail: video.image,
      title: video.title,
      description: video.description,
      duration: video.duration,
      sortOrder: 0
    })
    videoUrl.value = ''
    toast.add({ title: 'Videó mentve', color: 'success' })
  } catch (error) {
    toast.add({
      title: 'Sikertelen mentés',
      description: error instanceof Error ? error.message : 'A videót nem sikerült menteni.',
      color: 'error'
    })
  }
}

onMounted(loadVideos)
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
            :disabled="loadingVideos"
            variant="subtle"
            label="Hozzáadás"
            type="submit"
          />
        </UFieldGroup>
      </UFormField>
    </UPageCard>
  </UForm>

  <UEmpty
    v-if="!loadingVideos && videos.length === 0"
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
      v-for="video in videos"
      :key="video.id"
    >
      <UBlogPost
        orientation="horizontal"
        variant="outline"
        :title="video.title"
        :description="videoDescription(video.description, video.sourceId)"
        :image="video.thumbnail"
        :badge="videoDurationLabel(video.duration)"
        :ui="{ root: 'items-center lg:flex lg:flex-row', header: 'lg:w-72 shrink-0 aspect-4/3', body: 'flex-1', description: 'text-sm', image: 'object-center' }"
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
            :loading="deletingVideoId === video.id"
            :disabled="!!deletingVideoId"
            @click="deleteVideo(video)"
          />
        </template>
      </UBlogPost>
    </li>
  </ul>
</template>
