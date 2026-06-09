"use client";

import { useState } from "react";

type Props = {
  onSemprot: () => Promise<void>;
};

export default function SprayButton({ onSemprot }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const handleClick = async () => {
    if (status !== "idle") return;
    setStatus("loading");
    await onSemprot();
    setStatus("sent");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={status !== "idle"}
      className={`w-full py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] ${
        status === "idle"
          ? "bg-teal-700 text-teal-50 hover:bg-teal-800 shadow-md shadow-teal-900/20 hover:shadow-lg hover:shadow-teal-900/30"
          : status === "loading"
          ? "bg-teal-900 text-teal-400 cursor-not-allowed"
          : "bg-teal-800 text-teal-300 cursor-not-allowed"
      }`}
    >
      {status === "idle" && (
        <>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Semprot Pelembab
        </>
      )}
      {status === "loading" && (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Mengirim...
        </>
      )}
      {status === "sent" && "Terkirim ✓"}
    </button>
  );
}