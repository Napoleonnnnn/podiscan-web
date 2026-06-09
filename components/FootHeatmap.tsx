"use client";

import { useEffect, useRef } from "react";
import { SuhuData } from "@/hooks/usePodiscan";

type Props = {
  suhu: SuhuData | null;
};

const SENSOR_POINTS = [
  { key: "jempol",       x: 65,  y: 88  },
  { key: "metatarsal_1", x: 72,  y: 116 },
  { key: "metatarsal_2", x: 93,  y: 122 },
  { key: "metatarsal_3", x: 111, y: 127 },
  { key: "metatarsal_4", x: 127, y: 132 },
  { key: "tumit",        x: 100, y: 295 },
] as const;

function getColor(temp: number): string {
  if (temp > 35)   return "#E24B4A";
  if (temp > 33)   return "#EF9F27";
  if (temp > 31.5) return "#1D9E75";
  return "#378ADD";
}

function getTempAt(
  px: number,
  py: number,
  points: { x: number; y: number; temp: number }[]
): number {
  let weightedSum = 0;
  let weightTotal = 0;

  for (const p of points) {
    const dist = Math.sqrt((px - p.x) ** 2 + (py - p.y) ** 2);
    const weight = dist < 1 ? 1e6 : 1 / (dist ** 2);
    weightedSum += weight * p.temp;
    weightTotal += weight;
  }

  return weightedSum / weightTotal;
}

export default function FootHeatmap({ suhu }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !suhu) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = SENSOR_POINTS.map((p) => ({
      x: p.x,
      y: p.y,
      temp: suhu[p.key],
    }));

    const { width, height } = canvas;
    const imageData = ctx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const temp = getTempAt(x, y, points);
        const color = hexToRgb(getColor(temp));
        const idx = (y * width + x) * 4;
        imageData.data[idx]     = color.r;
        imageData.data[idx + 1] = color.g;
        imageData.data[idx + 2] = color.b;
        imageData.data[idx + 3] = 180;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    for (const p of SENSOR_POINTS) {
      const temp = suhu[p.key];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = getColor(temp);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.font = "9px monospace";
      ctx.fillStyle = "#444";
      ctx.fillText(`${temp.toFixed(1)}°`, p.x + 12, p.y + 4);
    }
  }, [suhu]);

  return (
    <div className="heatmap-container mx-auto sm:mx-0">
      <svg
        viewBox="0 0 200 340"
        className="absolute inset-0 w-full h-full"
      >
        <ellipse cx="100" cy="200" rx="68" ry="120" fill="#f5f4f0" stroke="#ddd" strokeWidth="1.5" />
        <ellipse cx="65"  cy="72"  rx="22" ry="26"  fill="#f5f4f0" stroke="#ddd" strokeWidth="1.5" />
        <circle  cx="88"  cy="70"  r="12"            fill="#f5f4f0" stroke="#ddd" strokeWidth="1.5" />
        <circle  cx="108" cy="68"  r="11"            fill="#f5f4f0" stroke="#ddd" strokeWidth="1.5" />
        <circle  cx="126" cy="72"  r="10"            fill="#f5f4f0" stroke="#ddd" strokeWidth="1.5" />
        <circle  cx="140" cy="79"  r="9"             fill="#f5f4f0" stroke="#ddd" strokeWidth="1.5" />
      </svg>
      <canvas
        ref={canvasRef}
        width={200}
        height={340}
        className="absolute inset-0 w-full h-full mix-blend-multiply"
      />
    </div>
  );
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
