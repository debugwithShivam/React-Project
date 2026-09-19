import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const res = await api.get('/user/me');
          if (active && res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('auth_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid:', error.message);
          if (active) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setUser(null);
            setToken(null);
          }
        }
      }
      if (active) {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data?.success) {
      const authToken = res.data.token || res.data.accessToken;
      const authUser = res.data.user;

      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      return authUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      const authToken = res.data.token || res.data.accessToken;
      const authUser = res.data.user;

      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      return authUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isDriver: user?.role === 'DRIVER',
        isRider: user?.role === 'USER',
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
