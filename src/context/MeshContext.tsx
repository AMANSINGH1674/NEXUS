"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import MeshNetworkService from "../services/MeshNetworkService"
import type { User, Chat, Message, Group, MeshStatus, NetworkNode } from "../types/mesh-types"

interface MeshContextType {
  meshStatus: MeshStatus
  users: User[]
  chats: Chat[]
  groups: Group[]
  networkNodes: NetworkNode[]
  localUser: User | null
  isInitialized: boolean
  isInitializing: boolean
  initializeMesh: (userData: Partial<User>) => Promise<boolean>
  sendMessage: (chatId: string, content: string, type?: "text" | "image" | "file" | "emergency") => Promise<boolean>
  createChat: (userId: string) => Promise<Chat>
  createGroup: (name: string, participants: string[]) => Promise<Group>
  getMessages: (chatId: string) => Message[]
  sendEmergencyBroadcast: (message: string) => Promise<boolean>
  setPowerMode: (mode: "performance" | "balanced" | "battery_saver" | "emergency") => void
  updateMeshStatus: (status: Partial<MeshStatus>) => void
}

const MeshContext = createContext<MeshContextType | undefined>(undefined)

export const useMesh = () => {
  const context = useContext(MeshContext)
  if (!context) {
    throw new Error("useMesh must be used within a MeshProvider")
  }
  return context
}

interface MeshProviderProps {
  children: ReactNode
}

export const MeshProvider: React.FC<MeshProviderProps> = ({ children }) => {
  const [meshStatus, setMeshStatus] = useState<MeshStatus>({
    isActive: false,
    nodeCount: 0,
    connectedNodes: 0,
    networkHealth: 0,
    batteryOptimized: true,
    emergencyMode: false,
    encryptionEnabled: true,
    meshDensity: "sparse",
  })
  
  const [users, setUsers] = useState<User[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([])
  const [localUser, setLocalUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map())
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    // Set up event listeners
    MeshNetworkService.on("meshStatusUpdated", handleMeshStatusUpdated)
    MeshNetworkService.on("userDiscovered", handleUserDiscovered)
    MeshNetworkService.on("userUpdated", handleUserUpdated)
    MeshNetworkService.on("chatCreated", handleChatCreated)
    MeshNetworkService.on("chatUpdated", handleChatUpdated)
    MeshNetworkService.on("groupCreated", handleGroupCreated)
    MeshNetworkService.on("messageReceived", handleMessageReceived)
    MeshNetworkService.on("networkUpdated", handleNetworkUpdated)
    
    return () => {
      // Clean up event listeners
      MeshNetworkService.removeListener("meshStatusUpdated", handleMeshStatusUpdated)
      MeshNetworkService.removeListener("userDiscovered", handleUserDiscovered)
      MeshNetworkService.removeListener("userUpdated", handleUserUpdated)
      MeshNetworkService.removeListener("chatCreated", handleChatCreated)
      MeshNetworkService.removeListener("chatUpdated", handleChatUpdated)
      MeshNetworkService.removeListener("groupCreated", handleGroupCreated)
      MeshNetworkService.removeListener("messageReceived", handleMessageReceived)
      MeshNetworkService.removeListener("networkUpdated", handleNetworkUpdated)
    }
  }, [])

  const handleMeshStatusUpdated = (status: MeshStatus) => {
    setMeshStatus(status)
  }

  const handleUserDiscovered = (user: User) => {
    setUsers(prev => {
      const existing = prev.findIndex(u => u.id === user.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = user
        return updated
      }
      return [...prev, user]
    })
  }

  const handleUserUpdated = (user: User) => {
    setUsers(prev => {
      const existing = prev.findIndex(u => u.id === user.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = user
        return updated
      }
      return prev
    })
  }

  const handleChatCreated = (chat: Chat) => {
    setChats(prev => [...prev, chat])
  }

  const handleChatUpdated = (chat: Chat) => {
    setChats(prev => {
      const existing = prev.findIndex(c => c.id === chat.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = chat
        return updated
      }
      return prev
    })
  }

  const handleGroupCreated = (group: Group) => {
    setGroups(prev => [...prev, group])
  }

  const handleMessageReceived = ({ chatId, message }: { chatId: string, message: Message }) => {
    setMessages(prev => {
      const newMessages = new Map(prev)
      const chatMessages = newMessages.get(chatId) || []
      newMessages.set(chatId, [...chatMessages, message])
      return newMessages
    })
  }

  const handleNetworkUpdated = (nodes: NetworkNode[]) => {
    setNetworkNodes(nodes)
  }

  const initializeMesh = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsInitializing(true)
      const success = await MeshNetworkService.initialize(userData)
      
      if (success) {
        // Load initial data
        setUsers(MeshNetworkService.getUsers())
        setChats(MeshNetworkService.getChats())
        setGroups(MeshNetworkService.getGroups())
        setNetworkNodes(MeshNetworkService.getNetworkNodes())
        setLocalUser(MeshNetworkService.getLocalUser())
        setMeshStatus(MeshNetworkService.getMeshStatus())
        
        // Load messages for each chat
        const messagesMap = new Map<string, Message[]>()
        MeshNetworkService.getChats().forEach(chat => {
          messagesMap.set(chat.id, MeshNetworkService.getMessages(chat.id))
        })
        setMessages(messagesMap)
        
        setIsInitialized(true)
      }
      
      setIsInitializing(false)
      return success
    } catch (error) {
      console.error("Failed to initialize mesh:", error)
      setIsInitializing(false)
      return false
    }
  }

  const sendMessage = async (chatId: string, content: string, type: "text" | "image" | "file" | "emergency" = "text"): Promise<boolean> => {
    return await MeshNetworkService.sendMessage(chatId, content, type)
  }

  const createChat = async (userId: string): Promise<Chat> => {
    return await MeshNetworkService.createChat(userId)
  }

  const createGroup = async (name: string, participants: string[]): Promise<Group> => {
    return await MeshNetworkService.createGroup(name, participants)
  }

  const getMessages = (chatId: string): Message[] => {
    return messages.get(chatId) || []
  }

  const sendEmergencyBroadcast = async (message: string): Promise<boolean> => {
    return await MeshNetworkService.sendEmergencyBroadcast(message)
  }

  const setPowerMode = (mode: "performance" | "balanced" | "battery_saver" | "emergency"): void => {
    MeshNetworkService.setPowerMode(mode)
  }

  const updateMeshStatus = (status: Partial<MeshStatus>) => {
    setMeshStatus((prev) => ({ ...prev, ...status }))
  }

  return (
    <MeshContext.Provider 
      value={{ 
        meshStatus, 
        users, 
        chats, 
        groups,
        networkNodes,
        localUser,
        isInitialized,
        isInitializing,
        initializeMesh,
        sendMessage,
        createChat,
        createGroup,
        getMessages,
        sendEmergencyBroadcast,
        setPowerMode,
        updateMeshStatus 
      }}
    >
      {children}
    </MeshContext.Provider>
  )
}
