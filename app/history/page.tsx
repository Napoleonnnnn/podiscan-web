"use client";

import { useState } from "react";
import Link from "next/link";
import { useHistory, FilterType } from "@/hooks/useHistory";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const SENSOR_LINES = [
  { key: "jempol", label: "Jempol", color: "#0d9488" },
  { key: "metatarsal_1", label: "Meta 1", color: "#2563eb" },
  { key: "metatarsal_2", label: "Meta 2", color: "#7c3aed" },
  { key: "metatarsal_3", label: "Meta 3", color: "#d97706" },
  { key: "metatarsal_4", label: "Meta 4", color: "#db2777" },
  { key: "tumit", label: "Tumit", color: "#64748b" },
] as const;

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d} ${months[date.getMonth()]} ${h}:${min}`;
}

function formatFull(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d} ${months[date.getMonth()]} ${date.getFullYear()}, ${h}:${min}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const anomali = payload[0]?.payload?.anomali;
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium mb-1.5 text-[var(--foreground)]">{payload[0]?.payload?.fullName ?? label}</p>
      {payload.map((e: any) => (
        <div key={e.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5" style={{ color: e.color }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
            {e.name}
          </span>
          <span className="font-mono text-[var(--foreground)]">{e.value.toFixed(1)}°C</span>
        </div>
      ))}
      <div className="mt-1.5 pt-1.5 border-t border-[var(--card-border)]">
        <span className={`text-xs font-medium uppercase tracking-wider ${anomali ? "text-red-500" : "text-teal-600 dark:text-teal-400"}`}>
          {anomali ? "Anomali" : "Normal"}
        </span>
      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("hari_ini");
  const { sessions, loading } = useHistory(filter);

  const chartData = [...sessions].reverse().map((s) => ({
    name: formatDate(s.date),
    fullName: formatFull(s.date),
    anomali: s.anomali,
    jempol: s.suhu.jempol,
    metatarsal_1: s.suhu.metatarsal_1,
    metatarsal_2: s.suhu.metatarsal_2,
    metatarsal_3: s.suhu.metatarsal_3,
    metatarsal_4: s.suhu.metatarsal_4,
    tumit: s.suhu.tumit,
  }));

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" aria-label="Kembali">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <span className="text-lg sm:text-xl font-bold tracking-tight">Riwayat Pengukuran</span>
          </div>
          {/* Desktop Filter */}
          <div className="hidden lg:flex rounded-lg border border-[var(--card-border)] overflow-hidden text-sm">
            <button onClick={() => setFilter("hari_ini")} className={`px-5 py-2 font-medium transition-colors ${filter === "hari_ini" ? "bg-teal-600 text-white" : "bg-[var(--card-bg)] text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}>24 Jam</button>
            <button onClick={() => setFilter("3_hari")} className={`px-5 py-2 font-medium transition-colors border-l border-[var(--card-border)] ${filter === "3_hari" ? "bg-teal-600 text-white" : "bg-[var(--card-bg)] text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}>3 Hari</button>
            <button onClick={() => setFilter("7_hari")} className={`px-5 py-2 font-medium transition-colors border-l border-[var(--card-border)] ${filter === "7_hari" ? "bg-teal-600 text-white" : "bg-[var(--card-bg)] text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}>7 Hari</button>
            <button onClick={() => setFilter("1_bulan")} className={`px-5 py-2 font-medium transition-colors border-l border-[var(--card-border)] ${filter === "1_bulan" ? "bg-teal-600 text-white" : "bg-[var(--card-bg)] text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}>1 Bulan</button>
            <button onClick={() => setFilter("semua")} className={`px-5 py-2 font-medium transition-colors border-l border-[var(--card-border)] ${filter === "semua" ? "bg-teal-600 text-white" : "bg-[var(--card-bg)] text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}>Semua</button>
          </div>

          {/* Mobile Filter */}
          <div className="lg:hidden relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="appearance-none bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] text-xs font-medium rounded-lg block w-[110px] sm:w-[140px] pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 cursor-pointer"
            >
              <option value="hari_ini">24 Jam</option>
              <option value="3_hari">3 Hari</option>
              <option value="7_hari">7 Hari</option>
              <option value="1_bulan">1 Bulan</option>
              <option value="semua">Semua Rentang</option>
            </select>
            <svg className="w-4 h-4 text-[var(--muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-4 sm:py-6 lg:py-8 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="flex items-center gap-1.5">
              <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
              <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
              <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
            </div>
            <p className="text-sm text-gray-400 font-mono">Memuat riwayat...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-sm text-[var(--muted)]">Belum ada data sesi.</p>
          </div>
        ) : (
          <>
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5 lg:p-6 mb-6">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium mb-4">Grafik Suhu Sensor</p>
              <div className="w-full h-[280px] sm:h-[340px] lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={{ stroke: "var(--card-border)" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={{ stroke: "var(--card-border)" }} tickLine={false} unit="°" domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    {SENSOR_LINES.map((line) => (
                      <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium mb-3">Daftar Sesi ({sessions.length})</p>
              <div className="flex flex-col gap-2">
                {sessions.map((sesi) => (
                  <Link key={sesi.id} href={`/history/${sesi.id}`} className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-[var(--foreground)]">{formatFull(sesi.date)}</span>
                      <span className="text-xs text-[var(--muted)] font-mono">{sesi.sampleValid}/20 sample valid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${sesi.anomali ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400"}`}>
                        {sesi.anomali ? "Anomali" : "Normal"}
                      </span>
                      <svg className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <footer className="px-4 sm:px-6 lg:px-10 xl:px-16 py-4 border-t border-[var(--card-border)]">
        <p className="text-xs text-center text-[var(--muted)]">
          PodiScan - Kelompok 4 © 2026
        </p>
      </footer>
    </main>
  );
}
