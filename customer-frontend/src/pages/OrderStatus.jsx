import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'

const STEPS = ['PLACED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED']
const LABELS = { PLACED: 'Order Placed', PREPARING: 'Preparing', READY_FOR_PICKUP: 'Ready for Pickup', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }

export default function OrderStatus() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = () => api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => setError('Could not load order.'))
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [id])

  if (error) return <div className="page"><p className="error-msg">{error}</p></div>
  if (!order) return <div className="page"><p>Loading…</p></div>

  const stepIdx = STEPS.indexOf(order.status)

  return (
    <div className="page">
      <header className="top-bar">
        <button className="link-btn" onClick={() => navigate('/menu')}>← Menu</button>
        <span className="brand">Order #{order.id}</span>
      </header>

      <div className="status-card">
        <div className="status-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i <= stepIdx ? 'done' : ''} ${order.status === 'CANCELLED' && s === 'PLACED' ? 'cancelled' : ''}`}>
              <div className="step-dot" />
              <span>{LABELS[s]}</span>
            </div>
          ))}
        </div>

        {order.status === 'CANCELLED' && <p className="cancelled-msg">This order was cancelled.</p>}
        {order.status === 'READY_FOR_PICKUP' && <p className="ready-msg">🔔 Your order is ready! Please collect it from the counter.</p>}

        <div className="order-summary">
          {order.items?.map(oi => (
            <div key={oi.id} className="order-row">
              <span>{oi.menuItem?.name} × {oi.quantity}</span>
              <span>₹{(oi.priceAtOrderTime * oi.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="order-row total-row">
            <strong>Total</strong>
            <strong>₹{order.totalAmount?.toFixed(2)}</strong>
          </div>
        </div>
        <p className="payment-status">Payment: {order.paymentStatus} · {order.paymentMethod}</p>
      </div>
    </div>
  )
}
