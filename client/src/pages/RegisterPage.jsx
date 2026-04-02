import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Truck, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('Please fill in all fields');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    
    setLoading(true);
    setError('');
    
    const result = await register(name, email, password, role);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full slide-up">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-accent to-accent-dark flex items-center justify-center p-2 shadow-2xl accent-glow">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l-5-5m0 0l5-5" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none italic uppercase">LogiTrack</h1>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Start Your Journey</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
            Sign <span className="text-gradient">Up</span>
          </h1>
          <p className="text-text-muted text-sm">
            Create your account to start shipping or managing deliveries.
          </p>
        </div>

        <div className="glass-card p-8 accent-glow">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center fade-in">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="mb-6">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1 block mb-3">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  role === 'user'
                    ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(224,122,47,0.15)]'
                    : 'border-border bg-bg-primary hover:border-border-light'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  role === 'user' ? 'bg-accent/20' : 'bg-bg-secondary'
                }`}>
                  <Package size={20} className={role === 'user' ? 'text-accent' : 'text-text-muted'} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  role === 'user' ? 'text-accent' : 'text-text-muted'
                }`}>User</span>
                <span className="text-[10px] text-text-muted text-center leading-tight">Send & track packages</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('operator')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  role === 'operator'
                    ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(224,122,47,0.15)]'
                    : 'border-border bg-bg-primary hover:border-border-light'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  role === 'operator' ? 'bg-accent/20' : 'bg-bg-secondary'
                }`}>
                  <Truck size={20} className={role === 'operator' ? 'text-accent' : 'text-text-muted'} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  role === 'operator' ? 'text-accent' : 'text-text-muted'
                }`}>Operator</span>
                <span className="text-[10px] text-text-muted text-center leading-tight">Manage deliveries</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10!"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10!"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10! pr-11!"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-text-muted ml-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl group mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <>Sign Up <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-text-muted font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-light transition-colors font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
