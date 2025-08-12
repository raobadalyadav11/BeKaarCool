# Authentication Setup Guide for BeKaarCool

## 🔐 Complete Authentication System

This guide covers the complete authentication system implementation with NextAuth.js, including:

- **Login/Register** with email & password
- **Social Authentication** (Google, GitHub)
- **Email Verification**
- **Password Reset**
- **Role-based Access Control**
- **Protected Routes**

## 📁 File Structure

```
app/
├── (public)/auth/
│   ├── login/page.tsx           # Enhanced login page
│   ├── register/page.tsx        # Enhanced register page
│   ├── forgot-password/page.tsx # Password reset request
│   ├── reset-password/page.tsx  # Password reset form
│   └── verify/page.tsx          # Email verification
├── api/auth/
│   ├── [...nextauth]/route.ts   # NextAuth configuration
│   ├── register/route.ts        # User registration API
│   ├── forgot-password/route.ts # Password reset request API
│   ├── reset-password/
│   │   ├── route.ts            # Password reset API
│   │   └── verify/route.ts     # Token verification API
│   ├── verify/route.ts         # Email verification API
│   └── resend-verification/route.ts # Resend verification email
components/auth/
├── auth-guard.tsx              # Route protection component
└── social-auth.tsx             # Social login component
```

## 🚀 Features Implemented

### ✅ Enhanced UI/UX
- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Loading States**: Proper loading indicators for all actions
- **Error Handling**: Comprehensive error messages and validation
- **Success Feedback**: Toast notifications and success states
- **Password Strength**: Real-time password strength indicator
- **Responsive**: Mobile-first responsive design

### ✅ Authentication Features
- **Email/Password Login**: Secure credential-based authentication
- **User Registration**: Complete registration with validation
- **Email Verification**: Mandatory email verification for new users
- **Password Reset**: Secure password reset via email
- **Social Login**: Google and GitHub OAuth integration
- **Role-based Access**: Customer, Seller, Admin roles
- **Session Management**: Secure JWT-based sessions

### ✅ Security Features
- **Password Hashing**: bcrypt with salt rounds
- **CSRF Protection**: Built-in NextAuth CSRF protection
- **Rate Limiting**: Protection against brute force attacks
- **Secure Tokens**: Cryptographically secure reset tokens
- **Email Validation**: Server-side email format validation
- **Input Sanitization**: XSS protection on all inputs

## 🔧 Environment Setup

### Required Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/bekaar-cool

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@bekaar-cool.com
SUPPORT_EMAIL=support@bekaar-cool.com

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Email Service Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password as `SMTP_PASS`

## 📧 Email Templates

The system includes professional email templates for:

- **Welcome/Verification**: Sent after registration
- **Password Reset**: Sent when user requests password reset
- **Order Confirmation**: Sent after successful orders
- **Order Updates**: Sent when order status changes

## 🛡️ Usage Examples

### Protecting Routes

```tsx
import { AuthGuard } from "@/components/auth/auth-guard"

export default function SellerDashboard() {
  return (
    <AuthGuard requiredRole={["seller", "admin"]}>
      <div>Seller Dashboard Content</div>
    </AuthGuard>
  )
}
```

### Using Session Data

```tsx
import { useSession } from "next-auth/react"

export default function Profile() {
  const { data: session, status } = useSession()

  if (status === "loading") return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>

  return <div>Welcome {session.user.name}!</div>
}
```

### Social Authentication

```tsx
import { SocialAuth } from "@/components/auth/social-auth"

export default function LoginPage() {
  return (
    <div>
      {/* Email/Password form */}
      <SocialAuth mode="signin" />
    </div>
  )
}
```

## 🔄 Authentication Flow

### Registration Flow
1. User fills registration form
2. Server validates input and creates user
3. Verification email sent to user
4. User clicks verification link
5. Account activated, user can login

### Login Flow
1. User enters credentials
2. NextAuth validates against database
3. JWT token created and stored
4. User redirected based on role

### Password Reset Flow
1. User requests password reset
2. Reset token generated and emailed
3. User clicks reset link
4. New password form displayed
5. Password updated in database

## 🎨 Customization

### Styling
- All components use Tailwind CSS
- Consistent color scheme with brand colors
- Dark mode support ready
- Fully responsive design

### Email Templates
- HTML email templates in `/lib/email.ts`
- Branded with BeKaarCool styling
- Mobile-responsive email design

### Error Messages
- User-friendly error messages
- Internationalization ready
- Consistent error handling

## 🚀 Deployment Checklist

- [ ] Set production environment variables
- [ ] Configure production database
- [ ] Set up production email service
- [ ] Configure OAuth redirect URLs
- [ ] Test all authentication flows
- [ ] Set up monitoring and logging

## 🔍 Testing

### Manual Testing Checklist
- [ ] User registration with email verification
- [ ] Login with email/password
- [ ] Social login (Google)
- [ ] Password reset flow
- [ ] Role-based access control
- [ ] Session persistence
- [ ] Logout functionality

### Test Accounts
Create test accounts for each role:
- Customer: `customer@test.com`
- Seller: `seller@test.com`
- Admin: `admin@test.com`

## 📞 Support

For authentication-related issues:
1. Check environment variables
2. Verify database connection
3. Test email service configuration
4. Check OAuth provider settings
5. Review server logs for errors

## 🔄 Updates & Maintenance

- Regularly update NextAuth.js
- Monitor security advisories
- Update OAuth provider configurations
- Review and rotate secrets
- Monitor authentication metrics