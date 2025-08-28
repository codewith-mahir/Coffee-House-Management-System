import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { items, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (user?.role === 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  const formatPrice = (price) => {
    return `৳${Math.round(price)}`;
  };

  const handleQuantityChange = (index, change) => {
    const item = items[index];
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(index, newQuantity);
      } else {
        removeFromCart(index);
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to proceed with checkout');
      navigate('/login', { replace: true });
      return;
    }
    if (!items || items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(139, 69, 19, 0.1)',
          border: '1px solid rgba(139, 69, 19, 0.1)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            color: '#D2691E'
          }}>
            🛒
          </div>
          <h2 style={{ 
            color: '#8B4513', 
            marginBottom: '1rem',
            fontSize: '2rem'
          }}>
            Your Cart is Empty
          </h2>
          <p style={{ 
            color: '#5D4037', 
            marginBottom: '2rem',
            fontSize: '1.1rem'
          }}>
            Discover our delicious menu and add some items to your cart!
          </p>
          <button
            onClick={() => window.location.href = '/menu'}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #8B4513, #CD853F)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(139, 69, 19, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #6F3410, #A0522D)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #8B4513, #CD853F)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '2rem',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #F5F5DC 50%, #FAEBD7 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '3rem',
          background: 'linear-gradient(135deg, #8B4513, #D2691E, #CD853F)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          fontFamily: 'serif',
          letterSpacing: '2px'
        }}>
          Your Cart
        </h1>
        <p style={{ 
          color: '#5D4037', 
          fontSize: '1.1rem',
          fontStyle: 'italic'
        }}>
          Review your selected items
        </p>
      </div>

      {/* Cart Items */}
      <div style={{ marginBottom: '2rem' }}>
    {items.map((item, index) => (
          <div
      key={`${item._id}-${item.customization?.size || 'medium'}-${index}`}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '1.5rem',
              marginBottom: '1rem',
              borderRadius: '15px',
              boxShadow: '0 5px 20px rgba(139, 69, 19, 0.1)',
              border: '1px solid rgba(139, 69, 19, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {/* Item Image */}
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '10px',
                border: '2px solid #F5F5DC'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
              }}
            />

            {/* Item Details */}
            <div style={{ flex: '1' }}>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                color: '#333',
                fontSize: '1.2rem'
              }}>
                {item.name}
              </h3>
              <div style={{ color: '#6b4f3a', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Size: <strong style={{ textTransform: 'capitalize' }}>{item.customization?.size || 'medium'}</strong>
              </div>
              <p style={{ 
                margin: '0 0 0.5rem 0', 
                color: '#666',
                fontSize: '0.9rem'
              }}>
                {item.description}
              </p>
              <p style={{ 
                margin: '0', 
                color: '#8B4513',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                {formatPrice((item.unitPrice ?? item.price))} each
              </p>
            </div>

            {/* Quantity Controls */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              backgroundColor: '#F5F5DC',
              padding: '0.5rem',
              borderRadius: '10px'
            }}>
              <button
                onClick={() => handleQuantityChange(index, -1)}
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  border: '2px solid #8B4513',
                  backgroundColor: 'white',
                  color: '#8B4513',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#8B4513';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#8B4513';
                }}
              >
                -
              </button>
              
              <span style={{ 
                minWidth: '30px', 
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {item.quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(index, 1)}
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  border: '2px solid #8B4513',
                  backgroundColor: 'white',
                  color: '#8B4513',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#8B4513';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#8B4513';
                }}
              >
                +
              </button>
            </div>

            {/* Item Total */}
            <div style={{ 
              textAlign: 'right',
              minWidth: '100px'
            }}>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #8B4513, #D2691E)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {formatPrice((item.unitPrice ?? item.price) * item.quantity)}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFromCart(index)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#c82333';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.transform = 'scale(1)';
              }}
              title="Remove from cart"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
        border: '2px solid rgba(139, 69, 19, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ 
            color: '#8B4513', 
            margin: '0',
            fontSize: '2rem'
          }}>
            Total: 
          </h2>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #8B4513, #D2691E, #CD853F)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {formatPrice(cartTotal)}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={clearCart}
            style={{
              flex: '1',
              minWidth: '150px',
              padding: '1rem 2rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5a6268';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#6c757d';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Clear Cart
          </button>

          <button
            onClick={handleCheckout}
            style={{
              flex: '2',
              minWidth: '200px',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #218838, #1ea085)';
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
