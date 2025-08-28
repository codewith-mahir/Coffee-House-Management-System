import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function AdminOrders() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    async function fetchOrders() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = {};
        if (status) params.status = status;
        const res = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
          params,
          withCredentials: true
        });
        setOrders(res.data);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated, user, status]);

  const updateStatus = async (id, newStatus) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || '';
      await axios.patch(`${API_URL}/api/orders/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(o => o.map(ord => ord._id === id ? { ...ord, status: newStatus } : ord));
    } catch {
      alert('Failed to update status');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') return <div style={{ padding: '1rem' }}>Unauthorized</div>;
  if (loading) return <div style={{ padding: '1rem' }}>Loading orders…</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
      <h2 className="section-title">All Orders (Admin Dashboard)</h2>
      <div className="divider-accent" />
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: 8 }}>Filter by status:</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {error && <div style={{ color: '#b00020', marginBottom: '1rem' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {orders.map(order => (
          <div key={order._id} className="glass" style={{ padding: '1rem', borderRadius: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Order #{order._id.slice(-6)}</div>
            <div style={{ marginBottom: 6, color: '#4E342E' }}>Status: <strong style={{ textTransform: 'capitalize' }}>{order.status}</strong></div>
            <div style={{ marginBottom: 6 }}>Total: ৳{order.total}</div>
            <div style={{ maxHeight: 150, overflow: 'auto', background: '#fff', borderRadius: 8, border: '1px solid #eee', padding: 8 }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ fontSize: 13, color: '#333', marginBottom: 4 }}>
                  • {item.name} x{item.quantity} — {item.customization.size}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                <button key={s} onClick={() => updateStatus(order._id, s)} style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 6, background: order.status === s ? '#8B4513' : '#fff', color: order.status === s ? '#fff' : '#333', cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
            {order.deliveryType === 'Home Delivery' && (
              <div style={{ marginTop: 8 }}>
                <div><strong>Address:</strong> {order.address}</div>
                <div><strong>Phone:</strong> {order.phone}</div>
                <div><strong>Note:</strong> {order.deliveryNote}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
