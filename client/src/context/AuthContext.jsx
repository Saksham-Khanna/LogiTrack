import { createContext, useContext, useState, useEffect } from 'react';
import shipmentApi from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await shipmentApi.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Auth initialization error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const { token, user } = await shipmentApi.login(email, password);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { token, user } = await shipmentApi.register(name, email, password, role);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      loading, 
      login, 
      register, 
      logout, 
      isOperator: user?.role === 'operator',
      isUser: user?.role === 'user',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
