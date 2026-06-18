const dayMs = 24 * 60 * 60 * 1000;
const dateValuePattern = /^\d{4}-\d{2}-\d{2}$/;

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function addDays(days: number, base = startOfToday()): string {
  return toDateInputValue(new Date(base.getTime() + days * dayMs));
}

export function isValidDateValue(dateValue: string): boolean {
  if (!dateValuePattern.test(dateValue)) return false;
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isFinite(date.getTime()) && toDateInputValue(date) === dateValue;
}

function parseDateValue(dateValue: string): Date | null {
  if (!isValidDateValue(dateValue)) return null;
  return new Date(`${dateValue}T00:00:00`);
}

export function daysUntil(dateValue: string): number {
  const today = startOfToday();
  const target = parseDateValue(dateValue);
  if (!target) return Number.POSITIVE_INFINITY;
  return Math.round((target.getTime() - today.getTime()) / dayMs);
}

export function formatShortDate(dateValue: string): string {
  const date = parseDateValue(dateValue);
  if (!date) return "日付確認";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export function relativeLabel(dateValue: string): string {
  const days = daysUntil(dateValue);
  if (!Number.isFinite(days)) return "日付確認";
  if (days < 0) return `${Math.abs(days)}日超過`;
  if (days === 0) return "今日";
  if (days === 1) return "明日";
  return `あと${days}日`;
}
