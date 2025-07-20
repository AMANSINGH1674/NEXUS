"use client"

import { useState } from "react"
import { Search, MessageCircle, Settings, Wifi, WifiOff, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Chat } from "@/types/chat"

interface ChatListProps {
  chats: Chat[]
  onChatSelect: (chat: Chat) => void
  onNewChat: () => void
  onSettings: () => void
}

export default function ChatList({ chats, onChatSelect, onNewChat, onSettings }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isBluetoothConnected] = useState(true)
  const [connectedDevices] = useState(3)

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString()
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">OfflineChat</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onSettings} className="text-white hover:bg-green-700">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          {isBluetoothConnected ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>{connectedDevices} devices nearby</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>Searching for devices...</span>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
          >
            <div className="relative">
              <img
                src={chat.avatar || "/placeholder.svg"}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {chat.type === "group" && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Users className="h-3 w-3 text-white" />
                </div>
              )}
              {chat.isOnline && chat.type === "private" && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                <span className="text-xs text-gray-500">{formatTime(chat.lastMessageTime)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <Badge className="bg-green-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 right-6">
        <Button onClick={onNewChat} className="bg-green-600 hover:bg-green-700 rounded-full w-14 h-14 shadow-lg">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
