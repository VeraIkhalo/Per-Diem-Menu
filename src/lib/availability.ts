import type { CatalogAvailabilityPeriod } from "square";

const SQUARE_WEEKDAY_TO_JS: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

export interface AvailabilityPeriod {
  dayOfWeek?: string | null;
  startLocalTime?: string | null;
  endLocalTime?: string | null;
}

export function isWithinAvailabilityWindows(
  periods: AvailabilityPeriod[],
  timezone: string,
  now: Date = new Date(),
): boolean {
  if (periods.length === 0) {
    return true;
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const jsDay = new Date(
    now.toLocaleString("en-US", { timeZone: timezone }),
  ).getDay();

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const nowMinutes = hour * 60 + minute;

  for (const period of periods) {
    if (period.dayOfWeek) {
      const expected = SQUARE_WEEKDAY_TO_JS[period.dayOfWeek];
      if (expected !== undefined && expected !== jsDay) {
        continue;
      }
    }

    const start = parseLocalTime(period.startLocalTime);
    const end = parseLocalTime(period.endLocalTime);
    if (start === null || end === null) {
      continue;
    }

    if (isTimeInRange(nowMinutes, start, end)) {
      return true;
    }
  }

  return false;
}

function parseLocalTime(value?: string | null): number | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function isTimeInRange(
  nowMinutes: number,
  startMinutes: number,
  endMinutes: number,
): boolean {
  if (startMinutes === endMinutes) {
    return true;
  }
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

export function toAvailabilityPeriod(
  data: CatalogAvailabilityPeriod,
): AvailabilityPeriod {
  return {
    dayOfWeek: data.dayOfWeek ?? null,
    startLocalTime: data.startLocalTime ?? null,
    endLocalTime: data.endLocalTime ?? null,
  };
}

export function availabilityLabel(periods: AvailabilityPeriod[]): string {
  if (periods.length === 0) return "";
  const first = periods[0];
  const days = first.dayOfWeek ?? "Daily";
  const start = formatTimeLabel(first.startLocalTime);
  const end = formatTimeLabel(first.endLocalTime);
  if (start && end) {
    return `${days} ${start}–${end}`;
  }
  return "Limited hours";
}

function formatTimeLabel(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return "";
  const h = Number(match[1]);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}
