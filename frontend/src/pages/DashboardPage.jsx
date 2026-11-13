import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Lightbulb,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/formatters';
import { StatCard } from '../components/StatCard';
import { CashflowChart } from '../components/CashflowChart';
import { MOCK_CASHFLOW_DAILY } from '../data/mockData';

export const DashboardPage = () => {
  const { user, transactions, metrics, period, setPeriod, setIsAddModalOpen } = useApp();

  const recentTransactions = transactions.slice(0, 5);

  const isNetSurplus = metrics.netCashFlow >= 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Ringkasan Keuangan Usaha
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau arus kas, cadangan likuiditas, dan kesehatan finansial {user.business_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
          >
            <option value="30d">30 Hari Terakhir</option>
            <option value="7d">7 Hari Terakhir</option>
            <option value="all">Semua Periode</option>
          </select>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Catat Kas
          </button>
        </div>
      </div>

      {/* 2. Stat Cards Row (4 Columns on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Kas Saat Ini"
          value={formatRupiah(metrics.currentCash)}
          helper="Dari modal awal + mutasi kas riil"
          badge={{ text: "Real-time", className: "bg-emerald-50 text-emerald-700" }}
        />
        <StatCard
          title="Total Pemasukan"
          value={formatRupiah(metrics.totalIncome)}
          helper={`${transactions.filter(t => t.type === 'income').length} transaksi kas masuk`}
          type="income"
          badge={{ text: "+ Kas Masuk", className: "bg-emerald-50 text-emerald-700" }}
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatRupiah(metrics.totalExpense)}
          helper={`Termasuk ${formatRupiah(metrics.totalOpEx)} operasional`}
          type="expense"
          badge={{ text: "- Kas Keluar", className: "bg-rose-50 text-rose-700" }}
        />
        <StatCard
          title="Arus Kas Bersih"
          value={`${isNetSurplus ? "+" : ""}${formatRupiah(metrics.netCashFlow)}`}
          helper={isNetSurplus ? "Surplus kas operasional" : "Defisit kas (pengeluaran > omzet)"}
          type={isNetSurplus ? "income" : "deficit"}
          badge={{
            text: isNetSurplus ? "Surplus" : "Defisit",
            className: isNetSurplus ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }}
        />
      </div>

      {/* 3. Primary Analytics Grid (2 Columns on Desktop: Chart & Health Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Cashflow Chart */}
        <div className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tren Arus Kas (Pemasukan vs Pengeluaran)
              </h3>
              <p className="text-xs text-slate-500">
                Visualisasi pergerakan kas harian
              </p>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Satuan: Rupiah
            </span>
          </div>
          <CashflowChart data={MOCK_CASHFLOW_DAILY} />
        </div>

        {/* Right Column: Health & Runway Quick Widget */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Health Score Mini Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Skor Kesehatan Bisnis
              </span>
              <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold border ${metrics.statusBadge}`}>
                {metrics.statusLabel}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {metrics.healthScore}
              </span>
              <span className="text-sm font-medium text-slate-400">/ 100</span>
            </div>

            {/* Runway Alert */}
            <div className="mt-4 rounded-md bg-slate-50 border border-slate-200/80 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Clock className="h-4 w-4 text-emerald-700" />
                <span>Estimasi Daya Tahan Kas (Runway):</span>
              </div>
              <p className="text-xs text-slate-600">
                {metrics.runway.isRunwayInfinite ? (
                  <span className="font-semibold text-emerald-700">Aman: Arus kas rata-rata masih surplus.</span>
                ) : (
                  <span>Kas bertahan sekitar <strong className="text-rose-700">{metrics.runway.runwayDays} hari</strong> ke depan jika kondisi burn berlanjut.</span>
                )}
              </p>
            </div>

            {/* Top Priority Insight */}
            <div className="mt-3 rounded-md bg-amber-50/80 border border-amber-200/80 p-3 flex gap-2">
              <Lightbulb className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Insight Prioritas:</strong> Rasio beban operasional Anda berada di angka <strong>{metrics.pillars.operatingExpense.value}</strong>. Jaga agar tidak melebihi 70% dari pendapatan harian.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <Link
                to="/health"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Lihat Analisis Detail & Rekomendasi &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions List */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Transaksi Terkini
            </h3>
            <p className="text-xs text-slate-500">
              5 catatan kas masuk dan keluar terakhir
            </p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Lihat Semua Transaksi &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Tanggal</th>
                <th className="py-3 px-5">Keterangan</th>
                <th className="py-3 px-5">Kategori</th>
                <th className="py-3 px-5 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-5 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-3 px-5 text-xs font-medium text-slate-800">
                    {tx.description}
                  </td>
                  <td className="py-3 px-5 text-xs whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      tx.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {tx.category_label}
                    </span>
                  </td>
                  <td className={`py-3 px-5 text-xs font-bold text-right tabular-nums whitespace-nowrap ${
                    tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
