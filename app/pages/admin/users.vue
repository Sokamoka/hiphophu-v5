<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  path: '/u/users',
  middleware: 'auth',
  roles: ['ADMIN']
})

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

const { data: users, status } = await useFetch('/api/admin/users')

type User = NonNullable<typeof users.value>[number]

const columns: TableColumn<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'nickname', header: 'Nickname' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'language', header: 'Language' },
  { accessorKey: 'role', header: 'Role', cell: ({ row }) => {
    const color = {
      ADMIN: 'error' as const,
      EDITOR: 'warning' as const,
      USER: 'success' as const
    }[row.getValue('role') as string]

    return h(UBadge, { class: 'capitalize', variant: 'subtle', color, size: 'md' }, () =>
      row.getValue('role')
    )
  } },
  { accessorKey: 'createdAt', header: 'Registered' },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      console.log(row)
      return h(UButton, {
        'icon': 'i-lucide-pencil',
        'color': 'neutral',
        'variant': 'ghost',
        'aria-label': 'Szerkesztés',
        'to': `/u/users/edit/${row.original.id}`
      })
    }
  }
]
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <UContainer>
        <UPageCard
          title="Users"
          description="Registered users"
          variant="naked"
          orientation="horizontal"
          class="mb-4"
        />

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <UTable
            :data="users ?? []"
            :columns="columns"
            :loading="status === 'pending'"
            empty="No registered users"
          >
            <template #createdAt-cell="{ getValue }">
              {{ new Date(getValue<string>()).toLocaleString('hu-HU') }}
            </template>
          </UTable>
        </UCard>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
