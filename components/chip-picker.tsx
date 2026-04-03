"use client";

interface ChipPickerProps {
  label: string;
  options: readonly string[];
  value: string | null;
  onChange: (val: string | null) => void;
  formatLabel?: (val: string) => string;
}

function defaultFormat(val: string): string {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

export function ChipPicker({
  label,
  options,
  value,
  onChange,
  formatLabel = defaultFormat,
}: ChipPickerProps) {
  const normalized = value?.toLowerCase() ?? null;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.35)] font-bold mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = normalized === opt.toLowerCase();
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(isSelected ? null : opt)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                isSelected
                  ? "bg-[#1a1814] text-white"
                  : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.55)] hover:bg-[rgba(26,24,20,0.08)]"
              }`}
            >
              {formatLabel(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
