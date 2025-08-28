import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="coffee-light-bg" style={{ 
      padding: '2rem',
      minHeight: '80vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
  <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ 
            fontSize: '2.7rem',
            fontWeight: 'bold',
            margin: '0.5rem 0 0',
            fontFamily: 'serif'
          }}>
            Coffee house Dashboard
          </h1>
          <p style={{ color: '#5D4037', marginTop: '0.5rem' }}>Your personalized coffee command center</p>
        </div>
        
        <div className="glass fade-in-up" style={{ 
          padding: '2rem', 
          borderRadius: '15px', 
          marginBottom: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))',
          border: '1px solid rgba(124,69,25,0.12)'
        }}>
          <h3 className="section-title">Welcome, {user?.name}!</h3>
          <div className="divider-accent" />
          <p style={{ color: '#4E342E', marginBottom: '0.5rem' }}>
            <strong>Email:</strong> {user?.email}
          </p>
          <p style={{ color: '#4E342E' }}>
            <strong>Role:</strong> 
            <span className="badge-role" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </p>
        </div>

        {user?.role === 'admin' ? (
          <div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Admin Dashboard</h2>
            <div className="divider-accent" />
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
              gap: '1.5rem' 
            }}>
              <div className="tile tile-amber"
              onClick={() => window.location.href = '/admin'}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Manage Products</h3>
                <p>Add, edit, and remove coffee products</p>
              </div>
              <div className="tile tile-green"
              onClick={() => window.location.href = '/admin/orders'}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>View All Orders</h3>
                <p>Monitor all customer orders</p>
              </div>
              <div className="tile tile-cyan"
              onClick={() => window.location.href = '/admin/users'}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>User Management</h3>
                <p>Manage customer accounts</p>
              </div>
              <div className="tile tile-purple"
              onClick={() => window.location.href = '/admin/categories'}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Manage Categories</h3>
                <p>Add, edit and remove categories</p>
              </div>
              <div className="tile tile-blue"
              onClick={() => window.location.href = '/admin/reports'}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Sales Reports</h3>
                <p>View sales analytics and reports</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Customer Dashboard</h2>
            <div className="divider-accent" />
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
              gap: '1.5rem' 
            }}>
              <div className="tile tile-amber"
              onClick={() => window.location.href = '/menu'}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Browse Menu</h3>
                <p>View our delicious coffee selection</p>
              </div>
                <div className="tile tile-green" onClick={() => navigate('/my-orders')}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>My Orders</h3>
                  <p>View your order history</p>
                </div>
                <div className="tile tile-cyan" onClick={() => navigate('/profile')}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>My Profile</h3>
                  <p>Update your account information</p>
                </div>
              {/* Loyalty Points removed per request */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
