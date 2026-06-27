import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { SuhuData } from "@/hooks/usePodiscan";
import { parseTimestamp } from "@/hooks/useHistory";

export type SesiAnalisis = {
  id: string;
  timestamp: string;
  date: Date;
  anomali: boolean;
  titikAnomali: string;
  sampleValid: number;
  mft: number;
  suhu: SuhuData;
};

export type TitikAnalisis = {
  nama: string;
  frekuensiAnomali: number;
  trendSuhu: number[];
  rataRata: number;
  selisihBaseline: number;
};

export type HasilAnalisis = {
  vonis: "NORMAL" | "PERLU PERHATIAN" | "INDIKASI TINGGI";
  titikTerparah: string;
  frekuensiTertinggi: number;
  rekomendasi: string;
  titikAnalisis: TitikAnalisis[];
};

export function useAnalysis() {
  const [sesi7, setSesi7] = useState<SesiAnalisis[]>([]);
  const [kalibrasiSelesai, setKalibrasiSelesai] = useState<boolean>(false);
  const [sesiKalibrasi, setSesiKalibrasi] = useState<number>(0);
  const [baseline, setBaseline] = useState<SuhuData | null>(null);
  const [analisis, setAnalisis] = useState<HasilAnalisis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rootRef = ref(db, "podiscan");

    const unsubscribe = onValue(rootRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setLoading(false);
        return;
      }

      // Parse kalibrasi
      // Jika node kalibrasi tidak ada di DB, kita asumsikan sudah selesai agar tidak memblokir UI
      const kalibrasi = val.kalibrasi;
      const isKalibrasiSelesai = kalibrasi ? (kalibrasi.selesai ?? false) : true;
      const countKalibrasi = kalibrasi ? (kalibrasi.sesi_count ?? 0) : 0;
      setKalibrasiSelesai(isKalibrasiSelesai);
      setSesiKalibrasi(countKalibrasi);

      // Parse baseline
      // Gunakan default baseline dari prompt awal jika di DB kosong, agar analisis tetap berjalan
      const base = val.baseline ?? {
        jempol: 29.1,
        metatarsal_1: 28.9,
        metatarsal_2: 29.3,
        metatarsal_3: 29.0,
        metatarsal_4: 29.2,
        tumit: 28.8
      };
      setBaseline(base);

      // Parse sesi
      const sesiObj = val.sesi ?? {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listSesi: SesiAnalisis[] = Object.entries(sesiObj)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter(([, v]: [string, any]) => v.mode !== "kalibrasi")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(([key, v]: [string, any]) => {
          const ts = v.timestamp ?? key;
          return {
            id: key,
            timestamp: ts,
            date: parseTimestamp(ts),
            anomali: v.anomali ?? false,
            titikAnomali: v.titik_anomali ?? "",
            sampleValid: v.sample_valid ?? 0,
            mft: v.mft ?? 0,
            suhu: v.suhu ?? { jempol: 0, metatarsal_1: 0, metatarsal_2: 0, metatarsal_3: 0, metatarsal_4: 0, tumit: 0 },
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 7);

      setSesi7(listSesi);

      // Calculate Analysis if we have baseline and listSesi
      if (listSesi.length > 0 && base) {
        const TITIK = ["jempol", "metatarsal_1", "metatarsal_2", "metatarsal_3", "metatarsal_4", "tumit"] as const;
        const titikAnalisis: TitikAnalisis[] = TITIK.map((t) => {
          // Hitung frekuensi anomali per titik dari 7 sesi terakhir
          const frekuensiAnomali = listSesi.filter(s => (s.anomali && s.titikAnomali === t) || s.suhu[t] > 35).length;
          
          // Array suhu berurutan chronologically (terlama ke terbaru) untuk grafik
          const trendSuhu = [...listSesi].reverse().map(s => s.suhu[t]); 
          
          const rataRata = trendSuhu.reduce((acc, curr) => acc + curr, 0) / (trendSuhu.length || 1);
          const selisihBaseline = rataRata - (base[t] ?? 0);

          return {
            nama: t.replace("_", " "),
            frekuensiAnomali,
            trendSuhu,
            rataRata,
            selisihBaseline
          };
        });

        // Cari titik terparah berdasarkan frekuensi anomali tertinggi
        let titikTerparah = "";
        let frekuensiTertinggi = 0;
        titikAnalisis.forEach(t => {
          if (t.frekuensiAnomali > frekuensiTertinggi) {
            frekuensiTertinggi = t.frekuensiAnomali;
            titikTerparah = t.nama;
          }
        });

        let vonis: HasilAnalisis["vonis"] = "NORMAL";
        let rekomendasi = "Kondisi kaki dalam batas normal. Lanjutkan pemantauan rutin harian.";

        if (frekuensiTertinggi >= 3) {
          vonis = "INDIKASI TINGGI";
          rekomendasi = `Terdeteksi pola kenaikan suhu konsisten pada ${titikTerparah} selama ${frekuensiTertinggi} dari 7 hari terakhir. Segera konsultasikan dengan dokter atau tenaga medis.`;
        } else if (frekuensiTertinggi > 0) {
          vonis = "PERLU PERHATIAN";
          rekomendasi = `Terdeteksi kenaikan suhu tidak konsisten pada ${titikTerparah}. Kurangi aktivitas berjalan dan pantau lebih ketat selama 3 hari ke depan.`;
        }

        setAnalisis({
          vonis,
          titikTerparah,
          frekuensiTertinggi,
          rekomendasi,
          titikAnalisis,
        });
      } else {
        setAnalisis(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { sesi7, kalibrasiSelesai, sesiKalibrasi, baseline, analisis, loading };
}
