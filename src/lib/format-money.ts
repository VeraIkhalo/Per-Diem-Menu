import type { MoneyDisplay } from "@/lib/types";

export function formatMoney(
  amountCents: number,
  currency = "USD",
): MoneyDisplay {
  const formatted =
    currency === "USD"
      ? `${amountCents}¢`
      : `${amountCents} ${currency} (minor units)`;

  return { amountCents, currency, formatted };
}
