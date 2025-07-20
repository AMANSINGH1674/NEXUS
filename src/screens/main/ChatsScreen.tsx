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
  const { meshStatus, chats } = useMesh()
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString()
  }

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.chatItem, { borderBottomColor: colors.border }]}
      onPress={() => navigation.navigate("Chat" as never, { chat: item } as never)}
    >
      <Avatar source={{ uri: item.avatar }} size={48} />

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.chatTitleRow}>
            <Text style={[styles.chatName, { color: colors.text }]}>{item.name}</Text>
            {item.isEncrypted && <Ionicons name="shield-checkmark" size={12} color={colors.success} />}
          </View>
          <View style={styles.chatTimeContainer}>
            <Text style={[styles.chatTime, { color: colors.textSecondary }]}>{formatTime(item.lastMessageTime)}</Text>
          </View>
        </View>

        <View style={styles.chatFooter}>
          <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          <View style={styles.chatMeta}>
            <Text style={[styles.hopsText, { color: colors.textSecondary }]}>{item.meshRoute.length}h</Text>
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

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

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
      />
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
