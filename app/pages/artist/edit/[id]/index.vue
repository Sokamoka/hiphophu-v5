<script setup lang="ts">
import type * as z from 'zod'
import type { ArtistFormState } from '~~/shared/types/artist'

definePageMeta({
  name: 'ArtistProfile'
})

defineProps<{
  schema: z.ZodType<unknown, ArtistFormState>
}>()

const artist = defineModel<ArtistFormState>({ required: true })
</script>

<template>
  <div>
    <ArtistProfileForm
      v-model="artist"
      :schema="schema"
    />
  </div>
</template>
