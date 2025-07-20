"use client"

import { useState } from "react"
import { Camera, User, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProfileSetupProps {
  onComplete: (profile: { name: string; avatar: string }) => void
  darkMode: boolean
}

export default function ProfileSetup({ onComplete, darkMode }: ProfileSetupProps) {
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("/placeholder.svg?height=100&width=100")
  const [isValid, setIsValid] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    setIsValid(value.trim().length >= 2)
  }

  const handleComplete = () => {
    if (isValid) {
      onComplete({ name: name.trim(), avatar })
    }
  }

  const avatarOptions = [
    "/placeholder.svg?height=100&width=100&text=👤",
    "/placeholder.svg?height=100&width=100&text=👨",
    "/placeholder.svg?height=100&width=100&text=👩",
    "/placeholder.svg?height=100&width=100&text=🧑",
    "/placeholder.svg?height=100&width=100&text=👦",
    "/placeholder.svg?height=100&width=100&text=👧",
  ]

  return (
    <div
      className={`h-screen max-w-md mx-auto border-x border-gray-200 flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}
    >
      {/* Header */}
      <div className="p-6 text-center">
        <div
          className={`w-16 h-16 rounded-full ${darkMode ? "bg-gray-800" : "bg-green-100"} flex items-center justify-center mx-auto mb-4`}
        >
          <User className="h-8 w-8 text-green-500" />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Create Your Profile</h1>
        <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>Set up your identity for the mesh network</p>
      </div>

      {/* Profile Setup */}
      <div className="flex-1 px-6">
        {/* Avatar Selection */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <img
              src={avatar || "/placeholder.svg"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {avatarOptions.map((avatarOption, index) => (
              <button
                key={index}
                onClick={() => setAvatar(avatarOption)}
                className={`w-16 h-16 rounded-full border-2 overflow-hidden ${
                  avatar === avatarOption ? "border-green-500" : darkMode ? "border-gray-600" : "border-gray-300"
                }`}
              >
                <img
                  src={avatarOption || "/placeholder.svg"}
                  alt={`Avatar ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Display Name
          </label>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter your name"
            className={`${darkMode ? "bg-gray-800 border-gray-600 text-white" : ""}`}
            maxLength={30}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">This name will be visible to other mesh network users</p>
            <span className="text-xs text-gray-500">{name.length}/30</span>
          </div>
        </div>

        {/* Device Info */}
        <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
          <h3 className={`font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Device Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Device ID:</span>
              <span className={`font-mono ${darkMode ? "text-gray-300" : "text-gray-700"}`}>BLE:AA:BB:CC:DD:EE:FF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mesh Role:</span>
              <span className={`${darkMode ? "text-green-400" : "text-green-600"} font-medium`}>Coordinator</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Encryption:</span>
              <span className={`${darkMode ? "text-green-400" : "text-green-600"} font-medium`}>AES-256 Enabled</span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div
          className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"}`}
        >
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={`font-medium ${darkMode ? "text-blue-200" : "text-blue-800"}`}>Privacy Protected</h4>
              <p className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                Your profile is stored locally and only shared with devices you connect to directly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-6">
        <Button
          onClick={handleComplete}
          disabled={!isValid}
          className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
        >
          Create Profile & Continue
        </Button>

        <p className="text-center text-xs text-gray-500 mt-3">You can update your profile anytime in settings</p>
      </div>
    </div>
  )
}
