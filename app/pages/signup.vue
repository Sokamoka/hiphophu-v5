<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})

const toast = useToast()
const { signUp, signInSocial } = useAuth()
const loading = ref(false)

const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Name',
  placeholder: 'Enter your name'
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email'
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}, {
  name: 'location',
  type: 'text' as const,
  label: 'Location',
  placeholder: 'Enter your city'
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: async () => {
    loading.value = true
    try {
      const { error } = await signInSocial({
        provider: 'google',
        callbackURL: '/'
      })
      if (error) {
        toast.add({ title: 'Sign up failed', description: error.message || 'Could not sign up with Google', color: 'error' })
      }
    } finally {
      loading.value = false
    }
  }
}]

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  location: z.string().trim().max(100).optional()
})

type Schema = z.output<typeof schema>

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const { error } = await signUp({
      name: data.name,
      location: data.location || undefined,
      email: data.email,
      password: data.password
    })
    if (error) {
      toast.add({ title: 'Sign up failed', description: error.message || 'Could not create the account', color: 'error' })
      return
    }
    await navigateTo('/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    :loading="loading"
    title="Create an account"
    :submit="{ label: 'Create account' }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account? <ULink
        to="/login"
        class="text-primary font-medium"
      >Login</ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
