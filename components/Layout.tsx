import React from 'react';
import { useAuth } from '../services/authContext';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, LogOut, User as UserIcon, PlusCircle, LayoutDashboard } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <ShoppingBag className="h-8 w-8 text-indigo-600" />
                <span className="font-bold text-xl tracking-tight text-gray-900">MarketNest</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                  Marketplace
                </Link>
                {session?.user.role === 'BRAND' && (
                  <Link to="/dashboard" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/dashboard' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                    Brand Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                     <span className="hidden md:inline">Welcome, <strong>{session.user.name}</strong></span>
                     <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {session.user.role}
                     </span>
                  </div>
                  <Link to="/profile" className={`p-2 rounded-full ${isActive('/profile')}`}>
                    <UserIcon className="h-5 w-5" />
                  </Link>
                  <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600" title="Logout">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium">Log in</Link>
                  <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">Made by Vigneshwar Reddy Gangireddy.</p>
        </div>
      </footer>
    </div>
  );
};