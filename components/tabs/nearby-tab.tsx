"use client"

import { useState } from "react"
import { Search, Radar, UserPlus, Wifi, WifiOff, Bluetooth, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { User, Chat } from "@/types/chat"

interface NearbyTabProps {
  users: User[]
  onChatSelect: (chat: Chat) => void
}

export default function NearbyTab({ users, onChatSelect }: NearbyTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)

  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleScan = () => {
    setIsScanning(true)
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false)
    }, 3000)
  }

  const handleUserSelect = (user: User) => {
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

  const getSignalStrength = (user: User) => {
    // Mock signal strength based on online status
    return user.isOnline ? Math.floor(Math.random() * 3) + 2 : 1
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Nearby Devices</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleScan}
            disabled={isScanning || !bluetoothEnabled}
            className="text-white hover:bg-green-700"
          >
            <RefreshCw className={`h-5 w-5 ${isScanning ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {bluetoothEnabled ? (
            <>
              <Bluetooth className="h-4 w-4" />
              <span>{isScanning ? "Scanning..." : `${users.filter((u) => u.isOnline).length} devices found`}</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>Bluetooth disabled</span>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bluetooth Status */}
      {!bluetoothEnabled && (
        <div className="p-4 bg-yellow-50 border-b">
          <div className="flex items-center gap-2 text-yellow-800">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">Enable Bluetooth to discover nearby devices</span>
          </div>
          <Button
            size="sm"
            onClick={() => setBluetoothEnabled(true)}
            className="mt-2 bg-yellow-600 hover:bg-yellow-700"
          >
            Enable Bluetooth
          </Button>
        </div>
      )}

      {/* Device List */}
      <div className="flex-1 overflow-y-auto">
        {!bluetoothEnabled ? (
          <div className="p-8 text-center text-gray-500">
            <Bluetooth className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Bluetooth is disabled</p>
            <p className="text-sm mt-1">Enable Bluetooth to find nearby devices</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Radar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No devices found</p>
            <p className="text-sm mt-1">Pull down to scan for devices</p>
          </div>
        ) : (
          <>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">AVAILABLE DEVICES</h3>
            </div>

            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
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
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <div className="flex items-center gap-1">
                      {/* Signal strength bars */}
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          className={`w-1 h-3 rounded-full ${
                            bar <= getSignalStrength(user) ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
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
                    <div className="text-xs text-gray-400">{user.deviceId}</div>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 ml-2">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Scan Button */}
      {bluetoothEnabled && (
        <div className="p-4 border-t">
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scanning for devices...
              </>
            ) : (
              <>
                <Radar className="h-4 w-4 mr-2" />
                Scan for Devices
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
