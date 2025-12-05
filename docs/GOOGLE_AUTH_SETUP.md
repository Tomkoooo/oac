# Google OAuth Integration Guide

## Overview

The OAC Portal integrates with tDarts' existing Google OAuth system. Users can log in with their Google account, and the authentication is handled by the tDarts platform.

## Authentication Flow

```
1. User clicks "Login with Google" on OAC Portal
   ↓
2. Redirects to tDarts Google OAuth
   → https://tdarts.sironic.hu/api/auth/signin/google
   ↓
3. User authenticates with Google
   ↓
4. tDarts creates/updates user account
   - Creates JWT token
   - Sets user as verified
   - Links Google account
   ↓
5. tDarts redirects back to OAC Portal
   → /auth/callback?token=<JWT>
   ↓
6. OAC Portal validates token
   ↓
7. User redirected to Dashboard
```

## User Types

### Google Users (No Password)
- Users who register/login with Google **don't have a password**
- They can only authenticate via Google OAuth
- Account is automatically verified
- Profile picture from Google is used

### Email/Password Users
- Traditional username/password authentication
- Can link Google account later
- Need email verification

## Environment Variables

### OAC Portal

```bash
# tDarts API URL
NEXT_PUBLIC_TDARTS_API_URL=https://tdarts.sironic.hu

# MongoDB for applications
MONGODB_URI=mongodb://localhost:27017/oac_portal

# NextAuth (for admin panel)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<your-secret>
```

### tDarts Platform (Already Configured)

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Callback URL
# https://tdarts.sironic.hu/api/auth/callback/google
```

## Implementation Details

### Login Page Features

1. **Google Login Button**
   - Prominent placement above email/password form
   - Google branding with icon
   - Loading state during redirect

2. **Email/Password Form**
   - Traditional login for users with passwords
   - Password visibility toggle
   - Form validation

3. **Registration Link**
   - Points to tDarts registration
   - Supports both Google and email signup

### Callback Handling

**Route**: `/auth/callback`

The callback page:
- Receives token from tDarts
- Validates token with tDarts API
- Sets HTTP-only cookie
- Redirects to dashboard

### Token Validation

**Route**: `/api/auth/validate-token`

Validates token by:
1. Calling tDarts `/api/auth/verify` endpoint
2. Verifying user exists and is active
3. Setting `tdarts_token` cookie
4. Returning user data

## Dashboard Integration

When users log in (especially with Google), the dashboard:

1. **Fetches User's Clubs**
   ```typescript
   GET /api/user/clubs
   → tDarts: GET /api/users/me/clubs
   ```

2. **Shows Club Creation Help**
   - If no clubs exist
   - Links to tDarts club creation
   - Explains admin requirement

3. **Allows League Application**
   - Only for club admins
   - Submits to OAC database
   - Admin approves → Club verified on tDarts

## User Journey

### New Google User

```
1. Click "Login with Google"
   ↓
2. Authenticate with Google
   ↓
3. Account created on tDarts
   ↓
4. Redirected to OAC Dashboard
   ↓
5. Dashboard shows "No clubs" message
   ↓
6. User clicks "Create Club" → Goes to tDarts
   ↓
7. Creates club on tDarts (sets self as admin)
   ↓
8. Returns to OAC Dashboard
   ↓
9. Dashboard shows club
   ↓
10. User clicks "Apply for National League"
   ↓
11. Application submitted
   ↓
12. Admin approves
   ↓
13. Club verified on tDarts
   ↓
14. Club can participate in National League
```

### Existing tDarts User

```
1. Login with existing credentials (Google or Email)
   ↓
2. Dashboard shows existing clubs
   ↓
3. User applies for National League
   ↓
4. Application processed
```

## Club Verification Requirements

For a club to apply for National League:

1. **User Requirements**
   - Must be club admin
   - Account must be active
   - Must be logged in

2. **Club Requirements**
   - Club must exist on tDarts
   - User must have admin role
   - Club can have multiple admins

3. **After Approval**
   - Club marked as `verified: true` on tDarts
   - National League created for club
   - Club can host league tournaments

## Security Considerations

### Token Security
- HTTP-only cookies
- Secure flag in production
- 7-day expiration
- SameSite: strict

### OAuth Security
- Uses tDarts' existing Google OAuth
- No client secrets exposed
- Callback URL whitelisted
- State parameter for CSRF protection

### API Security
- All API calls authenticated
- Token validation on each request
- Rate limiting (recommended)
- Error messages don't leak info

## Testing

### Test Google Login Flow

1. Start OAC Portal:
   ```bash
   cd /Users/tomko/programing/oac/portal
   npm run dev
   ```

2. Visit: `http://localhost:3001/login`

3. Click "Login with Google"

4. Should redirect to tDarts Google OAuth

5. After auth, should return to OAC dashboard

### Test Club Creation

1. After Google login
2. Click "Create Club" on dashboard
3. Redirects to tDarts
4. Create club on tDarts
5. Set yourself as admin
6. Return to OAC portal
7. Club should appear on dashboard

### Test League Application

1. From dashboard with admin role
2. Click "Apply for National League"
3. Application submitted
4. Check admin panel for pending application

## Troubleshooting

### "No clubs found"

**Solution**: 
- Create club on tDarts platform
- Make sure you're set as admin
- Refresh OAC dashboard

### "Only admins can apply"

**Solution**:
- Check your role on the club
- Must be 'admin' role
- Contact club owner to promote you

### Google login redirects to error

**Causes**:
- tDarts Google OAuth not configured
- Callback URL mismatch
- Network/API issue

**Check**:
- `NEXT_PUBLIC_TDARTS_API_URL` is correct
- tDarts is accessible
- Google OAuth credentials valid

### Token validation fails

**Causes**:
- Expired token
- Invalid token format
- tDarts API unavailable

**Solution**:
- Try logging in again
- Clear cookies
- Check tDarts API status

## Google OAuth Setup (tDarts Side)

Already configured on tDarts, but for reference:

### Google Cloud Console

1. **Create OAuth 2.0 Client**
   - Go to: https://console.cloud.google.com
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID

2. **Configure Consent Screen**
   - App name: "tDarts"
   - User support email
   - Developer contact

3. **Authorized Redirect URIs**
   ```
   https://tdarts.sironic.hu/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google (dev)
   ```

4. **Get Credentials**
   - Client ID
   - Client Secret
   - Add to tDarts `.env`

## Benefits

### For Users
- ✅ One-click login with Google
- ✅ No password to remember
- ✅ Automatic email verification
- ✅ Profile picture from Google
- ✅ Secure authentication

### For Platform
- ✅ Reduced friction
- ✅ Higher conversion rates
- ✅ Verified emails by default
- ✅ OAuth security
- ✅ Single sign-on capability

---

**Status**: ✅ Implemented
**Last Updated**: December 2024
**Integration**: tDarts Platform

