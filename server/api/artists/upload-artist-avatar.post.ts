import { uploadProfileImage } from '../../utils/artists/uploadProfileImage'

export default defineEventHandler(async event => ({
  avatar: await uploadProfileImage(event, 'avatar')
}))
