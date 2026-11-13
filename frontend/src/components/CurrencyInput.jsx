import React from 'react';

export const CurrencyInput = ({ value, onChange, label = "Nominal Transaksi", required = true }) => {
  const quickChips = [
    { label: "+50rb", val: 50000 },
    { label: "+100rb", val: 100000 },
    { label: "+500rb", val: 500000 },
    { label: "+1jt", val: 1000000 }
  ];

  const handleRawChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(raw ? parseInt(raw, 10) : 0);
  };

  const addChipValue = (added) => {
    const current = Number(value) || 0;
    onChange(current + added);
  };

  const displayFormatted = value ? new Intl.NumberFormat("id-ID").format(value) : "";

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative rounded-md shadow-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="font-mono text-sm font-semibold text-slate-400">Rp</span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={displayFormatted}
          onChange={handleRawChange}
          placeholder="0"
          className="block w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 font-mono text-base font-semibold text-slate-900 placeholder:text-slate-300 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 tabular-nums bg-white"
        />
      </div>
      {/* Quick chips for fast mobile tap */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {quickChips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => addChipValue(chip.val)}
            className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition active:scale-95 cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="rounded border border-slate-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 transition active:scale-95 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
