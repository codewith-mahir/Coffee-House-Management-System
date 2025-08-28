import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, isAuthenticated: true };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, error: null };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Setup axios defaults
  axios.defaults.baseURL = API_URL;
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/auth/me');
        dispatch({ type: 'SET_USER', payload: response.data.user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      // Use relative URL since axios.defaults.baseURL is already set
      const response = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, phone = '') => {
    try {
      dispatch({ type: 'LOGIN_START' });
      // Use relative URL since axios.defaults.baseURL is already set
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        phone
      }, { withCredentials: true });
      console.log('Register response:', response.data); // Added debugging log
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message); // Added error log
      const message = error.response?.data?.error || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
