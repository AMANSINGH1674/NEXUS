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

export default function ChatsScreen({ onChatSelect, meshStatus, darkMode, users }: ChatsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")

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
            <div className={`w-2 h-2 rounded-full ${meshStatus.isActive ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
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
        <div className="p-8 text-center text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No chats yet</p>
          <p className="text-sm mt-1">Start messaging via mesh network</p>
        </div>
      </div>
    </div>
  )
}