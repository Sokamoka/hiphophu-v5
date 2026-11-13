<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { artistCategories } from '~~/shared/types/artist'

definePageMeta({
  path: '/u/artist/add',
  middleware: 'auth',
  roles: ['ADMIN', 'USER']
})

const userSchema = z.object({
  isActive: z.boolean(),
  name: z.string().min(2, 'Too short'),
  nameId: z.string().min(2, 'Required'),
  isTeam: z.boolean().nullable().refine(value => value !== null, 'Required'),
  category: z.array(z.enum(artistCategories)).min(1, 'Required'),
  description: z.string(),
  links: z.array(z.object({
    platform: z.string(),
    url: z.string().min(1, 'Required').url('Invalid URL')
  }))
})

type UserForm = z.output<typeof userSchema>
type UserFormState = z.input<typeof userSchema>

const toast = useToast()
const saving = ref(false)

const artist = reactive<UserFormState>({
  isActive: false,
  name: '',
  nameId: '',
  isTeam: null,
  category: [],
  description: '',
  links: []
})

async function onSubmit({ data }: FormSubmitEvent<UserForm>) {
  saving.value = true
  try {
    await $fetch('/api/artists', { method: 'POST', body: data })
    toast.add({ title: 'Előadó mentve' })
    await navigateTo('/')
  } catch (error) {
    toast.add({
      title: 'Sikertelen mentés',
      description: (error as { statusMessage?: string }).statusMessage ?? 'Az előadó mentése nem sikerült',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <UContainer>
        <!-- <UAlert
          v-if="error"
          title="User could not be loaded"
          color="error"
          variant="subtle"
        /> -->
        <ArtistProfileForm
          v-model="artist"
          :schema="userSchema"
          @submit="onSubmit"
        >
          <UPageCard
            title="Artist"
            description="This information will be displayed publicly."
            variant="naked"
            orientation="horizontal"
            class="mb-4"
          >
            <UButton
              form="artist-profile-form"
              label="Mentés"
              color="neutral"
              type="submit"
              icon="i-lucide-save"
              class="w-fit lg:ms-auto"
              :loading="saving"
            />
          </UPageCard>
        </ArtistProfileForm>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
