import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Orders from './pages/Orders'
import MenuManager from './pages/MenuManager'

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function LoginRoute() {
  const { user } = useAuth()
  if (user?.role === 'ADMIN') return <Navigate to="/orders" replace />
  if (user?.role === 'CUSTOMER') return <Navigate to="/menu" replace />
  return <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginRoute />} />
          <Route path="/orders" element={<AdminRoute><Orders /></AdminRoute>} />
          <Route path="/menu" element={<AdminRoute><MenuManager /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
