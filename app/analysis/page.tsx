"use client";

import Link from "next/link";
import { useAnalysis } from "@/hooks/useAnalysis";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const SENSOR_LINES = [
  { key: "jempol", label: "Jempol", color: "#0d9488" },
  { key: "metatarsal_1", label: "Meta 1", color: "#2563eb" },
  { key: "metatarsal_2", label: "Meta 2", color: "#7c3aed" },
  { key: "metatarsal_3", label: "Meta 3", color: "#d97706" },
  { key: "metatarsal_4", label: "Meta 4", color: "#db2777" },
  { key: "tumit", label: "Tumit", color: "#64748b" },
] as const;

function formatDateShort(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d} ${months[date.getMonth()]} ${h}:${min}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg text-xs min-w-[200px]">
      <p className="font-medium mb-2 text-[var(--foreground)] border-b border-[var(--card-border)] pb-1">{label}</p>
      
      <div className="mb-2">
        <span className="text-[var(--muted)]">MFT: </span>
        <span className="font-mono text-[var(--foreground)] font-semibold">{data.mft.toFixed(1)}°C</span>
      </div>

      <div className="flex flex-col gap-1 mb-2">
        {payload.map((e: any) => (
          <div key={e.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: e.color }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
              {e.name}
            </span>
            <span className="font-mono text-[var(--foreground)]">{e.value.toFixed(1)}°C</span>
          </div>
        ))}
      </div>

      <div className="mt-1.5 pt-1.5 border-t border-[var(--card-border)]">
        <span className={`text-xs font-semibold uppercase tracking-wider ${data.anomali ? "text-red-500" : "text-teal-600 dark:text-teal-400"}`}>
          Status: {data.anomali ? "Anomali" : "Normal"}
        </span>
      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function AnalysisPage() {
  const { sesi7, kalibrasiSelesai, sesiKalibrasi, baseline, analisis, loading } = useAnalysis();

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
          <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
          <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
        </div>
        <p className="text-sm text-gray-400 font-mono">Memuat analisis...</p>
      </main>
    );
  }

  // STATE 1: Kalibrasi Belum Selesai
  if (!kalibrasiSelesai) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
            Sistem Sedang Kalibrasi
          </h1>
          <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
            Sistem membutuhkan 7 pengukuran awal untuk menentukan baseline suhu normal kaki Anda. Lakukan pengukuran rutin setiap pagi.
          </p>
          
          <div className="mb-6">
            <div className="flex justify-between text-xs font-medium text-[var(--foreground)] mb-1.5">
              <span>Progress Kalibrasi</span>
              <span>{sesiKalibrasi} / 7 Sesi</span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 transition-all duration-500 ease-out" 
                style={{ width: `${Math.min(100, (sesiKalibrasi / 7) * 100)}%` }}
              />
            </div>
          </div>

          <Link href="/" className="inline-flex w-full justify-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  // STATE 2 & 3: Ada data deteksi (kurang dari 7 atau 7+)
  const chartData = [...sesi7].reverse().map(s => ({
    name: formatDateShort(s.date),
    mft: s.mft,
    anomali: s.anomali,
    jempol: s.suhu.jempol,
    metatarsal_1: s.suhu.metatarsal_1,
    metatarsal_2: s.suhu.metatarsal_2,
    metatarsal_3: s.suhu.metatarsal_3,
    metatarsal_4: s.suhu.metatarsal_4,
    tumit: s.suhu.tumit,
  }));

  const isInsufficientData = sesi7.length < 7;

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-3 lg:py-4 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Kembali ke Beranda"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold tracking-tight leading-tight">Analisis Tren 7 Hari</span>
            <span className="text-xs text-[var(--muted)]">Berdasarkan {sesi7.length} sesi pengukuran terakhir</span>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-4 sm:py-6 lg:py-8 flex-1 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Warning Kurang Data */}
        {isInsufficientData && (
          <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Data Belum Lengkap</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Analisis membutuhkan minimal 7 sesi deteksi untuk memberikan vonis. Saat ini baru tersedia {sesi7.length} sesi.
                Grafik di bawah ini menampilkan data yang sudah ada.
              </p>
            </div>
          </div>
        )}

        {/* Vonis Card (Tampilkan meski data kurang dari 7 untuk keperluan demo) */}
        {analisis && (
          <div className={`rounded-2xl border p-5 sm:p-6 lg:p-8 ${
            analisis.vonis === "NORMAL" 
              ? "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800"
              : analisis.vonis === "PERLU PERHATIAN"
                ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 ${
                  analisis.vonis === "NORMAL" ? "text-teal-600 dark:text-teal-400"
                  : analisis.vonis === "PERLU PERHATIAN" ? "text-amber-600 dark:text-amber-500"
                  : "text-red-600 dark:text-red-400"
                }`}>Vonis Kondisi Kaki</p>
                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 ${
                  analisis.vonis === "NORMAL" ? "text-teal-800 dark:text-teal-300"
                  : analisis.vonis === "PERLU PERHATIAN" ? "text-amber-800 dark:text-amber-400"
                  : "text-red-800 dark:text-red-400"
                }`}>
                  {analisis.vonis}
                </h2>
                <p className={`text-sm sm:text-base max-w-2xl leading-relaxed ${
                  analisis.vonis === "NORMAL" ? "text-teal-700 dark:text-teal-300/80"
                  : analisis.vonis === "PERLU PERHATIAN" ? "text-amber-800 dark:text-amber-300/80"
                  : "text-red-800 dark:text-red-300/80"
                }`}>
                  {analisis.rekomendasi}
                </p>
              </div>
              
              {analisis.vonis !== "NORMAL" && (
                <div className={`shrink-0 rounded-xl px-4 py-3 border ${
                  analisis.vonis === "PERLU PERHATIAN" 
                    ? "bg-amber-100/50 border-amber-200/60 dark:bg-amber-900/40 dark:border-amber-800/60"
                    : "bg-red-100/50 border-red-200/60 dark:bg-red-900/40 dark:border-red-800/60"
                }`}>
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70 mb-1">Titik Terparah</p>
                  <p className="text-base font-bold capitalize mb-1">{analisis.titikTerparah}</p>
                  <p className="text-xs font-mono font-medium">Anomali: {analisis.frekuensiTertinggi}/7 sesi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grafik Tren */}
        {chartData.length > 0 && (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Grafik Tren Suhu</h3>
            </div>
            <div className="w-full h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={{ stroke: "var(--card-border)" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={{ stroke: "var(--card-border)" }} tickLine={false} unit="°" domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                  {SENSOR_LINES.map((line) => (
                    <Line 
                      key={line.key} 
                      type="monotone" 
                      dataKey={line.key} 
                      name={line.label} 
                      stroke={line.color} 
                      strokeWidth={2} 
                      dot={{ r: 3, strokeWidth: 1 }} 
                      activeDot={{ r: 5, strokeWidth: 0 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Grid Analisis per Titik */}
        {analisis && (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-[var(--card-border)]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Rincian Per Titik Sensor</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x lg:divide-y divide-[var(--card-border)]">
              {/* Gunakan class grid ini dengan cermat agar rapi. 
                  Karena ada 6 titik, di MD akan 2 kolom (3 baris), di LG 3 kolom (2 baris). */}
              {analisis.titikAnalisis.map((titik, idx) => {
                const frekuensi = titik.frekuensiAnomali;
                const statusColor = frekuensi >= 3 ? "text-red-500 bg-red-50 dark:bg-red-950/30" 
                                  : frekuensi > 0 ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30" 
                                  : "text-teal-600 bg-teal-50 dark:bg-teal-950/30";
                
                return (
                  <div key={titik.nama} className={`p-4 sm:p-5 flex flex-col gap-3 ${idx < 3 && 'lg:border-b'} border-[var(--card-border)]`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold capitalize text-[var(--foreground)]">{titik.nama}</span>
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                        Anomali: {frekuensi}/7
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[var(--muted)] mb-1">Rata-rata (7 Sesi)</p>
                        <p className="text-sm font-mono font-medium text-[var(--foreground)]">{titik.rataRata.toFixed(1)}°C</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)] mb-1">Selisih Baseline</p>
                        <p className={`text-sm font-mono font-medium ${titik.selisihBaseline > 0 ? 'text-red-500' : titik.selisihBaseline < 0 ? 'text-blue-500' : 'text-teal-500'}`}>
                          {titik.selisihBaseline > 0 ? '+' : ''}{titik.selisihBaseline.toFixed(1)}°C
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Baseline */}
        {baseline && (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Referensi Baseline</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              {Object.entries(baseline).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="text-[var(--muted)] capitalize">{k.replace("_", " ")}:</span>
                  <span className="font-mono font-medium text-[var(--foreground)]">{v.toFixed(1)}°C</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center pb-8 pt-4">
          <Link
            href="/history"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-sm font-medium text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Lihat Semua Riwayat
          </Link>
        </div>

      </div>
    </main>
  );
}
