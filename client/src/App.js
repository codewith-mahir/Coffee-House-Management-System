import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import AdminPanel from './pages/AdminPanel';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminCategories from './pages/AdminCategories';
import AdminAnalytics from './pages/AdminAnalytics';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import UserProfile from './pages/UserProfile';
import './App.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItemsCount } = useCart();

  return (
    <nav style={{ 
      display: 'flex', 
      gap: '1rem', 
      padding: '1.5rem 2rem', 
      borderBottom: '1px solid #e8e8e8',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fafafa',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <h2 style={{ 
          margin: 0, 
          background: 'linear-gradient(135deg, #8B4513, #D2691E, #CD853F)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1.8rem',
          fontWeight: 'bold',
          letterSpacing: '1px',
          fontFamily: 'serif'
        }}>
          Coffee house
        </h2>
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none', 
            color: '#8B4513', 
            fontWeight: '500',
            transition: 'all 0.3s ease',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F5F5DC';
            e.target.style.color = '#5D4037';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#8B4513';
          }}
        >
          Home
        </Link>
        <Link 
          to="/menu" 
          style={{ 
            textDecoration: 'none', 
            color: '#8B4513', 
            fontWeight: '500',
            transition: 'all 0.3s ease',
            padding: '0.5rem 1rem',
            borderRadius: '6px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F5F5DC';
            e.target.style.color = '#5D4037';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#8B4513';
          }}
        >
          Menu
        </Link>
        {isAuthenticated && user?.role !== 'admin' && (
          <Link 
            to="/cart" 
            style={{ 
              textDecoration: 'none', 
              color: '#8B4513', 
              fontWeight: '500',
              transition: 'all 0.3s ease',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#F5F5DC';
              e.target.style.color = '#5D4037';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#8B4513';
            }}
          >
            🛒 Cart
            {cartItemsCount > 0 && (
              <span style={{
                backgroundColor: '#D2691E',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                position: 'absolute',
                top: '-5px',
                right: '-5px'
              }}>
                {cartItemsCount}
              </span>
            )}
          </Link>
        )}

        {isAuthenticated ? (
          <>
            <Link 
              to="/dashboard" 
              style={{ 
                textDecoration: 'none', 
                color: '#8B4513', 
                fontWeight: '500',
                transition: 'all 0.3s ease',
                padding: '0.5rem 1rem',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F5F5DC';
                e.target.style.color = '#5D4037';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#8B4513';
              }}
            >
              Dashboard
            </Link>
            {user?.role !== 'admin' && (
              <Link 
                to="/my-orders" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#8B4513', 
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#F5F5DC';
                  e.target.style.color = '#5D4037';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#8B4513';
                }}
              >
                My Orders
              </Link>
            )}
            <Link 
              to="/profile" 
              style={{ 
                textDecoration: 'none', 
                color: '#8B4513', 
                fontWeight: '500',
                transition: 'all 0.3s ease',
                padding: '0.5rem 1rem',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F5F5DC';
                e.target.style.color = '#5D4037';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#8B4513';
              }}
            >
              Profile
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#8B4513', 
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#F5F5DC';
                  e.target.style.color = '#5D4037';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#8B4513';
                }}
              >
                Admin Panel
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link 
                to="/admin/analytics" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#8B4513', 
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#F5F5DC';
                  e.target.style.color = '#5D4037';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#8B4513';
                }}
              >
                📊 Analytics
              </Link>
            )}
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              style={{ 
                textDecoration: 'none', 
                color: '#8B4513', 
                fontWeight: '500',
                transition: 'all 0.3s ease',
                padding: '0.5rem 1rem',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F5F5DC';
                e.target.style.color = '#5D4037';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#8B4513';
              }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              style={{ 
                textDecoration: 'none', 
                color: '#8B4513', 
                fontWeight: '500',
                transition: 'all 0.3s ease',
                padding: '0.5rem 1rem',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F5F5DC';
                e.target.style.color = '#5D4037';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#8B4513';
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
      {isAuthenticated && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ 
            color: '#5D4037',
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>
            Welcome, {user?.name} ({user?.role})
          </span>
          <button 
            onClick={logout}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#8B4513',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 5px rgba(139, 69, 19, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#6F3410';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#8B4513';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      <Route path="/menu" element={<Menu />} />
      <Route 
        path="/cart" 
        element={
          <PrivateRoute>
            {user?.role === 'admin' ? <Navigate to="/dashboard" replace /> : <Cart />}
          </PrivateRoute>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <PrivateRoute>
            {user?.role === 'admin' ? <Navigate to="/dashboard" replace /> : <Checkout />}
          </PrivateRoute>
        } 
      />
      <Route
        path="/my-orders"
        element={
          <PrivateRoute>
            <MyOrders />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <PrivateRoute>
            <AdminOrders />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <AdminUsers />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <PrivateRoute>
            <AdminCategories />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <PrivateRoute>
            <AdminReports />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <PrivateRoute>
            <AdminAnalytics />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="App" style={{
            minHeight: '100vh',
            backgroundColor: '#FEFEFE',
            fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
          }}>
            <Navbar />
            <AppRoutes />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
