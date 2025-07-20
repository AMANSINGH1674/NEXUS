"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, Platform } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useTheme } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import type { Group } from "../../types"
import { CreateGroupModal } from "../../components/CreateGroupModal"
import { EmptyGroups } from "../../components/EmptyGroups"
import { Loading } from "../../components/Loading"
import { Error } from "../../components/Error"
import { useGroups } from "../../hooks/useGroups"
import { useUser } from "../../hooks/useUser"

interface GroupsScreenProps {
  onChatSelect: (groupId: string, groupName: string) => void
  meshStatus: boolean
  darkMode: boolean
  users: any[]
}

export default function GroupsScreen({ onChatSelect, meshStatus, darkMode, users }: GroupsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  // Empty groups array instead of mock data
  const mockGroups: Group[] = []

  const filteredGroups = mockGroups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const { colors } = useTheme()
  const { user } = useUser()
  const { groups, loading, error, refetch } = useGroups()

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, []),
  )

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <Error message={error} />
  }

  const renderItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={[styles.groupItem, { backgroundColor: colors.card }]}
      onPress={() => onChatSelect(item.id, item.name)}
    >
      <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={[styles.searchBar, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Search Groups"
          placeholderTextColor={colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.createGroupButton} onPress={() => setShowCreateGroup(true)}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {groups.length === 0 ? (
        <EmptyGroups onPress={() => setShowCreateGroup(true)} />
      ) : (
        <FlatList
          data={groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}

      <CreateGroupModal
        isVisible={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        users={users}
        user={user}
        refetch={refetch}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  groupItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
  },
  createGroupButton: {
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
})
