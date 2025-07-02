import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const REFRESH_ENDPOINT = 'https://betwise-sport-betting-app.onrender.com/api/auth/refresh-token'; // Update to your actual endpoint

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const saveAuthData = useCallback((user, accessToken, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setCurrentUser(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    navigate('/login');
  }, [clearAuthData, navigate]);

  // Modified login to accept a 'from' path for redirection
  const login = useCallback((userData, accessToken, refreshToken, fromPath = '/') => {
    saveAuthData(userData, accessToken, refreshToken);
    navigate(fromPath, { replace: true }); // Navigate to the 'from' path, replacing history entry
  }, [saveAuthData]);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return logout();
    try {
      const res = await fetch(REFRESH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to refresh token');
      saveAuthData(data.user, data.accessToken, data.refreshToken);
    } catch (err) {
      console.error('Token refresh error:', err);
      logout();
    }
  }, [refreshToken, saveAuthData, logout]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');

    if (token && refresh && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setAccessToken(token);
        setRefreshToken(refresh);
      } catch (e) {
        clearAuthData();
      }
    }
    setIsLoading(false);
  }, [clearAuthData]);

  const value = {
    currentUser,
    accessToken,
    isAuthenticated: !!accessToken,
    isLoadingAuth: isLoading,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};
