<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

definePageMeta({
  path: '/u/artists/:artistId',
  middleware: 'auth',
  roles: ['ADMIN']
})

const route = useRoute()

const links = computed(() => {
  const params = { artistId: String(route.params.artistId) }

  return [
    {
      label: 'Profile',
      icon: 'i-ph-user',
      to: { name: 'AdminArtistProfile', params },
      exact: true
    },
    {
      label: 'Profile images',
      icon: 'i-ph-user-circle',
      to: { name: 'AdminArtistProfileImages', params }
    },
    {
      label: 'Images',
      icon: 'i-ph-images',
      to: { name: 'AdminArtistImages', params }
    },
    {
      label: 'Videos',
      icon: 'i-ph-video',
      to: { name: 'AdminArtistVideos', params }
    }
  ] satisfies NavigationMenuItem[]
})
</script>

<template>
  <UDashboardPanel>
    <!-- ADMIN ARTIST EDIT: {{ $route.params.artistId }} -->
    <template #header>
      <UDashboardToolbar class="sticky top-(--ui-header-height) z-10 bg-default/75 backdrop-blur-sm">
        <UContainer>
          <UNavigationMenu
            :items="links"
            highlight
          />
        </UContainer>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UContainer>
        <!-- <UAlert
          v-if="status === 'pending'"
          title="Loading artist"
          color="neutral"
          variant="subtle"
        /> -->
        <!-- <UAlert
          v-else-if="error"
          title="Artist could not be loaded"
          :description="error.statusMessage"
          color="error"
          variant="subtle"
        /> -->
        <!-- <template v-else-if="artist"> -->
        <!-- <template> -->
        <!-- <UPageCard
            :title="artist?.name || 'Art'"
            description="Szerkesztheted az adatotak"
            variant="naked"
            orientation="horizontal"
            class="mb-4"
          >
            <UButton
              v-if="$route.name === 'ArtistProfile'"
              form="artist-profile-form"
              label="Mentés"
              color="neutral"
              type="submit"
              icon="i-lucide-save"
              class="w-fit lg:ms-auto"
            />
          </UPageCard> -->
        <NuxtPage />
        <!-- <NuxtPage
            v-model="artist"
            :schema="artistSchema"
          /> -->
        <!-- </template> -->
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
