import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

function TabIcon({
  name,
  iconType = "feather",
  color,
  focused,
  size = 22,
}: {
  name: string;
  iconType?: "feather" | "mci";
  color: string;
  focused: boolean;
  size?: number;
}) {
  const colors = useColors();
  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: colors.primaryLight }]}>
      {iconType === "mci" ? (
        <MaterialCommunityIcons name={name as any} size={size} color={color} />
      ) : (
        <Feather name={name as any} size={size} color={color} />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="trophy-outline"
              iconType="mci"
              color={color}
              focused={focused}
              size={23}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="lightning-bolt"
              iconType="mci"
              color={color}
              focused={focused}
              size={23}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
