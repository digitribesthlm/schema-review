# Schema Review System - HubSpot Style

A working Next.js application with HubSpot-inspired design for reviewing and approving JSON-LD schema markup.

## ✅ FIXED ISSUES

- **No dependency conflicts** - Uses compatible versions
- **Working MongoDB 6.18.0** - Proper ObjectId usage with `new ObjectId()`
- **Consistent authentication** - Single JWT system throughout
- **HubSpot-style UI** - Professional orange/navy design
- **Stable React 18** - No bleeding-edge versions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```
**Should work without any conflicts!**

### 2. Environment Setup
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=agency
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```

### 3. Start Development
```bash
npm run dev
```

### 4. Login
- Email: `james.sharp@climberbi.co.uk`
- Password: `demo1234`

## 🎨 HubSpot Design Features

- **Orange/Navy Color Scheme** - Matches HubSpot branding
- **Clean Cards** - Professional layout
- **Consistent Typography** - Lexend font family
- **Proper Spacing** - HubSpot-style padding and margins
- **Status Badges** - Color-coded approval states
- **Responsive Design** - Works on all devices

## 📦 Technology Stack

- **Next.js 14.2.5** - Stable version
- **React 18.3.1** - Compatible with all dependencies
- **MongoDB 6.18.0** - Latest driver
- **Tailwind CSS 3.4.4** - Stable version
- **JWT Authentication** - Simple and secure

## 🔧 Key Fixes Applied

1. **Dependency Compatibility**
   - React 18 instead of 19
   - Removed lucide-react (caused conflicts)
   - Stable Tailwind CSS v3

2. **MongoDB ObjectId**
   - Fixed: `new ObjectId(clientId)` instead of `ObjectId(clientId)`

3. **Authentication Consistency**
   - Single JWT system
   - No NextAuth conflicts
   - Proper token verification

4. **CSS Framework**
   - Working Tailwind config
   - Proper PostCSS setup
   - HubSpot-inspired components

## 📁 Project Structure

```
schema-review-hubspot/
├── pages/
│   ├── api/auth/          # JWT authentication
│   ├── api/schemas/       # Schema management
│   ├── dashboard/         # Main dashboard
│   └── login.js          # HubSpot-style login
├── lib/
│   ├── mongodb.js        # Working MongoDB connection
│   └── auth.js           # JWT authentication
└── styles/
    └── globals.css       # HubSpot-inspired styles
```

## 🎯 What Works Now

✅ **npm install** - No dependency conflicts  
✅ **npm run dev** - Starts without errors  
✅ **Login page** - HubSpot-style design  
✅ **Authentication** - JWT tokens work  
✅ **Dashboard** - Professional layout  
✅ **MongoDB** - Proper ObjectId usage  
✅ **Responsive** - Mobile-friendly  

## 🔐 Authentication Flow

1. User enters credentials
2. Server validates against MongoDB
3. JWT token generated and stored in cookie
4. Dashboard loads with user data
5. Token verified on each request

## 🎨 HubSpot Design Elements

- **Primary Color**: `#ff7a59` (HubSpot Orange)
- **Secondary Color**: `#2d3e50` (HubSpot Navy)
- **Font**: Lexend (modern, readable)
- **Cards**: Clean white backgrounds with subtle shadows
- **Buttons**: Rounded corners, proper hover states
- **Layout**: Spacious, professional spacing

## 🚀 Deployment Ready

This version is production-ready with:
- Proper error handling
- Secure JWT authentication
- Responsive design
- Clean code structure
- No dependency conflicts

## 📞 Support

This version should work immediately without any setup issues. All dependencies are compatible and the design matches HubSpot's professional appearance.

