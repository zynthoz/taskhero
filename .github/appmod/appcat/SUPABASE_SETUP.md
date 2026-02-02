# Supabase Setup Guide for TaskHero

## Prerequisites
- Supabase account (free tier available at https://supabase.com)
- Google Cloud Console account (for Google OAuth)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name:** TaskHero
   - **Database Password:** (generate a strong password)
   - **Region:** Choose closest to your users
4. Click "Create new project"
5. Wait for project initialization (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

3. Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Enable it (should be enabled by default)
4. Configure email settings:
   - **Enable email confirmations:** Toggle based on preference
   - **Secure email change:** Recommended to enable
   - **Secure password change:** Recommended to enable

### Optional: Customize Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirmation email
   - Password reset
   - Email change
   - Magic link

## Step 4: Set Up Google OAuth

### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure OAuth consent screen:
   - User type: **External**
   - App name: **TaskHero**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: **TaskHero**
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)
   - Authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**

### B. Configure Google Provider in Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Google** provider
3. Enable it
4. Paste:
   - **Client ID** from Google
   - **Client Secret** from Google
5. Copy the **Callback URL** shown (you already added this to Google Console)
6. Click **Save**

### C. Add Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

## Step 5: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL:**
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

## Step 6: Test Authentication

### Test Email/Password:

```bash
npm run dev
```

1. Navigate to `http://localhost:3000`
2. Click "Create Hero"
3. Sign up with email/password
4. Check email for verification (if enabled)
5. Sign in

### Test Google OAuth:

1. Click "Sign in with Google"
2. Authorize application
3. Should redirect to `/dashboard`

## Step 7: Security Best Practices

### Enable RLS (Row Level Security)
We'll set this up in Phase 3, but keep in mind:
- All tables should have RLS enabled
- Users should only access their own data
- Use Supabase policies for security

### Rate Limiting
Supabase provides built-in rate limiting:
- Check **Settings** → **API** → **Rate Limits**
- Adjust if needed for production

### Email Rate Limiting
- Go to **Authentication** → **Rate Limits**
- Configure email sending limits to prevent abuse

## Troubleshooting

### "Invalid API key" error
- Check `.env.local` has correct values
- Restart dev server: `npm run dev`
- Ensure variables start with `NEXT_PUBLIC_`

### Google OAuth not working
- Verify redirect URI in Google Console matches Supabase callback URL exactly
- Check Google OAuth is enabled in Supabase
- Ensure Client ID and Secret are correct
- Check browser console for errors

### Email not sending
- Check Supabase email logs: **Authentication** → **Logs**
- Verify email provider is configured
- For production, set up custom SMTP (optional)

### Users can't sign in
- Check **Authentication** → **Users** to see if user was created
- Verify email confirmation settings
- Check user's email for confirmation link

## Production Checklist

Before deploying to production:

- [ ] Set production Site URL in Supabase
- [ ] Add production redirect URLs
- [ ] Update Google OAuth authorized origins
- [ ] Set up custom SMTP for emails (optional)
- [ ] Enable email confirmations
- [ ] Configure password requirements
- [ ] Set up proper rate limits
- [ ] Test all auth flows in production
- [ ] Monitor auth logs for issues

## Next Steps

Once authentication is working:
- Proceed to **Phase 3: Database Setup**
- Create user profiles table
- Set up Row Level Security
- Create database functions for gamification

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
