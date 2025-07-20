"use client"

import { useState } from "react"
import { Search, Users, Plus, UserPlus, Shield, Zap, Signal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Group, User, Chat, MeshStatus } from "@/types/mesh-types"
import GroupChat from "@/components/group-chat"

interface GroupsScreenProps {
  onChatSelect: (chat: Chat) => void
  meshStatus: MeshStatus
  darkMode: boolean
  users: User[]
}

export default function GroupsScreen({ onChatSelect, meshStatus, darkMode, users }: GroupsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString()
  }

  const getActiveParticipants = (group: Group) => {
    return group.participants.filter((participantId) => {
      const user = users.find((u) => u.id === participantId)
      return user?.isOnline
    }).length
  }

  const handleGroupSelect = (group: Group) => {
    const chat: Chat = {
      id: group.id,
      type: "group",
      name: group.name,
      avatar: group.avatar,
      lastMessage: group.lastMessage,
      lastMessageTime: group.lastMessageTime,
      unreadCount: group.unreadCount,
      participants: group.participants,
      isEncrypted: true,
      meshRoute: ["node_1", "node_3", "node_5"],
    }
    onChatSelect(chat)
  }

  return (
    <div className={`h-full flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-green-600"} text-white p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Mesh Groups</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateGroup(true)}
            className="text-white hover:bg-green-700"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>0 active groups</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${darkMode ? "bg-gray-800 border-gray-600 text-white" : ""}`}
          />
        </div>
      </div>

      {/* Create Group Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={() => setShowCreateGroup(true)}
          className={`w-full justify-start gap-3 h-12 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}
        >
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-green-600" />
          </div>
          <span>Create New Mesh Group</span>
        </Button>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 text-center text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No groups yet</p>
          <p className="text-sm mt-1">Create a group to get started</p>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md">
            <GroupChat onBack={() => setShowCreateGroup(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
