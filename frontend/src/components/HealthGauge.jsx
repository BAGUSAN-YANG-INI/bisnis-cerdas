import React from 'react';

export const HealthGauge = ({ score = 74, statusLabel = "Kondisi Sehat", summary }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Skor Kesehatan Keuangan
          </span>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {score}<span className="text-lg font-normal text-slate-400">/100</span>
          </h3>
        </div>
        <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          {statusLabel}
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mt-4 grid grid-cols-4 gap-1.5">
        <div
          className={`h-2.5 rounded-l-full transition-all ${
            score >= 0 ? "bg-rose-400" : "bg-slate-200"
          }`}
          title="Kritis (0-39)"
        ></div>
        <div
          className={`h-2.5 transition-all ${
            score >= 40 ? "bg-amber-400" : "bg-slate-200"
          }`}
          title="Waspada (40-59)"
        ></div>
        <div
          className={`h-2.5 transition-all ${
            score >= 60 ? "bg-emerald-500" : "bg-slate-200"
          }`}
          title="Sehat (60-79)"
        ></div>
        <div
          className={`h-2.5 rounded-r-full transition-all ${
            score >= 80 ? "bg-emerald-600" : "bg-slate-200"
          }`}
          title="Prima (80-100)"
        ></div>
      </div>

      <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400">
        <span>0 (Kritis)</span>
        <span>40 (Waspada)</span>
        <span>60 (Sehat)</span>
        <span>80 (Prima)</span>
      </div>

      {summary && (
        <p className="mt-4 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
          <strong>Kesimpulan:</strong> {summary}
        </p>
      )}
    </div>
  );
};
