interface StatusMessageProps {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
  variant?: "error" | "empty" | "info";
}

export function StatusMessage({
  title,
  message,
  action,
  variant = "info",
}: StatusMessageProps) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-900",
    empty: "border-amber-200 bg-amber-50 text-amber-950",
    info: "border-zinc-200 bg-zinc-50 text-zinc-900",
  }[variant];

  return (
    <div
      className={`rounded-xl border px-6 py-8 text-center ${styles}`}
      role="status"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm opacity-90">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
