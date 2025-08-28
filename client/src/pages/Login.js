import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #F5F5DC 50%, #FAEBD7 100%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(6px)',
        borderRadius: '18px',
        border: '1px solid rgba(139, 69, 19, 0.15)',
        boxShadow: '0 20px 60px rgba(139, 69, 19, 0.15)',
        padding: '2rem 2rem 2.5rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            background: 'linear-gradient(135deg, #8B4513, #D2691E, #CD853F)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'serif'
          }}>Welcome back to Coffee house</h1>
          <p style={{ color: '#5D4037', marginTop: '0.5rem' }}>Sign in to continue your coffee journey</p>
        </div>

        {error && (
          <div style={{
            color: '#842029',
            background: '#f8d7da',
            border: '1px solid #f5c2c7',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#5D4037', fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid #e5e7eb',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#D2691E'; e.target.style.boxShadow = '0 0 0 4px rgba(210,105,30,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#5D4037', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid #e5e7eb',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#D2691E'; e.target.style.boxShadow = '0 0 0 4px rgba(210,105,30,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem 1rem',
              background: 'linear-gradient(135deg, #8B4513, #CD853F)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: '0 6px 18px rgba(139, 69, 19, 0.25)'
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#5D4037' }}>
          New to Coffee house?{' '}
          <Link to="/register" style={{ color: '#8B4513', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
