<script setup lang="ts">
import type { BlogPostProps } from '@nuxt/ui'

defineProps<{
  artist: BlogPostProps
}>()
</script>

<template>
  <UBlogPost
    v-bind="{ ...artist, image: `https://picsum.photos/512/512?r=${$route.path}` }"
    variant="outline"
    :ui="{ body: 'p-3 sm:p-3 px-5', title: 'text-base', header: 'aspect-square' }"
  />
</template>
