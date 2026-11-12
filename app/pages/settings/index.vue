<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'auth' })

const profileSchema = z.object({
  name: z.string().min(2, 'Too short'),
  email: z.email('Invalid email'),
  nickname: z.string().trim().max(40).refine(v => v.length === 0 || v.length >= 2, 'Too short'),
  location: z.string().trim().max(100),
  language: z.enum(['hu', 'en'])
})

type ProfileSchema = z.output<typeof profileSchema>

const { user, refresh } = useAuth()
const profile = reactive<ProfileSchema>({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  nickname: user.value?.nickname ?? '',
  location: user.value?.location ?? '',
  language: user.value?.language ?? 'hu'
})
const languageOptions = [{ label: 'Magyar', value: 'hu' }, { label: 'English', value: 'en' }]
const toast = useToast()
const saving = ref(false)

async function onSubmit({ data }: FormSubmitEvent<ProfileSchema>) {
  saving.value = true
  try {
    await $fetch('/api/account/profile', { method: 'PATCH', body: data })
    await refresh()
    toast.add({
      title: 'Success',
      description: 'Your settings have been updated.',
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Save failed',
      description: error instanceof Error ? error.message : 'Could not save your profile',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Profile"
      description="This information will be displayed publicly."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Mentés"
        icon="i-lucide-save"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
        :loading="saving"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="Name"
        description="Will appear on receipts, invoices, and other communication."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.name"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Email"
        description="Used to sign in, for email receipts and product updates."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.email"
          type="email"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="nickname"
        label="Nickname"
        description="The name other users will see."
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.nickname"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="location"
        label="Location"
        description="Your city."
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.location"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="language"
        label="Language"
        description="Preferred language of the site."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <USelect
          v-model="profile.language"
          :items="languageOptions"
        />
      </UFormField>
      <USeparator />
    </UPageCard>
  </UForm>
</template>
