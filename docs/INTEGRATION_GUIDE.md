# OAC Portal - tDarts Integration Guide

## 🔗 Integration Overview

The OAC Portal is a third-party application portal that seamlessly integrates with the tDarts platform to manage National League applications.

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   OAC Portal    │ ◄─────► │  tDarts API     │
│  (Next.js App)  │  REST   │  (Main Platform)│
└─────────────────┘         └─────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────┐         ┌─────────────────┐
│  OAC MongoDB    │         │ tDarts MongoDB  │
│  (Applications) │         │ (Clubs, Users)  │
└─────────────────┘         └─────────────────┘
```

## 🔐 Authentication Flow

### 1. User Login
```
User → OAC Portal → tDarts API → tDarts MongoDB
                      ↓
              JWT Token (Cookie)
                      ↓
              OAC Portal Session
```

**Endpoint**: `/api/login`
```typescript
POST /api/login
Body: { email, password }

// Proxies to tDarts
→ POST https://tdarts.sironic.hu/api/auth/login

// Returns
← { token, user }

// Stores in HTTP-only cookie
Set-Cookie: tdarts_token=<JWT>
```

### 2. Authenticated Requests
```typescript
// All subsequent requests include cookie
Cookie: tdarts_token=<JWT>

// OAC Portal validates and forwards to tDarts
Authorization: Bearer <JWT>
```

## 📡 API Endpoints

### User Endpoints

#### Get User's Clubs
```typescript
GET /api/user/clubs

// Forwards to tDarts
→ GET https://tdarts.sironic.hu/api/users/me/clubs
  Headers: { Authorization: Bearer <token> }

// Returns
← { clubs: [{ _id, name, role }] }
```

### Application Endpoints

#### Submit Application
```typescript
POST /api/applications
Body: { clubId, clubName }

// Stores in OAC MongoDB
→ Application.create({
    clubId,
    clubName,
    applicantUserId,
    status: 'submitted'
  })

// Returns
← { application }
```

#### Get User Applications
```typescript
GET /api/applications

// Queries OAC MongoDB
→ Application.find({ applicantUserId })

// Returns
← { applications: [...] }
```

### Admin Endpoints

#### Get All Applications
```typescript
GET /api/admin/applications

// Requires NextAuth session
→ Application.find({})

// Returns
← { applications: [...] }
```

#### Approve Application
```typescript
POST /api/admin/applications/approve
Body: { applicationId, clubId }

// 1. Verify club on tDarts
→ POST https://tdarts.sironic.hu/api/admin/club-verification
  Body: { clubId }
  Headers: { Authorization: Bearer <ADMIN_TOKEN> }

// 2. Update application status
→ Application.updateOne({ _id }, { status: 'approved' })

// 3. Create subscription
→ Subscription.create({
    clubId,
    plan: 'national_league',
    status: 'active'
  })

// Returns
← { application, subscription }
```

#### Reject Application
```typescript
POST /api/admin/applications/reject
Body: { applicationId }

// Updates status
→ Application.updateOne({ _id }, { status: 'rejected' })

// Returns
← { success: true }
```

## 🔑 Environment Variables

### Required Configuration

```bash
# tDarts API URL
NEXT_PUBLIC_TDARTS_API_URL=https://tdarts.sironic.hu

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/oac_portal

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# tDarts Admin Token (for club verification)
TDARTS_ADMIN_TOKEN=<your-tdarts-admin-token>
```

### Generate NextAuth Secret
```bash
openssl rand -base64 32
```

## 📊 Data Models

### OAC Portal Models

#### Application
```typescript
{
  _id: ObjectId,
  clubId: string,           // tDarts club ID
  clubName: string,
  applicantUserId: string,  // tDarts user ID
  status: 'submitted' | 'approved' | 'rejected',
  submittedAt: Date,
  notes?: string
}
```

#### Subscription
```typescript
{
  _id: ObjectId,
  clubId: string,           // tDarts club ID
  clubName: string,
  plan: 'national_league',
  status: 'active' | 'inactive',
  startDate: Date,
  endDate: Date,
  paymentHistory: []
}
```

#### AdminUser
```typescript
{
  _id: ObjectId,
  email: string,
  password: string,         // bcrypt hashed
  role: 'admin' | 'super_admin',
  createdAt: Date
}
```

### tDarts Models (Read-Only)

#### Club
```typescript
{
  _id: ObjectId,
  name: string,
  location: string,
  verified: boolean,        // Set by admin approval
  // ... other fields
}
```

#### User
```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  username: string,
  // ... other fields
}
```

## 🔄 Integration Workflows

### Complete Application Flow

```
1. User Registration (tDarts)
   ↓
2. User Creates Club (tDarts)
   ↓
3. User Logs into OAC Portal
   ↓
4. Portal Fetches User's Clubs (from tDarts)
   ↓
5. User Submits Application (OAC Portal)
   ↓
6. Admin Reviews Application (OAC Portal)
   ↓
7. Admin Approves Application
   ├─→ Verifies Club on tDarts
   ├─→ Creates League on tDarts
   └─→ Creates Subscription in OAC
   ↓
8. Club is Verified & Active
```

### Club Verification on tDarts

When an application is approved:

```typescript
// 1. Call tDarts verification endpoint
POST /api/admin/club-verification
Body: { clubId }

// 2. tDarts performs:
→ Club.updateOne({ _id: clubId }, { verified: true })
→ League.create({
    name: `National League - ${club.name}`,
    club: clubId,
    verified: true,
    isActive: true,
    pointSystemType: 'platform'
  })

// 3. Club can now participate in National League
```

## 🛡️ Security Considerations

### Authentication
- ✅ HTTP-only cookies for JWT tokens
- ✅ Secure cookies in production
- ✅ SameSite: strict
- ✅ 7-day token expiration

### Authorization
- ✅ Admin routes protected by NextAuth
- ✅ User routes require valid tDarts token
- ✅ Club ownership verified via tDarts API

### API Security
- ✅ CORS properly configured
- ✅ Rate limiting (recommended)
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB)

## 🧪 Testing Integration

### 1. Test User Login
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 2. Test Fetch Clubs
```bash
curl http://localhost:3001/api/user/clubs \
  -H "Cookie: tdarts_token=<JWT>"
```

### 3. Test Submit Application
```bash
curl -X POST http://localhost:3001/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: tdarts_token=<JWT>" \
  -d '{"clubId":"123","clubName":"Test Club"}'
```

### 4. Test Admin Approval
```bash
# First login as admin
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oac.hu","password":"admin"}'

# Then approve
curl -X POST http://localhost:3001/api/admin/applications/approve \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<SESSION>" \
  -d '{"applicationId":"123","clubId":"456"}'
```

## 🚀 Deployment

### Environment Setup

#### Development
```bash
npm run dev
# Runs on http://localhost:3001
```

#### Production
```bash
npm run build
npm start
# Runs on configured port
```

### Required Services
1. MongoDB instance
2. tDarts API access
3. Admin token from tDarts

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name oac.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📈 Monitoring

### Key Metrics
- Application submission rate
- Approval/rejection ratio
- User login success rate
- API response times
- Error rates

### Logging
```typescript
// Application submissions
console.log('Application submitted:', { clubId, userId });

// Approvals
console.log('Application approved:', { applicationId, clubId });

// Errors
console.error('Integration error:', error);
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Login Fails
```
Check:
- tDarts API is accessible
- Credentials are correct
- NEXT_PUBLIC_TDARTS_API_URL is set
```

#### 2. Clubs Not Loading
```
Check:
- Token is valid
- Cookie is being sent
- tDarts /api/users/me/clubs endpoint works
```

#### 3. Approval Fails
```
Check:
- TDARTS_ADMIN_TOKEN is set
- Admin has permission on tDarts
- Club exists on tDarts
```

## 📚 Additional Resources

- [tDarts API Documentation](https://tdarts.sironic.hu/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [MongoDB Documentation](https://docs.mongodb.com)

---

**Integration Version**: 1.0
**Last Updated**: December 2024
**Status**: ✅ Production Ready

