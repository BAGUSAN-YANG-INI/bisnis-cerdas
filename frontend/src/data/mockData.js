// Mock Data strictly following API_CONTRACT.md & design.md

export const INITIAL_USER = {
  id: 1,
  name: "Siti Rahmawati",
  email: "siti.rahmawati@gmail.com",
  business_name: "Warung Bu Siti",
  business_type: "culinary",
  initial_cash_balance: 10000000,
  created_at: "2026-10-15T08:00:00Z"
};

export const INITIAL_TRANSACTIONS = [
  {
    id: 101,
    date: "2026-11-13",
    type: "income",
    category: "sales",
    category_label: "Penjualan Produk",
    amount: 1450000,
    description: "Penjualan paket makan siang katering kantor 30 porsi",
    is_operational: true
  },
  {
    id: 102,
    date: "2026-11-13",
    type: "expense",
    category: "raw_materials",
    category_label: "Bahan Baku / Stok",
    amount: 620000,
    description: "Belanja ayam potong, sayur, dan bumbu dapur pasar pagi",
    is_operational: true
  },
  {
    id: 103,
    date: "2026-11-12",
    type: "income",
    category: "sales",
    category_label: "Penjualan Produk",
    amount: 980000,
    description: "Omzet harian warung makan",
    is_operational: true
  },
  {
    id: 104,
    date: "2026-11-11",
    type: "expense",
    category: "utilities",
    category_label: "Listrik, Air, & Internet",
    amount: 350000,
    description: "Token listrik PLN dapur dan freezer",
    is_operational: true
  },
  {
    id: 105,
    date: "2026-11-10",
    type: "income",
    category: "sales",
    category_label: "Penjualan Produk",
    amount: 1250000,
    description: "Pesanan tumpeng mini acara syukuran",
    is_operational: true
  },
  {
    id: 106,
    date: "2026-11-09",
    type: "expense",
    category: "operational_transport",
    category_label: "Transportasi Operasional",
    amount: 75000,
    description: "Bensin motor operasional belanja pasar",
    is_operational: true
  },
  {
    id: 107,
    date: "2026-11-08",
    type: "expense",
    category: "raw_materials",
    category_label: "Bahan Baku / Stok",
    amount: 850000,
    description: "Beras 2 karung dan minyak goreng 4 jerigen",
    is_operational: true
  },
  {
    id: 108,
    date: "2026-11-07",
    type: "income",
    category: "sales",
    category_label: "Penjualan Produk",
    amount: 1100000,
    description: "Omzet harian warung makan",
    is_operational: true
  },
  {
    id: 109,
    date: "2026-11-05",
    type: "expense",
    category: "salaries",
    category_label: "Gaji / Upah Karyawan",
    amount: 1500000,
    description: "Upah mingguan 2 asisten masak",
    is_operational: true
  },
  {
    id: 110,
    date: "2026-11-03",
    type: "income",
    category: "service_income",
    category_label: "Pendapatan Jasa",
    amount: 400000,
    description: "Jasa sewa peralatan prasmanan RT",
    is_operational: true
  },
  {
    id: 111,
    date: "2026-11-01",
    type: "expense",
    category: "rent",
    category_label: "Sewa Tempat",
    amount: 1200000,
    description: "Iuran sewa lapak kios bulan November",
    is_operational: true
  }
];

export const MOCK_CASHFLOW_DAILY = [
  { date: "07 Nov", income: 1100000, expense: 350000 },
  { date: "08 Nov", income: 850000, expense: 850000 },
  { date: "09 Nov", income: 920000, expense: 75000 },
  { date: "10 Nov", income: 1250000, expense: 200000 },
  { date: "11 Nov", income: 780000, expense: 350000 },
  { date: "12 Nov", income: 980000, expense: 420000 },
  { date: "13 Nov", income: 1450000, expense: 620000 }
];

export const CATEGORIES = {
  income: [
    { value: "sales", label: "Penjualan Produk", is_operational: true },
    { value: "service_income", label: "Pendapatan Jasa", is_operational: true },
    { value: "other_income", label: "Pendapatan Lain-lain", is_operational: false }
  ],
  expense: [
    { value: "raw_materials", label: "Bahan Baku / Stok", is_operational: true },
    { value: "rent", label: "Sewa Tempat", is_operational: true },
    { value: "utilities", label: "Listrik, Air, & Internet", is_operational: true },
    { value: "operational_transport", label: "Transportasi Operasional", is_operational: true },
    { value: "salaries", label: "Gaji / Upah Karyawan", is_operational: true },
    { value: "marketing", label: "Pemasaran & Promosi", is_operational: true },
    { value: "asset_purchase", label: "Pembelian Peralatan / Aset", is_operational: false },
    { value: "loan_principal", label: "Bayar Pokok Pinjaman / Utang", is_operational: false },
    { value: "owner_withdrawal", label: "Prive / Ambil Pribadi", is_operational: false },
    { value: "other_expense", label: "Pengeluaran Lainnya", is_operational: false }
  ]
};
