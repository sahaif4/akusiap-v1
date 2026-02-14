import React, { useState, useEffect } from 'react';
import { User as UserIcon, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Role, User, Unit, BrandingConfig } from '../types';
import * as apiService from '../services/apiService';

interface LoginViewProps {
  onLoginSuccess: (user: User, unit?: Unit) => void;
  onBack: () => void;
  brandingConfig: BrandingConfig;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBack, brandingConfig }) => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Example accounts for display only, not used for login logic
  const demoAccounts = [
      { role: 'Direktur', nip: 'harmanto' },
      { role: 'Admin UPM', nip: 'wisnu' },
      { role: 'Auditor', nip: 'irwanto' },
      { role: 'Admin Prodi', nip: 'shofie' },
      { role: 'Super Admin', nip: 'superadmin' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, unit, access, refresh } = await apiService.login(nip, password);
      
      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      
      onLoginSuccess(user, unit);
    } catch (apiError: any) {
      setError(apiError.message || 'Terjadi kesalahan saat login. Pastikan backend berjalan.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Visual Content */}
      <div className="hidden lg:flex w-7/12 bg-slate-900 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592994982637-23030376d859?q=80&w=1887&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-pepi-green-900/90 via-slate-900/95 to-slate-900"></div>
        
        <div className="relative z-10 text-white max-w-2xl space-y-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-10 border border-white/20 shadow-2xl">
             <ShieldCheck size={40} className="text-emerald-400" />
          </div>
          <div className="space-y-4">
             <h2 className="text-5xl font-black leading-tight tracking-tight">Sistem Audit Mutu Internal Digital</h2>
             <p className="text-xl text-pepi-green-100 leading-relaxed font-light">
               Platform terpadu untuk penjaminan mutu Internal Politeknik Enjiniring Pertanian Indonesia.
             </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form Login */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 bg-white lg:rounded-l-[4rem] shadow-2xl relative z-10">
        <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-right-12 duration-700">
          <div className="text-center lg:text-left">
            <button onClick={onBack} className="text-[10px] font-black text-slate-400 hover:text-pepi-green-900 mb-6 uppercase tracking-[0.2em] transition-all flex items-center gap-2">
              <ArrowRight size={14} className="rotate-180" /> Portal Depan
            </button>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Login {brandingConfig.appName}</h2>
            <p className="text-slate-500 font-medium">Siklus AMI 2025 (SK No. 6897/KPTS)</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ID Pengguna (NIP/Username)</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pepi-green-500 transition-colors" size={20} />
                  <input type="text" required value={nip} onChange={(e) => setNip(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-pepi-green-500/10 focus:border-pepi-green-500 outline-none transition-all" placeholder="Contoh: irwanto" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kata Sandi</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pepi-green-500 transition-colors" size={20} />
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-pepi-green-500/10 focus:border-pepi-green-500 outline-none transition-all" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pepi-green-900 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold animate-in shake"><AlertCircle size={20} />{error}</div>}

            <button type="submit" disabled={isLoading} className="w-full py-5 bg-pepi-green-900 hover:bg-pepi-green-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-pepi-green-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70">
              {isLoading ? 'Memproses...' : <>Otorisasi Masuk <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100">
             <div className="bg-slate-50 rounded-3xl p-5 space-y-3">
                <p className="text-[9px] font-black text-pepi-green-900 uppercase tracking-widest mb-1">Akun (Password: pepi123):</p>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-[10px] font-bold text-slate-500">
                  {demoAccounts.map(acc => (
                      <div key={acc.nip} className="flex justify-between">
                          <span>{acc.role}:</span>
                          <span className="text-slate-900 font-mono">{acc.nip}</span>
                      </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;