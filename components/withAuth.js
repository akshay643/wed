import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      checkAuth();
    }, []);

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Not authenticated, redirect to login
          router.push('/login');
        }
      } catch (error) {
        // Error checking auth, redirect to login
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Router will handle redirect
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
