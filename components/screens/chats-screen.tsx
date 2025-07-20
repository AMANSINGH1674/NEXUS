"use client"

import { useState } from "react"
import { Search, MessageCircle, Battery, Signal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Chat, User, MeshStatus } from "@/types/mesh-types"

interface ChatsScreenProps {
  onChatSelect: (chat: Chat) => void
  meshStatus: MeshStatus
  darkMode: boolean
  users: User[]
}

// Mock chats data
const mockChats: Chat[] = [
  {
    id: "chat_1",
    type: "private",
    name: "Alice Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Message delivered via 2 hops",
    lastMessageTime: new Date(Date.now() - 300000),
    unreadCount: 2,
    participants: ["user_1"],
    isEncrypted: true,
    meshRoute: ["node_1", "node_2"],
  },
  {
    id: "chat_2",
    type: "group",
    name: "Emergency Response",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Bob: Location shared",
    lastMessageTime: new Date(Date.now() - 600000),
    unreadCount: 1,
    participants: ["user_1", "user_2", "user_3"],
    isEncrypted: true,
    meshRoute: ["node_1", "node_3", "node_5"],
  },
  {
    id: "chat_3",
    type: "private",
    name: "Carol Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for the help!",
    lastMessageTime: new Date(Date.now() - 1800000),
    unreadCount: 0,
    participants: ["user_3"],
    isEncrypted: true,
    meshRoute: ["node_1", "node_4"],
  },
]

export default function ChatsScreen({ onChatSelect, meshStatus, darkMode, users }: ChatsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = mockChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString()
  }

  const getSignalBars = (hops: number) => {
    const strength = Math.max(1, 5 - hops)
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-1 h-3 rounded-full ${i < strength ? "bg-green-500" : darkMode ? "bg-gray-600" : "bg-gray-300"}`}
      />
    ))
  }

  return (
    <div className={`h-full flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-green-600"} text-white p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Mesh Chats</h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${meshStatus.isActive ? "bg-green-400" : "bg-red-400"} animate-pulse`}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Signal className="h-4 w-4" />
            <span>{meshStatus.connectedNodes} connected</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className="h-4 w-4" />
            <span>{meshStatus.batteryOptimized ? "Optimized" : "Standard"}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${darkMode ? "bg-gray-800 border-gray-600 text-white" : ""}`}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No chats yet</p>
            <p className="text-sm mt-1">Start messaging via mesh network</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const user = users.find((u) => u.id === chat.participants[0])
            return (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`flex items-center p-4 hover:${darkMode ? "bg-gray-800" : "bg-gray-50"} cursor-pointer border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
              >
                <div className="relative">
                  <img
                    src={chat.avatar || "/placeholder.svg"}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.type === "group" && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <MessageCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {user?.isOnline && chat.type === "private" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"} truncate`}>
                        {chat.name}
                      </h3>
                      {chat.isEncrypted && (
                        <div className="w-3 h-3 bg-green-500 rounded-full" title="End-to-end encrypted" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">{getSignalBars(chat.meshRoute.length)}</div>
                      <span className="text-xs text-gray-500">{formatTime(chat.lastMessageTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} truncate`}>
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{chat.meshRoute.length} hops</span>
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-green-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
