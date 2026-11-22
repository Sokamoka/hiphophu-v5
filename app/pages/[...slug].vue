<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import { artistLinkPlatformIcons } from '~~/shared/types/artist'

const route = useRoute()
const router = useRouter()
const nameId = computed(() => {
  const slug = route.params.slug
  return Array.isArray(slug) ? slug.at(-1) : slug
})

const { data: artist, status, error } = await useFetch(
  () => `/api/artists/by-name-id/${encodeURIComponent(nameId.value ?? '')}`
)

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

const items: TabsItem[] = [
  {
    label: 'Videók',
    icon: 'i-lucide-video',
    value: 'video'
  },
  {
    label: 'Képek',
    icon: 'i-lucide-image',
    value: 'picture'
  }
]

const active = computed({
  get() {
    return (route.query.tab as string) || 'video'
  },
  set(tab) {
    router.push({
      query: { tab },
      hash: `#${tab}`
    })
  }
})
</script>

<template>
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

        <template #links>
          <UAvatarGroup>
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
        </template>

        <template #bottom>
          BOTTOM
        </template>
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

      <UTabs
        v-model="active"
        :content="false"
        :items="items"
        class="w-full"
        variant="link"
      />
    </div>
  </UContainer>
  <UContainer v-else>
    <UAlert
      title="Artist nem található"
      color="error"
      variant="subtle"
    />
  </UContainer>
</template>
