<script setup lang="ts" generic="S extends z.ZodType<unknown, ArtistFormState>">
import type * as z from 'zod'
import { useSortable } from '@vueuse/integrations/useSortable'
import { kebabCase, splitByCase } from 'scule'
import type { FormState, FormSubmitEvent, RadioGroupItem, SelectItem } from '@nuxt/ui'
import { removeDiacritics } from '~/utils/string'
import type { ArtistFormState } from '~~/shared/types/artist'

const props = defineProps<{
  schema: S
}>()

const emit = defineEmits<{
  submit: [event: FormSubmitEvent<z.output<S>>]
}>()
const artist = defineModel<z.input<S>>({ required: true })

const descriptionMaxLength = 512
const siteUrl = 'https://hiphop.hu/'
const linkPlaceholder = 'https://example.social/felhasznalo'

const platforms = [
  { label: 'Honlap', value: 'site', icon: 'i-ph-globe' },
  { label: 'YouTube', value: 'youtube', icon: 'i-simple-icons-youtube' },
  { label: 'Instagram', value: 'instagram', icon: 'i-simple-icons-instagram' },
  { label: 'Facebook', value: 'facebook', icon: 'i-simple-icons-facebook' },
  { label: 'TikTok', value: 'tiktok', icon: 'i-simple-icons-tiktok' },
  { label: 'Spotify', value: 'spotify', icon: 'i-simple-icons-spotify' },
  { label: 'Apple Music', value: 'applemusic', icon: 'i-simple-icons-applemusic' },
  { label: 'YouTube Music', value: 'youtubemusic', icon: 'i-simple-icons-youtubemusic' },
  { label: 'LinkedIn', value: 'linkedin', icon: 'i-simple-icons-linkedin' }
]

const el = useTemplateRef('el')

useSortable(el, artist.value.links, {
  handle: '[data-drag-handle]',
  animation: 320
} as Parameters<typeof useSortable>[2])

const l = computed(() => (descriptionMaxLength - artist.value.description.length).toString())

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

function createPageName() {
  const name = splitByCase(removeDiacritics(artist.value.name), ['-', '_', '/', '.', ' '])
  artist.value.nameId = kebabCase(name)
}

function addLink() {
  artist.value.links.push({ platform: 'site', url: '' })
}

function removeLink(index: number) {
  artist.value.links.splice(index, 1)
}
</script>

<template>
  <UForm
    id="artist-profile-form"
    :schema="props.schema"
    :state="artist as FormState<S>"
    @submit="emit('submit', $event)"
  >
    <slot />

    <UPageCard
      variant="outline"
      class="mb-10"
    >
      <UFormField
        name="active"
        label="Aktív artist"
        description="Will appear on receipts, invoices, and other communication."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <USwitch
          v-model="artist.isActive"
          :label="artist.isActive ? 'aktív' : 'inaktív'"
          size="xl"
          class="w-96"
        />
      </UFormField>

      <USeparator />

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
          @change="createPageName"
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
        :help="l"
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UTextarea
          v-model="artist.description"
          color="neutral"
          variant="subtle"
          placeholder="Description"
          :maxlength="descriptionMaxLength"
          autoresize
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
      <div
        ref="el"
        class="space-y-5"
      >
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
            <UButton
              icon="i-lucide-grip-vertical"
              color="neutral"
              variant="ghost"
              class="cursor-grab active:cursor-grabbing me-3"
              data-drag-handle
              aria-label="Átrendezés"
            />

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
              @click="removeLink(index)"
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
