import { Platform } from "react-native";
import { daysUntil, formatShortDate, isValidDateValue, relativeLabel } from "./date";
import { readJson, writeJson } from "./storage";
import type { ShelfItem } from "./types";

type NotificationsModule = typeof import("expo-notifications");

const notificationSettingsKey = "mamoru-tana-due-notifications-v1";
const notificationIdPrefix = "mamoru-tana-due-";
const notificationChannelId = "mamoru-tana-due-reminders";
const maxScheduledNotifications = 64;
const reminderHour = 9;
let notificationsModulePromise: Promise<NotificationsModule> | null = null;
let didSetNotificationHandler = false;

export type DueNotificationState = {
  enabled: boolean;
  permission: "unknown" | "granted" | "denied" | "web" | "error";
  scheduledCount: number;
  nextReminderAt: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
};

export const defaultDueNotificationState: DueNotificationState = {
  enabled: false,
  permission: "unknown",
  scheduledCount: 0,
  nextReminderAt: null,
  lastSyncedAt: null,
  lastError: null,
};

export function readDueNotificationState(): DueNotificationState {
  const stored = readJson<Partial<DueNotificationState> | null>(notificationSettingsKey, null);
  if (!stored || typeof stored !== "object") return defaultDueNotificationState;

  return {
    ...defaultDueNotificationState,
    enabled: stored.enabled === true,
    permission: normalizePermission(stored.permission),
    scheduledCount: asCount(stored.scheduledCount),
    nextReminderAt: typeof stored.nextReminderAt === "string" ? stored.nextReminderAt : null,
    lastSyncedAt: typeof stored.lastSyncedAt === "string" ? stored.lastSyncedAt : null,
    lastError: typeof stored.lastError === "string" ? stored.lastError : null,
  };
}

export function writeDueNotificationState(state: DueNotificationState) {
  writeJson(notificationSettingsKey, state);
}

export async function enableDueNotificationsForItems(items: ShelfItem[]): Promise<DueNotificationState> {
  if (Platform.OS === "web") {
    return {
      ...defaultDueNotificationState,
      permission: "web",
      lastError: "通知はiOS/Androidの実機で有効にできます。",
      lastSyncedAt: new Date().toISOString(),
    };
  }

  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return webNotificationState();

    const granted = await ensureNotificationPermission(Notifications, true);
    if (!granted) {
      await cancelMamoruTanaNotifications(Notifications);
      return {
        ...defaultDueNotificationState,
        permission: "denied",
        lastError: "端末の通知権限が許可されていません。",
        lastSyncedAt: new Date().toISOString(),
      };
    }

    return await scheduleDueNotifications(Notifications, items);
  } catch {
    return {
      ...defaultDueNotificationState,
      permission: "error",
      lastError: "通知の設定に失敗しました。端末の通知設定を確認してください。",
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

export async function syncDueNotificationsForItems(items: ShelfItem[]): Promise<DueNotificationState> {
  if (Platform.OS === "web") {
    return {
      ...defaultDueNotificationState,
      permission: "web",
      lastError: "通知はiOS/Androidの実機で有効にできます。",
      lastSyncedAt: new Date().toISOString(),
    };
  }

  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return webNotificationState();

    const granted = await ensureNotificationPermission(Notifications, false);
    if (!granted) {
      await cancelMamoruTanaNotifications(Notifications);
      return {
        ...defaultDueNotificationState,
        permission: "denied",
        lastError: "端末の通知権限が許可されていません。",
        lastSyncedAt: new Date().toISOString(),
      };
    }

    return await scheduleDueNotifications(Notifications, items);
  } catch {
    return {
      ...defaultDueNotificationState,
      permission: "error",
      lastError: "通知の再設定に失敗しました。",
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

export async function disableDueNotificationsForItems(): Promise<DueNotificationState> {
  const Notifications = await getNotificationsModule();
  if (Notifications) {
    await cancelMamoruTanaNotifications(Notifications);
  }

  return {
    ...defaultDueNotificationState,
    permission: Platform.OS === "web" ? "web" : "unknown",
    lastSyncedAt: new Date().toISOString(),
  };
}

export function formatNotificationStatus(state: DueNotificationState): string {
  if (Platform.OS === "web") return "通知はiOS/Androidの実機で使えます。";
  if (!state.enabled) return "オフ。必要なときにここから有効にできます。";
  if (state.scheduledCount === 0) return "オン。通知予定のアイテムはまだありません。";
  return `オン。${state.scheduledCount}件を予約中${state.nextReminderAt ? `（次回 ${formatNotificationDateTime(state.nextReminderAt)}）` : ""}。`;
}

function normalizePermission(value: unknown): DueNotificationState["permission"] {
  return value === "granted" || value === "denied" || value === "web" || value === "error" ? value : "unknown";
}

function asCount(value: unknown): number {
  const count = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.min(maxScheduledNotifications, Math.floor(count)));
}

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (Platform.OS === "web") return null;

  notificationsModulePromise ??= import("expo-notifications");
  const Notifications = await notificationsModulePromise;
  if (!didSetNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    didSetNotificationHandler = true;
  }

  return Notifications;
}

function webNotificationState(): DueNotificationState {
  return {
    ...defaultDueNotificationState,
    permission: "web",
    lastError: "通知はiOS/Androidの実機で有効にできます。",
    lastSyncedAt: new Date().toISOString(),
  };
}

async function ensureNotificationPermission(Notifications: NotificationsModule, shouldRequest: boolean): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!shouldRequest) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function scheduleDueNotifications(Notifications: NotificationsModule, items: ShelfItem[]): Promise<DueNotificationState> {
  await ensureAndroidChannel(Notifications);
  await cancelMamoruTanaNotifications(Notifications);

  const now = new Date();
  const scheduledItems = items
    .filter((item) => !item.done && isValidDateValue(item.dueDate))
    .map((item) => ({ item, triggerAt: getReminderDate(item, now) }))
    .filter((entry): entry is { item: ShelfItem; triggerAt: Date } => entry.triggerAt !== null)
    .sort((a, b) => a.triggerAt.getTime() - b.triggerAt.getTime())
    .slice(0, maxScheduledNotifications);

  for (const entry of scheduledItems) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${notificationIdPrefix}${entry.item.id}`,
      content: {
        title: "期限が近いものがあります",
        body: `${entry.item.name}は${relativeLabel(entry.item.dueDate)}です。確認しましょう。`,
        data: { itemId: entry.item.id, source: "mamoru-tana" },
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: entry.triggerAt,
        channelId: notificationChannelId,
      },
    });
  }

  return {
    enabled: true,
    permission: "granted",
    scheduledCount: scheduledItems.length,
    nextReminderAt: scheduledItems[0]?.triggerAt.toISOString() ?? null,
    lastSyncedAt: new Date().toISOString(),
    lastError: null,
  };
}

async function ensureAndroidChannel(Notifications: NotificationsModule) {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(notificationChannelId, {
    name: "期限のお知らせ",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
}

async function cancelMamoruTanaNotifications(Notifications: NotificationsModule) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => request.identifier.startsWith(notificationIdPrefix) || request.content.data?.source === "mamoru-tana")
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );
}

function getReminderDate(item: ShelfItem, now: Date): Date | null {
  const dueDate = new Date(`${item.dueDate}T00:00:00`);
  dueDate.setHours(reminderHour, 0, 0, 0);

  const dueEnd = new Date(dueDate);
  dueEnd.setHours(23, 59, 0, 0);
  if (dueEnd.getTime() <= now.getTime()) return null;

  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - item.reminderDays);
  reminderDate.setHours(reminderHour, 0, 0, 0);

  if (reminderDate.getTime() > now.getTime() + 60 * 1000) {
    return reminderDate;
  }

  const nextMorning = new Date(now);
  nextMorning.setDate(nextMorning.getDate() + 1);
  nextMorning.setHours(reminderHour, 0, 0, 0);

  return nextMorning.getTime() <= dueEnd.getTime() ? nextMorning : null;
}

function formatNotificationDateTime(isoValue: string): string {
  const date = new Date(isoValue);
  if (!Number.isFinite(date.getTime())) return "未定";

  return `${formatShortDate(date.toISOString().slice(0, 10))} 9:00`;
}
