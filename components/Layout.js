import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // Don't show navigation on login page
  if (router.pathname === '/login') {
    return children;
  }

  // Always show layout with navigation
  const displayUser = user || { name: 'User', role: 'user' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Schema Review
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname === '/' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              
              <Link 
                href="/schema-workflow" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname === '/schema-workflow' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Schema Workflow
              </Link>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{displayUser.contact_name || displayUser.name}</span>
                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {displayUser.role || 'user'}
                  </span>
                </div>
                
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-sm text-gray-600">
            © 2025 Schema Review System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
