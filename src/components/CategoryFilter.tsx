import type { CategorySummary } from "@/lib/types";

interface CategoryFilterProps {
  categories: CategorySummary[];
  selectedCategoryId: string | null;
  onChange: (categoryId: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onChange,
}: CategoryFilterProps) {
  const available = categories.filter((c) => c.isCurrentlyAvailable);

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Filter by category"
    >
      <button
        type="button"
        role="tab"
        aria-selected={selectedCategoryId === null}
        onClick={() => onChange(null)}
        className={chipClass(selectedCategoryId === null)}
      >
        All
      </button>
      {available.map((cat) => (
        <button
          key={cat.id}
          type="button"
          role="tab"
          aria-selected={selectedCategoryId === cat.id}
          onClick={() => onChange(cat.id)}
          className={chipClass(selectedCategoryId === cat.id)}
          title={cat.availabilityLabel}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

function chipClass(active: boolean): string {
  return [
    "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
    active
      ? "bg-emerald-700 text-white"
      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
  ].join(" ");
}
