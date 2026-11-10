<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()

const items: TabsItem[] = [
  {
    label: 'Videók',
    icon: 'i-lucide-video',
    value: 'video'
  },
  {
    label: 'Képek',
    icon: 'i-lucide-image',
    value: 'picture'
  }
]

const active = computed({
  get() {
    return (route.query.tab as string) || 'video'
  },
  set(tab) {
    router.push({
      query: { tab },
      hash: `#${tab}`
    })
  }
})

const desc = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
</script>

<template>
  <div class="grid gap-5">
    <UPageHero
      :title="$route.path"
      :description="desc"
      orientation="horizontal"
    >
      <template #top>
        <div class="absolute inset-0 -z-10">
          <img
            :src="`https://picsum.photos/1280/720?r=${$route.path}`"
            alt=""
            class="size-full object-cover"
          >
          <div class="absolute inset-0 bg-linear-to-r from-default to-transparent" />
          <div class="absolute inset-0 bg-linear-to-b from-transparent from-0% via-transparent via-60% to-default to-100%" />
        </div>
      </template>
    </UPageHero>

    <UContainer>
      <UTabs
        v-model="active"
        :content="false"
        :items="items"
        class="w-full"
        variant="link"
      />
      <pre>{{ $route }}</pre>
    </UContainer>
  </div>
</template>
