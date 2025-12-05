# OAC Portal - Navigation Guide

## 🗺️ Site Map

```
OAC Portal (localhost:3001)
│
├── 🏠 Homepage (/)
│   ├── Hero Section
│   ├── Stats Showcase
│   ├── About Section (#about)
│   ├── Apply Section (#apply)
│   └── Rules Section (#rules)
│
├── 🔍 Felfedezés (/search) ← NEW!
│   ├── Search Bar
│   ├── 🏢 Klubok Tab
│   ├── 🏆 Ligák Tab
│   ├── 👥 Versenyek Tab
│   └── 📈 Ranglisták Tab
│
├── 🔐 User Login (/login)
│   ├── Google OAuth
│   └── Email/Password
│
├── 👤 User Dashboard (/dashboard)
│   ├── My Clubs
│   ├── Applications
│   └── Status Tracking
│
├── 🛡️ Admin Login (/admin) ← NEW!
│   └── Local Authentication
│
└── 👨‍💼 Admin Dashboard (/admin/dashboard)
    ├── Pending Applications
    ├── Active Subscriptions
    └── Statistics
```

## 🎯 Quick Access

### For Public Users
```
Homepage → Felfedezés → Browse Content
   ↓
Search clubs, leagues, tournaments
   ↓
Click external link → tDarts Platform
```

### For Club Admins
```
Login → Dashboard → My Clubs
   ↓
Apply to National League
   ↓
Wait for approval
```

### For OAC Admins
```
/admin → Admin Login → Dashboard
   ↓
Review applications
   ↓
Approve/Reject
```

## 🔗 URL Structure

### Public URLs
```
/                  → Landing page
/search            → Discovery page (NEW!)
/login             → User login
/auth/callback     → OAuth callback
```

### Protected URLs (User)
```
/dashboard         → User dashboard
```

### Protected URLs (Admin)
```
/admin             → Admin login (NEW!)
/admin/dashboard   → Admin panel
```

### External Links
```
https://tdarts.sironic.hu                    → tDarts Platform
https://tdarts.sironic.hu/clubs/[id]         → Club page
https://tdarts.sironic.hu/leagues/[id]       → League page
https://tdarts.sironic.hu/tournaments/[id]   → Tournament page
https://tdarts.sironic.hu/auth/register      → Registration
https://tdarts.sironic.hu/clubs/create       → Create club
```

## 📱 Navigation Bar

### Desktop
```
┌────────────────────────────────────────────────────────┐
│ 🏆 OAC Portál  │  Rólunk  Felfedezés  Szabályok  │ 🔐 │
│  powered by    │                       Jelentkezés│    │
│    tDarts      │                                  │    │
└────────────────────────────────────────────────────────┘
```

### Mobile
```
┌──────────────────┐
│ 🏆 OAC Portál   │
│  powered by     │
│    tDarts       │
│                 │
│ 🔐 Bejelentkezés│
└──────────────────┘
```

## 🎨 Page Themes

### Landing Page
- **Color**: Primary Red
- **Icon**: Trophy
- **Style**: Glass morphism
- **Purpose**: Introduction & CTA

### Search Page
- **Color**: Primary Red
- **Icons**: Search, Building2, Trophy, Users
- **Style**: Tabbed interface
- **Purpose**: Public discovery

### User Login
- **Color**: Primary Red
- **Icon**: Trophy
- **Style**: Glass card
- **Purpose**: User authentication

### Admin Login
- **Color**: Warning Orange
- **Icon**: Shield
- **Style**: Glass card
- **Purpose**: Admin authentication

### User Dashboard
- **Color**: Primary Red
- **Icons**: Building2, Trophy
- **Style**: Depth cards
- **Purpose**: Club management

### Admin Dashboard
- **Color**: Warning Orange
- **Icons**: Shield, Clock, CheckCircle
- **Style**: Glass cards
- **Purpose**: Application management

## 🔍 Search Page Features

### Search Bar
```
┌─────────────────────────────────────────────┐
│ 🔍 Keresés klubok, ligák, versenyek között │
└─────────────────────────────────────────────┘
```

### Tabs
```
┌──────┬──────┬──────────┬──────────┐
│ 🏢   │ 🏆   │ 👥       │ 📈       │
│Klubok│Ligák │Versenyek │Ranglisták│
│  (5) │ (12) │   (23)   │   (0)    │
└──────┴──────┴──────────┴──────────┘
```

### Club Card
```
┌─────────────────────────────┐
│ 🏢 Klub Neve          ✅    │
│    Budapest, Hungary        │
│                             │
│ Megtekintés →               │
└─────────────────────────────┘
```

### League Card
```
┌─────────────────────────────┐
│ 🏆 Liga Neve          ✅    │
│    Klub Neve                │
│    2024.01.01 - 2024.12.31  │
│                             │
│ Liga leírása...             │
│                             │
│ Megtekintés →               │
└─────────────────────────────┘
```

### Tournament Card
```
┌─────────────────────────────┐
│ 👥 Verseny Neve             │
│    Klub Neve                │
│                             │
│ 🏆 Liga Neve          ✅    │
│                             │
│ [Folyamatban]     🔗        │
└─────────────────────────────┘
```

## 🛡️ Admin Features

### Admin Login (`/admin`)
```
┌─────────────────────────────┐
│        🛡️                   │
│   Admin Bejelentkezés       │
│                             │
│ 📧 Email: ____________      │
│ 🔒 Password: ________       │
│                             │
│ [ Admin Bejelentkezés ]     │
└─────────────────────────────┘
```

### Admin Dashboard
```
┌─────────────────────────────────────┐
│ 🛡️ Admin Kezelőfelület             │
│                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │ ⏰  │ │ ✅  │ │ 🏢  │           │
│ │  5  │ │ 12  │ │ 23  │           │
│ │Függő│ │Aktív│ │Klub │           │
│ └─────┘ └─────┘ └─────┘           │
│                                     │
│ Függőben lévő Jelentkezések         │
│ ┌─────────────────────────────┐   │
│ │ 🏢 Klub Neve                │   │
│ │ Beküldve: 2024.12.01        │   │
│ │ [✅ Jóváhagyás] [❌ Elutasítás]│   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🎯 User Flows

### Browse Content (Public)
```
1. Visit homepage
2. Click "Felfedezés" in navbar
3. See search page with tabs
4. Click tab (Klubok/Ligák/Versenyek)
5. Type in search bar (optional)
6. Browse filtered results
7. Click "Megtekintés" on card
8. Opens tDarts page in new tab
```

### Apply to League (User)
```
1. Click "Bejelentkezés"
2. Login with Google or Email
3. Redirected to dashboard
4. See "My Clubs" section
5. Click "Apply to National League"
6. Application submitted
7. Status shows "Függőben"
8. Wait for admin approval
```

### Approve Application (Admin)
```
1. Visit /admin
2. Enter admin credentials
3. Login to admin dashboard
4. See "Pending Applications"
5. Review club information
6. Click "Jóváhagyás"
7. Confirm approval
8. Club verified on tDarts
9. Subscription created
```

## 📊 Data Sources

### Search Page Data
```
Source: tDarts Public API
Endpoint: /api/public/data?type=all

Returns:
{
  leagues: [
    {
      _id: string,
      name: string,
      verified: boolean,
      club: { name, location },
      startDate: string,
      endDate: string
    }
  ],
  tournaments: [
    {
      _id: string,
      tournamentSettings: {
        name: string,
        status: string,
        startDate: string
      },
      clubId: { name },
      league: { name, verified }
    }
  ]
}
```

### Dashboard Data
```
Source: tDarts API + OAC Database

User Clubs:
→ GET /api/user/clubs
→ tDarts: /api/users/me/clubs

Applications:
→ GET /api/applications
→ OAC Database
```

## 🔐 Authentication Summary

### User Auth
- **Method**: tDarts JWT + Google OAuth
- **Storage**: HTTP-only cookie
- **Expiry**: 7 days
- **Routes**: /login, /dashboard

### Admin Auth
- **Method**: NextAuth (local)
- **Storage**: Session cookie
- **Expiry**: Session
- **Routes**: /admin, /admin/dashboard

## 🎨 Design Tokens

### Colors
```css
Primary:   #b62441  (Red)
Warning:   #e8a02e  (Orange)
Success:   #4ade80  (Green)
Error:     #ef4444  (Red)
Info:      #3b82f6  (Blue)
```

### Icons
```
Trophy:     User features
Shield:     Admin features
Building2:  Clubs
Trophy:     Leagues
Users:      Tournaments
Search:     Discovery
TrendingUp: Rankings
```

## 📱 Responsive Breakpoints

```css
Mobile:   < 768px
Tablet:   768px - 1024px
Desktop:  > 1024px
```

---

**Quick Links**:
- Homepage: `/`
- Discovery: `/search`
- User Login: `/login`
- Admin Login: `/admin`
- tDarts: `https://tdarts.sironic.hu`

