import React from 'react';

export const StatCard = ({ title, value, helper, badge, type = "neutral" }) => {
  let valueColor = "text-slate-900";
  if (type === "income") valueColor = "text-emerald-700";
  if (type === "expense") valueColor = "text-rose-700";
  if (type === "deficit") valueColor = "text-rose-700";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {badge && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className || "bg-emerald-50 text-emerald-700"}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className={`mt-2 text-2xl font-bold tracking-tight ${valueColor} tabular-nums`}>
        {value}
      </div>
      {helper && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
          {helper}
        </p>
      )}
    </div>
  );
};
