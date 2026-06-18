import { categories } from "./data";
import { isValidDateValue } from "./date";
import type { Category, RecallStatus, ShelfItem } from "./types";

export const maxBackupItems = 1000;
export const maxBackupTextLength = 500_000;

export const itemTextLimits = {
  id: 80,
  name: 80,
  place: 80,
  notes: 500,
  owner: 40,
  createdAt: 40,
} as const;

const categoryIds = new Set<Category>(categories.map((category) => category.id));
const recallStatuses = new Set<RecallStatus>(["clear", "watch", "check"]);

type BackupFile = {
  app: "mamoru-tana";
  version: 1;
  exportedAt: string;
  items: ShelfItem[];
};

function asString(value: unknown, fallback = "", maxLength = 240): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asReminderDays(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 7;
  return Math.max(1, Math.min(3650, Math.floor(numeric)));
}

function asCategory(value: unknown): Category {
  return typeof value === "string" && categoryIds.has(value as Category) ? (value as Category) : "other";
}

function asRecallStatus(value: unknown): RecallStatus {
  return typeof value === "string" && recallStatuses.has(value as RecallStatus) ? (value as RecallStatus) : "clear";
}

export function normalizeShelfItem(value: unknown): ShelfItem | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const name = asString(source.name, "", itemTextLimits.name);
  const dueDate = asString(source.dueDate, "", 10);

  if (!name || !isValidDateValue(dueDate)) {
    return null;
  }

  const id = asString(source.id, "", itemTextLimits.id) || makeLocalId();
  const recallStatus = asRecallStatus(source.recallStatus);

  return {
    id,
    name,
    category: asCategory(source.category),
    place: asString(source.place, "", itemTextLimits.place),
    dueDate,
    reminderDays: asReminderDays(source.reminderDays),
    notes: asString(source.notes, "", itemTextLimits.notes),
    owner: asString(source.owner, "自分", itemTextLimits.owner),
    done: asBoolean(source.done),
    recallWatch: asBoolean(source.recallWatch) || recallStatus !== "clear",
    recallStatus,
    createdAt: asString(source.createdAt, new Date().toISOString(), itemTextLimits.createdAt),
  };
}

export function normalizeItems(value: unknown): ShelfItem[] | null {
  if (!Array.isArray(value)) return null;
  const usedIds = new Set<string>();

  return value
    .slice(0, maxBackupItems)
    .map(normalizeShelfItem)
    .filter((item): item is ShelfItem => item !== null)
    .map((item) => {
      if (!usedIds.has(item.id)) {
        usedIds.add(item.id);
        return item;
      }

      const uniqueId = makeLocalId();
      usedIds.add(uniqueId);
      return { ...item, id: uniqueId };
    });
}

export function buildBackupText(items: ShelfItem[]): string {
  const file: BackupFile = {
    app: "mamoru-tana",
    version: 1,
    exportedAt: new Date().toISOString(),
    items: normalizeItems(items) ?? [],
  };

  return JSON.stringify(file, null, 2);
}

export function parseBackupText(raw: string): ShelfItem[] | null {
  if (raw.length > maxBackupTextLength) return null;

  try {
    const parsed = JSON.parse(raw);
    const candidateItems = Array.isArray(parsed) ? parsed : parsed?.items;
    const items = normalizeItems(candidateItems);
    return items && items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

function csvCell(value: unknown): string {
  const text = escapeSpreadsheetFormula(String(value ?? ""));
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeSpreadsheetFormula(text: string): string {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function makeLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function buildCsvText(items: ShelfItem[]): string {
  const rows = [
    ["名前", "カテゴリ", "場所", "期限", "通知日数", "担当", "状態", "安全チェック", "メモ", "作成日"],
    ...items.map((item) => [
      item.name,
      item.category,
      item.place,
      item.dueDate,
      item.reminderDays,
      item.owner,
      item.done ? "完了" : "未完了",
      item.recallStatus,
      item.notes,
      item.createdAt,
    ]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}
