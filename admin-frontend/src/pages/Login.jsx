import React, { useState } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [tab, setTab] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const switchTab = (t) => {
    setTab(t)
    setError('')
    setEmail('')
    setPassword('')
    setFullName('')
    setIsRegister(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await api.post('/auth/register', { fullName, email, password })
        setIsRegister(false)
        setPassword('')
        return
      }
      const res = await api.post('/auth/login', { email, password })
      const { token, role, ...userData } = res.data
      if (tab === 'admin' && role !== 'ADMIN') {
        setError('Not an admin account.')
        return
      }
      if (tab === 'customer' && role !== 'CUSTOMER') {
        setError('Use the Admin tab to log in as admin.')
        return
      }
      login({ ...userData, role }, token)
      navigate(role === 'ADMIN' ? '/orders' : '/menu')
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to server. Make sure the backend is running on port 8080.')
      } else if (err.response?.status === 401) {
        setError('Wrong email or password.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-logo">🍽️</span>
          <h1>College Canteen</h1>
          <p>Order food, track status, manage the kitchen</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'customer' ? 'active' : ''}`}
            onClick={() => switchTab('customer')}
          >
            👤 Customer
          </button>
          <button
            className={`login-tab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => switchTab('admin')}
          >
            🔧 Admin / Staff
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && tab === 'customer' && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        {tab === 'customer' && (
          <p className="login-switch">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button className="link-btn" onClick={() => { setIsRegister(!isRegister); setError('') }}>
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        )}

        {tab === 'admin' && (
          <p className="login-hint">Admin accounts are created by the system administrator.</p>
        )}
      </div>
    </div>
  )
}
