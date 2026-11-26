export function artistImageUrl(artistId: string, filename: string | null | undefined) {
  return filename ? imageUrl([artistId, filename]) : undefined
}

export function mediaImageUrl(pathname: string) {
  return imageUrl(pathname.split('/'))
}

function imageUrl(segments: string[]) {
  return `/images/${segments.map(encodeURIComponent).join('/')}`
}
