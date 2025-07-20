"use client"

import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"

export default function GroupsScreen() {
  const { colors } = useTheme()

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Mesh Groups</Text>
      </View>

      {/* Empty State */}
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Groups Yet</Text>
        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
          Create a group to communicate with multiple devices at once
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
})