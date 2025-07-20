"use client"

import { useState } from "react"
import { ArrowLeft, UserPlus, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { User } from "@/types/chat"

interface GroupChatProps {
  onBack: () => void
}

export default function GroupChat({ onBack }: GroupChatProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const filteredUsers: User[] = []

  const handleUserSelect = (user: User) => {
    setSelectedUsers([...selectedUsers, user])
  }

  const handleUserRemove = (user: User) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id))
  }

  const handleCreateGroup = () => {
    // Implement group creation logic here
    alert(`Creating group with ${selectedUsers.length} users`)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-green-700 p-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">New Group</h1>
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
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-3">SELECTED</h3>
          <div className="flex items-center gap-2 overflow-x-auto">
            {selectedUsers.map((user) => (
              <div key={user.id} className="relative">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <button
                  onClick={() => handleUserRemove(user)}
                  className="absolute -top-1 -right-1 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Users */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">ADD PARTICIPANTS</h3>
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
              <p className="text-sm text-gray-500">Available via Bluetooth</p>
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

      {/* Create Group Button */}
      <div className="p-4">
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleCreateGroup}>
          Create Group
        </Button>
      </div>
    </div>
  )
}
