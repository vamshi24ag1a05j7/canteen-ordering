import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Menu() {
  const [items, setItems] = useState([])
  const [cart, setCart] = useState({})
  const [category, setCategory] = useState('All')
  const [error, setError] = useState('')
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/menu').then(r => setItems(r.data)).catch(() => setError('Could not load menu.'))
  }, [])

  const categories = ['All', ...new Set(items.map(i => i.category))]
  const filtered = category === 'All' ? items : items.filter(i => i.category === category)

  const add = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const remove = (id) => setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n })
  const total = Object.entries(cart).reduce((s, [id, qty]) => {
    const item = items.find(i => i.id === parseInt(id))
    return s + (item ? item.price * qty : 0)
  }, 0)

  const placeOrder = () => {
    if (!Object.keys(cart).length) return
    navigate('/checkout', { state: { cart, items } })
  }

  return (
    <div className="page">
      <header className="top-bar">
        <span className="brand">🍽️ Canteen</span>
        <span>Hi, {user?.fullName || user?.email}</span>
        <button className="link-btn" onClick={() => { logout(); navigate('/') }}>Logout</button>
      </header>

      {error && <p className="error-msg">{error}</p>}

      <div className="category-chips">
        {categories.map(c => (
          <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="menu-grid">
        {filtered.map(item => (
          <div key={item.id} className={`menu-card ${!item.available ? 'sold-out' : ''}`}>
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="item-img" />}
            <div className="card-body">
              <h3>{item.name}</h3>
              <p className="desc">{item.description}</p>
              <div className="card-footer">
                <span className="price">₹{item.price}</span>
                {item.available ? (
                  cart[item.id] ? (
                    <div className="qty-ctrl">
                      <button onClick={() => remove(item.id)}>−</button>
                      <span>{cart[item.id]}</span>
                      <button onClick={() => add(item.id)}>+</button>
                    </div>
                  ) : (
                    <button className="btn-add" onClick={() => add(item.id)}>Add</button>
                  )
                ) : (
                  <span className="sold-out-tag">Sold Out</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(cart).length > 0 && (
        <div className="cart-bar">
          <span>{Object.values(cart).reduce((a, b) => a + b, 0)} items · ₹{total.toFixed(2)}</span>
          <button className="btn-primary" onClick={placeOrder}>View Cart & Checkout →</button>
        </div>
      )}
    </div>
  )
}
