<script setup lang="ts" generic="S extends z.ZodType<unknown, ArtistFormState>">
import type { FormSubmitEvent } from '@nuxt/ui'
import type * as z from 'zod'
import type { ArtistFormState } from '~~/shared/types/artist'

const props = defineProps<{
  schema: S
}>()

const emit = defineEmits<{
  submit: [event: FormSubmitEvent<z.output<S>>]
}>()

const artist = defineModel<z.input<S>>({ required: true })
</script>

<template>
  <div>
    <ArtistProfileForm
      v-model="artist"
      :schema="props.schema"
      @submit="emit('submit', $event)"
    />
  </div>
</template>
