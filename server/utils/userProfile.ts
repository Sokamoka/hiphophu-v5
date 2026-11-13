import * as z from 'zod'
import { LANGUAGES, THEMES } from '../database/schema'

// Empty strings are stored as NULL; undefined leaves the column untouched
const optionalText = (max: number) => z.string().trim().max(max)
  .transform(v => v || null)
  .optional()

export const userProfileFields = {
  location: optionalText(100),
  language: z.enum(LANGUAGES).optional(),
  theme: z.enum(THEMES).optional()
}
