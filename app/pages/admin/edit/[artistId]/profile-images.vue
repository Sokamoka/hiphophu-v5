<script setup lang="ts">
definePageMeta({
  name: 'AdminArtistProfileImages',
  path: '/u/artists/:artistId/profile-images',
  middleware: 'auth',
  roles: ['ADMIN']
})
</script>

<template>
  <div>
    Profile Images
  </div>
</template>
