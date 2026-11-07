<script setup lang="ts">
definePageMeta({
  path: '/u/artist'
})
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <UContainer>
        <UEmpty
          icon="i-lucide-file"
          title="No projects found"
          description="It looks like you haven't added any projects. Create one to get started."
          :actions="[
            {
              icon: 'i-ph-plus',
              label: 'Saját oldal létrehozása',
              variant: 'subtle',
              to: '/u/artist/add'
            }
          ]"
        />
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
