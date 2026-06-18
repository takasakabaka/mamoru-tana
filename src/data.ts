import type { Category, CategoryMeta, ShelfItem } from "./types";
import { addDays } from "./date";

export const storageKey = "mamoru-tana-items-v1";

export const categories: CategoryMeta[] = [
  { id: "food", label: "食品", shortLabel: "食品", tone: "mint" },
  { id: "warranty", label: "保証", shortLabel: "保証", tone: "blue" },
  { id: "document", label: "書類", shortLabel: "書類", tone: "yellow" },
  { id: "emergency", label: "防災", shortLabel: "防災", tone: "coral" },
  { id: "health", label: "薬・健康", shortLabel: "薬", tone: "green" },
  { id: "other", label: "その他", shortLabel: "他", tone: "gray" },
];

export const categoryMap = new Map<Category, CategoryMeta>(
  categories.map((category) => [category.id, category]),
);

export function createSeedItems(): ShelfItem[] {
  const now = new Date().toISOString();

  return [
    {
      id: "seed-freezer-meal",
      name: "冷凍作り置き",
      category: "food",
      place: "冷凍庫 上段",
      dueDate: addDays(1),
      reminderDays: 2,
      notes: "今夜か明日の昼に使う",
      owner: "家族",
      done: false,
      recallWatch: false,
      recallStatus: "clear",
      createdAt: now,
    },
    {
      id: "seed-emergency-water",
      name: "防災リュックの水",
      category: "emergency",
      place: "玄関収納",
      dueDate: addDays(3),
      reminderDays: 7,
      notes: "交換後は古い水を掃除に使う",
      owner: "自分",
      done: false,
      recallWatch: true,
      recallStatus: "check",
      createdAt: now,
    },
    {
      id: "seed-medicine",
      name: "解熱剤の使用期限",
      category: "health",
      place: "洗面台の引き出し",
      dueDate: addDays(9),
      reminderDays: 14,
      notes: "残量も一緒に確認",
      owner: "家族",
      done: false,
      recallWatch: false,
      recallStatus: "clear",
      createdAt: now,
    },
    {
      id: "seed-helmet",
      name: "子ども用ヘルメット",
      category: "emergency",
      place: "自転車置き場",
      dueDate: addDays(5),
      reminderDays: 14,
      notes: "型番メモあり。安全情報を確認",
      owner: "家族",
      done: false,
      recallWatch: true,
      recallStatus: "watch",
      createdAt: now,
    },
    {
      id: "seed-washer-warranty",
      name: "洗濯機の延長保証",
      category: "warranty",
      place: "保証書ファイル",
      dueDate: addDays(25),
      reminderDays: 30,
      notes: "購入店のレシート写真を追加予定",
      owner: "自分",
      done: false,
      recallWatch: true,
      recallStatus: "clear",
      createdAt: now,
    },
    {
      id: "seed-passport",
      name: "パスポート更新",
      category: "document",
      place: "重要書類ケース",
      dueDate: addDays(48),
      reminderDays: 60,
      notes: "写真と申請日を決める",
      owner: "自分",
      done: false,
      recallWatch: false,
      recallStatus: "clear",
      createdAt: now,
    },
  ];
}
