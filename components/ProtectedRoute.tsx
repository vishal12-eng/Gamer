
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SparklesIcon from './icons/SparklesIcon';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. EXPLICIT BYPASS: If the path is exactly /admin/login, render children immediately.
  // This prevents any logic inside this component from blocking the login page rendering.
  if (location.pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
        <p className="text-gray-400 animate-pulse flex items-center">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Verifying Access...
        </p>
      </div>
    );
  }

  // 2. REDIRECT LOGIC: Only redirect if NOT authenticated AND NOT already on the login page.
  if (!isAuthenticated && location.pathname !== "/admin/login") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
