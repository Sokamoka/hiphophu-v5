import { z } from 'zod'

const dateField = z
  .union([
    z.object({ $date: z.union([z.string(), z.number(), z.date()]) }).transform(v => v.$date),
    z.string(),
    z.number(),
    z.date()
  ])
  .pipe(z.coerce.date())

const list = z.array(z.string()).default([])

export const artistInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameId: z.string().min(1),
  description: z.string().nullish().transform(v => v ?? null),
  isActive: z.boolean().default(true),
  isTeam: z.boolean().default(false),
  category: list,
  connections: list,
  videos: list,
  images: list,
  editor: list,
  links: list,
  tags: list,
  pictures: z
    .object({ header: z.string().optional(), avatar: z.string().optional() })
    .nullish()
    .transform(v => v ?? {}),
  createdAt: dateField,
  updatedAt: dateField,
  publishedAt: dateField.nullish().transform(v => v ?? null)
})

export type ArtistInput = z.output<typeof artistInputSchema>
export type ArtistFormInput = z.input<typeof artistInputSchema>
