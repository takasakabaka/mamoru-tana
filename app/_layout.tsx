import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CalendarDays, Home, List, Settings } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { AppStateProvider, useAppState } from "@/src/app-state";
import { colors } from "@/src/theme";

const icons = {
  index: Home,
  list: List,
  schedule: CalendarDays,
  settings: Settings,
};

const labels = {
  index: "ホーム",
  list: "一覧",
  schedule: "予定",
  settings: "設定",
};

export default function RootLayout() {
  return (
    <AppStateProvider>
      <StatusBar style="dark" />
      <AppTabs />
    </AppStateProvider>
  );
}

function AppTabs() {
  const { isEasyMode } = useAppState();

  return (
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: colors.ink,
          tabBarLabel: labels[route.name as keyof typeof labels],
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarIcon: ({ color, focused }) => {
            const Icon = icons[route.name as keyof typeof icons] ?? Home;
            return (
              <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
                <Icon color={color} size={24} strokeWidth={focused ? 2.8 : 2.25} />
              </View>
            );
          },
        })}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="list" options={{ href: isEasyMode ? null : "/list" }} />
        <Tabs.Screen name="schedule" options={{ href: isEasyMode ? null : "/schedule" }} />
        <Tabs.Screen name="settings" />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.lineStrong,
    minHeight: 72,
    overflow: "hidden",
    paddingBottom: 8,
    paddingTop: 7,
    width: "100%",
  },
  tabItem: {
    flex: 1,
    flexBasis: "25%",
    gap: 3,
    maxWidth: "25%",
    minWidth: 0,
    paddingHorizontal: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 12,
    height: 30,
    justifyContent: "center",
    width: 40,
  },
  iconWrapActive: {
    backgroundColor: colors.blueSoft,
  },
});
