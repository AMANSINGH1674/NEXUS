"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ArrowLeft, Send, Paperclip, Smile, MoreVertical, Wifi, WifiOff, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Chat, Message } from "@/types/chat"

interface ChatScreenProps {
  chat: Chat
  onBack: () => void
  onSendMessage: (chatId: string, content: string, type?: "text" | "image") => void
}

// Mock messages for demonstration
const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey! Are you coming to the meeting?",
    type: "text",
    senderId: "1",
    timestamp: new Date(Date.now() - 300000),
    status: "delivered",
  },
  {
    id: "2",
    content: "Yes, I'll be there in 10 minutes",
    type: "text",
    senderId: "me",
    timestamp: new Date(Date.now() - 240000),
    status: "delivered",
  },
  {
    id: "3",
    content: "Great! See you there 👍",
    type: "text",
    senderId: "1",
    timestamp: new Date(Date.now() - 180000),
    status: "delivered",
  },
]

export default function ChatScreen({ chat, onBack, onSendMessage }: ChatScreenProps) {
  const [message, setMessage] = useState("")
  const [messages] = useState<Message[]>(mockMessages)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(chat.id, message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      // In a real app, you'd process the image file here
      onSendMessage(chat.id, "Image shared", "image")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-green-700 p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />

        <div className="flex-1">
          <h2 className="font-medium">{chat.name}</h2>
          <div className="flex items-center gap-1 text-sm opacity-90">
            {chat.type === "group" && <Users className="h-3 w-3" />}
            {chat.isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>{chat.type === "group" ? "Active group" : "Online via Bluetooth"}</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Last seen 5m ago</span>
              </>
            )}
          </div>
        </div>

        <Button variant="ghost" size="sm" className="text-white hover:bg-green-700">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.senderId === "me" ? "bg-green-500 text-white" : "bg-white text-gray-800 border"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <div
                className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                  msg.senderId === "me" ? "text-green-100" : "text-gray-500"
                }`}
              >
                <span>{formatTime(msg.timestamp)}</span>
                {msg.senderId === "me" && (
                  <div className="flex">
                    <div
                      className={`w-1 h-1 rounded-full ${msg.status === "delivered" ? "bg-blue-300" : "bg-gray-300"}`}
                    />
                    <div
                      className={`w-1 h-1 rounded-full ml-0.5 ${
                        msg.status === "delivered" ? "bg-blue-300" : "bg-gray-300"
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-700"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-green-600 hover:bg-green-700 rounded-full w-10 h-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>
    </div>
  )
}
