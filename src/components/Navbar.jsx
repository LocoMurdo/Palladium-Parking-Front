import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="w-full pl-14 pr-3 sm:pl-6 sm:pr-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1">
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
              Bienvenido, {user?.names || 'Usuario'}
            </h2>
          </div>
          <div className="flex items-center pl-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.names?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;