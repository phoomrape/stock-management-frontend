import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ตรวจสอบสถานะการเข้าสู่ระบบเมื่อเริ่มต้น
    const initAuth = () => {
      const currentUser = ApiService.getCurrentUser();
      const token = ApiService.getToken();
      
      if (currentUser && token) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setIsLoading(true);
      const response = await ApiService.login(username, password);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🔄 AuthContext logout started');
    console.log('📊 Current state before logout:', { user, isAuthenticated });
    
    try {
      console.log('📡 Calling ApiService.logout()...');
      await ApiService.logout();
      console.log('✅ ApiService.logout() completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      console.error('Error details:', error.message, error.stack);
    } finally {
      console.log('🧹 Cleaning up state...');
      // ล้างข้อมูล state เสมอ
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ State cleaned up - logout process complete');
      console.log('📊 Final state:', { user: null, isAuthenticated: false });
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await ApiService.register(userData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;