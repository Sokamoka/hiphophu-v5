<script setup lang="ts">
import type { ArtistProfilePictures } from '#components'

const modelValue = defineModel<InstanceType<typeof ArtistProfilePictures>['$props']['modelValue']>({ required: true })

definePageMeta({
  name: 'ProfileImages'
})
</script>

<template>
  <ArtistProfilePictures v-model="modelValue" />
</template>
