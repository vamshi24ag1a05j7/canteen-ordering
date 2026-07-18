import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/api'

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { cart, items } = state || {}
  const [note, setNote] = useState('')
  const [payMethod, setPayMethod] = useState('CASH')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!cart || !items) return <p>No cart data.</p>

  const cartItems = Object.entries(cart).map(([id, qty]) => ({
    item: items.find(i => i.id === parseInt(id)),
    qty
  })).filter(x => x.item)

  const total = cartItems.reduce((s, { item, qty }) => s + item.price * qty, 0)

  const handleOrder = async () => {
    setLoading(true)
    setError('')
    try {
      const orderRes = await api.post('/orders', {
        items: cartItems.map(({ item, qty }) => ({ menuItemId: item.id, quantity: qty })),
        pickupNote: note
      })
      await api.post('/payments/pay', { orderId: orderRes.data.id, paymentMethod: payMethod })
      navigate('/orders/' + orderRes.data.id)
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page checkout-page">
      <header className="top-bar">
        <button className="link-btn" onClick={() => navigate('/menu')}>← Back to Menu</button>
        <span className="brand">Checkout</span>
      </header>

      <div className="checkout-card">
        <h2>Your Order</h2>
        {cartItems.map(({ item, qty }) => (
          <div key={item.id} className="order-row">
            <span>{item.name} × {qty}</span>
            <span>₹{(item.price * qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="order-row total-row">
          <strong>Total</strong>
          <strong>₹{total.toFixed(2)}</strong>
        </div>

        <label>Pickup Note (optional)</label>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. less spicy" />

        <label>Payment Method</label>
        <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
        </select>

        {error && <p className="login-error">{error}</p>}
        <button className="btn-primary" onClick={handleOrder} disabled={loading}>
          {loading ? 'Placing order…' : 'Place Order & Pay'}
        </button>
      </div>
    </div>
  )
}
