import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { SuhuData } from "@/hooks/usePodiscan";

export type SesiData = {
  id: string;
  timestamp: string;
  date: Date;
  anomali: boolean;
  titikAnomali: string;
  sampleValid: number;
  suhu: SuhuData;
};

export type FilterType = "hari_ini" | "3_hari" | "7_hari" | "1_bulan" | "semua";

function parseTimestamp(ts: string): Date {
  // Format: "2026-06-25_17-01-13"
  const [datePart, timePart] = ts.split("_");
  if (!datePart || !timePart) return new Date(0);
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split("-").map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

export function useHistory(filter: FilterType = "hari_ini") {
  const [sessions, setSessions] = useState<SesiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sesiRef = ref(db, "podiscan/sesi");

    const unsubscribe = onValue(sesiRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setSessions([]);
        setLoading(false);
        return;
      }

      const now = new Date();
      let cutoff: Date | null = null;

      if (filter === "hari_ini") {
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (filter === "3_hari") {
        cutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      } else if (filter === "7_hari") {
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filter === "1_bulan") {
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const list: SesiData[] = Object.entries(val)
        .map(([key, value]) => {
          const v = value as {
            timestamp?: string;
            anomali?: boolean;
            titik_anomali?: string;
            sample_valid?: number;
            suhu?: SuhuData;
          };
          const ts = v.timestamp ?? key;
          const date = parseTimestamp(ts);
          return {
            id: key,
            timestamp: ts,
            date,
            anomali: v.anomali ?? false,
            titikAnomali: v.titik_anomali ?? "",
            sampleValid: v.sample_valid ?? 0,
            suhu: v.suhu ?? {
              jempol: 0,
              metatarsal_1: 0,
              metatarsal_2: 0,
              metatarsal_3: 0,
              metatarsal_4: 0,
              tumit: 0,
            },
          };
        })
        .filter((s) => cutoff === null || s.date >= cutoff)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      setSessions(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  return { sessions, loading };
}

export { parseTimestamp };
