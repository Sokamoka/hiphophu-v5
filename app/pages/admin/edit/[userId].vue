<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  path: '/u/users/edit/:userId',
  middleware: 'auth',
  roles: ['ADMIN']
})

const userSchema = z.object({
  name: z.string().min(2, 'Too short'),
  email: z.email('Invalid email'),
  location: z.string().trim().max(100),
  language: z.enum(['hu', 'en']),
  theme: z.enum(['light', 'dark', 'system']),
  role: z.enum(['ADMIN', 'EDITOR', 'USER'])
})

type UserForm = z.output<typeof userSchema>

const route = useRoute()
const toast = useToast()
const saving = ref(false)
const languageOptions = [{ label: 'Magyar', value: 'hu' }, { label: 'English', value: 'en' }]
const themeOptions = [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }]
const roleOptions = ['ADMIN', 'EDITOR', 'USER'].map(role => ({ label: role, value: role }))
const { data: user, status, error } = await useFetch<UserForm>(
  () => `/api/admin/users/${route.params.userId}`,
  {
    transform: data => ({ ...data, location: data.location ?? '' })
  }
)

async function onSubmit({ data }: FormSubmitEvent<UserForm>) {
  saving.value = true
  try {
    await $fetch(`/api/admin/users/${route.params.userId}`, {
      method: 'PATCH',
      body: data
    })
    toast.add({ title: 'User saved' })
  } catch (error) {
    toast.add({
      title: 'Save failed',
      description: error instanceof Error ? error.message : 'Could not save user',
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
        <UAlert
          v-if="error"
          title="User could not be loaded"
          color="error"
          variant="subtle"
        />
        <UForm
          v-else-if="user"
          id="user"
          :schema="userSchema"
          :state="user"
          @submit="onSubmit"
        >
          <UPageCard
            title="User"
            description="This information will be displayed publicly."
            variant="naked"
            orientation="horizontal"
            class="mb-4"
          >
            <UButton
              form="user"
              label="Mentés"
              color="neutral"
              type="submit"
              icon="i-lucide-save"
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
                v-model="user.name"
                autocomplete="off"
                class="w-80"
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
                v-model="user.email"
                type="email"
                autocomplete="off"
                class="w-80"
              />
            </UFormField>
            <USeparator />
            <UFormField
              name="location"
              label="Location"
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <UInput
                v-model="user.location"
                autocomplete="off"
                class="w-80"
              />
            </UFormField>
            <USeparator />
            <UFormField
              name="language"
              label="Language"
              required
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <USelect
                v-model="user.language"
                :items="languageOptions"
                class="w-80"
              />
            </UFormField>
            <USeparator />
            <UFormField
              name="theme"
              label="Theme"
              required
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <USelect
                v-model="user.theme"
                :items="themeOptions"
                class="w-80"
              />
            </UFormField>
            <USeparator />
            <UFormField
              name="role"
              label="Role"
              description="Your unique username for logging in and your profile URL."
              required
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <USelect
                v-model="user.role"
                :items="roleOptions"
                class="w-80"
              />
            </UFormField>
            <USeparator />
          </UPageCard>
        </UForm>
        <div
          v-else-if="status === 'pending'"
          class="py-8 text-center text-muted"
        >
          Loading user...
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
