'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const checkAuth = async () => {
      try {
        // This would be replaced with your actual auth check
        // For example, calling an API endpoint to verify the session
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        
        const data = await response.json();
        
        if (data.role !== 'admin') {
          throw new Error('Not authorized');
        }
        
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth check failed:', err);
        // Redirect to login page
        router.push('/login?redirect=/admin/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-purple-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Admin Portal</span>
              </div>
              <div className="ml-6 flex items-center space-x-4">
                <a href="/admin/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                  Dashboard
                </a>
                <a href="/admin/properties" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                  Properties
                </a>
                <a href="/admin/users" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                  Users
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => {
                  // This would be replaced with your actual logout logic
                  router.push('/login');
                }}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-10">
        {children}
      </main>
    </div>
  );
}