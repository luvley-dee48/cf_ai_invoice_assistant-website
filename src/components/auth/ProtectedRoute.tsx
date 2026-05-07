import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredToken, getStoredUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getStoredToken();
        const user = getStoredUser();
        
        console.log('ProtectedRoute - Token:', token ? 'exists' : 'missing');
        console.log('ProtectedRoute - User:', user ? 'exists' : 'missing');
        
        // Simple check - if token and user exist, consider authenticated
        const authenticated = !!(token && user);
        
        setIsAuthenticated(authenticated);
        setIsLoading(false);
      } catch (error) {
        console.error('ProtectedRoute - Auth check error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
