import type { LocationSummary } from "@/lib/types";

interface LocationSwitcherProps {
  locations: LocationSummary[];
  selectedId: string;
  onChange: (locationId: string) => void;
  disabled?: boolean;
}

export function LocationSwitcher({
  locations,
  selectedId,
  onChange,
  disabled,
}: LocationSwitcherProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Pickup location
      </span>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || locations.length === 0}
        className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
            {loc.addressLine ? ` — ${loc.addressLine}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
