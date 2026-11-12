import { createAuthClient } from 'better-auth/vue'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import type { Auth } from '~~/server/utils/auth'

export const authClient = createAuthClient({
  plugins: [adminClient(), inferAdditionalFields<Auth>()]
})
