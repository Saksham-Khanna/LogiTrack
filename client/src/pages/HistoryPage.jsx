import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Package, ArrowRight, MapPin, Clock } from 'lucide-react';
import TopBar from '../components/TopBar';
import StatusBadge from '../components/StatusBadge';
import shipmentApi from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['All', 'Pending', 'Accepted', 'On The Way', 'Delivered', 'Cancelled'];

export default function HistoryPage() {
  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { isOperator } = useAuth();
  const limit = 8;

  const loadShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, sort: '-createdAt' };
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      const data = await shipmentApi.getAll(params);
      setShipments(data.shipments || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => loadShipments();
    socket.on('shipment:created', handler);
    socket.on('shipment:updated', handler);
    return () => {
      socket.off('shipment:created', handler);
      socket.off('shipment:updated', handler);
    };
  }, [socket, loadShipments]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadShipments();
  };

  return (
    <div className="fade-in">
      <TopBar title="Order History" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 slide-up">
          <div>
            <p className="text-xs font-bold uppercase tracking-[2px] text-accent mb-1">
              {isOperator ? 'All Orders' : 'My Orders'}
            </p>
            <h1 className="text-2xl font-bold text-text-primary">Order History</h1>
            <p className="text-sm text-text-secondary mt-1">
              {isOperator 
                ? 'Complete registry of all shipment orders' 
                : 'All your past and current orders'}
            </p>
          </div>
          <span className="text-xs text-text-muted">{total} total records</span>
        </div>

        {/* Filters - Unified single row */}
        <div className="glass-card py-2 px-4 mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Find shipments by ID, name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-text-primary text-xs outline-none placeholder:text-text-muted"
              />
            </form>

            <div className="h-6 w-px bg-border hidden md:block" />

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-text-muted shrink-0 hidden lg:block" />
              <div className="flex gap-1 bg-bg-primary/50 rounded-lg p-1 overflow-x-auto no-scrollbar">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
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
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden slide-up" style={{ animationDelay: '0.15s' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="text-center py-20">
              <Package size={48} className="text-text-muted/30 mx-auto mb-4" />
              <p className="text-text-muted text-sm mb-2">No orders found</p>
              <p className="text-text-muted text-xs">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-primary/50 border-b border-border">
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Tracking ID</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Object</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Route</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Distance</th>
                    {isOperator && (
                      <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">User</th>
                    )}
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Status</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Date</th>
                    <th className="py-3 px-5"></th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr
                      key={s._id}
                      onClick={() => navigate(`/track/${s.trackingId}`)}
                      className="border-b border-border/40 hover:bg-bg-hover cursor-pointer transition-all duration-200 group"
                    >
                      <td className="py-4 px-5">
                        <span className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors font-mono tracking-wider">
                          {s.trackingId}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-sm text-text-primary">{s.objectName}</p>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                          <MapPin size={11} className="shrink-0" />
                          <span className="truncate max-w-[200px]">{s.fromLocation} → {s.toLocation}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-sm text-text-secondary">
                        {s.distance > 0 ? `${s.distance} km` : '—'}
                      </td>
                      {isOperator && (
                        <td className="py-4 px-5">
                          <p className="text-sm text-text-primary">{s.createdBy?.name || '—'}</p>
                        </td>
                      )}
                      <td className="py-4 px-5">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-4 px-5 text-sm text-text-secondary">
                        {new Date(s.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-5">
                        <ArrowRight size={14} className="text-text-muted group-hover:text-accent transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border">
              <p className="text-xs text-text-muted">
                Page {page} of {totalPages} — Showing {shipments.length} of {total} records
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-border hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} className="text-text-secondary" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        page === p
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'text-text-muted hover:text-text-secondary border border-transparent'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
