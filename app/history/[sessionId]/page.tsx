"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { SuhuData } from "@/hooks/usePodiscan";
import { parseTimestamp } from "@/hooks/useHistory";
import FootHeatmap from "@/components/FootHeatmap";
import TempCard from "@/components/TempCard";

type SesiDetail = {
  timestamp: string;
  date: Date;
  anomali: boolean;
  titikAnomali: string;
  sampleValid: number;
  mft: number;
  suhu: SuhuData;
};

function formatFull(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember",
  ];
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d} ${months[date.getMonth()]} ${date.getFullYear()}, ${h}:${min}`;
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [sesi, setSesi] = useState<SesiDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const sesiRef = ref(db, `podiscan/sesi/${sessionId}`);
    get(sesiRef).then((snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setLoading(false);
        return;
      }
      const ts = val.timestamp ?? sessionId;
      setSesi({
        timestamp: ts,
        date: parseTimestamp(ts),
        anomali: val.anomali ?? false,
        titikAnomali: val.titik_anomali ?? "",
        sampleValid: val.sample_valid ?? 0,
        mft: val.mft ?? 0,
        suhu: val.suhu ?? {
          jempol: 0, metatarsal_1: 0, metatarsal_2: 0,
          metatarsal_3: 0, metatarsal_4: 0, tumit: 0,
        },
      });
      setLoading(false);
    });
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
          <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
          <div className="loading-dot w-2 h-2 rounded-full bg-teal-500" />
        </div>
        <p className="text-sm text-gray-400 font-mono">Memuat detail sesi...</p>
      </main>
    );
  }

  if (!sesi) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[var(--muted)]">Sesi tidak ditemukan.</p>
        <Link href="/history" className="text-sm text-teal-600 hover:underline">
          Kembali ke riwayat
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-3 lg:py-4 flex items-center gap-3">
          <Link
            href="/history"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Kembali ke riwayat"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <span className="text-lg sm:text-xl font-bold tracking-tight">Detail Sesi</span>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-4 sm:py-6 lg:py-8 flex-1">
        {/* Timestamp + Status badge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold font-mono text-[var(--foreground)]">
            {formatFull(sesi.date)}
          </h1>
          {(() => {
            const isAnomali = sesi.anomali || Object.values(sesi.suhu).some(v => v > 35);
            return (
              <span className={`inline-flex items-center self-start text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                isAnomali
                  ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                  : "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
              }`}>
                {isAnomali ? "Anomali" : "Normal"}
              </span>
            );
          })()}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Left: Heatmap */}
          <div className="flex flex-col items-center gap-3 lg:gap-4 lg:w-[360px] shrink-0">
            <p className="text-xs lg:text-sm text-[var(--muted)] self-start tracking-wide uppercase font-medium">
              Peta suhu sesi
            </p>
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5 lg:p-6 flex justify-center w-full max-w-[260px] sm:max-w-none">
              <FootHeatmap suhu={sesi.suhu} />
            </div>
            <div className="flex gap-3 sm:gap-4 flex-wrap justify-center lg:justify-start w-full">
              {[
                { color: "bg-blue-400", label: "<31.5°" },
                { color: "bg-teal-500", label: "31.5–33°" },
                { color: "bg-amber-500", label: "33–35°" },
                { color: "bg-red-500", label: ">35°" },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <span className={`inline-block w-2.5 h-2.5 rounded-sm ${item.color}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Data */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 flex-1 min-w-0">
            {/* 6 TempCards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4">
              <TempCard label="Jempol" value={sesi.suhu.jempol} anomali={(sesi.anomali && sesi.titikAnomali === "jempol") || sesi.suhu.jempol > 35} />
              <TempCard label="Metatarsal 1" value={sesi.suhu.metatarsal_1} anomali={(sesi.anomali && sesi.titikAnomali === "metatarsal_1") || sesi.suhu.metatarsal_1 > 35} />
              <TempCard label="Metatarsal 2" value={sesi.suhu.metatarsal_2} anomali={(sesi.anomali && sesi.titikAnomali === "metatarsal_2") || sesi.suhu.metatarsal_2 > 35} />
              <TempCard label="Metatarsal 3" value={sesi.suhu.metatarsal_3} anomali={(sesi.anomali && sesi.titikAnomali === "metatarsal_3") || sesi.suhu.metatarsal_3 > 35} />
              <TempCard label="Metatarsal 4" value={sesi.suhu.metatarsal_4} anomali={(sesi.anomali && sesi.titikAnomali === "metatarsal_4") || sesi.suhu.metatarsal_4 > 35} />
              <TempCard label="Tumit" value={sesi.suhu.tumit} anomali={(sesi.anomali && sesi.titikAnomali === "tumit") || sesi.suhu.tumit > 35} />
            </div>

            {/* Info row */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 sm:px-5 py-3 sm:py-4">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium mb-2">
                Informasi Pengukuran
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div>
                  <p className="text-xs text-[var(--muted)]">Sample Valid</p>
                  <p className="text-sm font-mono font-semibold text-[var(--foreground)]">{sesi.sampleValid}/20</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Titik Anomali</p>
                  <p className="text-sm font-mono font-semibold text-[var(--foreground)] capitalize">
                    {(() => {
                      const points = Object.entries(sesi.suhu)
                        .filter(([k, v]) => v > 35 || (sesi.anomali && sesi.titikAnomali === k))
                        .map(([k]) => k.replace("_", " "));
                      if (points.length === 6) return "Semua Titik";
                      return points.length > 0 ? points.join(", ") : "—";
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">MFT</p>
                  <p className="text-sm font-mono font-semibold text-[var(--foreground)]">{sesi.mft}°C</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Baseline</p>
                  <p className="text-sm font-mono font-semibold text-[var(--foreground)]">29.0°C</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Threshold</p>
                  <p className="text-sm font-mono font-semibold text-[var(--foreground)]">2.2°C</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="px-4 sm:px-6 lg:px-10 xl:px-16 py-4 border-t border-[var(--card-border)]">
        <p className="text-xs text-center text-[var(--muted)]">
          PodiScan - Kelompok 4 © 2026
        </p>
      </footer>
    </main>
  );
}
