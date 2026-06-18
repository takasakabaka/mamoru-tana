import { useMemo } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react-native";
import { useAppState } from "./app-state";
import { daysUntil } from "./date";
import { CategoryIcon, Mascot, NoticeBar, Screen } from "./components";
import { colors, radius, shadows } from "./theme";
import type { ShelfItem } from "./types";

export function EasyHome() {
  const { width } = useWindowDimensions();
  const { notice, recallItems, setNotice, soonItems, toggleDone } = useAppState();

  const tasks = useMemo(() => {
    const seen = new Set<string>();
    return [...recallItems, ...soonItems].filter((item) => {
      if (seen.has(item.id) || item.done) return false;
      seen.add(item.id);
      return true;
    });
  }, [recallItems, soonItems]);

  const safetyCount = tasks.filter((item) => item.recallStatus !== "clear").length;
  const stackCounts = width < 360;

  return (
    <Screen contentStyle={styles.screenContent}>
      <NoticeBar message={notice} onClose={() => setNotice("")} />

      <View style={styles.hero}>
        <Mascot />
        <View style={styles.heroCopy}>
          <Text selectable style={styles.eyebrow}>
            かんたんモード
          </Text>
          <Text selectable style={styles.title}>
            きょうやること
          </Text>
        </View>
      </View>

      <View style={[styles.countRow, stackCounts ? styles.countRowStack : null]}>
        <View style={[styles.countCard, styles.countCardOrange]}>
          <Clock3 color={colors.orange} size={28} strokeWidth={2.5} />
          <Text selectable style={styles.countValue}>
            {tasks.length}
          </Text>
          <Text selectable style={styles.countLabel}>
            やること
          </Text>
        </View>
        <View style={[styles.countCard, styles.countCardRed]}>
          <AlertTriangle color={colors.red} size={28} strokeWidth={2.5} />
          <Text selectable style={styles.countValue}>
            {safetyCount}
          </Text>
          <Text selectable style={styles.countLabel}>
            おとなとみる
          </Text>
        </View>
      </View>

      <View style={styles.ruleCard}>
        <Text selectable style={styles.ruleText}>
          あかいカードは おとなの人に みせる
        </Text>
      </View>

      <View style={styles.taskStack}>
        {tasks.length ? (
          tasks.slice(0, 8).map((item) => (
            <EasyTaskCard
              item={item}
              key={item.id}
              onDone={() => toggleDone(item.id)}
              onShowAdult={() => {
                setNotice("おとなの人に みせてね。");
              }}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <CheckCircle2 color={colors.green} size={42} strokeWidth={2.4} />
            <Text selectable style={styles.emptyTitle}>
              きょうは だいじょうぶ
            </Text>
            <Text selectable style={styles.emptyText}>
              やることが あると ここにでます
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

function EasyTaskCard({
  item,
  onDone,
  onShowAdult,
}: {
  item: ShelfItem;
  onDone: () => void;
  onShowAdult: () => void;
}) {
  const needsAdult = item.recallStatus !== "clear";

  return (
    <View style={[styles.taskCard, needsAdult ? styles.taskCardAlert : styles.taskCardNormal]}>
      <View style={styles.taskTop}>
        <CategoryIcon category={item.category} size={28} />
        <View style={styles.taskBody}>
          <Text selectable style={styles.taskName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text selectable style={[styles.taskHint, needsAdult ? styles.taskHintAlert : null]}>
            {needsAdult ? "おとなとみる" : easyDueLabel(item.dueDate)}
          </Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={needsAdult ? onShowAdult : onDone} style={[styles.bigButton, needsAdult ? styles.bigButtonAlert : styles.bigButtonDone]}>
        <Text style={styles.bigButtonText}>{needsAdult ? "みせる" : "できた"}</Text>
      </Pressable>
    </View>
  );
}

function easyDueLabel(dateValue: string) {
  const days = daysUntil(dateValue);
  if (!Number.isFinite(days)) return "ひづけをみる";
  if (days < 0) return `${Math.abs(days)}にちすぎ`;
  if (days === 0) return "きょう";
  if (days === 1) return "あした";
  return `あと${days}にち`;
}

const styles = StyleSheet.create({
  screenContent: {
    gap: 18,
  },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    minHeight: 112,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: colors.blue,
    fontSize: 15,
    fontWeight: "900",
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 38,
  },
  countRow: {
    flexDirection: "row",
    gap: 12,
  },
  countRowStack: {
    flexDirection: "column",
  },
  countCard: {
    ...shadows.card,
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 136,
    justifyContent: "center",
    padding: 16,
  },
  countCardOrange: {
    backgroundColor: colors.orangeSoft,
    borderColor: "#ffdba3",
  },
  countCardRed: {
    backgroundColor: colors.redSoft,
    borderColor: "#ffcdd3",
  },
  countValue: {
    color: colors.ink,
    fontSize: 44,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    letterSpacing: 0,
  },
  countLabel: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "900",
  },
  ruleCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
  },
  ruleText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 26,
    textAlign: "center",
  },
  taskStack: {
    gap: 14,
  },
  taskCard: {
    ...shadows.card,
    borderRadius: radius.xl,
    borderWidth: 2,
    gap: 16,
    padding: 18,
  },
  taskCardNormal: {
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
  },
  taskCardAlert: {
    backgroundColor: colors.redSoft,
    borderColor: "#ffc1c9",
  },
  taskTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  taskBody: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  taskName: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29,
  },
  taskHint: {
    color: colors.orange,
    fontSize: 19,
    fontWeight: "900",
  },
  taskHintAlert: {
    color: colors.red,
  },
  bigButton: {
    alignItems: "center",
    borderRadius: 18,
    minHeight: 62,
    justifyContent: "center",
  },
  bigButtonDone: {
    backgroundColor: colors.green,
  },
  bigButtonAlert: {
    backgroundColor: colors.red,
  },
  bigButtonText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
  },
  emptyCard: {
    ...shadows.card,
    alignItems: "center",
    backgroundColor: colors.greenSoft,
    borderColor: "#c5eddc",
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: 10,
    minHeight: 220,
    justifyContent: "center",
    padding: 22,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
});
