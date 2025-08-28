import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function AdminUsers() {
  const { isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        // Prefer full /api/users (returns all profile fields). If not available, fallback to /api/auth/all
        try {
          const r = await axios.get(`${API_URL}/api/users`, {
            headers: { Authorization: token ? `Bearer ${token}` : undefined },
            withCredentials: true
          });
          setUsers(r.data);
          return;
        } catch (primaryErr) {
          console.warn('/api/users failed, falling back to /api/auth/all', primaryErr);
        }

        const r2 = await axios.get(`${API_URL}/api/auth/all`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          withCredentials: true
        });
        setUsers(r2.data);
      } catch (err) {
        // If server doesn't expose /api/users, try alternate admin route
  // no-op here; we'll surface the error below with diagnostics
  console.error('Failed to fetch users:', err);
  const attempted = err.config ? `${err.config.method?.toUpperCase() || 'GET'} ${err.config.url}` : undefined;
  const status = err.response?.status;
  const serverBody = err.response?.data;
  const serverMsg = err.response?.data?.error;
  const msg = status ? `${status} - ${serverMsg || err.message}` : (err.message || 'Failed to load users');
  const full = attempted ? `${msg} (requested: ${attempted})` : msg;
  setError(full + (serverBody ? ` — server response: ${JSON.stringify(serverBody)}` : ''));
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  function retryFetch() {
    setError('');
    setUsers([]);
    // re-run effect by calling fetchUsers directly
    (async function () {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        // Try primary on retry as well
        try {
          const r = await axios.get(`${API_URL}/api/users`, { headers: { Authorization: token ? `Bearer ${token}` : undefined }, withCredentials: true });
          setUsers(r.data);
          return;
        } catch (primaryErr) {
          console.warn('Retry: /api/users failed, falling back to /api/auth/all', primaryErr);
        }

        const res = await axios.get(`${API_URL}/api/auth/all`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          withCredentials: true
        });
        setUsers(res.data);
      } catch (err) {
  console.error('Retry failed:', err);
  const attempted = err.config ? `${err.config.method?.toUpperCase() || 'GET'} ${err.config.url}` : undefined;
  const status = err.response?.status;
  const serverBody = err.response?.data;
  const serverMsg = err.response?.data?.error;
  const msg = status ? `${status} - ${serverMsg || err.message}` : (err.message || 'Failed to load users');
  const full = attempted ? `${msg} (requested: ${attempted})` : msg;
  setError(full + (serverBody ? ` — server response: ${JSON.stringify(serverBody)}` : ''));
      } finally {
        setLoading(false);
      }
    })();
  }

  async function fetchUserDetails(userId) {
    try {
      setLoading(true);
      setUserDetails(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        withCredentials: true
      });
      setUserDetails(res.data);
    } catch (err) {
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }

  // Server-side user deletion has been disabled. The client no longer
  // provides a delete action to avoid calling a removed endpoint.

  if (!isAuthenticated || user?.role !== 'admin') return <div style={{padding:'1rem'}}>Unauthorized</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h2>All Users</h2>
      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          <div>{error}</div>
          <button onClick={retryFetch} style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6 }}>Retry</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <h3>User List</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {users.map(u => (
              <div key={u._id} className="tile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: '#F7EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a4a21', fontWeight: 700 }}>{(u.name || '').charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#4E342E' }}>{u.name} <span style={{ fontSize: 12, color: '#7a5a48' }}>({u.email})</span></div>
                    <div style={{ fontSize: 13, color: '#7a5a48' }}>{u.phone || '—'} • Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: 12, color: '#9b7b66' }}>{u.address?.city ? `${u.address.city}${u.address.state ? `, ${u.address.state}` : ''}` : ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div className="badge-role">{u.role}</div>
                  <button onClick={() => fetchUserDetails(u._id)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.06)', background: 'white' }}>Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 2 }}>
          {loading && <div>Loading...</div>}
          {userDetails && (
            <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
              <h3>User Profile</h3>
              <div><strong>Name:</strong> {userDetails.user.name}</div>
              <div><strong>Email:</strong> {userDetails.user.email}</div>
              <div><strong>Phone:</strong> {userDetails.user.phone}</div>
              <div><strong>Role:</strong> {userDetails.user.role}</div>
              <div><strong>Joined:</strong> {new Date(userDetails.user.createdAt).toLocaleString()}</div>
              <div><strong>Address:</strong> {userDetails.user.address ? `${userDetails.user.address.street || ''} ${userDetails.user.address.city || ''} ${userDetails.user.address.state || ''} ${userDetails.user.address.zip || ''} ${userDetails.user.address.country || ''}`.trim() : '—'}</div>
              <div><strong>DOB:</strong> {userDetails.user.dob ? new Date(userDetails.user.dob).toLocaleDateString() : '—'}</div>
              <div><strong>Bio:</strong> {userDetails.user.bio || '—'}</div>
              <div style={{ marginTop: 12 }}>
                <button disabled title="Deletion disabled" style={{ background: '#ff6b6b', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 6, opacity: 0.6, cursor: 'not-allowed' }}>Deletion disabled</button>
                <div style={{ fontSize: 12, color: '#7a5a48', marginTop: 8 }}>User deletion has been disabled by the administrator.</div>
              </div>
              <h4>Orders</h4>
              {userDetails.orders.length === 0 ? <div>No orders found.</div> : (
                <ul>
                  {userDetails.orders.map(order => (
                    <li key={order._id} style={{ marginBottom: 8 }}>
                      <div><strong>Order ID:</strong> {order._id}</div>
                      <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                      <div><strong>Total:</strong> ৳{order.total}</div>
                      <div><strong>Status:</strong> {order.status || 'pending'}</div>
                      <div><strong>Items:</strong>
                        <ul>
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              {item.name} ({item.customization?.size}) x{item.quantity} - ৳{item.price}
                              {item.customization?.extras?.length ? ` + ${item.customization.extras.join(', ')}` : ''}
                              {item.customization?.instructions ? ` [${item.customization.instructions}]` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {order.deliveryType === 'Home Delivery' && (
                        <div>
                          <strong>Address:</strong> {order.address}<br/>
                          <strong>Phone:</strong> {order.phone}<br/>
                          <strong>Note:</strong> {order.deliveryNote}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
