<script setup lang="ts">
import type { ArtistFormState } from '~~/shared/types/artist'

const profile = defineModel<ArtistFormState>({ required: true })

const route = useRoute()
const artistId = String(route.params.id)
const toast = useToast()
const modal = useConfirmModal()
const uploading = ref(false)
const deleting = ref<'avatar' | 'hero'>()
const busy = computed(() => uploading.value || !!deleting.value)
const maxFileSize = 1024 * 1024

async function uploadImage(field: 'avatar' | 'hero', payload: ImageCropperResult) {
  const file = payload.file
  if (busy.value) return

  if (!file) {
    toast.add({
      title: 'Sikertelen képfeltöltés',
      description: 'A kivágott kép nem tartalmaz feltölthető fájlt.',
      color: 'error'
    })
    return
  }

  if (file.type !== 'image/webp' || file.size === 0) {
    toast.add({
      title: 'Érvénytelen kép',
      description: 'A képnek WebP formátumúnak kell lennie.',
      color: 'error'
    })
    return
  }

  if (file.size > maxFileSize) {
    toast.add({
      title: 'Túl nagy fájlméret',
      description: 'A kép legfeljebb 1 MB méretű lehet.',
      color: 'error'
    })
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const options = { method: 'POST' as const, body: formData, query: { artistId } }
    const image = field === 'avatar'
      ? await $fetch('/api/artists/upload-artist-avatar', options)
      : await $fetch('/api/artists/upload-artist-hero', options)
    profile.value = { ...profile.value, ...image }
    toast.add({
      title: field === 'avatar' ? 'Avatar feltöltve' : 'Hero kép feltöltve',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Sikertelen képfeltöltés',
      description: error instanceof Error ? error.message : 'A kép feltöltése nem sikerült.',
      color: 'error'
    })
  } finally {
    uploading.value = false
  }
}

async function deleteImage(field: 'avatar' | 'hero') {
  if (busy.value || !profile.value[field]) return

  const instance = modal.open()
  if (!(await instance.result))
    return

  deleting.value = field
  try {
    const { filename } = await $fetch('/api/artists/profile-image', {
      method: 'DELETE',
      query: { artistId, field }
    })
    profile.value = { ...profile.value, [field]: filename }
    toast.add({
      title: field === 'avatar' ? 'Avatar törölve' : 'Borítókép törölve',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Sikertelen képtörlés',
      description: error instanceof Error ? error.message : 'A kép törlése nem sikerült.',
      color: 'error'
    })
  } finally {
    deleting.value = undefined
  }
}
</script>

<template>
  <UPageCard
    variant="outline"
    class="mb-10"
  >
    <UFormField
      name="avatar"
      label="Avatar"
      description="JPG, GIF, PNG or WebP."
      class="flex max-sm:flex-col justify-between sm:items-center gap-4"
    >
      <div class="flex flex-wrap items-center gap-3">
        <ImageManager
          v-slot="{ file }"
          :key="profile.avatar ?? undefined"
          orientation="vertical"
          :output-width="256"
          :output-height="256"
          :has-saved-image="!!profile.avatar"
          :disabled="busy"
          :deleting="deleting === 'avatar'"
          @confirm="uploadImage('avatar', $event)"
          @delete="deleteImage('avatar')"
        >
          <UAvatar
            :src="file || artistImageUrl(artistId, profile.avatar)"
            provider="none"
            icon="i-ph-user"
            :ui="{ root: 'size-56', fallback: 'text-7xl', icon: 'size-16' }"
          />
        </ImageManager>
      </div>
    </UFormField>

    <USeparator />

    <UFormField
      name="hero"
      label="Hero"
      description="JPG, GIF, PNG or WebP. 1 MB after cropping."
      class="flex flex-col justify-between gap-4"
    >
      <div class="flex flex-wrap items-center gap-3">
        <ImageManager
          v-slot="{ file }"
          :key="profile.hero ?? undefined"
          orientation="vertical"
          :output-width="1280"
          :output-height="720"
          :has-saved-image="!!profile.hero"
          :disabled="busy"
          :deleting="deleting === 'hero'"
          @confirm="uploadImage('hero', $event)"
          @delete="deleteImage('hero')"
        >
          <UEmpty
            v-if="!profile.hero && !file"
            icon="i-ph-image"
            title="No hero Image selected"
            description="It looks like you haven't added any projects. Create one to get started."
          />
          <div
            v-else
            class="aspect-video border border-dashed border-muted"
          >
            <img
              v-if="file || profile.hero"
              :src="file || artistImageUrl(artistId, profile.hero)"
              alt=""
              class="aspect-video w-full object-cover"
            >
          </div>
        </ImageManager>
      </div>
    </UFormField>
  </UPageCard>
</template>
