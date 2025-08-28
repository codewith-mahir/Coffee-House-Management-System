import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/orders/mine`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          withCredentials: true
        });
        const data = Array.isArray(res.data) ? res.data : (res.data.orders || []);
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch /api/orders/mine:', err?.response?.status, err?.response?.data || err.message);
        const attempted = err.config ? `${err.config.method?.toUpperCase() || 'GET'} ${err.config.url}` : undefined;
        const status = err.response?.status;
        const serverBody = err.response?.data;
        const msg = status ? `${status} - ${err.message}` : (err.message || 'Failed to load orders');
        setError((attempted ? `${msg} (requested: ${attempted})` : msg) + (serverBody ? ` — server: ${JSON.stringify(serverBody)}` : ''));
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <div className="tile" style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem' }}>Loading...</div>;
  if (error) return <div className="tile" style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem', color: '#7a5a48' }}>{error}</div>;
  if (!orders.length) return (
    <div className="tile orders-empty" style={{ maxWidth: 900, margin: '2rem auto', padding: '2.5rem', textAlign: 'center' }}>
      <h3 className="section-title">No Orders Yet</h3>
      <div className="divider-accent" />
      <p style={{ color: '#6b4a38' }}>You don't have any previous orders. Start exploring the menu and place your first order.</p>
    </div>
  );

  return (
    <div className="orders-container coffee-light-bg" style={{ padding: '2.5rem 1rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 className="section-title">My Orders</h2>
        <div className="divider-accent" />

        <div className="orders-grid" style={{ display: 'grid', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order._id} className="order-card tile glass glow-hover fade-in-up" style={{ padding: '1rem 1.25rem' }}>
              <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#7a4a21' }}>Order ID <span style={{ fontWeight: 700, color: '#4e342e' }}>{order._id}</span></div>
                  <div style={{ fontSize: 13, color: '#8a6a57' }}>{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`pill-badge badge-role status-badge`} style={{ background: order.status === 'delivered' ? 'linear-gradient(90deg,#CFEFD8,#A7E4B7)' : 'linear-gradient(90deg,#FFF1E0,#FFE6CC)' }}>
                    {order.status ? order.status.toUpperCase() : 'PENDING'}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#5D4037', marginTop: 8 }}>৳{order.total}</div>
                </div>
              </div>

              <div className="order-body" style={{ marginTop: 12, display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div className="item-line" key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed rgba(124,69,25,0.06)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#4E342E' }}>{item.name} <span style={{ fontWeight: 500, color: '#8a6a57' }}>({item.customization?.size})</span></div>
                        <div style={{ fontSize: 13, color: '#7a5a48' }}>{item.customization?.extras?.length ? item.customization.extras.join(', ') : <em style={{ color: '#b0886a' }}>No extras</em>} {item.customization?.instructions ? ` • ${item.customization.instructions}` : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 90 }}>
                        <div style={{ fontWeight: 700 }}>x{item.quantity}</div>
                        <div style={{ color: '#5D4037', fontWeight: 700 }}>৳{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {order.deliveryType === 'Home Delivery' && (
                  <div className="delivery-info" style={{ paddingTop: 8, fontSize: 14, color: '#6b4a38' }}>
                    <div><strong>Address:</strong> {order.address}</div>
                    <div><strong>Phone:</strong> {order.phone}</div>
                    {order.deliveryNote && <div><strong>Note:</strong> {order.deliveryNote}</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
