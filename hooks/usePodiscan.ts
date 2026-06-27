import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

export type SuhuData = {
  jempol: number;
  metatarsal_1: number;
  metatarsal_2: number;
  metatarsal_3: number;
  metatarsal_4: number;
  tumit: number;
};

export type PodiscanData = {
  suhu: SuhuData | null;
  anomali: boolean;
  titikAnomali: string;
  sampleValid: number;
  mft: number;
  timestamp: string;
  loading: boolean;
};

export function usePodiscan() {
  const [data, setData] = useState<PodiscanData>({
    suhu: null,
    anomali: false,
    titikAnomali: "",
    sampleValid: 0,
    mft: 0,
    timestamp: "",
    loading: true,
  });

  useEffect(() => {
    const ref_ = ref(db, "podiscan/pengukuran_terakhir");

    const unsubscribe = onValue(ref_, (snapshot) => {
      const val = snapshot.val();
      if (!val) return;

      setData({
        suhu: val.suhu ?? null,
        anomali: val.anomali ?? false,
        titikAnomali: val.titik_anomali ?? "",
        sampleValid: val.sample_valid ?? 0,
        mft: val.mft ?? 0,
        timestamp: val.timestamp ?? "",
        loading: false,
      });
    });

    return () => unsubscribe();
  }, []);

  return { ...data };
}