<script setup lang="ts">
import type { BlogPostProps } from '@nuxt/ui'

definePageMeta({
  path: '/a/:categoryId'
})

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
  <UPage>
    <UPageBody>
      <UContainer>
        <UPageHeader
          title="Break Tánc kategória"
          :ui="{ root: 'border-none' }"
        />
        <UBlogPosts :ui="{ base: 'gap-5 lg:gap-5 sm:grid sm:grid-cols-3 lg:grid-cols-6' }">
          <ArtistCard
            v-for="(post, index) in posts"
            :key="index"
            :artist="post"
          />
        </UBlogPosts>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
