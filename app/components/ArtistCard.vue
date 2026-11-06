<script setup lang="ts">
import type { BlogPostProps } from '@nuxt/ui'

defineProps<{
  artist: BlogPostProps
}>()
</script>

<template>
  <UBlogPost
    v-bind="artist"
    variant="outline"
    :ui="{ body: 'p-3 sm:p-3 px-5', title: 'text-base' }"
  />
</template>
