<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const UBadge = resolveComponent('UBadge')

definePageMeta({ middleware: 'auth', roles: ['ADMIN', 'USER'] })

const { data: users, status } = await useFetch('/api/admin/users')

type User = NonNullable<typeof users.value>[number]

const columns: TableColumn<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role', cell: ({ row }) => {
    const color = {
      ADMIN: 'error' as const,
      EDITOR: 'warning' as const,
      USER: 'success' as const
    }[row.getValue('status') as string]

    return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
      row.getValue('role')
    )
  } },
  { accessorKey: 'createdAt', header: 'Registered' }
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
