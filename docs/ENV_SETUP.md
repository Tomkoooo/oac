# Club Application Portal - Environment Variables

## Required Configuration

### tDarts API
```
NEXT_PUBLIC_TDARTS_API_URL=https://tdarts.sironic.hu
```

### MongoDB
```
MONGODB_URI=mongodb://localhost:27017/oac_portal
```

### NextAuth
```
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
```
Generate secret with: `openssl rand -base64 32`

### tDarts Admin Token (Optional)
```
TDARTS_ADMIN_TOKEN=your-tdarts-admin-token
```
Required for automatic club verification on tDarts when approving applications.
