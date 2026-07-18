import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const STATUS_ORDER = ['PLACED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED']
const NEXT = { PLACED: 'PREPARING', PREPARING: 'READY_FOR_PICKUP', READY_FOR_PICKUP: 'COMPLETED' }

function fmt(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) +
    ' · ' + d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})
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

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s)
    return acc
  }, {})

  const doneOrders = [...grouped['COMPLETED'], ...grouped['CANCELLED']]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="page">
      <header className="top-bar">
        <span className="brand">🔧 Kitchen Display</span>
        <button className="link-btn" onClick={() => navigate('/menu')}>Menu Manager</button>
        <button className="link-btn" onClick={() => { logout(); navigate('/') }}>Logout</button>
      </header>

      {error && <p className="error-msg">{error}</p>}

      {/* ── ACTIVE ORDERS KDS ── */}
      <div className="kds-board">
        {['PLACED', 'PREPARING', 'READY_FOR_PICKUP'].map(status => (
          <div key={status} className="kds-col">
            <h3 className={`kds-col-title ${status.toLowerCase().replace(/_/g, '-')}`}>
              {status.replace(/_/g, ' ')}
              {grouped[status].length > 0 && <span className="kds-count">{grouped[status].length}</span>}
            </h3>
            {grouped[status].map(order => (
              <div key={order.id} className="kds-card">
                <div className="kds-card-header">
                  <span>Order #{order.id}</span>
                  <span className="kds-customer">{order.customer?.fullName || order.customer?.email}</span>
                </div>
                <div className="kds-time">{fmt(order.createdAt)}</div>
                {order.items?.map(oi => (
                  <div key={oi.id} className="kds-item">
                    <span>{oi.menuItem?.name} × {oi.quantity}</span>
                    <span className="kds-item-price">₹{(oi.priceAtOrderTime * oi.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="kds-total">Total: ₹{order.totalAmount?.toFixed(2)}</div>
                {order.pickupNote && <p className="kds-note">📝 {order.pickupNote}</p>}
                <div className="kds-payment">
                  💳 {order.paymentMethod || '—'} · {order.paymentStatus}
                </div>
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

      {/* ── COMPLETED / CANCELLED ORDERS ── */}
      {doneOrders.length > 0 && (
        <div className="done-section">
          <h2 className="done-title">📋 Order History ({doneOrders.length})</h2>
          <div className="done-list">
            {doneOrders.map(order => (
              <div key={order.id} className={`done-card ${order.status === 'CANCELLED' ? 'cancelled' : 'completed'}`}>
                <div className="done-header" onClick={() => toggle(order.id)}>
                  <div className="done-header-left">
                    <span className={`done-badge ${order.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-completed'}`}>
                      {order.status === 'CANCELLED' ? '✕ Cancelled' : '✓ Completed'}
                    </span>
                    <span className="done-order-id">Order #{order.id}</span>
                    <span className="done-customer">👤 {order.customer?.fullName || order.customer?.email}</span>
                  </div>
                  <div className="done-header-right">
                    <span className="done-amount">₹{order.totalAmount?.toFixed(2)}</span>
                    <span className="done-time">{fmt(order.createdAt)}</span>
                    <span className="done-toggle">{expanded[order.id] ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expanded[order.id] && (
                  <div className="done-details">
                    <div className="done-items">
                      {order.items?.map(oi => (
                        <div key={oi.id} className="done-item-row">
                          <span>{oi.menuItem?.name}</span>
                          <span>× {oi.quantity}</span>
                          <span>₹{(oi.priceAtOrderTime * oi.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="done-meta">
                      <span>💳 {order.paymentMethod || '—'}</span>
                      <span className={order.paymentStatus === 'PAID' ? 'paid' : 'unpaid'}>
                        {order.paymentStatus}
                      </span>
                      {order.transactionRef && <span>Ref: {order.transactionRef}</span>}
                      {order.pickupNote && <span>📝 {order.pickupNote}</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
