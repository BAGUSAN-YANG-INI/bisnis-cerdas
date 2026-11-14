import React, { useState } from 'react';
import { Plus, Search, Trash2, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDate } from '../utils/formatters';

export const TransactionsPage = () => {
  const { transactions, deleteTransaction, setIsAddModalOpen } = useApp();

  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (searchTerm) {
      const matchDesc = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = tx.category_label?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDesc || matchCat;
    }
    return true;
  });

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Buku Catatan Kas Transaksi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pemasukan dan pengeluaran usaha secara real-time
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition active:scale-95 shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Catat Transaksi Baru
        </button>
      </div>

      {/* 2. Control Bar (Filters & Search) */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Filter */}
          <div className="inline-flex rounded-md bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                typeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("income")}
              className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                typeFilter === "income" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("expense")}
              className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                typeFilter === "expense" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pengeluaran
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Filter Summary Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Menampilkan <strong className="text-slate-800">{filteredTransactions.length}</strong> transaksi
          </span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-emerald-700">
              Total Masuk: <span className="tabular-nums font-bold">{formatRupiah(totalFilteredIncome)}</span>
            </span>
            <span className="text-rose-700">
              Total Keluar: <span className="tabular-nums font-bold">{formatRupiah(totalFilteredExpense)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Data Table (Desktop) / Cards (Mobile) */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <p className="text-sm font-semibold">Belum ada transaksi ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau tambah transaksi baru.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Tanggal</th>
                    <th className="py-3 px-5">Keterangan</th>
                    <th className="py-3 px-5">Kategori</th>
                    <th className="py-3 px-5">Sifat</th>
                    <th className="py-3 px-5 text-right">Nominal (Rp)</th>
                    <th className="py-3 px-4 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-5 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 px-5 text-xs font-medium text-slate-900">
                        {tx.description}
                      </td>
                      <td className="py-3 px-5 text-xs whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          tx.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {tx.category_label || tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-[11px] text-slate-500 whitespace-nowrap">
                        {tx.is_operational ? (
                          <span className="text-sky-700 font-medium">Operasional</span>
                        ) : (
                          <span className="text-slate-400">Non-Operasional</span>
                        )}
                      </td>
                      <td className={`py-3 px-5 text-xs font-bold text-right tabular-nums whitespace-nowrap ${
                        tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Hapus transaksi ini?")) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      tx.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {tx.category_label || tx.category}
                    </span>
                    <span className="text-slate-400 text-[11px]">{formatDate(tx.date)}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-medium text-slate-900 pr-2">
                      {tx.description}
                    </p>
                    <span className={`text-sm font-bold tabular-nums whitespace-nowrap ${
                      tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>{tx.is_operational ? "Beban Operasional" : "Non-Operasional"}</span>
                    <button
                      type="button"
                      onClick={() => deleteTransaction(tx.id)}
                      className="text-rose-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
