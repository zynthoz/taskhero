# Impeto Authentication System

## Overview

Impeto uses Supabase Auth for secure, scalable authentication with support for:
- ✅ Email/Password authentication
- ✅ Google OAuth (one-click sign in)
- ✅ Password reset flow
- ✅ Protected routes with middleware
- ✅ Global auth state management
- ✅ RPG-themed UI

## Architecture

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─── Email/Password ──────┐
       │                         │
       └─── Google OAuth ────────┤
                                 │
                          ┌──────▼──────┐
                          │  Supabase   │
                          │    Auth     │
                          └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │  Middleware │
                          │   (Route    │
                          │ Protection) │
                          └──────┬──────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼──────┐         ┌───────▼────┐
              │   Public   │         │  Protected │
              │   Routes   │         │   Routes   │
              └────────────┘         └────────────┘
                   │                       │
                   │                       ├─ /dashboard
                   ├─ /                    ├─ /tasks
                   ├─ /login               ├─ /shop
                   └─ /signup              ├─ /inventory
                                          ├─ /achievements
                                          ├─ /goals
                                          └─ /leaderboard
```

## File Structure

```
impeto/
├── app/
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── signup/
│   │   └── page.tsx              # Sign up page
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts          # OAuth callback handler
│   │   ├── forgot-password/
│   │   │   └── page.tsx          # Password reset request
│   │   └── reset-password/
│   │       └── page.tsx          # Password reset form
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard
│   └── layout.tsx                # Root layout with AuthProvider
├── lib/
│   └── supabase/
│       ├── auth.ts               # Auth helper functions
│       ├── auth-provider.tsx     # React Context Provider
│       ├── client.ts             # Browser Supabase client
│       └── server.ts             # Server Supabase client
├── middleware.ts                 # Route protection middleware
└── .env.local                    # Environment variables
```

## Core Components

### 1. Authentication Helpers (`lib/supabase/auth.ts`)

Provides clean, reusable functions for all auth operations:

```typescript
// Sign up
const { data, error } = await signUpWithEmail(email, password)

// Sign in
const { data, error } = await signInWithEmail(email, password)

// Google OAuth
const { data, error } = await signInWithGoogle()

// Password reset
const { data, error } = await resetPassword(email)

// Update password
const { data, error } = await updatePassword(newPassword)

// Sign out
const { data, error } = await signOut()

// Get current user (client-side)
const { data, error } = await getCurrentUser()

// Get current user (server-side)
const { data, error } = await getServerUser()
```

### 2. Auth Context Provider (`lib/supabase/auth-provider.tsx`)

Global state management for user authentication:

```tsx
'use client'

export function AuthProvider({ children }) {
  // Provides: user, loading, signOut
  // Listens to auth state changes
  // Updates automatically on login/logout
}

export const useAuth = () => {
  // Hook to access auth context
  const { user, loading, signOut } = useAuth()
}
```

**Usage in components:**

```tsx
'use client'
import { useAuth } from '@/lib/supabase/auth-provider'

export default function MyComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>
  
  return <div>Welcome, {user.email}</div>
}
```

### 3. Middleware (`middleware.ts`)

Automatic route protection:

```typescript
// Protected routes - require authentication
const protectedRoutes = [
  '/dashboard',
  '/tasks',
  '/shop',
  '/inventory',
  '/achievements',
  '/goals',
  '/leaderboard'
]

// Auth routes - redirect if already logged in
const authRoutes = ['/login', '/signup']

// Middleware runs on every route
// Redirects unauthenticated users to /login
// Redirects authenticated users away from auth pages
```

### 4. Supabase Clients

**Browser Client** (`lib/supabase/client.ts`):
```typescript
import { createClient } from '@/lib/supabase/client'

// Use in client components
const supabase = createClient()
```

**Server Client** (`lib/supabase/server.ts`):
```typescript
import { createClient } from '@/lib/supabase/server'

// Use in server components, API routes, Server Actions
const supabase = await createClient()
```

## Authentication Pages

### Login Page (`/login`)
- Email/password form
- Google OAuth button
- Link to signup
- Link to password reset
- Error handling

### Signup Page (`/signup`)
- Email/password registration
- Password confirmation
- Google OAuth button
- Email verification confirmation
- Link to login

### Forgot Password (`/auth/forgot-password`)
- Email input
- Sends reset link
- Success confirmation

### Reset Password (`/auth/reset-password`)
- New password form
- Password confirmation
- Redirects to login on success

## Usage Examples

### Client-Side Authentication

```tsx
'use client'
import { signInWithEmail } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  
  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await signInWithEmail(email, password)
    
    if (error) {
      console.error(error.message)
      return
    }
    
    router.push('/dashboard')
  }
  
  return <form onSubmit={handleLogin}>...</form>
}
```

### Server-Side User Check

```tsx
import { getServerUser } from '@/lib/supabase/auth'

export default async function ServerPage() {
  const { data: user } = await getServerUser()
  
  if (!user) {
    return <div>Not authenticated</div>
  }
  
  return <div>Welcome, {user.email}</div>
}
```

### Protected Component

```tsx
'use client'
import { useAuth } from '@/lib/supabase/auth-provider'

export default function ProtectedComponent() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return null // or redirect
  
  return <div>Protected content for {user.email}</div>
}
```

## Security Features

### ✅ Implemented
- Server-side session validation
- Middleware-based route protection
- Secure cookie handling via Supabase SSR
- HTTPS-only cookies (in production)
- CSRF protection via Supabase
- Password minimum length validation
- Email format validation

### 🔄 To Be Implemented (Phase 3)
- Row Level Security (RLS) on database tables
- User profile creation on signup
- Email verification requirements
- Rate limiting on auth endpoints
- Password strength requirements
- Account lockout after failed attempts

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing

### Manual Testing Checklist

**Email/Password:**
- [ ] Sign up with new email
- [ ] Receive confirmation email (if enabled)
- [ ] Sign in with credentials
- [ ] Sign out
- [ ] Sign in again (persistent session)

**Google OAuth:**
- [ ] Click "Sign in with Google"
- [ ] Authorize app
- [ ] Redirect to dashboard
- [ ] Sign out
- [ ] Sign in with Google again

**Password Reset:**
- [ ] Click "Forgot password"
- [ ] Enter email
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Set new password
- [ ] Redirect to login
- [ ] Sign in with new password

**Protected Routes:**
- [ ] Try accessing `/dashboard` while logged out → redirects to `/login`
- [ ] Log in → redirected to `/dashboard`
- [ ] Try accessing `/login` while logged in → redirects to `/dashboard`
- [ ] Refresh page → session persists

**Error Handling:**
- [ ] Sign in with wrong password → error message
- [ ] Sign up with existing email → error message
- [ ] Sign up with password mismatch → error message
- [ ] Submit empty forms → validation errors

## Troubleshooting

### "Session missing" error
- Check `.env.local` has correct Supabase credentials
- Restart dev server
- Clear browser cookies and retry

### Redirect not working
- Check middleware.ts is in project root
- Verify protected routes are listed in middleware
- Check browser console for errors

### Google OAuth fails
- Verify Google OAuth is enabled in Supabase
- Check redirect URI matches exactly
- Ensure Client ID/Secret are correct
- Check Google Cloud Console authorized origins

### User not persisting
- Check if cookies are enabled in browser
- Verify Supabase session is being stored
- Check Network tab for auth errors

## Best Practices

1. **Always use `useAuth()` in client components** for user state
2. **Use `getServerUser()` in server components** for user data
3. **Never expose Supabase service role key** in client code
4. **Always validate user input** before auth operations
5. **Handle all error states** with user-friendly messages
6. **Use HTTPS in production** for secure cookies
7. **Enable email verification** for production apps
8. **Implement rate limiting** on auth endpoints
9. **Log auth events** for security monitoring
10. **Keep auth libraries updated** for security patches

## Next Steps (Phase 3)

1. Create user profiles table in Supabase
2. Set up Row Level Security policies
3. Create user profile on signup (trigger or function)
4. Add user metadata (level, XP, gold, streak)
5. Implement user profile page
6. Add avatar upload functionality

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React Context API](https://react.dev/reference/react/useContext)
- [TaskHero PRD](./.github/appmod/appcat/PRD.md)
