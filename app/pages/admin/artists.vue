<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  path: '/u/artists',
  middleware: 'auth',
  roles: ['ADMIN']
})

const UBadge = resolveComponent('UBadge')
const { data: artists, status } = await useFetch('/api/artists')

type Artist = NonNullable<typeof artists.value>[number]

const columns: TableColumn<Artist>[] = [
  { accessorKey: 'name', header: 'Név' },
  { accessorKey: 'nameId', header: 'Azonosító' },
  {
    accessorKey: 'category',
    header: 'Kategóriák',
    cell: ({ row }) => row.original.category.join(', ')
  },
  {
    accessorKey: 'isActive',
    header: 'Állapot',
    cell: ({ row }) => h(UBadge, {
      color: row.original.isActive ? 'success' : 'neutral',
      variant: 'subtle'
    }, () => row.original.isActive ? 'Aktív' : 'Inaktív')
  },
  { accessorKey: 'createdAt', header: 'Regisztrálva' }
]
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <UContainer>
        <UPageCard
          title="Artists"
          description="Regisztrált előadók"
          variant="naked"
          orientation="horizontal"
          class="mb-4"
        />

        <template v-if="status === 'success' && !artists?.length">
          <UEmpty
            icon="i-lucide-file"
            title="Még nincs artist"
            description="Hozd létre az első artist oldalt."
            :actions="[
              {
                icon: 'i-ph-plus',
                label: 'Saját oldal létrehozása',
                variant: 'subtle',
                to: '/u/artist/add'
              }
            ]"
          />
        </template>
        <UCard
          v-else
          :ui="{ body: 'p-0 sm:p-0' }"
        >
          <UTable
            :data="artists ?? []"
            :columns="columns"
            :loading="status === 'pending'"
            empty="Nincs megjeleníthető artist"
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
