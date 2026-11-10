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
              form="user"
              label="Mentés"
              color="neutral"
              type="submit"
              icon="i-lucide-save"
              class="w-fit lg:ms-auto"
              :loading="saving"
            />
          </UPageCard>
        </ArtistProfileForm>
        <!-- <UForm
          id="user"
          :schema="userSchema"
          :state="artist"
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
              form="user"
              label="Mentés"
              color="neutral"
              type="submit"
              icon="i-lucide-save"
              class="w-fit lg:ms-auto"
              :loading="saving"
            />
          </UPageCard>

          <UPageCard
            variant="outline"
            class="mb-10"
          >
            <UFormField
              name="name"
              label="Artist Name"
              description="Will appear on receipts, invoices, and other communication."
              required
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <UInput
                v-model="artist.name"
                autocomplete="off"
                class="w-96"
              />
            </UFormField>

            <USeparator />

            <UFormField
              name="nameId"
              label="Site egyedi útvonal"
              description="Will appear on receipts, invoices, and other communication."
              required
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <UFieldGroup class="w-96">
                <UBadge
                  color="neutral"
                  variant="subtle"
                  size="lg"
                  label="https://hiphop.hu/"
                  class="rounded-full"
                  :ui="{ base: 'px-4' }"
                />
                <UInput
                  v-model="artist.nameId"
                  autocomplete="off"
                  class="w-full"
                />
              </UFieldGroup>
            </UFormField>

            <USeparator />

            <UFormField
              name="category"
              label="Category"
              description="Will appear on receipts, invoices, and other communication."
              required
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <USelect
                v-model="artist.category"
                :items="categoryItems"
                multiple
                autocomplete="off"
                placeholder="Select category"
                class="w-96"
              />
            </UFormField>

            <USeparator />

            <UFormField
              name="isTeam"
              label="Type"
              description="Will appear on receipts, invoices, and other communication."
              required
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <URadioGroup
                v-model="artist.isTeam"
                indicator="hidden"
                orientation="horizontal"
                variant="table"
                default-value="System"
                :items="typeItems"
              />
            </UFormField>

            <USeparator />

            <UFormField
              name="description"
              label="Description"
              description="Used to sign in, for email receipts and product updates."
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <UTextarea
                v-model="artist.description"
                color="neutral"
                variant="subtle"
                placeholder="Description"
                class="w-96"
              />
            </UFormField>
          </UPageCard>

          <UPageCard
            title="Külső hivatkozások"
            description="This information will be displayed publicly."
            variant="naked"
            orientation="horizontal"
            class="mb-4"
          />
          <UCard variant="outline">
            <div class="space-y-5">
              <UEmpty
                v-if="artist.links.length === 0"
                title="Nincs külső hivatkozás beállítva"
                description="Kattints a Hivatkozás hozzáadása gombra"
              >
                <template #actions>
                  <UButton
                    icon="i-lucide-plus"
                    variant="subtle"
                    size="sm"
                    label="Hivatkozás hozzáadása"
                    @click="addLink"
                  />
                </template>
              </UEmpty>
              <template
                v-for="(socialLink, index) in artist.links"
                :key="index"
              >
                <div class="flex gap-3 items-start">
                  <USelect
                    v-model="socialLink.platform"
                    :items="platforms"
                    :ui="{ content: 'min-w-fit' }"
                    class="w-48"
                  />
                  <UFormField
                    :name="`links.${index}.url`"
                    required
                    class="w-full"
                  >
                    <UInput
                      v-model="socialLink.url"
                      class="w-full"
                      :placeholder="linkPlaceholder"
                    />
                  </UFormField>
                  <UButton
                    icon="i-ph-x"
                    color="error"
                    variant="ghost"
                    @click="artist.links.splice(index, 1)"
                  />
                </div>
              </template>
            </div>

            <template
              v-if="artist.links.length > 0"
              #footer
            >
              <UButton
                icon="i-lucide-plus"
                variant="subtle"
                size="sm"
                label="Hivatkozás hozzáadása"
                @click="addLink"
              />
            </template>
          </UCard>
        </UForm> -->
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
