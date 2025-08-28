import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function UserProfile() {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [lastOrder, setLastOrder] = useState(null);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    let mounted = true;
    // Only attempt to load orders when we have a logged-in user
    if (!user) return;

    async function loadOrders() {
      try {
        setOrdersError('');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/orders/mine`, { headers: { Authorization: token ? `Bearer ${token}` : undefined }, withCredentials: true });
        if (!mounted) return;
        const orders = Array.isArray(res.data) ? res.data : (res.data.orders || []);
        setOrderCount(orders.length || 0);
        if (orders.length) setLastOrder(orders[0]);
      } catch (err) {
        // surface diagnostics so it's easier to debug when orders fail to load
        console.error('Failed to load user orders:', err?.response?.status, err?.response?.data || err.message);
        if (!mounted) return;
        setOrderCount(0);
        setLastOrder(null);
        const attempted = err.config ? `${err.config.method?.toUpperCase() || 'GET'} ${err.config.url}` : undefined;
        const status = err.response?.status;
        const serverBody = err.response?.data;
        const msg = status ? `${status} - ${err.message}` : (err.message || 'Failed to load orders');
        setOrdersError((attempted ? `${msg} (requested: ${attempted})` : msg) + (serverBody ? ` — server: ${JSON.stringify(serverBody)}` : ''));
      }
    }
    loadOrders();
    return () => { mounted = false; };
  }, [user]);

  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <div className="tile" style={{ maxWidth: 750, margin: '0 auto', padding: '2rem' }}>
      <h2 className="section-title">My Profile</h2>
      <div className="divider-accent" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone || '—'}</p>
          <p><strong>Role:</strong> <span className="badge-role" style={{ textTransform: 'capitalize' }}>{user.role}</span></p>

          <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
            <Link to="/my-orders" style={{ textDecoration: 'none', color: '#8B4513', padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(139,69,19,0.08)' }}>
              View My Orders
            </Link>
            <Link to="/profile/edit" style={{ textDecoration: 'none', color: '#8B4513', padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(139,69,19,0.08)' }}>
              Edit Profile
            </Link>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))', padding: 16, borderRadius: 12, border: '1px solid rgba(124,69,25,0.08)' }}>
          <h4 style={{ margin: 0, color: '#4E342E' }}>Quick Summary</h4>
          <div style={{ marginTop: 10, fontSize: 14, color: '#6b4a38' }}>
            <div><strong>Total Orders:</strong> {orderCount}</div>
            {ordersError && (
              <div style={{ marginTop: 8, color: '#b00020', fontSize: 13 }}>
                <strong>Orders load error:</strong> {ordersError}
              </div>
            )}
            {lastOrder ? (
              <div style={{ marginTop: 8 }}>
                <div><strong>Last Order:</strong></div>
                <div style={{ fontSize: 13, color: '#7a5a48' }}>{new Date(lastOrder.createdAt).toLocaleString()}</div>
                <div style={{ fontWeight: 700, color: '#5D4037', marginTop: 6 }}>৳{lastOrder.total}</div>
              </div>
            ) : (
              <div style={{ marginTop: 8, color: '#9b7b66' }}>No orders yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
