export interface LocationSummary {
  id: string;
  name: string;
  timezone: string;
  status: string;
  addressLine?: string;
}

export interface MoneyDisplay {
  amountCents: number;
  currency: string;
  formatted: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  isCurrentlyAvailable: boolean;
  availabilityLabel?: string;
}

export interface MenuItemSummary {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: MoneyDisplay;
  categoryIds: string[];
  isCurrentlyAvailable: boolean;
}

export interface MenuResponse {
  locationId: string;
  timezone: string;
  categories: CategorySummary[];
  items: MenuItemSummary[];
  meta: {
    totalCatalogItems: number;
    visibleAtLocation: number;
  };
}

export interface MenuItemDetail extends MenuItemSummary {
  variationName: string;
  modifierListIds: string[];
}

export interface ApiErrorBody {
  error: string;
  code?: string;
}
