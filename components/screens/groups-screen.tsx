"use client"

import { useState } from "react"
import { Search, Users, Plus, UserPlus, Shield, Zap, Signal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Group, User, Chat, MeshStatus } from "@/types/mesh-types"

interface GroupsScreenProps {
  onChatSelect: (chat: Chat) => void
  meshStatus: MeshStatus
  darkMode: boolean
  users: User[]
}

// Mock groups data
const mockGroups: Group[] = [
  {
    id: "group_1",
    name: "Emergency Response Team",
    avatar: "/placeholder.svg?height=40&width=40",
    description: "Local emergency coordination",
    participants: ["user_1", "user_2", "user_3"],
    admins: ["user_1"],
    createdAt: new Date(Date.now() - 86400000),
    lastMessage: "Bob: Location shared via mesh",
    lastMessageTime: new Date(Date.now() - 600000),
    unreadCount: 1,
    isActive: true,
    encryptionKey: "encrypted_key_1",
    meshBroadcast: true,
  },
  {
    id: "group_2",
    name: "Neighborhood Watch",
    avatar: "/placeholder.svg?height=40&width=40",
    description: "Community safety updates",
    participants: ["user_1", "user_3"],
    admins: ["user_1"],
    createdAt: new Date(Date.now() - 172800000),
    lastMessage: "All clear on Oak Street",
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 0,
    isActive: true,
    encryptionKey: "encrypted_key_2",
    meshBroadcast: false,
  },
]

export default function GroupsScreen({ onChatSelect, meshStatus, darkMode, users }: GroupsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  const filteredGroups = mockGroups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
            <span>{mockGroups.filter((g) => g.isActive).length} active groups</span>
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
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No groups yet</p>
            <p className="text-sm mt-1">Create a group to start mesh messaging</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleGroupSelect(group)}
              className={`flex items-center p-4 hover:${darkMode ? "bg-gray-800" : "bg-gray-50"} cursor-pointer border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
            >
              <div className="relative">
                <img
                  src={group.avatar || "/placeholder.svg"}
                  alt={group.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Users className="h-3 w-3 text-white" />
                </div>
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"} truncate`}>
                      {group.name}
                    </h3>
                    <Shield className="h-3 w-3 text-green-500" title="Encrypted" />
                    {group.meshBroadcast && <Zap className="h-3 w-3 text-yellow-500" title="Mesh broadcast enabled" />}
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(group.lastMessageTime)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} truncate`}>
                      {group.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Signal className="h-3 w-3" />
                        <span>
                          {getActiveParticipants(group)}/{group.participants.length} online
                        </span>
                      </div>
                      {group.isActive && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span>Active mesh</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {group.unreadCount > 0 && (
                    <Badge className="bg-green-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                      {group.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
