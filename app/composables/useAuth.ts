import type { Role, Language, Theme } from '~~/server/database/schema/auth'

export interface AuthUser { id: string, name: string, email: string, image?: string | null, location?: string | null, language: Language, theme: Theme, role: Role }
export interface AuthSession { id: string, expiresAt: string | Date, userId: string }
interface SessionPayload { user: AuthUser, session: AuthSession }

export function useAuth() {
  const payload = useState<SessionPayload | null>('auth:session', () => null)
  const fetcher = useRequestFetch() // forwards cookies during SSR

  async function refresh() {
    payload.value = await fetcher<SessionPayload | null>('/api/auth/get-session').catch(() => null)
    return payload.value
  }

  const user = computed(() => payload.value?.user ?? null)
  const session = computed(() => payload.value?.session ?? null)
  const hasRole = (role: Role | Role[]) =>
    !!user.value && (Array.isArray(role) ? role : [role]).includes(user.value.role)

  return {
    user,
    session,
    hasRole,
    refresh,
    signInSocial: authClient.signIn.social,
    signIn: async (...args: Parameters<typeof authClient.signIn.email>) => {
      const res = await authClient.signIn.email(...args)
      await refresh()
      return res
    },
    signUp: async (...args: Parameters<typeof authClient.signUp.email>) => {
      const res = await authClient.signUp.email(...args)
      await refresh()
      return res
    },
    signOut: async () => {
      const res = await authClient.signOut()
      payload.value = null
      return res
    }
  }
}
