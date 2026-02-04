import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    try {
      // Exchange code for session
      const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

      if (authError) {
        console.error('Auth error:', authError)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError.message)}`)
      }

      if (user) {
        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        // If profile doesn't exist, create it (fallback if trigger failed)
        if (!profile && !profileError) {
          console.log('Creating missing user profile for:', user.id)
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              username: user.user_metadata?.name || null,
              avatar_id: user.user_metadata?.avatar_url || null,
            })

          if (insertError) {
            console.error('Failed to create user profile:', insertError)
            // Don't block login if profile creation fails - user can still access the app
            // The profile will be created on next operation that requires it
          }
        }
      }
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication failed')}`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`)
}
