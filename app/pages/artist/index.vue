<script setup lang="ts">
import type { BlogPostProps } from '@nuxt/ui'

definePageMeta({
  path: '/u/artist',
  middleware: 'auth',
  roles: ['ADMIN', 'USER']
})

const { data: artists, status } = await useFetch('/api/artists/mine')

const cards = computed<BlogPostProps[]>(() => (artists.value ?? []).map(artist => ({
  title: artist.name,
  description: artist.description ?? undefined,
  image: artist.pictures?.avatar ?? artist.pictures?.header,
  date: artist.publishedAt ?? artist.createdAt
})))
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <UContainer>
        <UPageCard
          title="Artist"
          description="This information will be displayed publicly."
          variant="naked"
          orientation="horizontal"
          class="mb-4"
        >
          <UButton
            v-if="cards.length"
            label="Új"
            icon="i-ph-plus"
            class="w-fit lg:ms-auto"
            to="/u/artist/add"
          />
        </UPageCard>

        <UBlogPosts
          v-if="cards.length"
          :ui="{ base: 'gap-5 lg:gap-5 sm:grid sm:grid-cols-3 lg:grid-cols-6' }"
        >
          <ArtistCard
            v-for="(card, index) in cards"
            :key="index"
            :artist="card"
          />
        </UBlogPosts>
        <UEmpty
          v-else-if="status !== 'pending'"
          icon="i-ph-user"
          title="No projects found"
          description="It looks like you haven't added any projects. Create one to get started."
          :actions="[
            {
              icon: 'i-ph-plus',
              label: 'Saját oldal létrehozása',
              variant: 'subtle',
              to: '/u/artist/add'
            }
          ]"
        />
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
