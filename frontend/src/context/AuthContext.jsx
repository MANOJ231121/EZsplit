import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'ezsplit_token';
const USER_KEY = 'ezsplit_user';

const readStoredUser = () => {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          }
        } catch (err) {
          console.error("Session verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const persistSession = (newToken, userData) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // Re-pulls the profile so payment/UPI edits are reflected app-wide without a
  // full re-login. Falls back to cached data if the request fails.
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      console.warn('Could not refresh profile:', err.message);
    }
    return null;
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        const { token: newToken, user: userData } = res.data;
        persistSession(newToken, userData);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.success && res.data) {
        const { token: newToken, user: userData } = res.data;
        persistSession(newToken, userData);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const loginWithGoogleToken = async (idToken) => {
    try {
      const res = await api.post('/auth/google', { idToken });
      if (res.success && res.data) {
        const { token: newToken, user: userData } = res.data;
        persistSession(newToken, userData);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore - local session is cleared regardless.
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogleToken,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user,
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
