'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Ensures a user profile exists in the public.users table
 * This is a fallback in case the database trigger fails
 */
export async function ensureUserProfile() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if profile exists
  const { data: profile, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking profile:', fetchError)
    return { success: false, error: fetchError.message }
  }

  // If profile doesn't exist, create it
  if (!profile) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        username: user.user_metadata?.name || user.user_metadata?.full_name || null,
        avatar_id: user.user_metadata?.avatar_url || null,
      })

    if (insertError) {
      console.error('Error creating profile:', insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true, created: true }
  }

  return { success: true, created: false }
}
