"use client";

import { useCart } from "@/context/CartContext";

export function CartPanel() {
  const {
    lines,
    itemCount,
    subtotalFormatted,
    isOpen,
    setIsOpen,
    setQuantity,
    removeLine,
    clearCart,
  } = useCart();

  if (!isOpen && itemCount === 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex cursor-pointer items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-800"
        aria-expanded={isOpen}
        aria-controls="cart-panel"
      >
        Cart
        {itemCount > 0 && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="cart-panel"
          className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-96 sm:rounded-2xl"
          role="dialog"
          aria-label="Your cart"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <h2 className="font-semibold text-zinc-900">Your cart</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-800"
            >
              Close
            </button>
          </div>

          {lines.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              Add items from the menu to get started.
            </p>
          ) : (
            <>
              <ul className="max-h-64 overflow-y-auto px-4 py-2">
                {lines.map((line) => (
                  <li
                    key={line.lineId}
                    className="flex items-start justify-between gap-3 border-b border-zinc-50 py-3 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900">{line.name}</p>
                      {line.variationName !== "Regular" && (
                        <p className="text-xs text-zinc-500">
                          {line.variationName}
                        </p>
                      )}
                      <p className="text-sm text-emerald-800">
                        {line.price.formatted}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          setQuantity(line.lineId, line.quantity - 1)
                        }
                        className="h-8 w-8 cursor-pointer rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          setQuantity(line.lineId, line.quantity + 1)
                        }
                        className="h-8 w-8 cursor-pointer rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeLine(line.lineId)}
                        className="ml-1 cursor-pointer text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-4">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Subtotal</span>
                  <span>{subtotalFormatted}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Tax not included.
                </p>
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-3 cursor-pointer text-sm text-zinc-500 hover:text-zinc-800"
                >
                  Clear cart
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-pointer bg-black/20 sm:hidden"
          aria-label="Close cart overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
