import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, X } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { showAdminLoginModal, setShowAdminLoginModal, loginAdminWithCredentials, pengaturan } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!showAdminLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Masukkan username dan password admin.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    const res = await loginAdminWithCredentials(username, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Username atau password salah!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 shadow-xl rounded-2xl max-w-sm w-full p-6 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={() => setShowAdminLoginModal(false)}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 text-[#6C2BD9] flex items-center justify-center mb-1 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Login Admin Bendahara
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {pengaturan.namaSekolah || 'SMKN 7 SAMARINDA'} · KAS OSIS
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Username:</span>
            </label>
            <input
              type="text"
              placeholder="Username admin..."
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMsg('');
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0D62C9] focus:ring-2 focus:ring-[#0D62C9]/20 outline-none transition-all font-semibold"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Password:</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password admin..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0D62C9] focus:ring-2 focus:ring-[#0D62C9]/20 outline-none transition-all pr-10 font-mono-num font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0D62C9] hover:bg-[#0b54ad] text-white py-2.5 px-4 rounded-xl text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Memverifikasi...' : 'MASUK SEBAGAI ADMIN'}
            </button>
            <button
              type="button"
              onClick={() => setShowAdminLoginModal(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold text-center py-1 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
