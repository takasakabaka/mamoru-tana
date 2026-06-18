export type Category = "food" | "warranty" | "document" | "emergency" | "health" | "other";

export type RecallStatus = "clear" | "watch" | "check";

export type ShelfItem = {
  id: string;
  name: string;
  category: Category;
  place: string;
  dueDate: string;
  reminderDays: number;
  notes: string;
  owner: string;
  done: boolean;
  recallWatch: boolean;
  recallStatus: RecallStatus;
  createdAt: string;
};

export type CategoryMeta = {
  id: Category;
  label: string;
  shortLabel: string;
  tone: string;
};
