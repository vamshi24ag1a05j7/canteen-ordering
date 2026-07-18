import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

const empty = { name: '', description: '', price: '', category: '', imageUrl: '', available: true }

export default function MenuManager() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = () => api.get('/menu').then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, price: parseFloat(form.price) }
      if (editId) await api.put(`/admin/menu/${editId}`, payload)
      else await api.post('/admin/menu', payload)
      setForm(empty)
      setEditId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this item?')) return
    await api.delete(`/admin/menu/${id}`)
    load()
  }

  const edit = (item) => {
    setForm({ name: item.name, description: item.description || '', price: item.price, category: item.category, imageUrl: item.imageUrl || '', available: item.available })
    setEditId(item.id)
  }

  return (
    <div className="page">
      <header className="top-bar">
        <button className="link-btn" onClick={() => navigate('/orders')}>← Orders</button>
        <span className="brand">Menu Manager</span>
      </header>

      <div className="menu-manager">
        <form onSubmit={save} className="menu-form">
          <h3>{editId ? 'Edit Item' : 'Add New Item'}</h3>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
          <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
          <input placeholder="Image URL (optional)" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
          {form.imageUrl && <img src={form.imageUrl} alt="preview" className="img-preview" />}
          <label className="checkbox-label">
            <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
            Available
          </label>
          {error && <p className="login-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Add Item'}</button>
            {editId && <button type="button" className="btn-cancel" onClick={() => { setForm(empty); setEditId(null) }}>Cancel</button>}
          </div>
        </form>

        <div className="menu-list">
          {items.map(item => (
            <div key={item.id} className={`menu-list-item ${!item.available ? 'unavailable' : ''}`}>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="list-thumb" />}
              <div className="list-info">
                <strong>{item.name}</strong>
                <span>{item.category} · ₹{item.price}</span>
                {!item.available && <span className="sold-out-tag">Sold Out</span>}
              </div>
              <div className="list-actions">
                <button className="btn-edit" onClick={() => edit(item)}>Edit</button>
                <button className="btn-cancel" onClick={() => del(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
