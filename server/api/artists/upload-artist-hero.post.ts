import { uploadProfileImage } from '../../utils/artists/uploadProfileImage'

export default defineEventHandler(async event => ({
  hero: await uploadProfileImage(event, 'hero')
}))
