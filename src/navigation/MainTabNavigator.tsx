"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useMesh } from "../context/MeshContext"

import ChatsScreen from "../screens/main/ChatsScreen"
import GroupsScreen from "../screens/main/GroupsScreen"
import NetworkScreen from "../screens/main/NetworkScreen"
import EmergencyScreen from "../screens/main/EmergencyScreen"
import SettingsScreen from "../screens/settings/SettingsScreen"

const Tab = createBottomTabNavigator()

export default function MainTabNavigator() {
  const { colors, isDark } = useTheme()
  const { meshStatus, chats } = useMesh()

  // Calculate actual unread count from chats
  const unreadCount = chats.reduce((total, chat) => total + chat.unreadCount, 0)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Chats") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline"
          } else if (route.name === "Groups") {
            iconName = focused ? "people" : "people-outline"
          } else if (route.name === "Network") {
            iconName = focused ? "radio" : "radio-outline"
          } else if (route.name === "Emergency") {
            iconName = focused ? "flash" : "flash-outline"
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline"
          } else {
            iconName = "help-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: "#ffffff",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: "white",
            fontSize: 10,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            marginTop: -2,
          },
        }}
      />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen
        name="Network"
        component={NetworkScreen}
        options={{
          tabBarBadge: meshStatus.connectedNodes > 0 ? meshStatus.connectedNodes : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.success,
            color: "white",
            fontSize: 10,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            marginTop: -2,
          },
        }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          tabBarActiveTintColor: meshStatus.emergencyMode ? colors.error : colors.primary,
          tabBarBadge: meshStatus.emergencyMode ? "!" : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.error,
            color: "white",
            fontSize: 10,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            marginTop: -2,
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Tab.Navigator>
  )
}
