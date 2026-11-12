<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const nameId = computed(() => {
  const slug = route.params.slug
  return Array.isArray(slug) ? slug.at(-1) : slug
})

const { data: artist, status, error } = await useFetch(
  () => `/api/artists/by-name-id/${encodeURIComponent(nameId.value ?? '')}`
)

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
        <template #top>
          <div class="absolute inset-0 -z-10">
            <img
              v-if="artist.pictures?.header || artist.pictures?.avatar"
              :src="artist.pictures.header ?? artist.pictures.avatar"
              :alt="artist.name"
              class="size-full object-cover"
            >
            <div class="absolute inset-0 bg-linear-to-r from-default to-transparent" />
            <div class="absolute inset-0 bg-linear-to-b from-transparent from-0% via-transparent via-60% to-default to-100%" />
          </div>
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
