import { useState, useEffect } from 'react';
import { User, Bell, Shield, Save, Check, Camera, Mail, Info } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import shipmentApi from '../services/api';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [toggles, setToggles] = useState({
    emailNotifications: true,
    pushNotifications: true,
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync state with user context when loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        updateData.password = formData.newPassword;
      }

      const response = await shipmentApi.updateProfile(updateData);
      
      // Update local context
      if (setUser) {
        setUser(response);
      }
      
      showNotification({
        type: 'success',
        message: 'Your settings have been saved successfully',
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (e) {
      showNotification({
        type: 'error',
        message: e.response?.data?.error || e.message || 'Failed to update settings',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <TopBar title="Settings" />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8 slide-up">
          <p className="text-xs font-bold uppercase tracking-[2px] text-accent mb-1">Configuration</p>
          <h1 className="text-2xl font-bold text-text-primary">Profile Center</h1>
          <p className="text-sm text-text-secondary mt-1">
            Customize your account identity and system preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hero Profile Card */}
          <div className="glass-card overflow-hidden slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="h-24 bg-linear-to-r from-accent/20 via-accent/5 to-transparent" />
            <div className="px-8 pb-8 -mt-10 relative">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="relative group self-start">
                  <div className="w-24 h-24 rounded-2xl bg-bg-secondary border-4 border-bg-primary flex items-center justify-center p-1 shadow-2xl overflow-hidden accent-glow">
                    <div className="w-full h-full rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <User size={36} />
                    </div>
                  </div>
                  <button type="button" className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-bg-primary border border-border text-text-secondary hover:text-accent transition-all shadow-lg group-hover:scale-110">
                    <Camera size={14} />
                  </button>
                </div>
                
                <div className="flex-1 mb-2">
                  <h2 className="text-2xl font-bold text-text-primary">{user?.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                      {user?.role}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Mail size={12} /> {user?.email}
                    </span>
                  </div>
                </div>
                
                <div className="pb-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn-primary px-8 py-3 flex items-center gap-2 min-w-[150px] justify-center transition-all shadow-xl ${
                      saved ? 'bg-success border-success' : 'accent-glow'
                    }`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved ? (
                      <><Check size={18} /> Profile Updated</>
                    ) : (
                      <><Save size={18} /> Save Settings</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shadow-inner">
                    <User size={20} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">Personal Details</h2>
                    <p className="text-xs text-text-muted">How others see you on the platform</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shadow-inner">
                    <Shield size={20} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">Security & Password</h2>
                    <p className="text-xs text-text-muted">Update your credentials (blank to keep current)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2 ml-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2 ml-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Re-type new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* Notifications Section */}
              <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shadow-inner">
                    <Bell size={20} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">System Preferences</h2>
                    <p className="text-xs text-text-muted">Manage how we stay in touch</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'pushNotifications', title: 'Dashboard Alerts', desc: 'Real-time pop-ups for shipment progress', icon: Info },
                    { key: 'emailNotifications', title: 'Email Summaries', desc: 'Detailed delivery reports sent to your inbox', icon: Mail },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-bg-primary/30 rounded-xl border border-border/40">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-bg-secondary text-text-muted">
                          <item.icon size={14} />
                        </div>
                        <div>
                          <p className="text-sm text-text-primary font-bold">{item.title}</p>
                          <p className="text-[11px] text-text-muted leading-tight mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle(item.key)}
                        className={`w-11 h-6 rounded-full relative transition-all duration-300 shrink-0 ${
                          toggles[item.key] ? 'bg-accent shadow-[0_0_15px_rgba(255,107,0,0.4)]' : 'bg-border'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            toggles[item.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 rounded-xl bg-bg-primary/50 border border-dashed border-border text-center">
                  <p className="text-[10px] text-text-muted italic">
                    More customized preferences for your <strong>{user?.role}</strong> account will be available in future updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
