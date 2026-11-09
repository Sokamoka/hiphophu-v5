<script setup lang="ts">
const profile = reactive({
  avatar: undefined,
  hero: undefined,
  name: 'Ákos Stegner'
})
</script>

<template>
  <UPageCard
    variant="outline"
    class="mb-10"
  >
    <UFormField
      name="avatar"
      label="Avatar"
      description="JPG, GIF or PNG. 1MB Max."
      class="flex max-sm:flex-col justify-between sm:items-center gap-4"
    >
      <div class="flex flex-wrap items-center gap-3">
        <ImageManager
          v-slot="{ file }"
          orientation="vertical"
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
