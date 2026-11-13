<script setup lang="ts">
import type { FormSubmitEvent, NavigationMenuItem } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({
  path: '/u/artist/edit/:id',
  middleware: 'auth',
  roles: ['ADMIN', 'USER']
})

const artistSchema = z.object({
  isActive: z.boolean(),
  name: z.string().min(2, 'Too short'),
  nameId: z.string().min(2, 'Required'),
  isTeam: z.boolean().nullable().refine(value => value !== null, 'Required'),
  category: z.array(z.enum(artistCategories)).min(1, 'Required'),
  description: z.string(),
  links: z.array(z.object({
    platform: z.string(),
    url: z.string().min(1, 'Required').url('Invalid URL')
  }))
})

type ArtistDetails = z.output<typeof artistSchema>

const route = useRoute()
const { data: artist, status, error } = await useFetch<ArtistDetails>(() => `/api/artists/${route.params.id}`, {
  deep: true
})

const toast = useToast()
const saving = ref(false)

async function onSubmit({ data }: FormSubmitEvent<ArtistDetails>) {
  saving.value = true
  try {
    const artistUrl = `/api/artists/${encodeURIComponent(String(route.params.id))}` as '/api/artists/:id'
    await $fetch(artistUrl, { method: 'PATCH', body: data })
    toast.add({ title: 'Előadó mentve' })
  } catch (error) {
    toast.add({
      title: 'Sikertelen mentés',
      description: (error as { statusMessage?: string }).statusMessage ?? 'Az előadó mentése nem sikerült',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

const links = computed(() => {
  const params = { id: String(route.params.id) }

  return [
    {
      label: 'Profile',
      icon: 'i-ph-user',
      to: { name: 'artist-edit-id', params },
      exact: true
    },
    {
      label: 'Profile images',
      icon: 'i-ph-user-circle',
      to: { name: 'ProfileImages', params }
    },
    {
      label: 'Images',
      icon: 'i-ph-images',
      to: { name: 'ArtistImage', params }
    },
    {
      label: 'Videos',
      icon: 'i-ph-video',
      to: { name: 'ArtistVideo', params }
    }
  ] satisfies NavigationMenuItem[]
})
</script>

<template>
  <UDashboardPanel>
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
        <UAlert
          v-if="status === 'pending'"
          title="Loading artist"
          color="neutral"
          variant="subtle"
        />
        <UAlert
          v-else-if="error"
          title="Artist could not be loaded"
          :description="error.statusMessage"
          color="error"
          variant="subtle"
        />
        <template v-else-if="artist">
          <UPageCard
            :title="artist.name"
            description="Szerkesztheted az adatotak"
            variant="naked"
            orientation="horizontal"
            class="mb-4"
          >
            <UButton
              v-if="$route.name === 'artist-edit-id'"
              form="artist-profile-form"
              label="Mentés"
              color="neutral"
              type="submit"
              icon="i-lucide-save"
              class="w-fit lg:ms-auto"
              :loading="saving"
            />
          </UPageCard>
          <NuxtPage
            v-model="artist"
            :schema="artistSchema"
            @submit="onSubmit"
          />

          <!-- <UPageCard
            variant="outline"
            class="mb-10"
          >
            <dl class="grid gap-5 sm:grid-cols-2">
              <div>
                <dt class="text-muted">
                  Name
                </dt>
                <dd>{{ artist.name }}</dd>
              </div>
              <div>
                <dt class="text-muted">
                  Site path
                </dt>
                <dd>{{ artist.nameId }}</dd>
              </div>
              <div>
                <dt class="text-muted">
                  Type
                </dt>
                <dd>{{ artist.isTeam ? 'Team' : 'Artist' }}</dd>
              </div>
              <div>
                <dt class="text-muted">
                  Categories
                </dt>
                <dd class="mt-1 flex flex-wrap gap-2">
                  <UBadge
                    v-for="category in artist.category"
                    :key="category"
                    :label="category"
                    color="neutral"
                    variant="subtle"
                  />
                </dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-muted">
                  Description
                </dt>
                <dd class="whitespace-pre-wrap">
                  {{ artist.description || 'No description' }}
                </dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-muted">
                  Links
                </dt>
                <dd
                  v-if="artist.links.length"
                  class="mt-1 flex flex-col gap-1"
                >
                  <a
                    v-for="link in artist.links"
                    :key="link"
                    :href="link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary underline"
                  >{{ link }}</a>
                </dd>
                <dd v-else>
                  No links
                </dd>
              </div>
            </dl>
          </UPageCard> -->
        </template>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
