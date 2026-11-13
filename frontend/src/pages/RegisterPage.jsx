import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BUSINESS_TYPES = [
  { value: "culinary", label: "Kuliner & Makanan (Warung, Katering, Olahan)" },
  { value: "retail", label: "Retail & Dagang (Toko Kelontong, Warung Sembako)" },
  { value: "service", label: "Jasa (Laundri, Bengkel, Salon, Fotokopi)" },
  { value: "craft", label: "Kerajinan & Produksi (Konveksi, Batik, Handmade)" },
  { value: "agriculture", label: "Pertanian & Perkebunan" },
  { value: "other", label: "Usaha Lainnya" }
];

export const RegisterPage = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    business_name: "",
    business_type: "culinary",
    initial_cash_balance: ""
  });

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nama lengkap wajib diisi";
    if (!form.email.trim() || !form.email.includes("@")) errs.email = "Format email tidak valid";
    if (form.password.length < 8) errs.password = "Kata sandi minimal 8 karakter";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.business_name.trim()) errs.business_name = "Nama usaha wajib diisi";
    if (!form.business_type) errs.business_type = "Jenis usaha wajib dipilih";
    const bal = parseInt(String(form.initial_cash_balance).replace(/\D/g, ""), 10);
    if (isNaN(bal) || bal < 0) errs.initial_cash_balance = "Saldo awal kas harus berupa angka positif (boleh 0)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const rawBalance = parseInt(String(form.initial_cash_balance).replace(/\D/g, ""), 10) || 0;

    setUser({
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      business_name: form.business_name.trim(),
      business_type: form.business_type,
      initial_cash_balance: rawBalance,
      created_at: new Date().toISOString()
    });

    navigate("/dashboard", { replace: true });
  };

  const cashFormatted = form.initial_cash_balance
    ? new Intl.NumberFormat("id-ID").format(String(form.initial_cash_balance).replace(/\D/g, ""))
    : "";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex justify-center mb-6">
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

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${step >= 1 ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-500"}`}>
            1
          </div>
          <div className={`h-0.5 w-12 rounded transition ${step >= 2 ? "bg-emerald-500" : "bg-slate-200"}`} />
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${step >= 2 ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-500"}`}>
            2
          </div>
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Buat Akun Baru</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data akun pemilik usaha untuk login ke platform
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Siti Rahmawati"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className={`block w-full rounded-md border py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 ${errors.name ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"} bg-white`}
                  />
                  {errors.name && <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="pemilik@usaha.com"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className={`block w-full rounded-md border py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 ${errors.email ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"} bg-white`}
                  />
                  {errors.email && <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      className={`block w-full rounded-md border py-2.5 px-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 ${errors.password ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"} bg-white`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
                </div>

                <button type="submit" className="w-full rounded-md bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition shadow-xs cursor-pointer">
                  Lanjut ke Profil Usaha &rarr;
                </button>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Profil Usaha Anda</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informasi ini digunakan untuk kalibrasi analisis kesehatan finansial
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Nama Usaha <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Warung Bu Siti, Katering Berkah"
                    value={form.business_name}
                    onChange={(e) => updateForm("business_name", e.target.value)}
                    className={`block w-full rounded-md border py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 ${errors.business_name ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"} bg-white`}
                  />
                  {errors.business_name && <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.business_name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Jenis Usaha <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.business_type}
                    onChange={(e) => updateForm("business_type", e.target.value)}
                    className="block w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt.value} value={bt.value}>{bt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Saldo Kas Awal (Rp)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="font-mono text-sm font-semibold text-slate-400">Rp</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={cashFormatted}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        updateForm("initial_cash_balance", raw);
                      }}
                      className={`block w-full rounded-md border py-2.5 pl-10 pr-3 font-mono text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 tabular-nums ${errors.initial_cash_balance ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"} bg-white`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Total uang tunai atau rekening yang dimiliki saat ini. Boleh diisi 0 jika belum tahu.</p>
                  {errors.initial_cash_balance && <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.initial_cash_balance}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="rounded-md border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                    &larr; Kembali
                  </button>
                  <button type="submit" className="flex-1 rounded-md bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition shadow-xs cursor-pointer">
                    Mulai Pantau Usaha Saya
                  </button>
                </div>
              </>
            )}
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};
