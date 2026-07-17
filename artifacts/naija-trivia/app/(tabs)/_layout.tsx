import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

const TAB_BG = "#0F1B2D";
const TAB_ACTIVE = "#00B368";
const TAB_INACTIVE = "#8899B4";
const TAB_BORDER = "#1E2F47";

function HomeIcon({ color, size }: { color: string; size: number }) {
  return <Feather name="home" size={size} color={color} />;
}
function TrophyIcon({ color, size }: { color: string; size: number }) {
  return <MaterialCommunityIcons name="trophy-outline" size={size} color={color} />;
}
function BoltIcon({ color, size }: { color: string; size: number }) {
  return <MaterialCommunityIcons name="lightning-bolt" size={size} color={color} />;
}
function UserIcon({ color, size }: { color: string; size: number }) {
  return <Feather name="user" size={size} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopColor: TAB_BORDER,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          marginTop: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: HomeIcon }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{ title: "Leaderboard", tabBarIcon: TrophyIcon }}
      />
      <Tabs.Screen
        name="daily"
        options={{ title: "Challenges", tabBarIcon: BoltIcon }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: UserIcon }}
      />
    </Tabs>
  );
}
