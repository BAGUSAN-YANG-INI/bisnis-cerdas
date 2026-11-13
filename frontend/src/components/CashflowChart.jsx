import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatRupiah } from '../utils/formatters';

export const CashflowChart = ({ data }) => {
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload.find((p) => p.dataKey === "income")?.value || 0;
      const expense = payload.find((p) => p.dataKey === "expense")?.value || 0;
      const net = income - expense;

      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs">
          <p className="font-semibold text-slate-800 border-b border-slate-100 pb-1 mb-1.5">
            {label}
          </p>
          <div className="space-y-1">
            <p className="text-emerald-700 font-medium">
              Masuk: <span className="tabular-nums font-bold">{formatRupiah(income)}</span>
            </p>
            <p className="text-rose-700 font-medium">
              Keluar: <span className="tabular-nums font-bold">{formatRupiah(expense)}</span>
            </p>
            <p className={`font-semibold pt-1 border-t border-slate-100 ${net >= 0 ? "text-emerald-800" : "text-rose-800"}`}>
              Bersih: <span className="tabular-nums">{net >= 0 ? "+" : ""}{formatRupiah(net)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 sm:h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={{ stroke: "#CBD5E1" }}
            tick={{ fill: "#64748B", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
            tickFormatter={(val) => {
              if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
              if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
              return val;
            }}
          />
          <Tooltip content={customTooltip} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
          />
          <Bar dataKey="income" name="Pemasukan" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={30} />
          <Bar dataKey="expense" name="Pengeluaran" fill="#E11D48" radius={[4, 4, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
