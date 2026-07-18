import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Menu from './pages/Menu'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import AdminOrders from './pages/AdminOrders'
import AdminMenuManager from './pages/AdminMenuManager'

function PrivateRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function LoginRoute() {
  const { user } = useAuth()
  if (user?.role === 'ADMIN') return <Navigate to="/admin/orders" replace />
  if (user?.role === 'CUSTOMER') return <Navigate to="/menu" replace />
  return <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginRoute />} />
          <Route path="/menu" element={<PrivateRoute role="CUSTOMER"><Menu /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute role="CUSTOMER"><Checkout /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute role="CUSTOMER"><OrderStatus /></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute role="ADMIN"><AdminOrders /></PrivateRoute>} />
          <Route path="/admin/menu" element={<PrivateRoute role="ADMIN"><AdminMenuManager /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
