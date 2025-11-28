
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  login as apiLogin, 
  verifyToken, 
  getUserFromToken, 
  setAuthCookie, 
  getAuthCookie, 
  clearAuthCookie 
} from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Check & Sync
  useEffect(() => {
    const initAuth = () => {
      // 1. Try LocalStorage
      let token = localStorage.getItem('ftj_auth_token');
      
      // 2. Fallback to Cookie
      if (!token) {
        token = getAuthCookie();
      }

      // 3. Verify & Sync
      if (token && verifyToken(token)) {
        const userData = getUserFromToken(token);
        setUser(userData);
        
        // Ensure both stores are synced
        if (!localStorage.getItem('ftj_auth_token')) localStorage.setItem('ftj_auth_token', token);
        if (!getAuthCookie()) setAuthCookie(token);
        
      } else {
        // Invalid or missing token: Clear everything
        localStorage.removeItem('ftj_auth_token');
        clearAuthCookie();
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for storage events (logout in one tab logs out others)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ftj_auth_token') {
        initAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: loggedInUser, token } = await apiLogin(email, password);
      
      // Save to both Storage and Cookie for redundancy
      localStorage.setItem('ftj_auth_token', token);
      setAuthCookie(token);
      
      setUser(loggedInUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('ftj_auth_token');
    clearAuthCookie();
    setUser(null);
    
    // Check path to avoid redirect loops if already on login page
    // Using simple string inclusion check as a safe guard for hash/path routing
    const currentHref = window.location.href;
    if (!currentHref.includes('/admin/login')) {
        window.location.href = '/'; 
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
