<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import type { DropdownMenuItem } from '@nuxt/ui'

const route = useRoute()

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { user, refresh, signOut } = useAuth()
if (!user.value) await refresh()

const { open: searchOpen } = useContentSearch()

const open = ref(false)

const isDocs = computed(() => route.path === '/docs' || route.path.startsWith('/docs/'))

const accountItems: DropdownMenuItem[] = [
  {
    type: 'label',
    label: user.value?.name ?? '',
    description: user.value?.email ?? ''
  },
  {
    type: 'separator'
  },
  {
    label: 'Beállítások',
    icon: 'i-lucide-settings',
    to: '/s'
  },
  {
    type: 'separator'
  },
  {
    label: 'Sign out',
    icon: 'i-lucide-log-out',
    color: 'error',
    onSelect: async () => {
      await signOut()
      await navigateTo('/')
    }
  }]

// Both modals portal to `body` with no z-index, so after a client-side layout
// change the menu can end up painted over the search
watch(searchOpen, (value) => {
  if (value) {
    open.value = false
  }
})

const items = computed(() => [
  [

    {
      label: 'Zene',
      to: '/docs',
      active: isDocs.value
    },
    {
      label: 'DJ',
      to: '/docs',
      active: isDocs.value
    },
    {
      label: 'Break Tánc',
      to: '/a/break'
    },
    {
      label: 'Graffiti',
      to: '/docs',
      active: isDocs.value
    }

  ],
  [
    ...(user.value?.role === 'ADMIN'
      ? [{
          label: 'Admin',
          // to: '/u/users',
          children: [
            {
              label: 'Users',
              icon: 'i-ph-user-circle',
              to: '/u/users'
            },
            {
              label: 'Artists',
              icon: 'i-ph-users',
              to: '/u/artists'
            }
          ]
        }]
      : [])

  ]
])
</script>

<template>
  <UHeader v-model:open="open">
    <template #left>
      <NuxtLink
        to="/"
        class="focus-visible:outline-3 outline-primary/25 rounded-md p-1 -ms-1"
      >
        <AppLogo class="w-auto h-10 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      content-orientation="vertical"
    />

    <template #right>
      <UColorModeButton />

      <UContentSearchButton />

      <template v-if="!user">
        <UButton
          icon="i-lucide-log-in"
          color="neutral"
          variant="ghost"
          to="/login"
          class="lg:hidden"
        />

        <UButton
          label="Sign in"
          color="neutral"
          variant="outline"
          to="/login"
          class="hidden lg:inline-flex"
        />

        <UButton
          label="Sign up"
          color="neutral"
          trailing-icon="i-lucide-arrow-right"
          class="hidden lg:inline-flex"
          to="/signup"
        />
      </template>

      <template v-else>
        <UButton
          label="Saját oldalaim"
          variant="subtle"
          icon="i-ph-house"
          to="/u/artist"
          block
          class="lg:inline-fit"
        />

        <UDropdownMenu
          :items="accountItems"
          :content="{
            sideOffset: 4
          }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            class="gap-2"
          >
            <UAvatar :alt="user.name" />
          </UButton>
        </UDropdownMenu>
      </template>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <template v-if="isDocs">
        <USeparator class="my-6" />

        <UContentNavigation
          :navigation="navigation"
          highlight
        />
      </template>

      <template v-if="!user">
        <USeparator class="my-6" />

        <UButton
          label="Sign in"
          color="neutral"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
        />
        <UButton
          label="Sign up"
          color="neutral"
          to="/signup"
          block
        />
      </template>
    </template>
  </UHeader>
</template>
