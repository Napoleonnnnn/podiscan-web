type Props = {
  label: string;
  value: number;
  anomali?: boolean;
};

export default function TempCard({ label, value, anomali = false }: Props) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5 lg:px-5 lg:py-4 transition-all duration-200 hover:shadow-sm ${
        anomali
          ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
          : "bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800"
      }`}
    >
      <p
        className={`text-[10px] sm:text-[11px] lg:text-xs mb-1 lg:mb-1.5 uppercase tracking-wider font-medium ${
          anomali ? "text-red-400" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-lg sm:text-xl lg:text-2xl font-semibold font-mono tabular-nums ${
          anomali ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-100"
        }`}
      >
        {value.toFixed(1)}°C
      </p>
      <p
        className={`text-[9px] sm:text-[10px] lg:text-[11px] mt-1 font-medium ${
          anomali ? "text-red-400" : "text-teal-600 dark:text-teal-400"
        }`}
      >
        {anomali ? "⚠ Anomali" : "✓ Normal"}
      </p>
    </div>
  );
}