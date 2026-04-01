import { Bell, LogOut, User, X, Check, Info, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function TopBar({ title, showSearch = false }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { history, unreadCount, isOpen, setIsOpen, toggleDropdown, markAllRead, clearAll } = useNotification();

  const handleLogout = () => {
    logout();
    navigate('/register');
  };

  const handleNotificationClick = (n) => {
    setIsOpen(false);
    if (n.trackingId) {
      navigate(`/track/${n.trackingId}`);
    } else if (n.shipmentId) {
      navigate(`/track/${n.shipmentId}`);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-bg-secondary/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        {title && (
          <span className="text-xs font-bold uppercase tracking-[3px] text-accent">
            {title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3 pr-2 mr-2 border-r border-border">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-text-primary">{user.name}</span>
              <span className="text-[10px] text-accent font-semibold uppercase tracking-tighter">{user.role}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <User size={16} />
            </div>
          </div>
        ) : (
          <span className="text-xs font-black uppercase tracking-tighter text-text-primary italic">
            LogiTrack
          </span>
        )}
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className={`p-2 rounded-lg transition-colors relative group ${
              isOpen ? 'bg-accent/10 text-accent' : 'hover:bg-bg-hover text-text-secondary'
            }`}
          >
            <Bell size={18} className={isOpen ? 'text-accent' : 'group-hover:text-text-primary'} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent shadow-[0_0_10px_rgba(255,107,0,0.5)] rounded-full border-2 border-bg-secondary" />
            )}
          </button>

          {/* Notification Center Dropdown */}
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)} 
              />
              <div className="absolute right-0 mt-3 w-80 bg-bg-secondary border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col slide-up origin-top-right">
                <div className="p-4 border-b border-border bg-bg-primary/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <Bell size={14} className="text-accent" />
                    Notification Center
                  </h3>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-bg-hover text-text-muted transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
                  {history.length > 0 ? (
                    history.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`px-4 py-3 hover:bg-bg-hover cursor-pointer transition-colors border-l-2 ${
                          n.type === 'status_change' ? 'border-accent' : 
                          n.type === 'new_order' ? 'border-success' : 'border-info'
                        } ${n.read ? 'opacity-60' : 'opacity-100'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            n.type === 'status_change' ? 'bg-accent/10 text-accent' : 
                            n.type === 'new_order' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'
                          }`}>
                            {n.type === 'status_change' ? <Info size={14} /> : <Package size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-text-primary truncate">
                              {n.type === 'status_change' ? 'Shipment Update' : 'New Order Received'}
                            </p>
                            <p className="text-[11px] text-text-secondary line-clamp-2 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[9px] text-text-muted mt-1 font-mono uppercase">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!n.read && (
                            <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 px-4 text-center">
                      <Bell size={32} className="text-text-muted/20 mx-auto mb-3" />
                      <p className="text-xs text-text-secondary font-medium">No system notifications</p>
                      <p className="text-[10px] text-text-muted mt-1 lowercase">Updates about shipments will appear here</p>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-border bg-bg-primary/30 flex justify-center">
                  <button 
                    onClick={clearAll}
                    disabled={history.length === 0}
                    className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent-light disabled:opacity-30 disabled:pointer-events-none transition-colors py-1 flex items-center gap-2"
                  >
                    Clear All Notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {user && (
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-danger/10 transition-colors group"
            title="Logout"
          >
            <LogOut size={18} className="text-text-secondary group-hover:text-danger" />
          </button>
        )}
      </div>
    </header>
  );
}
