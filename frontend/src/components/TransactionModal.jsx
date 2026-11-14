import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { CurrencyInput } from './CurrencyInput';

export const TransactionModal = () => {
  const { isAddModalOpen, setIsAddModalOpen, addTransaction } = useApp();

  const [type, setType] = useState("income");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("sales");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!isAddModalOpen) return null;

  const currentCategories = CATEGORIES[type] || [];

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === "income" ? "sales" : "raw_materials");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Nominal transaksi harus lebih dari 0");
      return;
    }
    if (!description.trim()) {
      setError("Keterangan transaksi wajib diisi");
      return;
    }

    const selectedCat = currentCategories.find((c) => c.value === category);

    addTransaction({
      type,
      amount,
      category,
      category_label: selectedCat ? selectedCat.label : category,
      date,
      description: description.trim(),
      is_operational: selectedCat ? selectedCat.is_operational : true
    });

    // Reset and close
    setAmount(0);
    setDescription("");
    setError("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Catat Transaksi Baru</h2>
            <p className="text-xs text-slate-500">Pencatatan kas harian otomatis mengupdate metrik</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          {/* 3.3 Transaction Type Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition cursor-pointer ${
                type === "income"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${type === "income" ? "bg-emerald-500" : "bg-slate-300"}`}></span>
              Pemasukan (Uang Masuk)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition cursor-pointer ${
                type === "expense"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${type === "expense" ? "bg-rose-500" : "bg-slate-300"}`}></span>
              Pengeluaran (Uang Keluar)
            </button>
          </div>

          {/* 3.2 Currency Input */}
          <CurrencyInput
            value={amount}
            onChange={(val) => {
              setAmount(val);
              if (error) setError("");
            }}
          />

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Kategori Transaksi <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            >
              {currentCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} {cat.is_operational ? "(Operasional)" : "(Non-Operasional)"}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Klasifikasi operasional berpengaruh langsung pada skor Cash Coverage & OpEx ratio.
            </p>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Tanggal Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Keterangan / Catatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Belanja beras & minyak goreng untuk stok"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 rounded-md border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition active:scale-98 shadow-xs cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
