import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
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
  lastUpdated: number;
  loading: boolean;
};

export function usePodiscan() {
  const [data, setData] = useState<PodiscanData>({
    suhu: null,
    anomali: false,
    lastUpdated: 0,
    loading: true,
  });

  useEffect(() => {
    const podiscanRef = ref(db, "podiscan");

    const unsubscribe = onValue(podiscanRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) return;

      setData({
        suhu: val.suhu ?? null,
        anomali: val.status?.anomali ?? false,
        lastUpdated: val.status?.last_updated ?? 0,
        loading: false,
      });
    });

    return () => unsubscribe();
  }, []);

  const semprot = async () => {
    await set(ref(db, "podiscan/perintah/semprot"), true);
    setTimeout(async () => {
      await set(ref(db, "podiscan/perintah/semprot"), false);
    }, 3000);
  };

  return { ...data, semprot };
}