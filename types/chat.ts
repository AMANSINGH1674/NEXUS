export interface User {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen: Date
  deviceId: string
}

export interface Message {
  id: string
  content: string
  type: "text" | "image" | "file"
  senderId: string
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "failed"
}

export interface Chat {
  id: string
  type: "private" | "group"
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  participants: string[]
}

export interface Group {
  id: string
  name: string
  avatar: string
  description: string
  participants: string[]
  admins: string[]
  createdAt: Date
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isActive: boolean
}

export interface StorageItem {
  id: string
  name: string
  type: "image" | "file" | "chat"
  size: number
  date: Date
  chatId?: string
}
