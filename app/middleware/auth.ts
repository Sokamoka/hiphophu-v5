import type { Role } from '~~/server/database/schema/auth'

declare module '#app' {
  interface PageMeta {
    roles?: Role[]
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, refresh, hasRole } = useAuth()

  // SSR resolves from the request cookie; the client reuses hydrated state
  if (!user.value) await refresh()

  if (!user.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  const required = to.meta.roles
  if (required?.length && !hasRole(required)) {
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Forbidden' }))
  }
})
