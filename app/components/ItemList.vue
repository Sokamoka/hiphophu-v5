<script setup lang="ts">
import type { BlogPostProps } from '@nuxt/ui'

const props = defineProps<{
  title: string
  filter?: string
}>()

const { data: artists, status, error } = await useFetch('/api/artists/public', {
  query: computed(() => ({ category: props.filter }))
})

const posts = computed<(BlogPostProps & { id: string, isTeam: boolean })[]>(() => (artists.value ?? []).map(artist => ({
  id: artist.id,
  title: artist.name,
  image: artist.pictures?.avatar ?? artist.pictures?.header ?? 'https://www.ersteliga.hu/_upload/editor/650x650_A2.png',
  date: artist.publishedAt ?? artist.createdAt,
  isTeam: artist.isTeam,
  to: `/${artist.nameId}`
})))
</script>

<template>
  <div>
    <ScrollContainer
      v-if="posts.length"
      :title
    >
      <ArtistCard
        v-for="post in posts"
        :key="post.id"
        :artist="post"
      />
    </ScrollContainer>
    <UAlert
      v-else-if="status === 'pending'"
      title="Artistok betöltése..."
      color="neutral"
      variant="subtle"
    />
    <UAlert
      v-else-if="error"
      title="Az artistok nem tölthetők be"
      :description="error.statusMessage"
      color="error"
      variant="subtle"
    />
    <UAlert
      v-else
      title="Nincs megjeleníthető artist"
      description="A kiválasztott kategóriában még nincs artist."
      color="neutral"
      variant="subtle"
    />
  </div>
</template>
