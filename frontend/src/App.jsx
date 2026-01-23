import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import SignUp from './pages/auth/Signup'
import ListingsPage from './pages/listings/ListingsPage'
import ListingDetail from './pages/listings/ListingDetail'
import CreateListing from './pages/listings/CreateListing'
import EditListing from './pages/listings/EditListing'
import UserDashboard from './pages/user-panel/User-DashBoard'
import Homepage from './pages/landing-page/Homepage'
import About from './pages/About'
import Contact from './pages/Contact'
import Header from './components/free-components/Header'
import Footer from './components/free-components/Footer'
import { Loading } from './components/common/UIComponents'
import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin-panel/AdminDashboard'
import ForgotPassword from './pages/auth/ForgotPassword'
import ApplicationForm from './pages/listings/ApplicationForm'
import PaymentCallback from './pages/listings/PaymentCallback'
import OwnerDashboard from './pages/user-panel/OwnerDashboard'
import { ToastContainer } from "react-toastify";

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) return <Loading />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  
  // If admin route is required but user is not admin, redirect to dashboard
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function AppContent() {
  const { loading } = useAuth()

  if (loading) return <Loading />

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
        <Route path="/tenant-dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />

        <Route path="/create-listing" element={
          <ProtectedRoute>
            <CreateListing />
          </ProtectedRoute>
        } />

        <Route path="/edit-listing/:id" element={
          <ProtectedRoute>
            <EditListing />
          </ProtectedRoute>
        } />

        <Route path="/apply/:roomId" element={
          <ProtectedRoute>
            <ApplicationForm />
          </ProtectedRoute>
        } />

        <Route path="/payment-callback" element={
          <ProtectedRoute>
            <PaymentCallback />
          </ProtectedRoute>
        } />

        <Route path="/owner-dashboard" element={
          <ProtectedRoute>
             <OwnerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
         <ToastContainer />
      </AuthProvider>
    </Router>
  )
}
