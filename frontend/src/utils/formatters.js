// Utilities & Mathematical Logic strictly following Panduan_Logika_Matematika_UMKM_Financial_Health.md

export const formatRupiah = (number) => {
  if (number === undefined || number === null || isNaN(number)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number).replace(/\s/g, " ");
};

export const formatNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) return "0";
  return new Intl.NumberFormat("id-ID").format(number);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const calculateHealthMetrics = (transactions, initialCash = 10000000) => {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalOpEx = 0;

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === "income") {
      totalIncome += amt;
    } else if (tx.type === "expense") {
      totalExpense += amt;
      if (tx.is_operational) {
        totalOpEx += amt;
      }
    }
  });

  const currentCash = initialCash + totalIncome - totalExpense;
  const netCashFlow = totalIncome - totalExpense;

  // Monthly OpEx (assumed over 30 days window)
  const monthlyOpEx = totalOpEx > 0 ? totalOpEx : 1;
  const ccr = monthlyOpEx > 0 ? (currentCash / monthlyOpEx) : 3;

  let ccrScore = 20;
  if (ccr >= 2.0) ccrScore = 100;
  else if (ccr >= 1.5) ccrScore = 80;
  else if (ccr >= 1.0) ccrScore = 60;
  else if (ccr >= 0.5) ccrScore = 40;

  const oer = totalIncome > 0 ? (totalOpEx / totalIncome) : 1;
  let oerScore = 20;
  if (oer <= 0.60) oerScore = 100;
  else if (oer <= 0.75) oerScore = 80;
  else if (oer <= 0.85) oerScore = 60;
  else if (oer <= 1.00) oerScore = 40;

  const ncfm = totalIncome > 0 ? (netCashFlow / totalIncome) : 0;
  let ncfmScore = 20;
  if (ncfm >= 0.20) ncfmScore = 100;
  else if (ncfm >= 0.10) ncfmScore = 80;
  else if (ncfm >= 0.00) ncfmScore = 60;
  else if (ncfm >= -0.15) ncfmScore = 40;

  const healthScore = Math.min(100, Math.max(0, Math.round(
    0.35 * ccrScore + 0.35 * oerScore + 0.30 * ncfmScore
  )));

  let statusLabel = "Kondisi Sehat";
  let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (healthScore >= 80) {
    statusLabel = "Kondisi Prima";
    statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (healthScore >= 60) {
    statusLabel = "Kondisi Sehat";
    statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (healthScore >= 40) {
    statusLabel = "Perlu Perhatian / Waspada";
    statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
  } else {
    statusLabel = "Kondisi Kritis";
    statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
  }

  // Daily averages for runway
  const dailyIncome = Math.round(totalIncome / 30);
  const dailyExpense = Math.round(totalExpense / 30);
  const dailyNetBurn = dailyExpense - dailyIncome;
  let runwayDays = 999;
  let isRunwayInfinite = true;

  if (dailyNetBurn > 0) {
    isRunwayInfinite = false;
    runwayDays = Math.max(0, Math.floor(currentCash / dailyNetBurn));
  }

  return {
    currentCash,
    totalIncome,
    totalExpense,
    netCashFlow,
    totalOpEx,
    healthScore,
    statusLabel,
    statusBadge,
    pillars: {
      cashCoverage: {
        value: `${ccr.toFixed(1)}x`,
        score: ccrScore,
        label: "Cadangan Kas (Cash Coverage)",
        desc: "Berapa bulan kas mampu menutupi biaya operasional tanpa pemasukan. Standar aman: > 1.5x."
      },
      operatingExpense: {
        value: `${Math.round(oer * 100)}%`,
        score: oerScore,
        label: "Rasio Beban Operasional (OpEx Ratio)",
        desc: "Persentase pemasukan yang terserap untuk biaya rutin operasional. Ideal: < 65%."
      },
      netMargin: {
        value: `${ncfm >= 0 ? "+" : ""}${Math.round(ncfm * 100)}%`,
        score: ncfmScore,
        label: "Margin Arus Kas Bersih (Net Margin)",
        desc: "Sisa kas bersih dari seluruh pendapatan setelah operasional. Target sehat: > 15%."
      }
    },
    runway: {
      dailyIncome,
      dailyExpense,
      dailyNetBurn,
      runwayDays,
      isRunwayInfinite
    }
  };
};
