import React, { useState } from 'react';
import { Calculator, RefreshCw, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';

export const SimulatorPage = () => {
  const { metrics } = useApp();

  const baseline = {
    currentCash: metrics.currentCash,
    dailyIncome: metrics.runway.dailyIncome,
    dailyExpense: metrics.runway.dailyExpense,
  };

  const [simIncome, setSimIncome] = useState(baseline.dailyIncome);
  const [simExpense, setSimExpense] = useState(baseline.dailyExpense);
  const [simDays, setSimDays] = useState(30);
  const [hasCalculated, setHasCalculated] = useState(false);

  const incomeChangePct = baseline.dailyIncome > 0
    ? Math.round(((simIncome - baseline.dailyIncome) / baseline.dailyIncome) * 100)
    : 0;
  const expenseChangePct = baseline.dailyExpense > 0
    ? Math.round(((simExpense - baseline.dailyExpense) / baseline.dailyExpense) * 100)
    : 0;

  const simNetDaily = simIncome - simExpense;
  const simFinalCash = baseline.currentCash + (simNetDaily * simDays);
  const baseNetDaily = baseline.dailyIncome - baseline.dailyExpense;
  const baseFinalCash = baseline.currentCash + (baseNetDaily * simDays);
  const cashDifference = simFinalCash - baseFinalCash;

  let simRunwayDays = Infinity;
  let isSimRunwayInfinite = true;
  if (simNetDaily < 0) {
    isSimRunwayInfinite = false;
    simRunwayDays = simExpense > 0 ? Math.max(0, Math.floor(baseline.currentCash / simExpense)) : 999;
  }

  const handleReset = () => {
    setSimIncome(baseline.dailyIncome);
    setSimExpense(baseline.dailyExpense);
    setSimDays(30);
    setHasCalculated(false);
  };

  const incomePercentSliderVal = Math.round(((simIncome / (baseline.dailyIncome || 1)) - 1) * 100);
  const expensePercentSliderVal = Math.round(((simExpense / (baseline.dailyExpense || 1)) - 1) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
          Simulasi Skenario Runway (What-If)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ubah asumsi pemasukan dan pengeluaran harian untuk melihat dampaknya terhadap daya tahan kas.
        </p>
      </div>

      {/* Baseline Info Bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Data Riil (Baseline 30 Hari Terakhir)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Kas Tersedia</p>
            <p className="text-base font-extrabold text-slate-900 tabular-nums mt-0.5">{formatRupiah(baseline.currentCash)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-emerald-700">Rata-rata Masuk/Hari</p>
            <p className="text-base font-extrabold text-emerald-800 tabular-nums mt-0.5">{formatRupiah(baseline.dailyIncome)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-rose-700">Rata-rata Keluar/Hari</p>
            <p className="text-base font-extrabold text-rose-800 tabular-nums mt-0.5">{formatRupiah(baseline.dailyExpense)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Net Surplus/Defisit/Hari</p>
            <p className={`text-base font-extrabold tabular-nums mt-0.5 ${baseNetDaily >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {baseNetDaily >= 0 ? "+" : ""}{formatRupiah(baseNetDaily)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Simulation Panel */}
        <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Panel Simulasi (Ubah Asumsi)
          </h3>

          {/* Income Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Asumsi Pemasukan Harian
              </label>
              <span className={`text-xs font-bold tabular-nums rounded-full px-2 py-0.5 ${
                incomeChangePct > 0 ? "text-emerald-700 bg-emerald-50" :
                incomeChangePct < 0 ? "text-rose-700 bg-rose-50" :
                "text-slate-600 bg-slate-100"
              }`}>
                {incomeChangePct > 0 ? "+" : ""}{incomeChangePct}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              value={incomePercentSliderVal}
              onChange={(e) => {
                const pct = parseInt(e.target.value, 10);
                setSimIncome(Math.round(baseline.dailyIncome * (1 + pct / 100)));
              }}
              className="w-full accent-emerald-600 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>-50%</span>
              <span className="text-emerald-700 font-bold text-xs tabular-nums">{formatRupiah(simIncome)}/hari</span>
              <span>+100%</span>
            </div>
          </div>

          {/* Expense Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Asumsi Pengeluaran Harian
              </label>
              <span className={`text-xs font-bold tabular-nums rounded-full px-2 py-0.5 ${
                expenseChangePct < 0 ? "text-emerald-700 bg-emerald-50" :
                expenseChangePct > 0 ? "text-rose-700 bg-rose-50" :
                "text-slate-600 bg-slate-100"
              }`}>
                {expenseChangePct > 0 ? "+" : ""}{expenseChangePct}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              value={expensePercentSliderVal}
              onChange={(e) => {
                const pct = parseInt(e.target.value, 10);
                setSimExpense(Math.round(baseline.dailyExpense * (1 + pct / 100)));
              }}
              className="w-full accent-rose-500 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>-50%</span>
              <span className="text-rose-700 font-bold text-xs tabular-nums">{formatRupiah(simExpense)}/hari</span>
              <span>+100%</span>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
              Periode Proyeksi
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 14, 30, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSimDays(d)}
                  className={`rounded-md border py-2 text-xs font-semibold transition cursor-pointer ${
                    simDays === d
                      ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {d} Hari
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset ke Baseline
            </button>
            <button
              type="button"
              onClick={() => setHasCalculated(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-emerald-700 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
            >
              <Calculator className="h-3.5 w-3.5" />
              Hitung Simulasi
            </button>
          </div>
        </div>

        {/* Right: Simulation Results */}
        <div className="lg:col-span-7 space-y-4">
          {/* Always live results panel */}
          <div className={`rounded-lg border p-5 shadow-xs transition ${
            simNetDaily >= 0
              ? "border-emerald-200 bg-emerald-50/60"
              : "border-rose-200 bg-rose-50/60"
          }`}>
            <div className="flex items-center gap-2 mb-4">
              {simNetDaily >= 0
                ? <TrendingUp className="h-5 w-5 text-emerald-700" />
                : <TrendingDown className="h-5 w-5 text-rose-700" />
              }
              <h3 className="text-sm font-bold text-slate-900">
                Hasil Proyeksi Simulasi
              </h3>
              <span className="text-[10px] text-slate-500 font-medium ml-auto">
                (Langsung dihitung)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Net Daily */}
              <div className="rounded-lg bg-white border border-slate-200/80 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Net Arus Kas / Hari
                </p>
                <p className={`text-2xl font-extrabold tabular-nums mt-1 ${simNetDaily >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {simNetDaily >= 0 ? "+" : ""}{formatRupiah(simNetDaily)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {simNetDaily >= 0 ? "Surplus tiap hari" : "Defisit tiap hari"}
                </p>
              </div>

              {/* Runway */}
              <div className={`rounded-lg border p-4 text-center ${
                isSimRunwayInfinite
                  ? "bg-emerald-50 border-emerald-200/80"
                  : simRunwayDays <= 30
                  ? "bg-rose-50 border-rose-200/80"
                  : "bg-amber-50 border-amber-200/80"
              }`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Estimasi Daya Tahan Kas
                </p>
                <p className={`text-2xl font-extrabold tabular-nums mt-1 ${
                  isSimRunwayInfinite ? "text-emerald-700" :
                  simRunwayDays <= 30 ? "text-rose-700" : "text-amber-700"
                }`}>
                  {isSimRunwayInfinite ? "Aman ✓" : `${simRunwayDays} Hari`}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isSimRunwayInfinite ? "Kas masih surplus" : "Tanpa perubahan kondisi"}
                </p>
              </div>

              {/* Projected Cash after N days */}
              <div className="rounded-lg bg-white border border-slate-200/80 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Proyeksi Kas dalam {simDays} Hari
                </p>
                <p className={`text-2xl font-extrabold tabular-nums mt-1 ${simFinalCash >= 0 ? "text-slate-900" : "text-rose-700"}`}>
                  {simFinalCash < 0 ? "– " : ""}{formatRupiah(Math.abs(simFinalCash))}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Dari saldo awal {formatRupiah(baseline.currentCash)}
                </p>
              </div>

              {/* Difference vs baseline */}
              <div className={`rounded-lg border p-4 text-center ${
                cashDifference >= 0
                  ? "bg-emerald-50/60 border-emerald-200/80"
                  : "bg-rose-50/60 border-rose-200/80"
              }`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Selisih vs Kondisi Asli
                </p>
                <p className={`text-2xl font-extrabold tabular-nums mt-1 ${cashDifference >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {cashDifference >= 0 ? "+" : ""}{formatRupiah(cashDifference)}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {cashDifference >= 0 ? "Lebih baik dari baseline" : "Lebih buruk dari baseline"}
                </p>
              </div>
            </div>
          </div>

          {/* Insight Card */}
          <div className="rounded-lg border border-sky-200/80 bg-sky-50 p-4">
            <div className="flex gap-2.5">
              <Info className="h-4 w-4 text-sky-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-sky-900 mb-1">Bagaimana Membaca Simulasi Ini?</p>
                <ul className="text-xs text-sky-800 leading-relaxed space-y-1 list-disc list-inside">
                  <li>Geser slider kiri-kanan untuk melihat dampak perubahan pemasukan atau pengeluaran secara langsung.</li>
                  <li>Simulasi <strong>tidak mengubah data transaksi asli</strong>. Data riil Anda tetap aman.</li>
                  <li>Gunakan skenario ini sebelum mengambil keputusan penting seperti rekrut karyawan baru, pinjam modal, atau buka cabang.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
