import { blob } from 'hub:blob'

export default defineEventHandler(async (event) => {
  return await blob.handleUpload(event, {
    formKey: 'files',
    multiple: true,
    ensure: {
      maxSize: '1MB',
      types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    put: {
      addRandomSuffix: true,
      prefix: 'uploads'
    }
  })
})
