<script setup lang="ts">
definePageMeta({
  name: 'AdminArtistProfile',
  path: '/u/artists/:artistId',
  middleware: 'auth',
  roles: ['ADMIN']
})
</script>

<template>
  <div>
    Profile
  </div>
</template>
