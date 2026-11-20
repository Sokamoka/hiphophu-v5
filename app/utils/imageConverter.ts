export function convertToWebP(file: File, quality?: number, maxWidth?: number): Promise<File>
export function convertToWebP(files: File[], quality?: number, maxWidth?: number): Promise<File[]>
export function convertToWebP(fileOrFiles: File | File[], quality = 0.82, maxWidth = 1920): Promise<File | File[]> {
  if (Array.isArray(fileOrFiles)) {
    return Promise.all(fileOrFiles.map(file => convertFileToWebP(file, quality, maxWidth)))
  }

  return convertFileToWebP(fileOrFiles, quality, maxWidth)
}

function convertFileToWebP(file: File, quality: number, maxWidth: number): Promise<File> {
  if (file.type === 'image/webp') {
    return Promise.resolve(file)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas hiba'))

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('WebP konvertálás sikertelen'))

          const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
          resolve(new File([blob], newName, { type: 'image/webp' }))
        },
        'image/webp',
        quality
      )
    }

    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }

    img.src = url
  })
}
