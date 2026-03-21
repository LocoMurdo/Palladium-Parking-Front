import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const menuGroups = [
    {
      title: 'Operación',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Sesiones de Parqueo', path: '/parking-sessions', icon: '🚗' },
        { name: 'Crear Sesión', path: '/create-session', icon: '➕' },
        { name: 'Caja', path: '/cash-register', icon: '💵' },
      ],
    },
    {
      title: 'Catálogos',
      items: [
        { name: 'Suscripciones', path: '/subscriptions', icon: '🧾' },
        { name: 'Tarifas', path: '/rates', icon: '🏷️' },
        { name: 'Vehículos', path: '/vehicles', icon: '🚙' },
        { name: 'Crear Vehículo', path: '/create-vehicle', icon: '🆕' },
      ],
    },
    {
      title: 'Seguridad',
      items: [
        { name: 'Usuarios', path: '/users', icon: '👥' },
        { name: 'Crear Usuario', path: '/create-user', icon: '👤' },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-xl shadow-lg"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar-scroll fixed top-0 left-0 w-64 h-screen bg-slate-950 text-white overflow-y-auto transform transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
        <div className="px-6 pt-7 pb-5 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-blue-300">Palladium Parking</h1>
          <p className="text-xs text-slate-400 mt-1">Panel administrativo</p>
        </div>

        <nav className="sidebar-scroll mt-6 px-3 space-y-5 flex-1 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{group.title}</p>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-[#0A5FFF] to-[#7C3AED] text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-300/20'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-base ${
                      isActive(item.path)
                        ? 'bg-white/20'
                        : 'bg-slate-800 text-slate-200 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium leading-5">{item.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout button */}
        <div className="mt-4 px-4 py-5 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
          <button
            onClick={async () => {
              await logout();
              window.location.href = '/login';
            }}
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-md shadow-rose-900/40"
          >
            Cerrar Sesión
          </button>
        </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;