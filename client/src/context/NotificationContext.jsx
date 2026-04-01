import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, Bell, Info, CheckCircle, Package } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const showNotification = useCallback((notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      title: notification.title || 'System Notification',
      timestamp: new Date(),
      read: false,
      shipmentId: notification.shipmentId,
      trackingId: notification.trackingId,
    };

    // Add to toasts (transient)
    setToasts((prev) => [...prev, newNotification]);
    
    // Add to history (persistent for session)
    setHistory((prev) => [newNotification, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + 1);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setHistory(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setHistory([]);
    setUnreadCount(0);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) markAllRead();
  };

  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      history, 
      unreadCount, 
      isOpen, 
      setIsOpen,
      toggleDropdown,
      markAllRead,
      clearAll
    }}>
      {children}
      
      {/* Toast Container (Always on top) */}
      <div className="fixed top-20 right-6 z-9999 flex flex-col gap-3 w-80 pointer-events-none">
        {toasts.map((n) => (
          <div
            key={n.id}
            className="pointer-events-auto bg-bg-secondary border border-border rounded-xl shadow-2xl overflow-hidden flex transform transition-all duration-300 animate-slide-in-right accent-glow"
          >
            <div className={`w-1.5 shrink-0 ${
              n.type === 'status_change' ? 'bg-accent' : 
              n.type === 'new_order' ? 'bg-success' : 'bg-info'
            }`} />
            
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 mb-1">
                  {n.type === 'status_change' ? (
                    <Info size={14} className="text-accent" />
                  ) : n.type === 'new_order' ? (
                    <CheckCircle size={14} className="text-success" />
                  ) : (
                    <Bell size={14} className="text-info" />
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    {n.type === 'status_change' ? 'Update' : n.type === 'new_order' ? 'New Order' : 'Notice'}
                  </p>
                </div>
                <button 
                  onClick={() => removeToast(n.id)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-sm font-semibold text-text-primary leading-tight">
                {n.message}
              </p>
              <p className="text-[10px] text-text-muted mt-2">
                {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
