import React, { createContext, useState, useEffect } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedUser = tokenStorage.getUser();
    const accessTokenValid = tokenStorage.isAccessTokenValid();

    if (storedUser && accessTokenValid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(storedUser);
      setIsAuthenticated(true);
      setRole(storedUser.role ?? null);
    } else {
      tokenStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      setRole(null);
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    tokenStorage.setUser(userData);
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
    setUser(userData);
    setIsAuthenticated(true);
    setRole(userData.role ?? null);
  };

  const logout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    if (refreshToken) {
      try {
        await authService.revoke(refreshToken);
      } catch (error) {
        if (error?.response?.status !== 401) {
          console.error('Error al revocar refresh token:', error);
        }
      }
    }

    tokenStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setRole(null);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
    role,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;