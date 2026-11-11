<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'

const pictures = ref<{ title: string, image: string }[]>([])
const el = useTemplateRef('el')

useSortable(el, pictures, {
  handle: '[data-drag-handle]',
  animation: 320
} as Parameters<typeof useSortable>[2])

function onAddPicture(event: File[] | null | undefined) {
  if (!event) return
  console.log(event)
  pictures.value.push({ title: '', image: `https://picsum.photos/512/512/?r=${Math.random()}` })
}
</script>

<template>
  <UFileUpload
    multiple
    label="Drop your images here"
    description="SVG, PNG, JPG or GIF (max. 2MB)"
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
      :key="picture.title"
    >
      <UBlogPost
        orientation="horizontal"
        variant="outline"
        :image="picture.image"
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
