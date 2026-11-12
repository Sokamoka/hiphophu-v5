<script setup lang="ts">
definePageMeta({
  name: 'AdminArtistImages',
  path: '/u/artists/:artistId/images',
  middleware: 'auth',
  roles: ['ADMIN']
})
</script>

<template>
  <div>
    Artist Images
  </div>
</template>
