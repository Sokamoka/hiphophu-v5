<script setup lang="ts">
import type { BlogPostProps } from '@nuxt/ui'

const posts = ref<BlogPostProps[]>([
  {
    title: 'Nuxt Icon v1',
    image: 'https://nuxt.com/assets/blog/nuxt-icon/cover.png',
    to: '/artist1'
  },
  {
    title: 'Nuxt 3.14',
    image: 'https://nuxt.com/assets/blog/v3.14.png',
    to: '/artist2'
  },
  {
    title: 'Nuxt 3.13',
    image: 'https://nuxt.com/assets/blog/v3.13.png',
    to: '/artist3'
  },
  {
    title: 'Nuxt 3.13',
    image: 'https://nuxt.com/assets/blog/v3.13.png',
    to: '/artist4'
  },
  {
    title: 'Nuxt 3.13',
    image: 'https://nuxt.com/assets/blog/v3.13.png',
    to: '/artist4'
  },
  {
    title: 'Nuxt 3.13',
    image: 'https://nuxt.com/assets/blog/v3.13.png',
    to: '/artist4'
  }
])
</script>

<template>
  <ScrollContainer title="zene">
    <ArtistCard
      v-for="(post, index) in posts"
      :key="index"
      :artist="post"
    />
  </ScrollContainer>
</template>
