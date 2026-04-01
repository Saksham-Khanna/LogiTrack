import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Clock, User, Truck } from 'lucide-react';
import TopBar from '../components/TopBar';
import StatusBadge from '../components/StatusBadge';
import shipmentApi from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function TrackShipmentPage() {
  const { id: trackingId } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const { socket } = useSocket();
  const { isOperator } = useAuth();

  useEffect(() => {
    if (trackingId) loadShipment();
  }, [trackingId]);

  useEffect(() => {
    if (!socket || !trackingId) return;
    const handler = (updated) => {
      if (updated.trackingId === trackingId) {
        setShipment(updated);
      }
    };
    socket.emit('join:shipment', trackingId);
    socket.on(`shipment:${trackingId}`, handler);
    socket.on('shipment:updated', handler);
    return () => {
      socket.emit('leave:shipment', trackingId);
      socket.off(`shipment:${trackingId}`, handler);
      socket.off('shipment:updated', handler);
    };
  }, [socket, trackingId]);

  const loadShipment = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await shipmentApi.getByTrackingId(trackingId);
      setShipment(data);
    } catch (e) {
      setError('Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!shipment) return;
    setUpdatingStatus(newStatus);
    try {
      await shipmentApi.updateStatus(shipment._id, { status: newStatus });
    } catch (e) {
      alert('Failed to update: ' + (e.response?.data?.error || e.message));
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <TopBar title="Tracking" showSearch={false} />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <TopBar title="Tracking" showSearch={false} />
        <div className="flex flex-col items-center justify-center h-[80vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
            <MapPin size={32} className="text-danger" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Shipment Not Found</h2>
          <p className="text-text-muted text-sm mb-6">No shipment found with ID: {trackingId}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = ['Pending', 'Accepted', 'On The Way', 'Delivered'];
  const currentStepIndex = statusSteps.indexOf(shipment.status);
  const isCancelled = shipment.status === 'Cancelled';
  const history = shipment.statusHistory || [];

  const getNextActions = () => {
    if (!isOperator) return [];
    switch (shipment.status) {
      case 'Pending': return [
        { label: 'Accept Order', status: 'Accepted', cls: 'btn-primary' },
      ];
      case 'Accepted': return [
        { label: 'Mark On The Way', status: 'On The Way', cls: 'btn-primary' },
      ];
      case 'On The Way': return [
        { label: 'Mark Delivered', status: 'Delivered', cls: 'btn-primary' },
      ];
      default: return [];
    }
  };

  return (
    <div className="fade-in">
      <TopBar title="Shipment Tracking" showSearch={false} />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Header Card */}
        <div className="glass-card p-6 mb-6 accent-glow slide-up">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-accent mb-2">Tracking</p>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-3 font-mono">{shipment.trackingId}</h1>
              <StatusBadge status={shipment.status} />
            </div>
            <div className="md:text-right">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Created</p>
              <p className="text-sm text-text-primary font-medium">
                {new Date(shipment.createdAt).toLocaleDateString('en-US', { 
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                })}
              </p>
              <p className="text-xs text-text-muted mt-2">
                Last updated {new Date(shipment.updatedAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.05s' }}>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-text-primary mb-5">Order Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={14} className="text-accent" />
                      <p className="text-[11px] text-text-muted uppercase tracking-wider">Object</p>
                    </div>
                    <p className="text-base text-text-primary font-semibold">{shipment.objectName}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-success/30 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      </div>
                      <p className="text-[11px] text-text-muted uppercase tracking-wider">From</p>
                    </div>
                    <p className="text-sm text-text-primary font-medium">{shipment.fromLocation}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-danger" />
                      <p className="text-[11px] text-text-muted uppercase tracking-wider">To</p>
                    </div>
                    <p className="text-sm text-text-primary font-medium">{shipment.toLocation}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {shipment.distance > 0 && (
                    <div>
                      <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Distance</p>
                      <p className="text-2xl font-bold text-text-primary">{shipment.distance} <span className="text-sm text-text-muted font-normal">km</span></p>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-text-muted" />
                      <p className="text-[11px] text-text-muted uppercase tracking-wider">Ordered By</p>
                    </div>
                    <p className="text-sm text-text-primary font-medium">{shipment.createdBy?.name || '—'}</p>
                    <p className="text-xs text-text-muted">{shipment.createdBy?.email}</p>
                  </div>
                  {shipment.assignedOperator && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Truck size={14} className="text-accent" />
                        <p className="text-[11px] text-text-muted uppercase tracking-wider">Operator</p>
                      </div>
                      <p className="text-sm text-text-primary font-medium">{shipment.assignedOperator.name}</p>
                      <p className="text-xs text-text-muted">{shipment.assignedOperator.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {!isCancelled && (
              <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-sm font-bold uppercase tracking-[2px] text-text-primary mb-5">Delivery Progress</h2>
                <div className="flex items-center justify-between relative">
                  {/* Progress line */}
                  <div className="absolute top-4 left-0 right-0 h-[2px] bg-border">
                    <div 
                      className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-700 rounded-full"
                      style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                    />
                  </div>
                  {statusSteps.map((step, i) => {
                    const isComplete = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step} className="relative flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          isComplete 
                            ? 'bg-accent border-accent text-white' 
                            : 'bg-bg-primary border-border text-text-muted'
                        } ${isCurrent ? 'ring-4 ring-accent/20 scale-110' : ''}`}>
                          {isComplete ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-xs font-bold">{i + 1}</span>
                          )}
                        </div>
                        <p className={`text-[10px] uppercase tracking-wider font-bold mt-2 text-center whitespace-nowrap ${
                          isComplete ? 'text-accent' : 'text-text-muted'
                        }`}>
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="glass-card p-6 border-danger/20 bg-danger/5 slide-up" style={{ animationDelay: '0.1s' }}>
                <p className="text-danger font-bold uppercase tracking-wider text-sm">Order Cancelled</p>
                <p className="text-text-muted text-xs mt-1">This shipment has been cancelled and will not be delivered.</p>
              </div>
            )}

            {/* Operator Actions */}
            {isOperator && getNextActions().length > 0 && (
              <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.15s' }}>
                <h2 className="text-sm font-bold uppercase tracking-[2px] text-text-primary mb-4">Operator Actions</h2>
                <div className="flex gap-3">
                  {getNextActions().map((action) => (
                    <button
                      key={action.status}
                      onClick={() => updateStatus(action.status)}
                      disabled={updatingStatus === action.status}
                      className={`${action.cls} py-3 px-6`}
                    >
                      {updatingStatus === action.status ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        action.label
                      )}
                    </button>
                  ))}
                  {shipment.status === 'Pending' && (
                    <button
                      onClick={() => updateStatus('Cancelled')}
                      disabled={updatingStatus === 'Cancelled'}
                      className="btn-secondary py-3 px-6 hover:border-danger hover:text-danger"
                    >
                      {updatingStatus === 'Cancelled' ? (
                        <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right — Timeline */}
          <div className="space-y-6">
            <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-text-primary mb-5">Status History</h2>
              {history.length > 0 ? (
                <div className="space-y-0">
                  {[...history].reverse().map((event, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${
                          i === 0 ? 'bg-accent' : 'bg-border'
                        } group-hover:scale-125 transition-transform`} />
                        {i < history.length - 1 && (
                          <div className="w-[1px] flex-1 bg-border min-h-[40px]" />
                        )}
                      </div>
                      <div className="pb-5 -mt-0.5 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <StatusBadge status={event.status} />
                          <span className="text-[10px] text-text-muted shrink-0">
                            {new Date(event.timestamp).toLocaleString('en-US', { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        {event.note && (
                          <p className="text-xs text-text-secondary mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-xs">No status updates yet</p>
              )}
            </div>

            {/* Copy Tracking ID */}
            <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.15s' }}>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Share Tracking ID</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-accent bg-accent/10 px-3 py-2 rounded-lg border border-accent/20 select-all">
                  {shipment.trackingId}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shipment.trackingId);
                  }}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
