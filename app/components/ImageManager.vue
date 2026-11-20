<script setup lang="ts">
const props = defineProps<{
  orientation?: 'vertical' | 'horizontal'
  outputWidth?: number
  outputHeight?: number
}>()

const emit = defineEmits<{
  confirm: [result: ImageCropperResult]
}>()

const imageCropperRef = useTemplateRef('ImageCropper')
const fileInputRef = useTemplateRef<HTMLInputElement>('InputRef')
const open = ref(false)
const selectedFile = ref<string>()
const croppedFileRef = ref<ImageCropperResult>()

const aspectRatio = computed(() => ((props.outputWidth || 1) / (props.outputHeight || 1)))

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  selectedFile.value = URL.createObjectURL(input.files[0]!)
  open.value = true
}

function onFileClick() {
  fileInputRef.value?.click()
}

function onModalConfirmCrop() {
  imageCropperRef.value?.confirm()
  open.value = false
}
function onConfirmCrop(e: ImageCropperResult) {
  console.log(e)
  croppedFileRef.value = e
}

function onDelete() {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  selectedFile.value = undefined
  croppedFileRef.value = undefined
}

function onUpload() {
  if (!croppedFileRef.value) return
  emit('confirm', croppedFileRef.value)
}
</script>

<template>
  <div :class="['flex gap-5 w-full', { 'flex-col': orientation === 'vertical' }]">
    <slot :file="croppedFileRef?.dataUrl ?? ''" />

    <div class="flex gap-3 items-start">
      <UButton
        label="Choose"
        variant="subtle"
        icon="i-ph-image-square"
        @click="onFileClick"
      />
      <input
        ref="InputRef"
        type="file"
        class="hidden"
        accept=".jpg, .jpeg, .png, .gif, .webp"
        @change="onFileChange"
      >
      <UButton
        color="error"
        variant="subtle"
        icon="i-ph-x"
        @click="onDelete"
      />
      <UButton
        v-if="selectedFile"
        label="Upload"
        icon="i-ph-upload"
        @click="onUpload"
      />
    </div>

    <UModal
      v-model:open="open"
      title="Kép méretre vágása"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <ImageCropper
          ref="ImageCropper"
          :src="selectedFile ?? null"
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
