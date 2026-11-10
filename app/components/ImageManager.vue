<script setup lang="ts">
const props = defineProps<{
  orientation?: 'vertical' | 'horizontal'
  outputWidth?: number
  outputHeight?: number
}>()

const imageCropperRef = useTemplateRef('ImageCropper')
const open = ref(false)
const fileRef = ref<HTMLInputElement>()
const selectedFileRef = ref<string>()
const croppedFileRef = ref<string>()

const aspectRatio = computed(() => ((props.outputWidth || 1) / (props.outputHeight || 1)))

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  selectedFileRef.value = URL.createObjectURL(input.files[0]!)
  open.value = true
}

function onFileClick() {
  fileRef.value?.click()
}

function onModalConfirmCrop() {
  imageCropperRef.value?.confirm()
  open.value = false
}
function onConfirmCrop(e: ImageCropperResult) {
  console.log(e)
  croppedFileRef.value = e.dataUrl ?? ''
}

function onDelete() {
  fileRef.value = undefined
  selectedFileRef.value = undefined
  croppedFileRef.value = undefined
}
</script>

<template>
  <div :class="['flex gap-5 w-full', { 'flex-col': orientation === 'vertical' }]">
    <slot :file="croppedFileRef" />

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
        color="error"
        variant="subtle"
        icon="i-ph-x"
        @click="onDelete"
      />
      <UButton
        v-if="selectedFileRef"
        label="Upload"
        icon="i-ph-upload"
        @click="onFileClick"
      />
    </div>

    <UModal
      v-model:open="open"
      title="Kép méretre vágása"
    >
      <template #body>
        <ImageCropper
          ref="ImageCropper"
          :src="selectedFileRef ?? null"
          :show-controls="true"
          :output-width="outputWidth"
          :output-height="outputHeight"
          :aspect-ratio="aspectRatio"
          @confirm="onConfirmCrop"
        />
      </template>

      <template #footer="{ close }">
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          @click="close"
        />
        <UButton
          label="Submit"
          type="button"
          color="neutral"
          @click="onModalConfirmCrop"
        />
      </template>
    </UModal>
  </div>
</template>
