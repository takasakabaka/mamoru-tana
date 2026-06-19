import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AlertTriangle, CalendarDays, Clock3 } from "lucide-react-native";
import { useAppState } from "@/src/app-state";
import { addDays, daysUntil, formatShortDate } from "@/src/date";
import { EmptyState, ItemRow, NoticeBar, Screen, SectionHeader, SummaryCard } from "@/src/components";
import { EasyHome } from "@/src/easy-home";
import { colors, radius, shadows } from "@/src/theme";

export default function ScheduleScreen() {
  const { width } = useWindowDimensions();
  const { activeItems, isEasyMode, notice, setNotice, toggleDone } = useAppState();

  const sortedItems = useMemo(
    () => [...activeItems].sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate)),
    [activeItems],
  );

  const overdue = sortedItems.filter((item) => daysUntil(item.dueDate) < 0);
  const threeDays = sortedItems.filter((item) => daysUntil(item.dueDate) >= 0 && daysUntil(item.dueDate) <= 3);
  const twoWeeks = sortedItems.filter((item) => daysUntil(item.dueDate) >= 0 && daysUntil(item.dueDate) <= 14);
  const stackSummary = width < 340;

  const dayRows = Array.from({ length: 14 }, (_, index) => {
    const date = addDays(index);
    return {
      date,
      label: index === 0 ? "今日" : index === 1 ? "明日" : `${index}日後`,
      items: sortedItems.filter((item) => item.dueDate === date),
    };
  });

  if (isEasyMode) {
    return <EasyHome />;
  }

  return (
    <Screen>
      <NoticeBar message={notice} onClose={() => setNotice("")} />

      <View style={styles.header}>
        <Text selectable style={styles.title}>
          予定
        </Text>
        <Text selectable style={styles.subTitle}>
          期限前に小さく片づける
        </Text>
      </View>

      <View style={[styles.summaryGrid, stackSummary ? styles.summaryGridStack : null]}>
        <SummaryCard title="期限超過" count={overdue.length} icon={AlertTriangle} tone="red" />
        <SummaryCard title="3日以内" count={threeDays.length} icon={Clock3} tone="orange" />
        <SummaryCard title="2週間" count={twoWeeks.length} icon={CalendarDays} tone="blue" />
      </View>

      <View style={styles.panel}>
        <SectionHeader title="14日カレンダー" />
        <View style={styles.calendarStack}>
          {dayRows.map((row) => (
            <View key={row.date} style={[styles.dayRow, row.items.length ? styles.dayRowActive : null]}>
              <View style={styles.dayLeft}>
                <Text selectable style={styles.dayLabel}>
                  {row.label}
                </Text>
                <Text selectable style={styles.dayDate}>
                  {formatShortDate(row.date)}
                </Text>
              </View>
              <View style={styles.dayRight}>
                <Text selectable style={[styles.dayCount, row.items.length ? styles.dayCountActive : null]}>
                  {row.items.length}件
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <SectionHeader title="予定リスト" />
        <View style={styles.itemStack}>
          {sortedItems.slice(0, 12).map((item) => (
            <ItemRow key={item.id} item={item} actionLabel="完了" onAction={() => toggleDone(item.id)} />
          ))}
          {!sortedItems.length ? <EmptyState title="未完了の予定はありません" /> : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subTitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
  },
  summaryGridStack: {
    flexDirection: "column",
  },
  panel: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  calendarStack: {
    gap: 8,
  },
  dayRow: {
    alignItems: "center",
    backgroundColor: colors.page,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 14,
  },
  dayRowActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: "#ffd58e",
  },
  dayLeft: {
    flex: 1,
  },
  dayLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  dayDate: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  dayRight: {
    alignItems: "center",
    borderRadius: 999,
    minWidth: 54,
    paddingHorizontal: 8,
  },
  dayCount: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "900",
  },
  dayCountActive: {
    color: "#b96f08",
  },
  itemStack: {
    gap: 10,
  },
});
