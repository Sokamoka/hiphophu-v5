<script setup lang="ts">
const route = useRoute()
const artistId = String(route.params.id)
const toast = useToast()
const uploading = ref(false)
const maxFileSize = 1024 * 1024

const { data: artist, error: artistError } = await useFetch<{
  pictures: { avatar?: string } | null
}>(`/api/artists/${encodeURIComponent(artistId)}`)

if (artistError.value) throw artistError.value

const profile = reactive({
  avatar: artist.value?.pictures?.avatar,
  hero: undefined,
  name: 'Ákos Stegner'
})

async function onArtistAvatarConfirm(payload: ImageCropperResult) {
  const file = payload.file
  if (uploading.value) return

  if (!file) {
    toast.add({
      title: 'Sikertelen képfeltöltés',
      description: 'A kivágott avatar nem tartalmaz feltölthető fájlt.',
      color: 'error'
    })
    return
  }

  if (file.type !== 'image/webp' || file.size === 0) {
    toast.add({
      title: 'Érvénytelen kép',
      description: 'Az avatarnak WebP formátumúnak kell lennie.',
      color: 'error'
    })
    return
  }

  if (file.size > maxFileSize) {
    toast.add({
      title: 'Túl nagy fájlméret',
      description: 'Az avatar legfeljebb 1 MB méretű lehet.',
      color: 'error'
    })
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await $fetch<{ avatar: string }>(
      `/api/artists/upload-artist-avatar?artistId=${encodeURIComponent(artistId)}`,
      { method: 'POST', body: formData }
    )
    profile.avatar = result.avatar
    toast.add({
      title: 'Avatar feltöltve',
      description: 'Az avatar sikeresen frissítve.',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Sikertelen képfeltöltés',
      description: error instanceof Error ? error.message : 'Az avatar feltöltése nem sikerült.',
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
          @confirm="onArtistAvatarConfirm"
        >
          <UAvatar
            :src="file || profile.avatar"
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
      description="JPG, GIF or PNG. 1MB Max."
      class="flex flex-col justify-between gap-4"
    >
      <div class="flex flex-wrap items-center gap-3">
        <ImageManager
          v-slot="{ file }"
          orientation="vertical"
          :output-width="1280"
          :output-height="720"
        >
          <div class="aspect-video border border-dashed border-muted">
            <img
              v-if="file"
              :src="file"
              alt=""
              class="aspect-video w-full object-cover"
            >
          </div>
        </ImageManager>
      </div>
    </UFormField>
  </UPageCard>
</template>
