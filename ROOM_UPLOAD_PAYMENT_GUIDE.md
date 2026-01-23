# Room Upload Payment & User Role Implementation Guide

## 🎯 Overview
This guide documents the complete implementation of:
1. **User Roles**: Tenant vs Owner (removed "both" option)
2. **Room Upload Payment**: Rs.50 per room upload with payment verification
3. **Dashboard Separation**: Owner Dashboard shows uploaded rooms, User Dashboard shows applied rooms
4. **Email Fixes**: Fixed API URL for forgot password functionality

---

## 🔧 1. API URL Fixes

### Issue Fixed
Forgot password and other pages were using `localhost:3000/api` instead of `localhost:5000/api`

### Files Updated
- ✅ `frontend/src/context/AuthContext.jsx` - Changed default API_BASE_URL
- ✅ `frontend/src/pages/auth/ForgotPassword.jsx` - Fixed API URL
- ✅ `frontend/src/pages/listings/CreateListing.jsx` - Fixed API URL
- ✅ `frontend/src/pages/user-panel/User-DashBoard.jsx` - Fixed API URL
- ✅ `frontend/src/pages/user-panel/OwnerDashboard.jsx` - Fixed API URL

### Environment Variable
```env
VITE_API_BACKEND_URL=http://localhost:5000/api
```

---

## 👤 2. User Roles Implementation

### User Type Options
Changed from: `["owner", "renter", "both"]`
Changed to: `["tenant", "owner"]`

### Registration Default
- New registrations default to **"tenant"** role
- Tenant accounts can only **apply for rooms**
- Owner accounts can only **upload rooms**

### Backend Changes
**File**: `backend/model/UserModel.js`
```javascript
userType: {
  type: String,
  enum: ["tenant", "owner"],
  default: "tenant",  // Changed from "both"
}
```

**File**: `backend/controller/AuthController.js`
```javascript
userType: userType || "tenant",  // Changed from "both"
```

### Frontend Changes
**File**: `frontend/src/pages/auth/Signup.jsx`
```jsx
<option value="tenant">Tenant (Want to rent room)</option>
<option value="owner">Owner (Want to upload room)</option>
```

### User Story Flow

#### Tenant Account:
```
1. Registration → Select "Tenant" role
2. Login → Redirected to User Dashboard
3. Can: Browse listings, Apply for rooms, Track applications
4. Cannot: Upload rooms, Accept applications
```

#### Owner Account:
```
1. Registration → Select "Owner" role
2. Login → Redirected to Owner Dashboard
3. Can: Upload rooms (with payment), Accept/Reject applications
4. Cannot: Apply for rooms, Track applications
```

---

## 💳 3. Room Upload Payment System

### Payment Model
**File Created**: `backend/model/RoomPaymentModel.js`

```javascript
{
  userId: ObjectId,
  postId: ObjectId,
  amount: 50,  // Rs.50 per room upload (fixed)
  paymentMethod: String,  // "khalti", "esewa", "bank", "cash"
  transactionId: String,
  status: String,  // "pending", "success", "failed", "refunded"
  paymentResponse: Object,
  refundReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Controller
**File Created**: `backend/controller/RoomPaymentController.js`

#### Endpoints:
1. **POST `/api/room-payments/initialize`** - Create payment record
2. **POST `/api/room-payments/verify`** - Verify and complete payment
3. **GET `/api/room-payments/history`** - Get payment history
4. **GET `/api/room-payments/:paymentId`** - Get payment details
5. **POST `/api/room-payments/:paymentId/refund`** - Refund payment

### Payment Routes
**File Created**: `backend/routes/RoomPaymentRoutes.js`
- All routes require authentication (`protect` middleware)
- Added to backend index.js: `app.use('/api/room-payments', RoomPaymentRouter);`

### Room Upload Payment Flow

#### Step 1: Create Room Listing
```
User clicks "Create New Listing" → Fills form → Clicks "Create"
```

#### Step 2: Initialize Payment
```javascript
POST /api/room-payments/initialize
{
  "postId": "room_id_from_creation"
}
Response:
{
  "success": true,
  "payment": {
    "_id": "payment_id",
    "amount": 50,
    "status": "pending"
  }
}
```

#### Step 3: Redirect to Payment Page
```javascript
// Stored in localStorage for reference
{
  "paymentId": "payment_id",
  "postId": "room_id",
  "amount": 50
}

// Redirect to payment verification page
/payment-callback?paymentId=XXX&postId=YYY
```

#### Step 4: Verify Payment
```javascript
POST /api/room-payments/verify
{
  "paymentId": "payment_id",
  "postId": "room_id",
  "transactionId": "khalti_or_mock_transaction_id"
}
Response: Payment marked as "success" → Post becomes "available"
```

#### Step 5: Redirect to Owner Dashboard
After successful payment, user is redirected to `/owner-dashboard` to see their active listing.

### Frontend Implementation

#### CreateListing Page Update
**File**: `frontend/src/pages/listings/CreateListing.jsx`

1. Room listing is created first (POST `/api/posts`)
2. Payment is initialized for that room (POST `/api/room-payments/initialize`)
3. User is redirected to payment verification page
4. After payment success, user can view the room in Owner Dashboard

#### PaymentCallback Page Update
**File**: `frontend/src/pages/listings/PaymentCallback.jsx`

- Enhanced to handle both room upload payments and application payments
- Detects payment type by checking `paymentId` parameter
- For room payments: Redirects to `/owner-dashboard`
- For application payments: Redirects to `/dashboard`

#### Test Payment Simulation
```
Without real payment gateway:
- Payment callback page auto-simulates success
- Mock transaction ID: "TEST_" + timestamp
- Payment status: "success"
```

---

## 📊 4. Dashboard Separation

### Owner Dashboard
**File**: `frontend/src/pages/user-panel/OwnerDashboard.jsx`

#### Features:
1. **Tab 1: Uploaded Rooms** (default)
   - Shows all rooms created by owner
   - Grid layout with room images
   - Actions: View, Edit, Delete
   - Status badge: Active/Inactive
   - "Create New Listing" button with Rs.50 payment notice

2. **Tab 2: Applications**
   - Shows all applications received for owner's rooms
   - Applicant details: Name, email, phone
   - Application details: Duration, number of people, address
   - Status management: Accept/Reject pending applications
   - Status display: Pending/Accepted/Rejected

#### Data Fetched:
```javascript
// Uploaded posts
GET /api/posts/my-listings
Authorization: Bearer {token}

// Received applications
GET /api/applications/owner
Authorization: Bearer {token}
```

### User Dashboard (Tenant)
**File**: `frontend/src/pages/user-panel/User-DashBoard.jsx`

#### Features:
1. **Profile Tab**
   - Edit profile information
   - Update contact details
   - Manage address

2. **Applications Tab** (Formerly "Listings")
   - Shows all rooms user has applied for
   - Displays application status: Pending/Accepted/Rejected
   - Owner information visible
   - Linked to room details

#### Data Fetched:
```javascript
// User's applications
GET /api/applications/my-applications
Authorization: Bearer {token}

// Alternative (if endpoint not available)
GET /api/applications/my
Authorization: Bearer {token}
```

### Navigation Rules
```
Login as Tenant:
  → Redirected to /dashboard (User Dashboard)
  → Can see Profile, Applications
  → Can browse listings, apply for rooms

Login as Owner:
  → Redirected to /dashboard (User Dashboard by default)
  → Can navigate to Owner Dashboard via navigation menu
  → Can create new listings (with payment)
  → Can manage applications received
```

---

## 🔄 Complete User Journeys

### Journey 1: Tenant Applying for Room

```
1. Register as Tenant
   - Account Type: "Tenant (Want to rent room)"
   - Default role: tenant

2. Login
   - Redirected to /dashboard

3. Browse Listings
   - Go to /listings page
   - Filter by location, price, category
   - View room details

4. Apply for Room
   - Click "Apply" on room detail
   - Fill application form
   - Submit application
   - Payment for application (if required)
   - Application submitted successfully

5. Track Application
   - Go to User Dashboard → Applications tab
   - View application status: Pending/Accepted/Rejected
   - View owner's response
```

### Journey 2: Owner Uploading Room

```
1. Register as Owner
   - Account Type: "Owner (Want to upload room)"
   - Default role: owner

2. Login
   - Redirected to /dashboard
   - Can navigate to Owner Dashboard

3. Create New Listing
   - Go to /create-listing page
   - Fill room details (name, description, price, etc.)
   - Upload room images
   - Click "Create Listing"

4. Payment Required
   - Payment dialog: "Rs.50 per room upload"
   - Payment initialized automatically
   - Redirected to payment verification page
   - See payment status (mock success)

5. Room Published
   - Redirected to Owner Dashboard
   - Room shows in "Uploaded Rooms" tab
   - Status: Active/Available

6. Manage Applications
   - Go to Owner Dashboard → Applications tab
   - View all applications received
   - Accept/Reject applicants
   - Update application status

7. Edit/Delete Room
   - Click Edit: Modify room details
   - Click Delete: Remove room listing
```

---

## 📱 API Endpoints Summary

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Posts (Rooms)
```
POST /api/posts                      - Create room
GET /api/posts                       - Get all rooms
GET /api/posts/my-listings           - Get user's rooms
GET /api/posts/:id                   - Get room details
PUT /api/posts/:id                   - Update room
DELETE /api/posts/:id                - Delete room
GET /api/posts/nearby                - Nearby rooms
GET /api/posts/recommendations       - Recommendations
GET /api/posts/search/prefix         - Location autocomplete
```

### Applications
```
POST /api/applications               - Create application
GET /api/applications/owner          - Owner's received applications
GET /api/applications/my             - Tenant's applications
GET /api/applications/my-applications - Tenant's applications (alias)
PUT /api/applications/:id/status     - Update application status
```

### Room Payments
```
POST /api/room-payments/initialize   - Create payment record
POST /api/room-payments/verify       - Verify payment
GET /api/room-payments/history       - Payment history
GET /api/room-payments/:id           - Payment details
POST /api/room-payments/:id/refund   - Refund payment
```

---

## 🧪 Testing Checklist

### User Role Testing
- [ ] Can register as Tenant
- [ ] Can register as Owner
- [ ] Default role is "tenant"
- [ ] Tenant cannot access Owner Dashboard
- [ ] Owner can access Owner Dashboard

### Forgot Password Testing
- [ ] Click "Forgot password?" on login page
- [ ] Enter email
- [ ] Check backend terminal for OTP code (mock email)
- [ ] Enter OTP and new password
- [ ] Auto-redirect to login after 2 seconds
- [ ] Login with new password works

### Room Upload Payment Testing
- [ ] Login as Owner
- [ ] Go to Create Listing
- [ ] Fill room details and create
- [ ] Payment dialog appears (Rs.50)
- [ ] Payment initialized successfully
- [ ] Redirected to payment callback page
- [ ] Payment shows success status
- [ ] Redirected to Owner Dashboard
- [ ] Room appears in "Uploaded Rooms" tab

### Dashboard Testing
- [ ] Owner Dashboard shows "Uploaded Rooms" tab
- [ ] Owner Dashboard shows "Applications" tab
- [ ] User Dashboard shows "Applications" tab
- [ ] Can view applications as owner
- [ ] Can accept/reject applications
- [ ] Can delete uploaded rooms
- [ ] Can edit room details

### API Testing
```bash
# Get uploaded rooms (as owner)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/posts/my-listings

# Get applications (as owner)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/applications/owner

# Get applications (as tenant)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/applications/my-applications

# Initialize room payment
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postId": "room_id"}' \
  http://localhost:5000/api/room-payments/initialize
```

---

## 🔐 Security Features

1. **User Role Validation**
   - Backend validates user role on protected routes
   - Owner routes check `userType === "owner"`
   - Tenant routes check `userType === "tenant"`

2. **Payment Security**
   - Payment tied to specific user and post
   - User cannot make payment for others' posts
   - Transaction ID stored for audit trail

3. **Authorization**
   - Only post owner can manage room details
   - Only room owner can receive applications
   - Only tenant can create applications

---

## 📝 Notes for Developers

### Important URLs
- **Local Backend**: http://localhost:5000
- **Local Frontend**: http://localhost:5173
- **API Docs**: http://localhost:5000/api-docs

### Common Issues & Solutions

**Issue**: Forgot password not working
- **Solution**: Verify API_BASE_URL is set to `http://localhost:5000/api`
- **Check**: Browser DevTools → Network tab → Check request URL

**Issue**: Room payment not initializing
- **Solution**: Ensure room creation was successful first
- **Check**: Verify postId is valid in database

**Issue**: Owner Dashboard not showing rooms
- **Solution**: Make sure logged in as owner role
- **Check**: User role in token/localStorage

**Issue**: Application status not updating
- **Solution**: Verify user is room owner
- **Check**: Backend returns authorization error if not owner

---

## ✅ Deployment Checklist

- [ ] Update `VITE_API_BACKEND_URL` environment variable
- [ ] Configure email service for production (replace mock)
- [ ] Set up Khalti payment gateway integration
- [ ] Update MongoDB connection string
- [ ] Configure JWT secret
- [ ] Set up CDN for image uploads
- [ ] Enable HTTPS for payment pages
- [ ] Test complete user flows
- [ ] Monitor payment transactions
- [ ] Set up automated backups

---

## 🚀 Future Enhancements

1. **Multiple Payment Methods**
   - Integrate real Khalti, eSewa, Bank transfers
   - Mobile wallet support

2. **Payment Analytics**
   - Dashboard showing payment statistics
   - Revenue tracking for admins

3. **Subscription Plans**
   - Monthly/yearly subscription for owners
   - Unlimited room uploads for subscribers

4. **Automated Room Deactivation**
   - Auto-deactivate after period of inactivity
   - Auto-reactivate on request

5. **Review & Rating**
   - Tenants review owners
   - Room rating system

6. **Advanced Search**
   - Full-text search
   - ML-based recommendations

---

## 📞 Support & Maintenance

For issues or questions:
1. Check backend terminal for error logs
2. Review API response in DevTools
3. Verify JWT token in localStorage
4. Check database for records
5. Review environment variables

Contact: Development Team
