<script setup lang="ts" generic="S extends z.ZodType<unknown, ArtistFormState>">
import type * as z from 'zod'
import type { FormState, FormSubmitEvent, RadioGroupItem, SelectItem } from '@nuxt/ui'
import type { ArtistFormState } from '~~/shared/types/artist'

const props = defineProps<{
  schema: S
}>()

const emit = defineEmits<{
  submit: [event: FormSubmitEvent<z.output<S>>]
}>()
const artist = defineModel<z.input<S>>({ required: true })

function addLink() {
  artist.value.links.push({ platform: 'site', url: '' })
}

const siteUrl = 'https://hiphop.hu/'
const linkPlaceholder = 'https://example.com/felhasznalo'

const platforms = [
  { label: 'Honlap', value: 'site', icon: 'i-ph-globe' },
  { label: 'YouTube', value: 'youtube', icon: 'i-simple-icons-youtube' },
  { label: 'Instagram', value: 'instagram', icon: 'i-simple-icons-instagram' },
  { label: 'Facebook', value: 'facebook', icon: 'i-simple-icons-facebook' },
  { label: 'TikTok', value: 'tiktok', icon: 'i-simple-icons-tiktok' },
  { label: 'Spotify', value: 'spotify', icon: 'i-simple-icons-spotify' },
  { label: 'Apple Music', value: 'apple', icon: 'i-simple-icons-applemusic' },
  { label: 'YouTube Music', value: 'youtubemusic', icon: 'i-simple-icons-youtubemusic' },
  { label: 'LinkedIn', value: 'linkedin', icon: 'i-simple-icons-linkedin' }
]

const typeItems = ref<RadioGroupItem[]>([
  {
    label: 'Művész',
    value: false,
    class: 'w-20'
  },
  {
    label: 'Csapat',
    value: true,
    class: 'w-20'
  }
])

const categoryItems = ref<SelectItem[]>(
  artistCategories.map(category => ({
    label: category,
    value: category
  }))
)
</script>

<template>
  <UForm
    id="user"
    :schema="props.schema"
    :state="artist as FormState<S>"
    @submit="emit('submit', $event)"
  >
    <UPageCard
      title="Artist"
      description="This information will be displayed publicly."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <!-- <UButton
        form="user"
        label="Mentés"
        color="neutral"
        type="submit"
        icon="i-lucide-save"
        class="w-fit lg:ms-auto"
        :loading="saving"
      /> -->
      <slot />
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
            :label="siteUrl"
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
      <!-- <USeparator /> -->
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
  </UForm>
</template>
