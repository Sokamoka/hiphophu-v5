<script setup lang="ts">
const props = defineProps<{
  modelValue: ArtistFormState
}>()

const route = useRoute()
const artistId = String(route.params.id)
const toast = useToast()
const uploading = ref(false)
const maxFileSize = 1024 * 1024

// const { data: artist, error: artistError } = await useFetch<{ avatar: string | null, hero: string | null }>(
//   `/api/artists/${encodeURIComponent(artistId)}`
// )

// if (artistError.value) throw artistError.value

const profile = reactive({
  avatar: props.modelValue?.avatar,
  hero: props.modelValue?.hero
})

async function uploadImage(field: 'avatar' | 'hero', payload: ImageCropperResult) {
  const file = payload.file
  if (uploading.value) return

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
    if (field === 'avatar') {
      profile.avatar = (await $fetch('/api/artists/upload-artist-avatar', options)).avatar
    } else {
      profile.hero = (await $fetch('/api/artists/upload-artist-hero', options)).hero
    }
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
          orientation="vertical"
          :output-width="256"
          :output-height="256"
          @confirm="uploadImage('avatar', $event)"
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
          orientation="vertical"
          :output-width="1280"
          :output-height="720"
          @confirm="uploadImage('hero', $event)"
        >
          <div class="aspect-video border border-dashed border-muted">
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
