import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const STATUS_ORDER = ['PLACED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED']
const NEXT = { PLACED: 'PREPARING', PREPARING: 'READY_FOR_PICKUP', READY_FOR_PICKUP: 'COMPLETED' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const load = () => api.get('/admin/orders').then(r => setOrders(r.data)).catch(() => setError('Failed to load orders.'))

  useEffect(() => {
    load()
    const t = setInterval(load, 8000)
    return () => clearInterval(t)
  }, [])

  const advance = async (id, next) => {
    await api.put(`/admin/orders/${id}/status`, { status: next })
    load()
  }

  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s)
    return acc
  }, {})

  return (
    <div className="page">
      <header className="top-bar">
        <span className="brand">🔧 Kitchen Display</span>
        <button className="link-btn" onClick={() => navigate('/admin/menu')}>Menu Manager</button>
        <button className="link-btn" onClick={() => { logout(); navigate('/') }}>Logout</button>
      </header>
      {error && <p className="error-msg">{error}</p>}
      <div className="kds-board">
        {['PLACED', 'PREPARING', 'READY_FOR_PICKUP'].map(status => (
          <div key={status} className="kds-col">
            <h3 className={`kds-col-title ${status.toLowerCase().replace(/_/g, '-')}`}>{status.replace(/_/g, ' ')}</h3>
            {grouped[status].map(order => (
              <div key={order.id} className="kds-card">
                <div className="kds-card-header">
                  <span>Order #{order.id}</span>
                  <span className="kds-customer">{order.customer?.fullName || order.customer?.email}</span>
                </div>
                {order.items?.map(oi => (
                  <div key={oi.id} className="kds-item">{oi.menuItem?.name} × {oi.quantity}</div>
                ))}
                {order.pickupNote && <p className="kds-note">📝 {order.pickupNote}</p>}
                <div className="kds-actions">
                  {NEXT[status] && (
                    <button className="btn-primary" onClick={() => advance(order.id, NEXT[status])}>
                      → {NEXT[status].replace(/_/g, ' ')}
                    </button>
                  )}
                  <button className="btn-cancel" onClick={() => advance(order.id, 'CANCELLED')}>Cancel</button>
                </div>
              </div>
            ))}
            {grouped[status].length === 0 && <p className="kds-empty">No orders</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
