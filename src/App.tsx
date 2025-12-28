import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { LandingPage, ItemDetail, Login, Register } from './pages'
import { Dashboard } from './components/Dashboard'
import { AppLayout } from './components/layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageTransition } from './components/PageTransition'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CartPlaceholder } from './components/CartPlaceholder'
import { Chatbot } from './components/Chatbot'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { HomeIcon, HeartIcon, LoginIcon, CartIcon, LogoutIcon } from './components/ui/Icons'
import { NavigationItem } from './types'
import './App.css'

/**
 * Main App component with React Router configuration
 * Handles routing between landing page, dashboard, and item detail pages
 * Integrates with layout system for consistent navigation
 * Requirements: 9.1, 9.3, 9.4, 10.1, 10.2, 10.5, 11.1, 11.2, 11.5
 */
function AppContent() {
  const location = useLocation()
  const { isAuthenticated, logout, user } = useAuth()
  
  // State for placeholder modals
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)

  // Navigation items for sidebar
  const navigationItems: NavigationItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: HomeIcon
    },
    {
      path: '/wishlist',
      label: 'My Wishlist',
      icon: HeartIcon
    },
    // Show different items based on authentication status
    ...(isAuthenticated ? [
      {
        path: '/logout',
        label: 'Logout',
        icon: LogoutIcon,
        isPlaceholder: true,
        onClick: () => {
          logout()
          // Navigate to home after logout
          window.location.href = '/'
        }
      }
    ] : [
      {
        path: '/login',
        label: 'Login',
        icon: LoginIcon
      }
    ]),
    {
      path: '/cart', // Placeholder path
      label: 'Cart',
      icon: CartIcon,
      isPlaceholder: true,
      onClick: () => setCartModalOpen(true)
    }
  ]

  // Get page title based on current route
  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard'
      case '/wishlist':
        return 'My Wishlist'
      case '/login':
        return 'Login'
      case '/register':
        return 'Register'
      default:
        if (pathname.startsWith('/item/')) {
          return 'Item Details'
        }
        return 'Wishlist Tracker'
    }
  }

  const pageTitle = getPageTitle(location.pathname)

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <PageTransition>
            <LandingPage />
          </PageTransition>
        } />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AppLayout
                  currentPath={location.pathname}
                  pageTitle={pageTitle}
                  navigationItems={navigationItems}
                  userEmail={user?.email}
                >
                  <Dashboard />
                </AppLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        
        {/* Wishlist page (alias for dashboard) */}
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AppLayout
                  currentPath={location.pathname}
                  pageTitle={pageTitle}
                  navigationItems={navigationItems}
                  userEmail={user?.email}
                >
                  <Dashboard />
                </AppLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        
        {/* Item detail page with layout */}
        <Route 
          path="/item/:itemId" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AppLayout
                  currentPath={location.pathname}
                  pageTitle={pageTitle}
                  navigationItems={navigationItems}
                  userEmail={user?.email}
                >
                  <ItemDetail />
                </AppLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      {/* Placeholder modals */}
      <CartPlaceholder 
        isOpen={cartModalOpen} 
        onClose={() => setCartModalOpen(false)} 
      />
      
      {/* Chatbot */}
      <Chatbot 
        isOpen={chatbotOpen} 
        onToggle={() => setChatbotOpen(!chatbotOpen)} 
      />
    </ErrorBoundary>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App