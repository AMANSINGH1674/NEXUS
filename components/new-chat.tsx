"use client"

import { useState } from "react"
import { ArrowLeft, Search, Users, UserPlus, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { User, Chat } from "@/types/chat"

interface NewChatProps {
  users: User[]
  onBack: () => void
  onChatSelect: (chat: Chat) => void
}

export default function NewChat({ users, onBack, onChatSelect }: NewChatProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleUserSelect = (user: User) => {
    // Create a new chat with the selected user
    const newChat: Chat = {
      id: `chat_${user.id}`,
      type: "private",
      name: user.name,
      avatar: user.avatar,
      lastMessage: "",
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: user.isOnline,
      participants: [user.id],
    }
    onChatSelect(newChat)
  }

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date()
    const diff = now.getTime() - lastSeen.getTime()

    if (diff < 60000) return "Active now"
    if (diff < 3600000) return `Active ${Math.floor(diff / 60000)}m ago`
    return `Active ${Math.floor(diff / 3600000)}h ago`
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-green-700 p-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">New Chat</h1>
        </div>

        <div className="text-sm opacity-90">
          <div className="flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            <span>Scanning for nearby devices...</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b">
        <Button variant="ghost" className="w-full justify-start gap-3 h-12">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <span>New Group</span>
        </Button>
      </div>

      {/* Available Users */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">NEARBY DEVICES</h3>
        </div>

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => handleUserSelect(user)}
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
          >
            <div className="relative">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {user.isOnline ? (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              ) : (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="ml-3 flex-1">
              <h3 className="font-medium text-gray-900">{user.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {user.isOnline ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span>Available via Bluetooth</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span>{formatLastSeen(user.lastSeen)}</span>
                  </>
                )}
              </div>
            </div>

            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <WifiOff className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No devices found nearby</p>
            <p className="text-sm mt-1">Make sure Bluetooth is enabled</p>
          </div>
        )}
      </div>
    </div>
  )
}
