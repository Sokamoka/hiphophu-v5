<script setup lang="ts">
import type { BlogPostProps } from '@nuxt/ui'

const props = defineProps<{
  artist: BlogPostProps & { isTeam?: boolean }
}>()

const image = computed(() => {
  const value = props.artist.image
  if (!value) return undefined

  return {
    ...(typeof value === 'string' ? { src: value } : value),
    provider: 'none'
  }
})
</script>

<template>
  <UBlogPost
    v-bind="artist"
    :image="image"
    variant="outline"
    :ui="{ body: 'p-3 sm:p-3 px-5', title: 'text-base', header: 'aspect-square' }"
  >
    <template #header>
      <img
        v-if="props.artist.image"
        :src="props.artist.image"
        class="object-cover object-top w-full h-full transform transition-transform ease-out motion-reduce:transition-none group-hover/blog-post:scale-110"
      >
      <UAvatar
        v-else
        :alt="props.artist.title"
        class="w-full h-full rounded-none text-4xl"
      />
    </template>
    <template #badge>
      <UBadge
        :icon="artist.isTeam ? 'i-ph-users-bold' : 'i-ph-user-bold'"
        size="sm"
        variant="subtle"
        class="rounded-full"
      />
    </template>
  </UBlogPost>
</template>
