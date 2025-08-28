import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { sendOrderConfirmation } from '../services/emailService';

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deliveryType, setDeliveryType] = useState('Pickup');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // Debug: Log cart contents
    console.log('Checkout - Cart items:', items);
    console.log('Checkout - Cart total:', cartTotal);
    console.log('Checkout - User:', user);
  }, [isAuthenticated, items, cartTotal, user]);

  useEffect(() => {
    // Prefill name/phone from user when available
    if (user) {
      setCustomerName(prev => prev || user.name || '');
      setPhone(prev => prev || user.phone || '');
    }
  }, [user]);

  const validateForm = () => {
    if (!items || items.length === 0) return 'Your cart is empty';
    if (!isAuthenticated || !user) return 'Please log in to place an order';
    if (deliveryType === 'Home Delivery') {
      if (!customerName.trim()) return 'Full name is required for delivery';
      if (!address.trim()) return 'Delivery address is required';
      const ph = phone.trim();
      const bdPhone = /^(\+?88)?01[3-9]\d{8}$/;
      if (!bdPhone.test(ph)) return 'Enter a valid Bangladeshi phone number';
    }
    return '';
  };

  const placeOrder = async () => {
    try {
      setPlacing(true);
      setMessage('');
      setError('');

      // Validate form
      const validationMessage = validateForm();
      if (validationMessage) {
        setError(validationMessage);
        return;
      }

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      console.log('Placing order with items:', items);

      const payload = {
        items: items.map(it => ({
          menuItemId: it._id,
          quantity: it.quantity,
          customization: it.customization || { size: 'medium', extras: [], instructions: '' }
        })),
        deliveryType,
        customerName: customerName.trim(),
        address: deliveryType === 'Home Delivery' ? address.trim() : '',
        phone: deliveryType === 'Home Delivery' ? phone.trim() : '',
        deliveryNote: deliveryNote.trim()
      };

      console.log('Order payload:', payload);

  const response = await axios.post(`${API_URL}/api/orders`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log('Order response:', response);

      if (response.status === 201) {
        const created = response.data; // server returns the order document
        clearCart();
        setMessage(`Order #${created?._id || ''} placed successfully! Sending confirmation email...`);
        
        // Send confirmation email using EmailJS
        try {
          console.log('User object:', user);
          console.log('User email specifically:', user?.email);
          console.log('Sending confirmation email to:', user.email);
          console.log('Order data for email:', created);
          console.log('Order items structure:', created.items);
          
          if (!user?.email) {
            throw new Error('User email is not available');
          }
          
          const emailResult = await sendOrderConfirmation(created, user.email);
          if (emailResult.success) {
            console.log('Confirmation email sent successfully');
            setMessage(`Order #${created?._id || ''} placed successfully! Confirmation email sent to ${user.email}.`);
          } else {
            console.warn('Email sending failed:', emailResult.error);
            setMessage(`Order #${created?._id || ''} placed successfully! However, confirmation email failed to send: ${emailResult.error}`);
          }
        } catch (emailError) {
          console.warn('Email service error:', emailError);
          setMessage(`Order #${created?._id || ''} placed successfully! However, confirmation email failed to send due to a technical error: ${emailError.message || emailError}`);
        }
      }
    } catch (err) {
      console.error('Order failed:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);

      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || 'Invalid order data');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setPlacing(false);
    }
  };

  // Redirect if not authenticated
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{
        fontSize: '2rem',
        background: 'linear-gradient(135deg, #8B4513, #D2691E, #CD853F)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontFamily: 'serif'
      }}>Checkout</h1>

      {/* Cart Summary */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, color: '#8B4513' }}>Order Summary</h3>

        {items.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div>
            {items.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: index < items.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <div>
                  <strong>{item.name}</strong>
                  <br />
                  <small style={{ color: '#666' }}>
                    Size: {item.customization?.size || 'medium'}
                    {item.customization?.extras?.length > 0 && (
                      <> | Extras: {item.customization.extras.join(', ')}</>
                    )}
                    {item.customization?.instructions && (
                      <> | {item.customization.instructions}</>
                    )}
                  </small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>Qty: {item.quantity}</div>
                  <div style={{ color: '#8B4513', fontWeight: 'bold' }}>
                    ৳{Math.round((item.price || 0) * item.quantity)}
                  </div>
                </div>
              </div>
            ))}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
              borderTop: '2px solid #8B4513',
              marginTop: '1rem',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              <span>Total:</span>
              <span style={{ color: '#8B4513' }}>৳{Math.round(cartTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Options */}
      <div style={{
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '1px solid #eee'
      }}>
        <h3 style={{ marginTop: 0, color: '#8B4513' }}>Delivery Option</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="deliveryType"
              value="Pickup"
              checked={deliveryType === 'Pickup'}
              onChange={() => setDeliveryType('Pickup')}
            />
            Pickup
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="deliveryType"
              value="Home Delivery"
              checked={deliveryType === 'Home Delivery'}
              onChange={() => setDeliveryType('Home Delivery')}
            />
            Home Delivery
          </label>
        </div>

        {deliveryType === 'Home Delivery' && (
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House, Road, Area, City"
                rows={3}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd', resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 01XXXXXXXXX or +8801XXXXXXXXX"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Notes (optional)</label>
              <input
                type="text"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Any special instructions for delivery"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #c3e6cb'
        }}>
          <strong>Success:</strong> {message}
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={placeOrder}
        disabled={
          placing || items.length === 0 || !isAuthenticated || !!validateForm()
        }
        style={{
          width: '100%',
          padding: '1rem 2rem',
          background: placing || items.length === 0 || !isAuthenticated
            ? '#ccc'
            : 'linear-gradient(135deg, #8B4513, #CD853F)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: placing || items.length === 0 || !isAuthenticated || !!validateForm() ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {placing ? 'Placing Order...' : items.length === 0 ? 'Cart is Empty' : 'Place Order'}
      </button>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#666'
        }}>
          <strong>Debug Info:</strong><br />
          Authenticated: {isAuthenticated ? 'Yes' : 'No'}<br />
          User ID: {user?.id || 'None'}<br />
          Cart Items: {items.length}<br />
          Cart Total: ৳{Math.round(cartTotal)}<br />
          API URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000'}
        </div>
      )}
    </div>
  );
}
