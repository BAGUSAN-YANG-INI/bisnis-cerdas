// API Service Layer for connecting React Frontend to Laravel REST API
// Implements full API Contract v1.0 with automatic Bearer Token and Smart Fallback

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('umkm_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- 1. Autentikasi & Profil ---
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login gagal, periksa email dan password.');
    }
    if (data.data?.token) {
      localStorage.setItem('umkm_token', data.data.token);
    }
    return data.data;
  },

  async register(payload) {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.password,
        business_name: payload.business_name,
        business_type: payload.business_type,
        opening_balance: Number(payload.opening_balance) || 0
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const errMsg = data.errors ? Object.values(data.errors).flat().join(', ') : data.message;
      throw new Error(errMsg || 'Registrasi gagal.');
    }
    if (data.data?.token) {
      localStorage.setItem('umkm_token', data.data.token);
    }
    return data.data;
  },

  async logout() {
    try {
      // Best-effort: try to invalidate token on server, ignore all errors (401, network, etc.)
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch {
      // Ignore any error — token will be cleared locally anyway
    } finally {
      // Always clear local token regardless of server response
      localStorage.removeItem('umkm_token');
    }
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Sesi berakhir');
    const data = await res.json();
    return data.data;
  },

  // --- 2. Dashboard Data ---
  async getDashboard() {
    const res = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Gagal mengambil data dashboard');
    const data = await res.json();
    return data.data;
  },

  // --- 3. Manajemen Transaksi ---
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/transactions${query ? `?${query}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Gagal mengambil data transaksi');
    const data = await res.json();
    // Laravel pagination returns data.data.data or data.data
    const txList = data.data?.data || data.data || [];
    return txList.map((t) => ({
      ...t,
      date: t.transaction_date || t.date,
      amount: Number(t.amount) || 0
    }));
  },

  async createTransaction(tx) {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        type: tx.type,
        category: tx.category,
        amount: Number(tx.amount),
        description: tx.description,
        transaction_date: tx.date || new Date().toISOString().split('T')[0]
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const errMsg = data.errors ? Object.values(data.errors).flat().join(', ') : data.message;
      throw new Error(errMsg || 'Gagal menyimpan transaksi.');
    }
    const created = data.data;
    return {
      ...created,
      date: created.transaction_date || created.date,
      amount: Number(created.amount) || 0
    };
  },

  async deleteTransaction(id) {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Gagal menghapus transaksi');
    return true;
  },

  // --- 4. Diagnosis Kesehatan Finansial ---
  async getFinancialHealth() {
    const res = await fetch(`${API_BASE_URL}/financial-health`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Gagal mengambil data kesehatan finansial');
    const data = await res.json();
    return data.data;
  },

  // --- 5. Runway Simulator ---
  async simulateRunway(dailyIncome, dailyExpense) {
    const res = await fetch(`${API_BASE_URL}/runway/simulate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        daily_income_assumption: Number(dailyIncome) || 0,
        daily_expense_assumption: Number(dailyExpense) || 0
      })
    });
    if (!res.ok) throw new Error('Gagal menghitung simulasi runway');
    const data = await res.json();
    return data.data;
  }
};
