# CORS & Geolocation Implementation Guide

## 🔧 What Was Fixed

### 1. CORS Error Resolution
**Problem**: Frontend (localhost:5173) couldn't communicate with Backend (localhost:5000) due to CORS restrictions.

**Solution**: Updated CORS configuration in `backend/index.js`
- Added support for both localhost:3000 and localhost:5173
- Included proper CORS headers (Authorization, Content-Type)
- Enabled credentials and all HTTP methods

**Files Modified**:
- `backend/index.js` - CORS middleware configuration

### 2. API Base URL Configuration
**Problem**: Frontend was using hardcoded localhost:3000 instead of 5000.

**Solution**: Updated frontend API configuration
- Changed default API URL to `http://localhost:5000/api`
- Fixed axios setup to use correct base URL

**Files Modified**:
- `frontend/src/context/AuthContext.jsx` - Fixed API_BASE_URL

### 3. Geolocation Feature Implementation
**Problem**: Users' locations weren't being captured or used for filtering.

**Solution**: Implemented complete geolocation workflow:

#### Backend Changes:
- Updated User model to store `latitude` and `longitude` in address field
- Enhanced geolocation search in PostController
- Improved recommendations algorithm based on user location

#### Frontend Changes:
- Added geolocation request in AuthContext.jsx
- Created "Get My Location" button in Signup form
- Integrated location into user registration
- Added location-based filtering on ListingsPage

**Files Modified**:
- `backend/model/UserModel.js` - Added latitude/longitude fields
- `backend/controller/PostController.js` - Enhanced location-based search
- `frontend/src/context/AuthContext.jsx` - Added geolocation capture
- `frontend/src/pages/auth/Signup.jsx` - Added location button
- `frontend/src/pages/listings/ListingsPage.jsx` - Added geolocation filtering

### 4. Database Integration
- User locations are now stored in MongoDB
- Geospatial queries find nearby properties within specified radius
- Support for fallback to regular search if geospatial query fails

---

## 🚀 How to Use

### For Users (Frontend):

#### 1. Registration with Geolocation
```
1. Go to Sign Up page
2. Fill in basic information (Name, Email, Password)
3. Click "Get My Location" button
4. Browser will request location permission
5. Once approved, coordinates are captured and stored
6. Complete registration
```

#### 2. Search Properties by Location
```
1. Go to Listings page
2. Click "📍 Near Me" button to enable geolocation search
3. Set desired radius (e.g., 10km, 20km)
4. Properties near your location will be displayed
5. Click "Clear Location" to return to regular search
```

### For Developers:

#### Backend API Endpoints:

**Get Recommendations (Location-based)**:
```bash
GET /api/posts/recommendations?latitude=27.7172&longitude=85.3240&category=Flat&limit=10
```

**Nearby Search**:
```bash
GET /api/posts/nearby?latitude=27.7172&longitude=85.3240&maxDistance=5000
```

**Prefix Search** (Location autocomplete):
```bash
GET /api/posts/search/prefix?query=Kath&type=location&limit=10
```

#### Frontend API Usage:

**Get User Location**:
```javascript
import { useAuth } from '@context/useAuth';

function MyComponent() {
  const { userLocation } = useAuth();
  
  if (userLocation) {
    console.log(`Lat: ${userLocation.latitude}, Lon: ${userLocation.longitude}`);
  }
}
```

---

## 📋 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

---

## ✅ Testing Checklist

- [ ] Backend server running on http://localhost:5000
- [ ] Frontend server running on http://localhost:5173
- [ ] User can access Signup page without CORS errors
- [ ] "Get My Location" button works in Signup form
- [ ] Location coordinates saved in database
- [ ] User can login successfully
- [ ] Can access Listings page
- [ ] "📍 Near Me" button enables geolocation search
- [ ] Properties appear sorted by distance
- [ ] Can clear location filter
- [ ] API docs available at http://localhost:5000/api-docs

---

## 🛡️ Security Notes

1. **CORS Origins**: Only allowed origins can access the API
2. **JWT Token**: Used for authentication on protected routes
3. **Geolocation**: Browser requests permission before sharing location
4. **Data Storage**: Coordinates stored securely in database with user authentication

---

## 📚 Related Files Structure

```
backend/
├── middleware/
│   └── auth.js (JWT verification)
├── controller/
│   ├── AuthController.js (Registration with location)
│   └── PostController.js (Location-based search)
├── model/
│   ├── UserModel.js (Stores user location)
│   └── PostModel.js (Property locations)
└── config/
    └── swagger.js (API documentation)

frontend/
├── context/
│   └── AuthContext.jsx (Geolocation capture)
├── pages/
│   ├── auth/
│   │   └── Signup.jsx (Location button)
│   └── listings/
│       └── ListingsPage.jsx (Location filtering)
└── hooks/
    └── useApi.js (API calls)
```

---

## 🔄 How It Works (Flow Diagram)

```
User Registration Flow:
├── User fills registration form
├── Clicks "Get My Location" button
├── Browser requests geolocation permission
├── User approves location access
├── Coordinates captured (latitude, longitude)
├── User submits registration
└── Location stored in User document in MongoDB

Listing Search Flow:
├── User on Listings page
├── Clicks "📍 Near Me" button
├── Frontend sends: { latitude, longitude, radius }
├── Backend performs geospatial query
├── Database returns properties within radius
├── Properties displayed sorted by distance
└── User can click to view details
```

---

## 🐛 Troubleshooting

### Issue: Still getting CORS error
**Solution**: 
- Check backend is running on port 5000
- Verify CORS_ORIGIN in .env includes your frontend URL
- Clear browser cache and cookies
- Restart both servers

### Issue: Location not being captured
**Solution**:
- Check browser geolocation permissions
- Ensure HTTPS or localhost (required for geolocation)
- Check browser console for permission errors
- Verify localStorage is enabled

### Issue: Nearby search returns no results
**Solution**:
- Check properties have location coordinates stored
- Increase search radius
- Verify geospatial index exists on MongoDB
- Check MongoDB connection

---

## 📞 Support

For issues or questions:
1. Check API documentation at http://localhost:5000/api-docs
2. Review console logs on frontend and backend
3. Verify environment variables are correctly set
4. Check MongoDB connection status
