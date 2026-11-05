<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'auth' })

const profileSchema = z.object({
  name: z.string().min(2, 'Too short'),
  email: z.email('Invalid email')
})

type ProfileSchema = z.output<typeof profileSchema>

const { user, refresh } = useAuth()
const profile = reactive<ProfileSchema>({
  name: user.value?.name ?? '',
  email: user.value?.email ?? ''
})
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
    </UPageCard>
  </UForm>
</template>
