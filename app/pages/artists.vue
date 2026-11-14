<script setup lang="ts">
import type { BlogPostProps } from '@nuxt/ui'

definePageMeta({
  path: '/c'
})

const route = useRoute()
const categories = computed(() => {
  const categoryQuery = route.query.category
  const values = Array.isArray(categoryQuery) ? categoryQuery : [categoryQuery]
  return values.flatMap(value => value?.split(',').map(category => category.trim()).filter(Boolean) ?? [])
})

const { data: artists, status, error } = await useFetch('/api/artists/public', {
  query: computed(() => ({ category: route.query.category }))
})

const posts = computed<(BlogPostProps & { id: string })[]>(() => (artists.value ?? []).map(artist => ({
  id: artist.id,
  title: artist.name,
  // description: artist.description ?? undefined,
  image: artist.pictures?.avatar ?? artist.pictures?.header ?? 'https://www.ersteliga.hu/_upload/editor/650x650_A2.png',
  date: artist.publishedAt ?? artist.createdAt,
  isTeam: artist.isTeam,
  to: `/${artist.nameId}`
})))
</script>

<template>
  <UPage>
    <UPageBody>
      <UContainer>
        <UPageHeader
          :title="categories.length ? categories.join(', ') : 'Artistok'"
          :ui="{ root: 'border-none' }"
        />
        <UAlert
          v-if="error"
          title="Az artistok nem tölthetők be"
          :description="error.statusMessage"
          color="error"
          variant="subtle"
        />
        <UAlert
          v-else-if="status === 'pending'"
          title="Artistok betöltése..."
          color="neutral"
          variant="subtle"
        />
        <UEmpty
          v-else-if="!posts.length"
          icon="i-ph-user"
          title="Nincs megjeleníthető artist"
          description="A kiválasztott kategóriákban még nincs artist."
        />
        <UBlogPosts
          v-else
          :ui="{ base: 'gap-5 lg:gap-5 sm:grid sm:grid-cols-3 lg:grid-cols-6' }"
        >
          <ArtistCard
            v-for="post in posts"
            :key="post.id"
            :artist="post"
          />
        </UBlogPosts>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
