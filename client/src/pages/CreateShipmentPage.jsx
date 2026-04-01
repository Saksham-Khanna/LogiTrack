import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, ArrowRight, Send, ArrowLeft } from 'lucide-react';
import TopBar from '../components/TopBar';
import shipmentApi from '../services/api';

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    objectName: '',
    fromLocation: '',
    toLocation: '',
    distance: '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.objectName || !form.fromLocation || !form.toLocation) {
      return setError('Please fill in all required fields');
    }

    setSaving(true);
    setError('');
    try {
      const shipment = await shipmentApi.create({
        objectName: form.objectName,
        fromLocation: form.fromLocation,
        toLocation: form.toLocation,
        distance: parseFloat(form.distance) || 0,
      });
      navigate(`/track/${shipment.trackingId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <TopBar title="New Order" showSearch={false} />

      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 slide-up">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Create <span className="text-gradient">Order</span>
          </h1>
          <p className="text-sm text-text-secondary">
            Fill in the details below to create a new shipment order. An operator will pick it up.
          </p>
        </div>

        <div className="glass-card p-8 accent-glow slide-up" style={{ animationDelay: '0.1s' }}>
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Object Name */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-accent" />
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">What are you shipping? *</label>
              </div>
              <input
                type="text"
                placeholder="e.g., Electronics Box, Documents, Furniture..."
                value={form.objectName}
                onChange={(e) => updateField('objectName', e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* From / To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-success" />
                  </div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Pickup Location *</label>
                </div>
                <input
                  type="text"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={form.fromLocation}
                  onChange={(e) => updateField('fromLocation', e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-danger/20 flex items-center justify-center">
                    <MapPin size={12} className="text-danger" />
                  </div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Delivery Location *</label>
                </div>
                <input
                  type="text"
                  placeholder="e.g., Delhi, NCR"
                  value={form.toLocation}
                  onChange={(e) => updateField('toLocation', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-info/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-info" />
                </div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Approximate Distance *</label>
              </div>
              <div className="relative group">
                <input
                  type="number"
                  placeholder="Distance in kilometers (KM)"
                  value={form.distance}
                  onChange={(e) => updateField('distance', e.target.value)}
                  className="input-field"
                  min="0"
                />
              </div>
              <p className="text-[10px] text-text-muted ml-1 italic">Optional — helps operators estimate delivery time and pricing.</p>
            </div>

            {/* Divider */}
            <div className="border-t border-border pt-6">
              <div className="glass-card p-4 bg-accent/5 border-accent/10 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Send size={14} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary mb-0.5">How it works</p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Your order will be visible to all operators. Once accepted, the operator will manage pickup and delivery.
                      You'll get a unique tracking ID to monitor your shipment status in real-time.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full py-4 rounded-xl group text-base"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  <>Place Order <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
