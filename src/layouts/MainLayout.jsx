import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* Sidebar - Fixed width 250px */}
      <div className="w-0 md:w-64 flex-shrink-0 bg-white shadow-lg">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar - Top */}
        <Navbar />

        {/* Content Area - Below navbar */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-3 pt-4 sm:p-6 lg:p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;