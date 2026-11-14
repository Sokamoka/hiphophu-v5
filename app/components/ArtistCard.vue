<script setup lang="ts">
import type { BlogPostProps } from '@nuxt/ui'

defineProps<{
  artist: BlogPostProps & { isTeam?: boolean }
}>()
</script>

<template>
  <UBlogPost
    v-bind="artist"
    variant="outline"
    :ui="{ body: 'p-3 sm:p-3 px-5', title: 'text-base', header: 'aspect-square' }"
  >
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
