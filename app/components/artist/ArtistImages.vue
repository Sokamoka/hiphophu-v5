<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'

const pictures = ref<{ title: string, image: string }[]>([])
const el = useTemplateRef('el')
const files = shallowRef<File[]>([])
const toast = useToast()
const uploading = ref(false)
const route = useRoute()
const artistId = String(route.params.id)
const maxFileSize = 1024 * 1024

const upload = useUpload(`/api/artists/upload-artist-pictures?artistId=${encodeURIComponent(artistId)}`, {
  multiple: true
})

useSortable(el, pictures, {
  handle: '[data-drag-handle]',
  animation: 320
} as Parameters<typeof useSortable>[2])

async function onAddPicture(event: File[] | null | undefined) {
  if (!event
  ) return
  files.value = event
}

async function onUploadArtistPicture() {
  if (files.value.length === 0 || uploading.value) return
  uploading.value = true
  try {
    const webpFiles = await convertToWebP(files.value)
    const oversizedFiles = webpFiles.filter(file => file.size > maxFileSize)
    if (oversizedFiles.length > 0) {
      toast.add({
        title: 'Túl nagy fájlméret',
        description: `A konvertált képek legfeljebb 1 MB méretűek lehetnek. Túl nagy fájlok: ${oversizedFiles.map(file => file.name).join(', ')}`,
        color: 'error'
      })
      return
    }

    const uploadedFiles = await upload(webpFiles)
    files.value = []
    pictures.value = uploadedFiles.map(file => ({ title: '', image: `/images/${file.pathname}` }))
    toast.add({
      title: 'Képek feltöltve',
      description: `${uploadedFiles.length} kép sikeresen feltöltve.`,
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Sikertelen képfeltöltés',
      description: error instanceof Error ? error.message : 'A képek feltöltése nem sikerült.',
      color: 'error'
    })
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <UFileUpload
    multiple
    :model-value="files"
    :disabled="uploading"
    label="Drop your images here"
    description="PNG, JPG, WebP or GIF (max. 1MB)"
    accept="image/*"
    :ui="{
      base: 'min-h-56', files: 'md:grid-cols-6 grid-cols-2'
    }"
    @update:model-value="onAddPicture"
  />

  <div class="flex justify-end p-4">
    <UButton
      variant="solid"
      icon="i-ph-upload"
      label="Feltöltés"
      :loading="uploading"
      :disabled="uploading || files.length === 0"
      @click="onUploadArtistPicture"
    />
  </div>

  <UPageCard
    v-if="pictures.length > 0"
    title="Feltöltött képek"
    variant="naked"
    orientation="horizontal"
    class="mb-3 mt-8"
  />

  <ul
    ref="el"
    class="mt-5 space-y-3"
  >
    <li
      v-for="(picture, index) in pictures"
      :key="picture.image"
    >
      <UBlogPost
        orientation="horizontal"
        variant="outline"
        :image="{ src: picture.image, provider: 'none' }"
        :ui="{ root: 'items-center lg:flex lg:flex-row', header: 'lg:w-64 shrink-0', body: 'flex-1' }"
      >
        <template #footer>
          <UButton
            icon="i-lucide-grip-vertical"
            color="neutral"
            variant="ghost"
            class="cursor-grab active:cursor-grabbing me-3"
            data-drag-handle
            aria-label="Átrendezés"
          />
        </template>

        <template #authors>
          <UButton
            icon="i-ph-trash"
            color="error"
            label="Törlés"
            size="xs"
            @click="pictures.splice(index, 1)"
          />
        </template>

        <template #title>
          <UFormField label="Képaláírás">
            <UInput
              v-model.lazy="picture.title"
              class="w-full"
            />
          </UFormField>
        </template>
      </UBlogPost>
    </li>
  </ul>
</template>
