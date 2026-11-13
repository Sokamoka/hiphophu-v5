export function removeDiacritics(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '')
}
