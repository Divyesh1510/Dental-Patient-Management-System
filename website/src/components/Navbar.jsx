import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Stethoscope,
  UserCircle,
  LogOut,
  Menu,
  X,
  Home,
  Moon,
  Sun,
  ClipboardList,
  Clock,
  BookOpen,
  FileText
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm("Logout from Admin Panel?")) {
      await logout();
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/appointments-list', label: 'Appointments', Icon: Clock },
    { path: '/consultations', label: 'Walk-ins', Icon: ClipboardList },
    { path: '/prescription', label: 'Prescription', Icon: FileText },
    { path: '/calendar', label: 'Calendar', Icon: CalendarIcon },
    { path: '/patients', label: 'Patients', Icon: Users },
    { path: '/patient-management', label: 'Portal Mgmt', Icon: Users },
    { path: '/ortho', label: 'Ortho', Icon: Stethoscope },
    { path: '/blog-management', label: 'Blog Content', Icon: BookOpen },
    { path: '/profile', label: 'Profile', Icon: UserCircle },
  ];

  const renderNavItem = (item) => {
    const Icon = item.Icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setIsMenuOpen(false)}
        className={({ isActive }) => `
          flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-sm
          ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-slate-800/50'}
        `}
      >
        {({ isActive }) => (
          <>
            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-800'}`}>
              <Icon size={18} />
            </div>
            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Universal Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 lg:h-20 bg-slate-950 border-b border-glass-border flex items-center justify-between px-6 lg:px-10 z-[999] transition-all">
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 lg:p-3 bg-slate-900 border border-glass-border rounded-xl text-text-muted hover:text-white active:scale-95 transition-all shadow-lg"
            title="Toggle Menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={22} className="lg:w-6 lg:h-6" />}
          </button>
          <div className="flex items-center gap-3 lg:gap-4">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 lg:w-10 lg:h-10 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]" />
            <div className="flex flex-col">
              <span className="font-outfit font-bold text-xs lg:text-base tracking-tight uppercase leading-none">Radhika Super Speciality</span>
              <span className="text-primary text-[10px] lg:text-xs font-bold tracking-[0.2em] lg:tracking-[0.3em] uppercase mt-1">Dental Hospital</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-text-muted text-xs lg:text-sm font-bold uppercase tracking-[0.2em] opacity-50">
          {location.pathname === '/' ? 'Hospital Dashboard' : location.pathname.split('/')[1].replace('-', ' ')}
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 lg:p-3 bg-slate-900 border border-glass-border rounded-xl text-text-muted hover:text-white active:scale-95 transition-all shadow-lg"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="lg:w-5 lg:h-5 text-yellow-400" /> : <Moon size={18} className="lg:w-5 lg:h-5" />}
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2 lg:p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-danger hover:bg-red-500/20 active:scale-95 transition-all group"
            title="Logout"
          >
            <LogOut size={18} className="lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Backdrop for closing menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[1000] transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Toggleable Sidebar (Universal) */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-glass-border z-[1010] 
          transition-transform duration-300 transform shadow-2xl opacity-100
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-950 border border-glass-border rounded-xl p-1 overflow-hidden">
                <img src="/logo.svg" alt="Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <div className="font-outfit font-bold text-xs tracking-tight leading-tight">
                RADHIKA SUPER SPECIALITY <br />
                <span className="text-primary text-[10px]">DENTAL HOSPITAL</span>
              </div>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="xl:hidden p-2 text-text-muted hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-3 ml-2 opacity-50">Main Website</p>
            <NavLink 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-sm text-text-muted hover:bg-slate-800/50 mb-5"
            >
              <div className="p-1.5 rounded-lg bg-slate-800">
                <Home size={18} />
              </div>
              <span>View Website</span>
            </NavLink>

            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-3 ml-2 opacity-50">Hospital Management</p>
            {navItems.map(item => renderNavItem(item))}
          </nav>

          <div className="pt-5 border-t border-glass-border/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-danger font-bold hover:bg-red-500/10 transition-all text-sm"
            >
              <LogOut size={18} />
              <span>Logout Admin</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
