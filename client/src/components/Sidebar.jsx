import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, History, Settings, User, Home, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const { user, isOperator, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/register');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    ...(user && !isOperator ? [
      { path: '/orders/new', label: 'New Order', icon: PlusCircle },
    ] : []),
    ...(user ? [
      { path: '/history', label: 'History', icon: History },
      { path: '/settings', label: 'Settings', icon: Settings },
    ] : []),
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-secondary border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-8 mb-8">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent to-accent-dark flex items-center justify-center p-2 shadow-lg accent-glow">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l-5-5m0 0l5-5" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-black text-text-primary tracking-tighter leading-none italic uppercase">LogiTrack</h1>
          <p className="text-[9px] font-bold text-accent tracking-[2px] uppercase mt-0.5">Streamline</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-accent/10 text-accent font-bold shadow-[0_0_15px_rgba(249,115,22,0.1)] border-r-2 border-accent' 
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
              }
            `}
          >
            <Icon size={18} strokeWidth={1.5} />
            <span className="text-sm tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-border bg-bg-primary/30 backdrop-blur-sm">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform duration-300">
                  <User size={20} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-bg-secondary rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{user.name}</p>
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest mt-0.5">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group/logout flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs text-text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all uppercase tracking-[1.5px] font-bold"
            >
              <LogOut size={16} className="transition-transform group-hover/logout:-translate-x-1" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="text-center">
            <NavLink 
              to="/register" 
              className="text-xs font-bold text-accent hover:text-accent-light uppercase tracking-widest"
            >
              Sign Up to Access
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
