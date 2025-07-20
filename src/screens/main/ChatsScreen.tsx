"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../context/ThemeContext"
import { useMesh } from "../../context/MeshContext"
import Avatar from "../../components/Avatar"

export default function ChatsScreen() {
  const { colors } = useTheme()
  const { meshStatus } = useMesh()
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")

  // Override with empty chats array - no mock users
  const chats = []
  const filteredChats = []

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Mesh Chats</Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: meshStatus.isActive ? "#10b981" : "#ef4444" }]} />
        </View>
      </View>

      {/* Mesh Status */}
      <View style={[styles.meshStatus, { backgroundColor: colors.surface }]}>
        <View style={styles.statusItem}>
          <Ionicons name="radio" size={16} color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {meshStatus.connectedNodes} connected
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="battery-half" size={16} color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {meshStatus.batteryOptimized ? "Optimized" : "Standard"}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search chats..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Empty State */}
      <View style={styles.emptyState}>
        <Ionicons name="chatbubble-ellipses-outline" size={60} color={colors.textSecondary} />
        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Chats Yet</Text>
        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
          Nearby devices will appear here when discovered
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  meshStatus: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 250,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  chatTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  chatTimeContainer: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  chatMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  hopsText: {
    fontSize: 12,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
})