import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, AlertCircle, Database, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage = () => {
  const { login, user } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      // Show warning or fallback option
      setError(result.message || "Gagal terhubung ke backend. Periksa email atau jalankan mode demo.");
    }
  };

  const fillDemoBackend = () => {
    setEmail("budi@warungberkah.test");
    setPassword("password123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 shadow-xs">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">BisnisCerdas</h1>
              <p className="text-xs text-emerald-700 font-medium">UMKM Financial Health Platform</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau kondisi keuangan usaha Anda secara real-time
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-rose-50 border border-rose-200 p-3 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Quick Backend Fill Button */}
          <div className="mb-4 rounded-lg bg-emerald-50/80 border border-emerald-200 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <Database className="h-3.5 w-3.5" />
                Akun Demo Backend:
              </span>
              <button
                type="button"
                onClick={fillDemoBackend}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
              >
                Isi Otomatis
              </button>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 font-mono">
              budi@warungberkah.test (pass: password123)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="pemilik@usaha.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Kata sandi Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-emerald-700 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? "Menghubungkan ke Backend..." : "Masuk ke Dashboard"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Belum punya akun?{" "}
          <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Daftar gratis sekarang
          </Link>
        </p>

        {/* Demo shortcuts */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => navigate("/dashboard", { replace: true })}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 cursor-pointer"
          >
            Masuk Mode Standalone Demo ({user.name})
          </button>
        </div>
      </div>
    </div>
  );
};
