# Setup & Testing Guide - Authentication Fix

## Installation & Setup

### No New Dependencies Required ✅
All changes use existing packages. No `npm install` needed!

### Environment Variables (Verify These Are Set)

**Backend `.env`:**
```env
# Email Configuration (Required for verification)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Database
MONGODB_URI=your-mongodb-connection-string

# API Configuration
NODE_ENV=development
PORT=5000
```

**Frontend `.env` or `.env.local`:**
```env
VITE_API_BACKEND_URL=http://localhost:3000/api
```

⚠️ **Important for Gmail:**
- Use [App Password](https://support.google.com/accounts/answer/185833), NOT your regular Gmail password
- Enable 2FA in your Google Account first
- Generate a 16-character app password

---

## Testing Workflow

### Test 1: New User Registration with Email Verification

#### Steps:
```
1. Start backend: npm start (in backend/ directory)
2. Start frontend: npm run dev (in frontend/ directory)
3. Go to: http://localhost:5173/signup
4. Fill form:
   - Name: Test User
   - Email: test@gmail.com
   - Password: Test@123
   - Confirm: Test@123
   - Type: Tenant
5. Click "Sign Up"
```

#### Expected Results:
✅ See success message: "Account created successfully"
✅ Redirected to `/verify-email` page
✅ Email field pre-filled with registered email
✅ Check email inbox for verification code (6 digits)

#### Debug if Email Not Received:
- Check spam/junk folder
- Check console for errors: `console.log()`
- Verify `.env` EMAIL_USER and EMAIL_PASS are correct
- Restart backend after changing `.env`

---

### Test 2: Verify Email with Code

#### Steps:
```
1. Copy 6-digit code from email
2. On verify-email page, code field should show:
   - Clear placeholder: "000000"
   - Only accepts numbers
3. Paste code (will auto-format to 6 digits)
4. Click "Verify Email"
```

#### Expected Results:
✅ See success message: "Email verified successfully"
✅ After 2 seconds, redirected to `/login`
✅ Can now login with registered email

#### Test Invalid Code:
```
1. Enter wrong code (e.g., 000000)
2. Click "Verify Email"
```

✅ See error: "Invalid or expired verification code"

---

### Test 3: Try Login Before Email Verification

#### Steps:
```
1. Go to /signup
2. Register new user (Bob)
3. DO NOT verify email
4. Go to /login
5. Enter Bob's credentials
6. Click "Login"
```

#### Expected Results:
✅ See error: "Please verify your email before logging in"
✅ Option to click "Resend Code"
✅ Redirected to `/verify-email`
✅ Can resend code and verify

---

### Test 4: Resend Verification Code

#### Steps:
```
1. On /verify-email page
2. Click "Resend Code" button
3. Wait for success message
```

#### Expected Results:
✅ See message: "Verification email sent. Please check your inbox"
✅ New 6-digit code sent to email
✅ Can use new code to verify

#### When to Use Resend:
- Code expired (24 hours)
- Didn't receive email
- Lost the code

---

### Test 5: Successful Login & Redirect

#### For Tenant User:
```
1. Go to /login
2. Enter verified tenant email + password
3. Click "Login"
```

✅ See success: "Login successful"
✅ Redirected to `/tenant-dashboard`

#### For Owner User:
```
1. Go to /login
2. Enter verified owner email + password
3. Click "Login"
```

✅ See success: "Login successful"
✅ Redirected to `/owner-dashboard`

#### For Admin User:
```
1. Go to /login
2. Enter admin email + password
3. Click "Login"
```

✅ See success: "Login successful"
✅ Redirected to `/admin`

---

### Test 6: Code Expiration (24 Hours)

#### Long-term Test:
```
1. Note registration time
2. Wait 24+ hours
3. Try to verify with old code
```

✅ See error: "Invalid or expired verification code"
✅ Can click "Resend Code" to get new code

**For Testing:** Modify code to expire faster (e.g., 1 minute) in AuthController:
```javascript
const verificationExpires = Date.now() + 1 * 60 * 1000; // 1 minute
```

---

## API Testing (Using Postman or cURL)

### Test Endpoint: POST /auth/register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "userType": "tenant",
    "address": {"city": "Kathmandu"}
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": false
  },
  "requiresVerification": true
}
```

---

### Test Endpoint: POST /auth/login

**Before Email Verification:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Please verify your email before logging in",
  "requiresVerification": true,
  "user": { /* user object */ },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Test Endpoint: POST /auth/verify-email

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "123456"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

**Expected Response (Invalid Code):**
```json
{
  "success": false,
  "message": "Invalid or expired verification code"
}
```

---

### Test Endpoint: POST /auth/resend-verification

```bash
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

## Debugging Tips

### Check Console Logs:

**Backend Console:**
```
[Register] User registered: john@example.com
[Email] Sending verification email to: john@example.com
[Email] Code: 123456
[Login] Email verification required for: john@example.com
```

**Frontend Console:**
```
Login error: {status: 403, message: "Please verify your email..."}
Verify email success: Email verified successfully
```

### MongoDB Query to Check User:

```javascript
// Check if user is verified
db.users.findOne({ email: "john@example.com" })

// Should show:
{
  isVerified: false,
  verificationToken: "hashed_token_here",
  verificationExpires: 2026-01-25T10:30:00.000Z
}
```

### Common Issues & Solutions:

| Issue | Solution |
|-------|----------|
| Email not received | Check `.env` EMAIL_USER/PASS, restart backend |
| "Invalid credentials" | Check email/password are correct |
| Code not working | Make sure email matches registration email |
| "Already verified" error on resend | Email is already verified, try login |
| Page shows old error | Clear localStorage: `localStorage.clear()` |
| Stuck on verify page | Refresh page or go back to signup |

---

## Load Testing (Optional)

### Test Multiple Users:

```bash
# Create 10 users in sequence
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"User $i\",
      \"email\": \"user$i@example.com\",
      \"password\": \"password123\",
      \"userType\": \"tenant\"
    }"
done
```

---

## Verification Checklist

Before deploying to production, verify:

- [ ] ✅ Email configuration is correct
- [ ] ✅ All 6 user flow tests pass
- [ ] ✅ Code expires after 24 hours
- [ ] ✅ Resend works multiple times
- [ ] ✅ Redirect works for all user types
- [ ] ✅ Error messages are clear
- [ ] ✅ Database shows isVerified = true after verification
- [ ] ✅ No unhandled errors in console
- [ ] ✅ Mobile/responsive design works
- [ ] ✅ Tokens persist in localStorage
- [ ] ✅ Logout clears tokens
- [ ] ✅ Browser back button doesn't expose unverified state

---

## Production Checklist

Before going live:

- [ ] Set secure JWT_SECRET (long random string)
- [ ] Enable HTTPS/SSL
- [ ] Use production Gmail/email service
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting on verify endpoints
- [ ] Add max attempt limits for wrong codes
- [ ] Monitor email delivery failures
- [ ] Set up error logging (Sentry, etc.)
- [ ] Test on multiple browsers
- [ ] Backup user data
- [ ] Document email provider requirements
- [ ] Update user onboarding docs

---

## Support & Rollback

### If Something Goes Wrong:

**Option 1: Quick Fix**
```bash
# Restart services
npm restart  # backend
npm run dev  # frontend
```

**Option 2: Reset User Verification**
```javascript
// MongoDB console
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isVerified: true } }
)
```

**Option 3: Rollback Code**
```bash
git revert <commit-hash>
git push
```

---

## Need Help?

Check files:
- **Implementation Summary**: `/AUTH_FIX_SUMMARY.md`
- **Quick Reference**: `/QUICK_AUTH_FIX_GUIDE.md`
- **Code Reference**: `/CODE_REFERENCE.md`
- **This Guide**: `/SETUP_AND_TESTING.md`
