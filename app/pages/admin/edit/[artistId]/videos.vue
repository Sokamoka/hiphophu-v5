<script setup lang="ts">
definePageMeta({
  name: 'AdminArtistVideos',
  path: '/u/artists/:artistId/videos',
  middleware: 'auth',
  roles: ['ADMIN']
})
</script>

<template>
  <div>
    Artist Videos
  </div>
</template>
