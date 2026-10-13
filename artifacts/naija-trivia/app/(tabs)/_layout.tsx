import { MaterialCommunityIcons } from "@expo/vector-icons"; 
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useColors } from "@/hooks/useColors";

function HomeIcon({ color, size }: { color: string; size: number }) { return <Feather name="home" size={size} color={color} />; }
function TrophyIcon({ color, size }: { color: string; size: number }) { return <MaterialCommunityIcons name="trophy-outline" size={size} color={color} />; }
function BoltIcon({ color, size }: { color: string; size: number }) { return <MaterialCommunityIcons name="lightning-bolt" size={size} color={color} />; }
function UserIcon({ color, size }: { color: string; size: number }) { return <Feather name="user" size={size} color={color} />; }
export default function TabsLayout() {
  const colors = useColors(); return (<Tabs screenOptions={{
    headerShown: false, tabBarStyle:
    {
      backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1, height: Platform.OS === "ios" ? 88 : 64,
      paddingBottom: Platform.OS === "ios" ? 28 : 10, paddingTop: 8, elevation: 0,
    },
    tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.mutedForeground, tabBarLabelStyle:
      { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 1, },
  }} >
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: HomeIcon }} />
    <Tabs.Screen name="leaderboard" options={{ title: "Leaderboard", tabBarIcon: TrophyIcon }} />
    <Tabs.Screen name="daily" options={{ title: "Challenges", tabBarIcon: BoltIcon }} />
    <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: UserIcon }} /> </Tabs>);
}