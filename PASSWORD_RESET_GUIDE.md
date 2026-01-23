# Password Reset Feature - Complete Implementation Guide

## 🔐 Overview
The password reset feature allows users to securely reset their password through email verification. This implementation includes:
- Forgot password request with email verification
- 6-digit OTP code sent to registered email
- Password reset with verification code
- Automatic redirect after successful reset

---

## 📋 User Flow

### Step 1: Login Page → Forgot Password Link
```
1. User navigates to login page (http://localhost:5173/login)
2. Enters email and password
3. If they forgot their password, clicks "Forgot password?" link
4. Redirected to Forgot Password page
```

### Step 2: Request Reset Code
```
1. User enters their registered email address
2. Clicks "Send Reset Code" button
3. Backend generates 6-digit OTP
4. Email is sent to user (see "Email Verification" section)
5. Success message displayed: "Reset code sent to your email"
6. Form moves to Step 2: Reset Password
```

### Step 3: Reset Password with Code
```
1. User receives 6-digit code from email
2. Enters the code in "Reset Code" field
3. Enters new password
4. Clicks "Reset Password" button
5. Backend verifies code and updates password
6. Success message: "Password reset successfully. You can now login."
7. Automatically redirects to login page after 2 seconds
8. User can now login with new password
```

---

## 🔧 Backend Implementation

### AuthController.js

#### forgotPassword() - Request Password Reset
```javascript
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    // Generate 6-digit OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash token and store with 10-minute expiration
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    // Send email with OTP (mocked in development)
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message: `Your password reset code is ${resetToken}`
    });
    
    res.status(200).json({ success: true, message: "Password reset code sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Error during password reset request" });
  }
};
```

#### resetPassword() - Complete Password Reset
```javascript
const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    
    // Hash the provided code
    const resetPasswordToken = crypto.createHash('sha256').update(code).digest('hex');
    
    // Find user with valid token (not expired)
    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired reset code" 
      });
    }
    
    // Update password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: "Password reset successfully" 
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error resetting password" 
    });
  }
};
```

### UserModel.js - Password Reset Fields
```javascript
{
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  }
}
```

### API Routes (AuthRoutes.js)
```javascript
router.post("/forgot-password", forgotPassword);      // Request reset code
router.post("/reset-password", resetPassword);         // Complete password reset
```

---

## 🎨 Frontend Implementation

### Components Used

#### 1. Login Page (/pages/auth/login.jsx)
- Added "Forgot password?" link after password field
- Link styling: Pink color with hover effect
- Redirects to `/forgot-password` route

```jsx
<div className="text-right">
  <Link to="/forgot-password" className="text-sm text-pink-600 hover:text-pink-700 hover:underline font-medium">
    Forgot password?
  </Link>
</div>
```

#### 2. Forgot Password Page (/pages/auth/ForgotPassword.jsx)
**Features:**
- Two-step form (Request Code → Reset Password)
- Email validation
- OTP/Code entry field
- New password entry field
- Loading states for submit buttons
- Error and success message display
- Auto-redirect to login after successful reset

**Key Methods:**
- `handleRequestCode()` - Sends email with reset code
- `handleResetPassword()` - Verifies code and resets password

**API Calls:**
```javascript
// Step 1: Request reset code
POST /api/auth/forgot-password
Body: { email: "user@example.com" }

// Step 2: Reset password
POST /api/auth/reset-password
Body: { email: "user@example.com", code: "123456", password: "newPassword" }
```

---

## 📧 Email System

### Development Mode (Mock Email)
In development, emails are logged to console:
```
[EMAIL SEND MOCK] To: user@example.com, Subject: Password Reset, Message: Your password reset code is 123456
```

**Check Backend Console** for the 6-digit code during testing.

### Production Mode
Replace mock email sender with real email service (SMTP, SendGrid, etc.):
```javascript
const sendEmail = async (options) => {
  // Use your actual email service here
  // Example: await nodemailer.send(options);
  // Or: await sendgridMail.send(options);
};
```

---

## 🔒 Security Features

### 1. Token Hashing
- OTP code is hashed using SHA256 before storage
- Plain code sent via email, hashed code stored in database
- Prevents security breach if database is compromised

### 2. Time-Limited Tokens
- Reset code expires after **10 minutes**
- If expired, user must request new code
- Prevents long-standing vulnerability window

### 3. Email Verification
- User must have access to registered email
- Ensures only legitimate user can reset password
- One-time-use code

### 4. Password Hashing
- New password is hashed using bcryptjs before storage
- Uses pre-save hook in User model
- Original password never stored in plain text

---

## 🧪 Testing Guide

### Test Scenario 1: Successful Password Reset
```
1. Open http://localhost:5173/login
2. Click "Forgot password?" link
3. Enter registered email (e.g., test@example.com)
4. Click "Send Reset Code"
5. Check backend terminal for OTP code
6. Enter received code and new password
7. Click "Reset Password"
8. Should be redirected to login after 2 seconds
9. Login with email and new password
10. Should successfully login
```

### Test Scenario 2: Invalid Reset Code
```
1. Follow steps 1-4 above
2. Enter wrong 6-digit code (e.g., 999999)
3. Click "Reset Password"
4. Should see error: "Invalid or expired reset code"
```

### Test Scenario 3: Expired Reset Code
```
1. Follow steps 1-4 above
2. Wait more than 10 minutes
3. Enter code from earlier
4. Click "Reset Password"
5. Should see error: "Invalid or expired reset code"
6. Must request new code
```

### Test Scenario 4: User Not Found
```
1. Open forgot password page
2. Enter non-existent email (e.g., nonexistent@example.com)
3. Click "Send Reset Code"
4. Should see error: "User not found"
```

---

## 🌐 API Endpoints Reference

### 1. Request Password Reset
```
POST /api/auth/forgot-password

Request:
{
  "email": "user@example.com"
}

Response (Success):
{
  "success": true,
  "message": "Password reset code sent to email"
}

Response (Error - User not found):
{
  "success": false,
  "message": "User not found"
}

Response (Error - Email failed):
{
  "success": false,
  "message": "Email could not be sent"
}
```

### 2. Reset Password
```
POST /api/auth/reset-password

Request:
{
  "email": "user@example.com",
  "code": "123456",
  "password": "newPassword123"
}

Response (Success):
{
  "success": true,
  "message": "Password reset successfully"
}

Response (Error - Invalid code):
{
  "success": false,
  "message": "Invalid or expired reset code"
}
```

---

## 📁 File Structure

```
frontend/
├── pages/auth/
│   ├── login.jsx              ✅ Updated with "Forgot password?" link
│   ├── ForgotPassword.jsx     ✅ Two-step password reset form
│   └── VerifyEmail.jsx        (Separate email verification)

backend/
├── controller/
│   └── AuthController.js      ✅ forgotPassword() and resetPassword()
├── model/
│   └── UserModel.js           ✅ resetPasswordToken, resetPasswordExpires
├── routes/
│   └── AuthRoutes.js          ✅ /forgot-password and /reset-password
└── utils/
    └── EmailService.js        ✅ Email sender (mock in dev)
```

---

## ⚙️ Configuration

### Environment Variables
```
# Backend .env
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Frontend .env.local
VITE_API_BASE_URL=http://localhost:5000/api
```

### Server URLs
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **Login**: http://localhost:5173/login
- **Forgot Password**: http://localhost:5173/forgot-password

---

## 🐛 Troubleshooting

### Issue: "Cannot find reset code in email"
**Solution**: 
- Backend logs are mocked in development mode
- Check backend terminal/console for message like: `[EMAIL SEND MOCK] To: ... Message: Your password reset code is 123456`
- Copy the 6-digit code from console

### Issue: "Invalid or expired reset code"
**Solutions**:
- Verify you copied the code correctly (exactly 6 digits)
- Check if more than 10 minutes have passed (code expires after 10 min)
- Try requesting a new code

### Issue: "CORS error" or "Cannot reach backend"
**Solutions**:
- Verify backend is running: `npm run dev` in backend folder
- Check backend is on http://localhost:5000
- Verify frontend is on http://localhost:5173
- Check CORS configuration in backend/index.js

### Issue: "User not found"
**Solutions**:
- Ensure email is exactly as registered
- Check email doesn't have typo
- User must be registered before requesting password reset

---

## 🚀 Next Steps (Future Enhancements)

1. **Email Service Integration**
   - Replace mock email with real SMTP (Gmail, SendGrid, AWS SES)
   - Customizable email templates
   - HTML email with styling

2. **Additional Security**
   - Rate limiting on forgot password requests
   - Account lockout after failed attempts
   - Multi-factor authentication (MFA)

3. **User Experience**
   - Resend code button with cooldown timer
   - QR code for email verification (optional)
   - SMS backup for account recovery

4. **Monitoring**
   - Track password reset attempts
   - Alert on suspicious activity
   - Analytics dashboard

---

## ✅ Completion Checklist

- ✅ "Forgot password?" link added to login page
- ✅ Forgot password page fully functional
- ✅ Backend endpoints for forgot/reset password implemented
- ✅ Email verification (OTP) system working
- ✅ Password reset with token validation
- ✅ Auto-redirect after successful reset
- ✅ Error handling and user feedback
- ✅ Mock email system in development
- ✅ API documentation
- ✅ Testing guide

---

## 📞 Support

For additional help:
1. Check backend terminal for email logs (development mode)
2. Review API responses in browser DevTools Network tab
3. Verify CORS and API base URL configuration
4. Check UserModel for password hashing
