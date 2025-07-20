"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ArrowLeft, Send, Paperclip, Smile, MoreVertical, Shield, Zap, Users, Signal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Chat, Message, MeshStatus } from "@/types/mesh-types"

interface ChatInterfaceProps {
  chat: Chat
  onBack: () => void
  meshStatus: MeshStatus
  darkMode: boolean
}

export default function ChatInterface({ chat, onBack, meshStatus, darkMode }: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      // In real app, this would send via mesh network
      setMessage("")
    }
    if (file) {
      // In real app, this would send the file via mesh network
      alert(`File sent: ${file.name}`)
      setFile(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return "⏳"
      case "sent":
        return "✓"
      case "relayed":
        return "🔄"
      case "delivered":
        return "✓✓"
      case "failed":
        return "❌"
      default:
        return ""
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-blue-400"
      case "sent":
        return "text-gray-400"
      case "relayed":
        return "text-yellow-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className={`h-full flex flex-col ${darkMode ? "bg-gray-900" : "bg-white"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-green-600"} text-white p-4 flex items-center gap-3`}>
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-green-700 p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{chat.name}</h2>
            {chat.isEncrypted && <Shield className="h-4 w-4 text-green-300" />}
            {chat.type === "group" && <Users className="h-4 w-4" />}
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Signal className="h-3 w-3" />
            <span>{chat.meshRoute.length} hops via mesh</span>
            {meshStatus.emergencyMode && (
              <>
                <span>•</span>
                <Zap className="h-3 w-3 text-red-300" />
                <span>Emergency mode</span>
              </>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-green-700"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Route Information */}
      {/* REMOVED showRouteInfo and its usage */}

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        {/* Messages will be populated here */}
      </div>

      {/* Message Input */}
      <div className={`p-4 border-t ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className={`${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className={`pr-10 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
            />
            <Button
              variant="ghost"
              size="sm"
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim() && !file}
            className={`rounded-full w-10 h-10 p-0 ${darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-600 hover:bg-green-700"}`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {file && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
            <span>Selected file: {file.name}</span>
            <Button size="sm" variant="ghost" onClick={() => setFile(null)}>
              Remove
            </Button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="*" onChange={handleFileSelect} className="hidden" />

        {/* Network Status */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${meshStatus.isActive ? "bg-green-500" : "bg-red-500"} animate-pulse`}
            />
            <span>Mesh: {meshStatus.connectedNodes} nodes</span>
          </div>
          <div className="flex items-center gap-2">
            {chat.isEncrypted && (
              <>
                <Shield className="h-3 w-3 text-green-500" />
                <span>Encrypted</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
