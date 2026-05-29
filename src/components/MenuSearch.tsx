interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}

export function MenuSearch({
  value,
  onChange,
  resultCount,
  totalCount,
}: MenuSearchProps) {
  return (
    <div className="space-y-1">
      <label htmlFor="menu-search" className="sr-only">
        Search menu
      </label>
      <input
        id="menu-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search items…"
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
        autoComplete="off"
      />
      {value.trim() && (
        <p className="text-xs text-zinc-500" role="status">
          {resultCount} of {totalCount} items match &ldquo;{value.trim()}&rdquo;
        </p>
      )}
    </div>
  );
}
