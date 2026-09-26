import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('visionops_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('visionops_auth_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize authentication token with backend if present
  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      api.getMe()
        .then(res => {
          if (res?.success && res.user) {
            setUser(res.user);
            localStorage.setItem('visionops_user_session', JSON.stringify(res.user));
          } else {
            logout();
          }
        })
        .catch(() => {
          // If offline / server unreachable, keep existing user if present
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      if (res?.success && res.token && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('visionops_auth_token', res.token);
        localStorage.setItem('visionops_user_session', JSON.stringify(res.user));
        return { success: true, user: res.user };
      } else {
        const errMsg = res?.error || 'Authentication failed. Please verify credentials.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = err.message || 'Server connection error during login';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('visionops_auth_token');
    localStorage.removeItem('visionops_user_session');
  };

  const quickLoginAs = async (email, password = 'admin') => {
    return login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        logout,
        quickLoginAs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
