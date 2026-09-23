import { createContext, useEffect, useState, useCallback } from 'react';
import socket from '../socket/socket.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (user && token) {
      socket.auth = { token };
      socket.connect();
      // Join the user's personal room for notifications
      socket.emit('joinUserRoom', user._id || user.userId);
    } else {
      socket.disconnect();
    }
    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  const login = useCallback((userData, tokenVal) => {
    const userObj = {
      _id: userData._id || userData.userId,
      userId: userData.userId || userData._id,
      username: userData.username,
      email: userData.email,
    };
    setUser(userObj);
    setToken(tokenVal);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', tokenVal);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    socket.disconnect();
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
