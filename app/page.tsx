"use client";

import { usePodiscan } from "@/hooks/usePodiscan";
import FootHeatmap from "@/components/FootHeatmap";
import TempCard from "@/components/TempCard";
import SprayButton from "@/components/SprayButton";

export default function Home() {
  const { suhu, anomali, lastUpdated, loading, semprot } = usePodiscan();

  const timestamp = lastUpdated
    ? new Date(lastUpdated * 1000).toLocaleTimeString("id-ID")
    : "--:--:--";

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
          <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
          <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
        </div>
        <p className="text-sm text-gray-400 font-mono">Memuat data sensor...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Top accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500" />

      {/* Header — responsive */}
      <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">
              Podi<span className="text-teal-600 dark:text-teal-400">Scan</span>
            </span>
            <span className="hidden xs:inline text-[11px] sm:text-xs text-[var(--muted)] border-l border-[var(--card-border)] pl-3">
              Pasien: Demo
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <div className="status-pulse w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-[10px] sm:text-xs lg:text-sm text-[var(--muted)] hidden sm:inline">
                Terhubung
              </span>
            </div>
            <span className="text-[10px] sm:text-xs lg:text-sm font-mono text-[var(--muted)]">
              {timestamp}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* Left column — Heatmap */}
          <div className="flex flex-col items-center gap-3 lg:gap-4 lg:w-[360px] shrink-0">
            <p className="text-[11px] sm:text-xs lg:text-sm text-[var(--muted)] self-start tracking-wide uppercase font-medium">
              Kaki kanan — peta suhu real-time
            </p>
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 lg:p-6 flex justify-center w-full max-w-[260px] sm:max-w-none">
              <FootHeatmap suhu={suhu} />
            </div>

            {/* Color legend */}
            <div className="flex gap-3 sm:gap-4 flex-wrap justify-center lg:justify-start w-full">
              {[
                { color: "bg-blue-400",  label: "<31.5°" },
                { color: "bg-teal-500",  label: "31.5–33°" },
                { color: "bg-amber-500", label: "33–35°" },
                { color: "bg-red-500",   label: ">35°" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] lg:text-xs text-[var(--muted)]"
                >
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-sm ${item.color}`}
                  />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right column — Data panels */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 flex-1 min-w-0">

            {/* Status banner */}
            <div
              className={`rounded-2xl border px-4 sm:px-5 lg:px-6 py-4 lg:py-5 transition-colors duration-300 ${
                anomali
                  ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                  : "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800"
              }`}
            >
              <p
                className={`text-[10px] sm:text-[11px] lg:text-xs mb-1.5 uppercase tracking-wider font-medium ${
                  anomali ? "text-red-400" : "text-teal-600 dark:text-teal-400"
                }`}
              >
                Status kondisi kaki
              </p>
              <p
                className={`text-lg sm:text-xl lg:text-2xl font-semibold ${
                  anomali ? "text-red-600 dark:text-red-400" : "text-teal-700 dark:text-teal-300"
                }`}
              >
                {anomali ? "⚠ Anomali terdeteksi" : "✓ Normal"}
              </p>
              {anomali && suhu && (
                <p className="text-xs text-red-400 mt-1.5 opacity-80">
                  Metatarsal 1 · {suhu.metatarsal_1}°C
                </p>
              )}
            </div>

            {/* Temperature grid — responsive columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4">
              {suhu && (
                <>
                  <TempCard label="Jempol" value={suhu.jempol} />
                  <TempCard
                    label="Metatarsal 1"
                    value={suhu.metatarsal_1}
                    anomali={anomali && suhu.metatarsal_1 > 35}
                  />
                  <TempCard label="Metatarsal 2" value={suhu.metatarsal_2} />
                  <TempCard label="Metatarsal 3" value={suhu.metatarsal_3} />
                  <TempCard label="Metatarsal 4" value={suhu.metatarsal_4} />
                  <TempCard label="Tumit" value={suhu.tumit} />
                </>
              )}
            </div>

            {/* Spray action button */}
            <SprayButton onSemprot={semprot} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-4 border-t border-[var(--card-border)]">
          <p className="text-[10px] sm:text-xs text-center text-[var(--muted)]">
            PodiScan v0.1 · Sistem monitoring kaki diabetik real-time
          </p>
        </footer>
      </div>
    </main>
  );
}