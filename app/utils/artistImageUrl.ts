export function artistImageUrl(artistId: string, filename: string | null | undefined) {
  return filename ? `/images/${encodeURIComponent(artistId)}/${encodeURIComponent(filename)}` : undefined
}
