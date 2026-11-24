<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { artistLinkPlatformIcons } from '~~/shared/types/artist'
import type { ImageMedia, StreamMedia } from '~~/shared/types/media'

const route = useRoute()
const router = useRouter()
const nameId = computed(() => {
  const slug = route.params.slug
  return Array.isArray(slug) ? slug.at(-1) : slug
})

type GalleryImage = Pick<ImageMedia, 'id' | 'url' | 'thumbnail' | 'title'>
type GalleryVideo = Pick<StreamMedia, 'id' | 'url' | 'thumbnail' | 'title' | 'description' | 'duration'>

const videoUrl = ref('')
const selectedImage = ref<GalleryImage>()

const { data: artist, status, error } = await useFetch(
  () => `/api/artists/by-name-id/${encodeURIComponent(nameId.value ?? '')}`
)

const { data: gallery, status: galleryStatus, error: galleryError } = await useAsyncData(
  () => `artist-media:${artist.value?.id ?? nameId.value ?? ''}`,
  async () => {
    if (!artist.value) return { images: [] as GalleryImage[], videos: [] as GalleryVideo[] }

    const url = `/api/artists/${encodeURIComponent(artist.value.id)}/media`
    const [images, videos] = await Promise.all([
      $fetch<GalleryImage[]>(url, { query: { type: 'image' } }),
      $fetch<GalleryVideo[]>(url, { query: { type: 'video' } })
    ])
    return { images, videos }
  },
  { watch: [() => artist.value?.id] }
)

const images = computed(() => gallery.value?.images ?? [])
const videos = computed(() => gallery.value?.videos ?? [])
const hasBothMediaTypes = computed(() => images.value.length > 0 && videos.value.length > 0)
const visibleMediaType = computed(() => {
  if (hasBothMediaTypes.value) return active.value
  return videos.value.length ? 'video' : 'picture'
})

const title = computed(() => artist.value?.name || 'Artist')
const description = computed(() => artist.value?.description || `Ismerd meg ${title.value} adatlapját, videóit és képeit a HipHopHu-n.`)
const avatarUrl = computed(() => artist.value ? artistImageUrl(artist.value.id, artist.value.avatar) : undefined)
const heroUrl = computed(() => artist.value ? artistImageUrl(artist.value.id, artist.value.hero) : undefined)

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: computed(() => heroUrl.value ?? avatarUrl.value)
})

const items = computed<TabsItem[]>(() => hasBothMediaTypes.value
  ? [
      { label: 'Videók', icon: 'i-lucide-video', value: 'video' },
      { label: 'Képek', icon: 'i-lucide-image', value: 'picture' }
    ]
  : [])

const active = computed({
  get() {
    if (route.query.tab === 'picture' && hasBothMediaTypes.value) return 'picture'
    return 'video'
  },
  set(tab) {
    if (!hasBothMediaTypes.value) return
    router.replace({
      query: { ...route.query, tab },
      hash: `#${tab}`
    })
  }
})

const imageOpen = computed({
  get: () => Boolean(selectedImage.value),
  set: (open) => {
    if (!open) selectedImage.value = undefined
  }
})

function onCloseVideoPlayer() {
  videoUrl.value = ''
}
</script>

<template>
  <div>
    <UContainer v-if="status === 'pending'">
      <UAlert
        title="Artist betöltése..."
        color="neutral"
        variant="subtle"
      />
    </UContainer>
    <UContainer v-else-if="error">
      <UAlert
        title="Az artist adatai nem tölthetők be"
        :description="error.statusMessage"
        color="error"
        variant="subtle"
      />
    </UContainer>
    <UContainer v-else-if="artist">
      <div class="grid gap-5">
        <UPageHero
          :title="artist.name"
          :description="artist.description || undefined"
          orientation="horizontal"
        >
          <template
            v-if="heroUrl"
            #top
          >
            <div class="absolute inset-0 -z-10">
              <img
                :src="heroUrl"
                :alt="artist.name"
                class="size-full object-cover"
              >
              <div class="absolute inset-0 bg-linear-to-r from-default to-transparent" />
              <div class="absolute inset-0 bg-linear-to-b from-transparent from-0% via-transparent via-60% to-default to-100%" />
            </div>
          </template>
          <UAvatar
            :src="avatarUrl"
            :alt="artist.name"
            provider="none"
            :ui="{ root: 'size-56', fallback: 'text-7xl', icon: 'size-16' }"
            class="mx-auto"
          />

          <template
            v-if="artist.links.length || artist.connections.length"
            #links
          >
            <UAvatarGroup v-if="artist.links.length">
              <ULink
                v-for="(link, index) in artist.links"
                :key="index"
                :to="link.platform === 'email' ? `mailto:${link.url}` : link.url"
                :target="link.platform === 'email' ? undefined : '_blank'"
                class="hover:ring-primary transition hover:z-50"
                raw
              >
                <UAvatar
                  :icon="artistLinkPlatformIcons.get(link.platform) ?? `i-simple-icons-${link.platform}`"
                  size="2xl"
                />
              </ULink>
            </UAvatarGroup>
            <UAvatarGroup v-if="artist.connections.length">
              <ULink
                v-for="connection in artist.connections"
                :key="connection.id"
                :to="`/${connection.nameId}`"
                :aria-label="connection.name"
                :title="connection.name"
                class="hover:ring-primary transition hover:z-50"
                raw
              >
                <UAvatar
                  :src="artistImageUrl(connection.id, connection.avatar)"
                  :alt="connection.name"
                  provider="none"
                  size="2xl"
                />
              </ULink>
            </UAvatarGroup>
          </template>

          <!-- <template #bottom>
          BOTTOM
        </template> -->
          <template #headline>
            <UBadge
              v-for="category in artist.category"
              :key="category"
              :label="category"
              color="neutral"
              size="md"
              class="rounded-full not-last-of-type:me-3"
            />
          </template>
        </UPageHero>

        <UAlert
          v-if="galleryStatus === 'pending'"
          title="Médiák betöltése..."
          color="neutral"
          variant="subtle"
        />
        <UAlert
          v-else-if="galleryError"
          title="A médiák nem tölthetők be"
          :description="galleryError.statusMessage"
          color="error"
          variant="subtle"
        />
        <template v-else>
          <UTabs
            v-if="hasBothMediaTypes"
            v-model="active"
            :content="false"
            :items="items"
            class="w-full"
            variant="link"
          />

          <div
            v-if="visibleMediaType === 'video' && videos.length"
            class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <UCard
              v-for="video in videos"
              :key="video.id"
              :ui="{ body: 'p-0 sm:p-0' }"
            >
              <button
                type="button"
                class="group w-full text-start"
                :aria-label="`Videó lejátszása: ${video.title}`"
                @click="videoUrl = video.url"
              >
                <div class="relative aspect-video overflow-hidden rounded-t-lg">
                  <img
                    :src="video.thumbnail"
                    :alt="video.title"
                    class="size-full object-cover transition group-hover:scale-105"
                  >
                  <UIcon
                    name="i-lucide-play"
                    class="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg"
                  />
                </div>
                <div class="p-4 font-medium">
                  {{ video.title }}
                </div>
              </button>
            </UCard>
          </div>

          <div
            v-else-if="visibleMediaType === 'picture' && images.length"
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            <button
              v-for="image in images"
              :key="image.id"
              type="button"
              class="group overflow-hidden rounded-lg"
              :aria-label="`Kép megnyitása: ${image.title}`"
              @click="selectedImage = image"
            >
              <img
                :src="image.url"
                :alt="image.title"
                class="aspect-square size-full object-cover transition group-hover:scale-105"
                loading="lazy"
              >
            </button>
          </div>
        </template>
      </div>
    </UContainer>
    <UContainer v-else>
      <UAlert
        title="Artist nem található"
        color="error"
        variant="subtle"
      />
    </UContainer>

    <LazyVideoPlayer
      v-if="videoUrl"
      :url="videoUrl"
      @close="onCloseVideoPlayer"
    />

    <UModal v-model:open="imageOpen">
      <template #content>
        <div class="relative">
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="solid"
            class="absolute right-3 top-3 z-10"
            aria-label="Kép bezárása"
            @click="imageOpen = false"
          />
          <img
            v-if="selectedImage"
            :src="selectedImage.url"
            :alt="selectedImage.title"
            class="max-h-[85vh] w-full object-contain"
          >
        </div>
      </template>
    </UModal>
  </div>
</template>
