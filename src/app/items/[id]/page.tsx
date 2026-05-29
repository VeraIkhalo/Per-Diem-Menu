import type { Metadata } from "next";
import { ItemDetailView } from "@/components/ItemDetailView";
import { StatusMessage } from "@/components/StatusMessage";
import { getMenuItemDetail } from "@/lib/square/catalog-service";

interface ItemPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locationId?: string; timezone?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: ItemPageProps): Promise<Metadata> {
  const { id } = await params;
  const { locationId, timezone } = await searchParams;
  if (!locationId || !timezone) {
    return { title: "Item" };
  }
  try {
    const item = await getMenuItemDetail(id, locationId, timezone);
    if (item) {
      return { title: `${item.name} — ${item.price.formatted}` };
    }
  } catch {
    // ignore — client will show error state
  }
  return { title: "Item" };
}

export default async function ItemPage({ params, searchParams }: ItemPageProps) {
  const { id } = await params;
  const { locationId, timezone } = await searchParams;

  if (!locationId || !timezone) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <StatusMessage
          variant="info"
          title="Location required"
          message="Open this item from the menu so we know which location you are ordering from."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ItemDetailView itemId={id} locationId={locationId} timezone={timezone} />
    </div>
  );
}
