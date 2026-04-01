import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, MapPin, Clock, Send, Search } from 'lucide-react';
import TopBar from '../components/TopBar';
import StatusBadge from '../components/StatusBadge';
import shipmentApi from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function HomePage() {
  const { user, isOperator } = useAuth();
  const navigate = useNavigate();

  // Redirect to register if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/register');
    }
  }, [user, navigate]);

  if (!user) return null;
  
  if (isOperator) {
    return <OperatorDashboard />;
  }
  return <UserDashboard />;
}

// =============== USER DASHBOARD ===============
function UserDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { socket } = useSocket();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => loadData();
    socket.on('shipment:created', handler);
    socket.on('shipment:updated', handler);
    return () => {
      socket.off('shipment:created', handler);
      socket.off('shipment:updated', handler);
    };
  }, [socket]);

  const loadData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        shipmentApi.getDashboardStats(),
        shipmentApi.getAll({ limit: 10, sort: '-createdAt' }),
      ]);
      setStats(statsData);
      setOrders(ordersData.shipments || []);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    setSearching(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const result = await shipmentApi.getByTrackingId(trackInput.trim().toUpperCase());
      setTrackResult(result);
    } catch {
      setTrackError('Shipment not found. Check the tracking ID.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fade-in">
      <TopBar title="My Orders" showSearch={false} />
      
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 slide-up">
          <div>
            <p className="text-xs font-bold uppercase tracking-[2px] text-accent mb-1">Dashboard</p>
            <h1 className="text-2xl font-bold text-text-primary">My Shipments</h1>
            <p className="text-sm text-text-secondary mt-1">Create new orders and track your deliveries</p>
          </div>
          <button onClick={() => navigate('/orders/new')} className="btn-primary">
            <Send size={16} /> New Order
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 slide-up" style={{ animationDelay: '0.05s' }}>
          {[
            { label: 'Total Orders', value: stats.totalShipments || 0, color: 'text-accent' },
            { label: 'Pending', value: stats.pending || 0, color: 'text-warning' },
            { label: 'On The Way', value: stats.onTheWay || 0, color: 'text-info' },
            { label: 'Delivered', value: stats.delivered || 0, color: 'text-success' },
          ].map((s, i) => (
            <div key={i} className="glass-card glass-card-hover p-5">
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Track by ID */}
        <div className="mb-8 slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleTrack} className="relative">
            <div className="glass-card p-2 flex items-center gap-2 accent-glow">
              <div className="flex items-center flex-1 pl-4">
                <Search size={20} className="text-text-muted mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter Tracking ID (e.g., LOGI-...)"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  className="flex-1 bg-transparent text-text-primary text-base outline-none placeholder:text-text-muted py-3"
                />
              </div>
              <button type="submit" disabled={searching} className="btn-primary px-8 py-3 rounded-lg shrink-0">
                {searching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Track <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </form>
          {trackError && (
            <div className="mt-4 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center fade-in">
              {trackError}
            </div>
          )}
          {trackResult && (
            <div className="mt-4 glass-card p-6 fade-in">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">Tracking Result</p>
                  <h2 className="text-xl font-bold text-text-primary">{trackResult.trackingId}</h2>
                </div>
                <StatusBadge status={trackResult.status} />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Object</p>
                  <p className="text-sm text-text-primary">{trackResult.objectName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">From</p>
                  <p className="text-sm text-text-primary">{trackResult.fromLocation}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">To</p>
                  <p className="text-sm text-text-primary">{trackResult.toLocation}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/track/${trackResult.trackingId}`)}
                className="btn-primary w-full"
              >
                View Full Details <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[2px] text-accent mb-1">Order History</h2>
              <p className="text-lg font-bold text-text-primary">Your Orders</p>
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            ) : orders.length > 0 ? (
              <div className="divide-y divide-border/50">
                {orders.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => navigate(`/track/${s.trackingId}`)}
                    className="flex items-center justify-between p-4 hover:bg-bg-hover cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Package size={18} className="text-accent" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors font-mono">
                            {s.trackingId}
                          </p>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-xs text-text-secondary truncate">{s.objectName}</span>
                        </div>
                        <p className="text-xs text-text-muted flex items-center gap-1">
                          <MapPin size={11} /> {s.fromLocation} → {s.toLocation}
                          {s.distance > 0 && <span className="text-text-muted/60">({s.distance} km)</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <StatusBadge status={s.status} />
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-text-muted flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package size={48} className="text-text-muted/30 mx-auto mb-4" />
                <p className="text-text-muted text-sm mb-2">No orders yet</p>
                <p className="text-text-muted text-xs mb-4">Create your first shipment order</p>
                <button onClick={() => navigate('/orders/new')} className="btn-primary">
                  <Send size={16} /> Create Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== OPERATOR DASHBOARD ===============
function OperatorDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const STATUSES = ['All', 'Pending', 'Accepted', 'On The Way', 'Delivered', 'Cancelled'];

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => loadData();
    socket.on('shipment:created', handler);
    socket.on('shipment:updated', handler);
    return () => {
      socket.off('shipment:created', handler);
      socket.off('shipment:updated', handler);
    };
  }, [socket]);

  const loadData = async () => {
    try {
      const params = { limit: 50, sort: '-createdAt' };
      if (statusFilter !== 'All') params.status = statusFilter;
      
      const [statsData, ordersData] = await Promise.all([
        shipmentApi.getDashboardStats(),
        shipmentApi.getAll(params),
      ]);
      setStats(statsData);
      setOrders(ordersData.shipments || []);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (shipmentId, newStatus) => {
    setUpdatingId(shipmentId);
    try {
      await shipmentApi.updateStatus(shipmentId, { status: newStatus });
      await loadData();
    } catch (e) {
      alert('Failed to update: ' + (e.response?.data?.error || e.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextActions = (status) => {
    switch (status) {
      case 'Pending': return [{ label: 'Accept', status: 'Accepted', color: 'bg-success/15 text-success border-success/20 hover:bg-success/25' }];
      case 'Accepted': return [{ label: 'On The Way', status: 'On The Way', color: 'bg-info/15 text-info border-info/20 hover:bg-info/25' }];
      case 'On The Way': return [{ label: 'Delivered', status: 'Delivered', color: 'bg-accent/15 text-accent border-accent/20 hover:bg-accent/25' }];
      default: return [];
    }
  };

  return (
    <div className="fade-in">
      <TopBar title="Operator Panel" showSearch={false} />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6 slide-up">
          <p className="text-xs font-bold uppercase tracking-[2px] text-accent mb-1">Control Center</p>
          <h1 className="text-2xl font-bold text-text-primary">Incoming Orders</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and fulfill delivery requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 slide-up" style={{ animationDelay: '0.05s' }}>
          {[
            { label: 'Total', value: stats.totalShipments || 0, color: 'text-text-primary' },
            { label: 'Pending', value: stats.pending || 0, color: 'text-warning' },
            { label: 'Accepted', value: stats.accepted || 0, color: 'text-success' },
            { label: 'On The Way', value: stats.onTheWay || 0, color: 'text-info' },
            { label: 'Delivered', value: stats.delivered || 0, color: 'text-accent' },
          ].map((s, i) => (
            <div key={i} className="glass-card glass-card-hover p-4">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="glass-card p-3 mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex gap-1 overflow-x-auto">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                  statusFilter === s
                    ? 'bg-accent/20 text-accent'
                    : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="glass-card overflow-hidden slide-up" style={{ animationDelay: '0.15s' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package size={48} className="text-text-muted/30 mx-auto mb-4" />
              <p className="text-text-muted text-sm">No orders found</p>
              <p className="text-text-muted text-xs mt-1">Orders from users will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-primary/50 border-b border-border">
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Tracking ID</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Object</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">From → To</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Distance</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">User</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Status</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Date</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((s) => (
                    <tr key={s._id} className="border-b border-border/40 hover:bg-bg-hover transition-all duration-200 group">
                      <td className="py-4 px-5">
                        <span
                          onClick={() => navigate(`/track/${s.trackingId}`)}
                          className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors font-mono tracking-wider cursor-pointer"
                        >
                          {s.trackingId}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-sm text-text-primary">{s.objectName}</p>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-xs text-text-secondary">
                          {s.fromLocation} → {s.toLocation}
                        </p>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-sm text-text-secondary">{s.distance > 0 ? `${s.distance} km` : '—'}</span>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-sm text-text-primary">{s.createdBy?.name || '—'}</p>
                        <p className="text-[10px] text-text-muted">{s.createdBy?.email}</p>
                      </td>
                      <td className="py-4 px-5">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-4 px-5 text-sm text-text-secondary">
                        {new Date(s.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex gap-2">
                          {getNextActions(s.status).map((action) => (
                            <button
                              key={action.status}
                              onClick={() => updateStatus(s._id, action.status)}
                              disabled={updatingId === s._id}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider border transition-all ${action.color} disabled:opacity-50`}
                            >
                              {updatingId === s._id ? (
                                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                              ) : (
                                action.label
                              )}
                            </button>
                          ))}
                          {s.status === 'Pending' && (
                            <button
                              onClick={() => updateStatus(s._id, 'Cancelled')}
                              disabled={updatingId === s._id}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider border bg-danger/15 text-danger border-danger/20 hover:bg-danger/25 transition-all disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                          {(s.status === 'Delivered' || s.status === 'Cancelled') && (
                            <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider px-3 py-1.5">
                              {s.status === 'Delivered' ? '✓ Complete' : '✕ Cancelled'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
