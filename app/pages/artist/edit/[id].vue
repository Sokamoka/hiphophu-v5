<script setup lang="ts">
definePageMeta({
  path: '/u/artist/edit/:id',
  middleware: 'auth',
  roles: ['ADMIN', 'USER']
})
</script>

<template>
  <UContainer>
    Edit:
    <!-- <pre>{{ $route }}</pre> -->
    <ArtistProfilePictures />
  </UContainer>
</template>
