import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';
import { HealthGauge } from '../components/HealthGauge';

const PillarCard = ({ pillar, weight }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700';
    if (score >= 60) return 'text-emerald-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };
  const getBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-emerald-400';
    if (score >= 40) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {pillar.label}
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold tabular-nums ${getScoreColor(pillar.score)}`}>
              {pillar.value}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Bobot {weight}%
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-slate-500">Skor Komponen</span>
          <div className={`text-xl font-extrabold tabular-nums mt-0.5 ${getScoreColor(pillar.score)}`}>
            {pillar.score}
            <span className="text-sm font-normal text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Score Progress Bar */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getBarColor(pillar.score)}`}
          style={{ width: `${pillar.score}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
        <strong className="text-slate-800">Penjelasan: </strong>
        {pillar.desc}
      </p>
    </div>
  );
};

const RecommendationCard = ({ type, icon: Icon, title, body }) => {
  const styles = {
    warning: "bg-amber-50 border-amber-200/80 text-amber-900",
    success: "bg-emerald-50 border-emerald-200/80 text-emerald-900",
    info: "bg-sky-50 border-sky-200/80 text-sky-900",
    danger: "bg-rose-50 border-rose-200/80 text-rose-900"
  };
  const iconStyles = {
    warning: "text-amber-600",
    success: "text-emerald-600",
    info: "text-sky-600",
    danger: "text-rose-600"
  };
  return (
    <div className={`rounded-lg border p-4 ${styles[type] || styles.info}`}>
      <div className="flex gap-3">
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconStyles[type]}`} />
        <div>
          <p className="text-xs font-bold mb-1">{title}</p>
          <p className="text-xs leading-relaxed opacity-90">{body}</p>
        </div>
      </div>
    </div>
  );
};

export const HealthPage = () => {
  const { metrics, transactions } = useApp();
  const { healthScore, statusLabel, statusBadge, pillars, runway } = metrics;

  // Build dynamic recommendations
  const recommendations = [];
  const oerNum = parseInt(pillars.operatingExpense.value, 10);
  const ccrNum = parseFloat(pillars.cashCoverage.value);
  const marginNum = parseInt(pillars.netMargin.value, 10);

  if (ccrNum < 1.0) {
    recommendations.push({
      type: "danger",
      icon: AlertTriangle,
      title: "Cadangan Kas Sangat Kritis (< 1.0x)",
      body: `Kas Anda hanya menutup kurang dari 1 bulan operasional tanpa pemasukan. Prioritaskan peningkatan omzet atau kurangi pengeluaran tidak wajib segera.`
    });
  } else if (ccrNum < 1.5) {
    recommendations.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Cadangan Kas Perlu Diperkuat",
      body: `Cadangan kas di angka ${pillars.cashCoverage.value} belum mencapai standar aman UMKM (> 1.5x). Pertimbangkan menunda pembelian aset non-esensial.`
    });
  } else {
    recommendations.push({
      type: "success",
      icon: CheckCircle,
      title: "Cadangan Kas Dalam Kondisi Aman",
      body: `Kas Anda mampu menutup ${pillars.cashCoverage.value} biaya operasional bulanan. Pertahankan pola kas masuk yang konsisten.`
    });
  }

  if (oerNum > 75) {
    recommendations.push({
      type: "warning",
      icon: Lightbulb,
      title: "Rasio Beban Operasional Terlalu Tinggi",
      body: `${oerNum}% pendapatan terserap untuk operasional. Tinjau ulang komponen pengeluaran terbesar: bahan baku dan gaji. Negosiasikan harga pemasok grosir.`
    });
  } else if (oerNum > 60) {
    recommendations.push({
      type: "info",
      icon: Info,
      title: "Rasio Operasional Masih Wajar, Bisa Dioptimalkan",
      body: `OpEx Ratio ${oerNum}% masih dalam batas aman namun mendekati zona perhatian (> 65%). Pantau pengeluaran bahan baku dan lembur karyawan secara mingguan.`
    });
  } else {
    recommendations.push({
      type: "success",
      icon: CheckCircle,
      title: "Efisiensi Operasional Sangat Baik",
      body: `Hanya ${oerNum}% pendapatan yang digunakan untuk biaya operasional. Ini memberi ruang surplus yang sehat untuk pertumbuhan atau cadangan darurat.`
    });
  }

  if (marginNum < 0) {
    recommendations.push({
      type: "danger",
      icon: TrendingDown,
      title: "Margin Kas Bersih Negatif (Defisit)",
      body: `Pengeluaran melebihi pemasukan sebesar ${Math.abs(marginNum)}%. Jika berlanjut, akan menguras saldo kas dalam hitungan hari. Evaluasi pricing dan struktur biaya sekarang.`
    });
  } else if (marginNum < 15) {
    recommendations.push({
      type: "warning",
      icon: TrendingUp,
      title: "Margin Kas Bersih Masih Tipis",
      body: `Margin +${marginNum}% belum mencapai target sehat 15-20%. Pertimbangkan menaikkan harga jual 5-10% atau menambah lini produk bernilai lebih tinggi.`
    });
  } else {
    recommendations.push({
      type: "success",
      icon: TrendingUp,
      title: "Margin Kas Bersih Sangat Positif",
      body: `+${marginNum}% dari total pendapatan tersisa sebagai kas bersih. Alokasikan minimal 30% dari sisa ini untuk dana darurat bisnis atau investasi kapasitas produksi.`
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
          Analisis Kesehatan Finansial
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Dihitung dari 3 pilar: Cadangan Kas (35%), Beban Operasional (35%), Margin Arus Kas (30%)
        </p>
      </div>

      {/* Main Health Gauge */}
      <HealthGauge
        score={healthScore}
        statusLabel={statusLabel}
        summary={
          runway.isRunwayInfinite
            ? `Arus kas bersih Anda surplus. Kas mampu menutup ${pillars.cashCoverage.value} biaya operasional bulanan. Fokuslah pada peningkatan margin dan diversifikasi pendapatan.`
            : `Kas tersisa untuk menutup operasional selama sekitar ${runway.runwayDays} hari ke depan jika tidak ada pemasukan. Tingkatkan penjualan dan tekan pengeluaran non-esensial.`
        }
      />

      {/* 3 Pillar Breakdown */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Detail Tiga Pilar Penilaian
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PillarCard pillar={pillars.cashCoverage} weight={35} />
          <PillarCard pillar={pillars.operatingExpense} weight={35} />
          <PillarCard pillar={pillars.netMargin} weight={30} />
        </div>
        <p className="mt-2 text-[11px] text-slate-400 text-right">
          Skor total = (35% × Cadangan) + (35% × OpEx) + (30% × Margin)
        </p>
      </div>

      {/* Runway Detail */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Daya Tahan Kas (Cash Runway Estimate)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="rounded-md bg-slate-50 border border-slate-200/80 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Kas Tersedia</p>
            <p className="text-lg font-extrabold text-slate-900 tabular-nums mt-1">{formatRupiah(metrics.currentCash)}</p>
          </div>
          <div className="rounded-md bg-emerald-50 border border-emerald-200/80 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Rata-rata Masuk/Hari</p>
            <p className="text-lg font-extrabold text-emerald-800 tabular-nums mt-1">{formatRupiah(runway.dailyIncome)}</p>
          </div>
          <div className="rounded-md bg-rose-50 border border-rose-200/80 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Rata-rata Keluar/Hari</p>
            <p className="text-lg font-extrabold text-rose-800 tabular-nums mt-1">{formatRupiah(runway.dailyExpense)}</p>
          </div>
          <div className={`rounded-md border p-3 ${runway.isRunwayInfinite ? "bg-emerald-50 border-emerald-200/80" : "bg-amber-50 border-amber-200/80"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${runway.isRunwayInfinite ? "text-emerald-700" : "text-amber-700"}`}>
              Estimasi Runway
            </p>
            <p className={`text-lg font-extrabold tabular-nums mt-1 ${runway.isRunwayInfinite ? "text-emerald-800" : "text-amber-800"}`}>
              {runway.isRunwayInfinite ? "Aman ✓" : `${runway.runwayDays} Hari`}
            </p>
          </div>
        </div>
        {!runway.isRunwayInfinite && (
          <p className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
            <strong>Asumsi:</strong> Tidak ada pemasukan sama sekali. Kas sebesar {formatRupiah(metrics.currentCash)} dibagi rata-rata pengeluaran harian {formatRupiah(runway.dailyExpense)} = {runway.runwayDays} hari daya tahan.
          </p>
        )}
      </div>

      {/* Actionable Recommendations */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Rekomendasi Tindakan Prioritas
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <RecommendationCard key={i} {...rec} />
          ))}
        </div>
      </div>

      <div className="rounded-md bg-sky-50 border border-sky-200/80 p-4">
        <div className="flex gap-2.5">
          <Info className="h-4 w-4 text-sky-700 mt-0.5 shrink-0" />
          <p className="text-xs text-sky-900 leading-relaxed">
            <strong>Tentang Formula:</strong> Skor dihitung berdasarkan data transaksi yang dicatat. Semakin lengkap data transaksi yang Anda masukkan, semakin akurat diagnosis kesehatan finansial usaha Anda.
          </p>
        </div>
      </div>
    </div>
  );
};
