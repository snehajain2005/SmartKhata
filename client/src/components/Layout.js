import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? 'bg-ink-600 text-white shadow-md shadow-ink-200'
          : 'text-slate-600 hover:bg-ink-50 hover:text-ink-700'
      }`
    }
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/customers', icon: '👥', label: 'Customers' },
    { to: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 fixed h-full z-20">
        <div className="p-6 border-b border-slate-100">
          <h1 className="font-display text-2xl font-bold text-ink-700">📒 SmartKhata</h1>
          <p className="text-xs text-slate-400 mt-1 truncate">{user?.shopName}</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-bold text-sm">
              {user?.shopName?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{user?.shopName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full btn-secondary text-sm py-2">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-100 z-30 flex items-center justify-between px-4 h-14">
        <h1 className="font-display text-xl font-bold text-ink-700">📒 SmartKhata</h1>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={closeMobile}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 pt-16 border-b border-slate-100">
              <h2 className="font-display text-xl font-bold text-ink-700">📒 SmartKhata</h2>
              <p className="text-sm text-slate-500 mt-0.5">{user?.shopName}</p>
            </div>
            <nav className="flex-1 p-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavItem key={item.to} {...item} onClick={closeMobile} />
              ))}
            </nav>
            <div className="p-4 border-t border-slate-100">
              <button onClick={handleLogout} className="w-full btn-secondary text-sm py-2">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-20 flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-ink-600' : 'text-slate-400'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
