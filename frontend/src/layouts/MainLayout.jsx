import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  Activity,
  Calculator,
  Plus,
  Store,
  RotateCcw,
  TrendingUp,
  LogOut,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';
import { TransactionModal } from '../components/TransactionModal';

export const MainLayout = () => {
  const { user, metrics, setIsAddModalOpen, resetData, isConnectedToBe, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { name: "Transaksi", to: "/transactions", icon: ReceiptText },
    { name: "Kesehatan Finansial", to: "/health", icon: Activity },
    { name: "Simulasi Runway", to: "/simulator", icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* ============================================================== */}
      {/* 1. DESKTOP SIDEBAR (240px)                                     */}
      {/* ============================================================== */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-slate-200 bg-white">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">
              BisnisCerdas
            </h1>
            <p className="text-[11px] font-medium text-emerald-700 tracking-wide mt-0.5">
              UMKM Financial Health
            </p>
          </div>
        </div>

        {/* Business Profile Chip */}
        <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-emerald-700 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user.business_name}
              </p>
              <p className="text-[10px] text-slate-500 capitalize truncate">
                Bidang: {user.business_type}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Kas Riil:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatRupiah(metrics.currentCash)}
            </span>
          </div>
        </div>

        {/* Quick Add CTA */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition active:scale-98 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Catat Transaksi Baru
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Demo Tools & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between px-2 py-1 text-[10px]">
            <span className="text-slate-400">Database API:</span>
            {isConnectedToBe ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Laravel (Port 8000)
              </span>
            ) : (
              <span className="text-slate-500">Mode Lokal (Mock)</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Kembalikan data demo ke kondisi awal?")) {
                resetData();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Data Demo
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar Akun (Logout)
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE TOPBAR                                               */}
      {/* ============================================================== */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-900 leading-none">
              {user.business_name}
            </h1>
            <p className="text-[10px] text-slate-500">
              Kas: <span className="font-semibold text-emerald-700 tabular-nums">{formatRupiah(metrics.currentCash)}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs active:scale-95 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Catat</span>
        </button>
      </header>

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT AREA                                           */}
      {/* ============================================================== */}
      <main className="flex-1 md:pl-60 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* ============================================================== */}
      {/* 4. MOBILE BOTTOM FIXED BAR                                     */}
      {/* ============================================================== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-lg">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
              isActive ? "text-emerald-700" : "text-slate-500 hover:text-slate-900"
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="mt-0.5">Beranda</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
              isActive ? "text-emerald-700" : "text-slate-500 hover:text-slate-900"
            }`
          }
        >
          <ReceiptText className="h-4 w-4" />
          <span className="mt-0.5">Transaksi</span>
        </NavLink>

        {/* Center FAB */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="-mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg border-2 border-white hover:bg-emerald-800 transition active:scale-95 cursor-pointer"
          title="Catat Transaksi"
        >
          <Plus className="h-6 w-6" />
        </button>

        <NavLink
          to="/health"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
              isActive ? "text-emerald-700" : "text-slate-500 hover:text-slate-900"
            }`
          }
        >
          <Activity className="h-4 w-4" />
          <span className="mt-0.5">Kesehatan</span>
        </NavLink>

        <NavLink
          to="/simulator"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
              isActive ? "text-emerald-700" : "text-slate-500 hover:text-slate-900"
            }`
          }
        >
          <Calculator className="h-4 w-4" />
          <span className="mt-0.5">Simulasi</span>
        </NavLink>
      </nav>

      {/* Global Transaction Modal */}
      <TransactionModal />
    </div>
  );
};
