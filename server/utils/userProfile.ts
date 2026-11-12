import * as z from 'zod'
import { LANGUAGES } from '../database/schema'

// Empty strings are stored as NULL; undefined leaves the column untouched
const optionalText = (max: number, min = 0) => z.string().trim().max(max)
  .refine(v => v.length === 0 || v.length >= min, `Must be at least ${min} characters`)
  .transform(v => v || null)
  .optional()

export const userProfileFields = {
  nickname: optionalText(40, 2),
  location: optionalText(100),
  language: z.enum(LANGUAGES).optional()
}
