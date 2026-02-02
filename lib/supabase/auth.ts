import { createClient } from './client'

export type AuthError = {
  message: string
  status?: number
}

export type AuthResponse<T = any> = {
  data: T | null
  error: AuthError | null
}

// Client-side auth functions
export async function signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data, error: null }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data, error: null }
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data, error: null }
}

export async function signOut(): Promise<AuthResponse> {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data: true, error: null }
}

export async function resetPassword(email: string): Promise<AuthResponse> {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data, error: null }
}

export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data, error: null }
}

export async function getCurrentUser() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return { data: null, error: { message: error.message } }
  }

  return { data: user, error: null }
}
