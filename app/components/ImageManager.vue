<script setup lang="ts">
defineProps<{
  orientation?: 'vertical' | 'horizontal'
}>()

const fileRef = ref<HTMLInputElement>()
const selectedFileRef = ref<string>()

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  // profile.avatar = URL.createObjectURL(input.files[0]!)
  selectedFileRef.value = URL.createObjectURL(input.files[0]!)
}

function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <div :class="['flex gap-5 w-full', { 'flex-col': orientation === 'vertical' }]">
    <slot :file="selectedFileRef" />
    <div class="flex gap-3 items-start">
      <UButton
        label="Choose"
        variant="subtle"
        icon="i-ph-image-square"
        @click="onFileClick"
      />
      <input
        ref="fileRef"
        type="file"
        class="hidden"
        accept=".jpg, .jpeg, .png, .gif"
        @change="onFileChange"
      >
      <UButton
        label="Delete"
        color="error"
        variant="subtle"
        icon="i-ph-x"
        @click="onFileClick"
      />
      <UButton
        v-if="selectedFileRef"
        label="Upload"
        icon="i-ph-upload"
        @click="onFileClick"
      />
    </div>
  </div>
</template>
