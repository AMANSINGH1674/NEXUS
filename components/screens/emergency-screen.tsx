"use client"

import { useState } from "react"
import { AlertTriangle, Zap, Users, MapPin, Phone, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { User, MeshStatus } from "@/types/mesh-types"

interface EmergencyScreenProps {
  meshStatus: MeshStatus
  darkMode: boolean
  users: User[]
}

export default function EmergencyScreen({ meshStatus, darkMode, users }: EmergencyScreenProps) {
  const [emergencyMessage, setEmergencyMessage] = useState("")
  const [emergencyType, setEmergencyType] = useState<"medical" | "fire" | "security" | "natural" | "other">("medical")
  const [location, setLocation] = useState("")
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  const emergencyTypes = [
    { id: "medical", label: "Medical Emergency", icon: "🚑", color: "bg-red-500" },
    { id: "fire", label: "Fire Emergency", icon: "🔥", color: "bg-orange-500" },
    { id: "security", label: "Security Alert", icon: "🚨", color: "bg-purple-500" },
    { id: "natural", label: "Natural Disaster", icon: "🌪️", color: "bg-yellow-500" },
    { id: "other", label: "Other Emergency", icon: "⚠️", color: "bg-gray-500" },
  ]

  const handleEmergencyBroadcast = () => {
    setIsBroadcasting(true)
    // Simulate emergency broadcast
    setTimeout(() => {
      setIsBroadcasting(false)
      alert("Emergency broadcast sent to all mesh nodes!")
    }, 2000)
  }

  const getOnlineNodes = () => {
    return users.filter((u) => u.isOnline).length
  }

  return (
    <div className={`h-full flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Emergency Broadcast</h1>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{getOnlineNodes()} nodes will receive</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>High priority routing</span>
          </div>
        </div>
      </div>

      {/* Emergency Status */}
      {meshStatus.emergencyMode && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800 dark:text-red-200">Emergency Mode Active</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Network is prioritizing emergency communications
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Emergency Type Selection */}
        <div>
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-3`}>Emergency Type</h3>
          <div className="grid grid-cols-1 gap-2">
            {emergencyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setEmergencyType(type.id as any)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                  emergencyType === type.id
                    ? `${type.color} text-white border-transparent`
                    : darkMode
                      ? "border-gray-600 hover:border-gray-500 bg-gray-800"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <span className="text-xl">{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
            Location (Optional)
          </label>
          <div className="flex gap-2">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location or coordinates"
              className={darkMode ? "bg-gray-800 border-gray-600 text-white" : ""}
            />
            <Button
              variant="outline"
              size="sm"
              className={darkMode ? "border-gray-600 text-white hover:bg-gray-800" : ""}
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setLocation(`${position.coords.latitude}, ${position.coords.longitude}`)
                    },
                    (error) => {
                      alert("Location access denied or unavailable.")
                    }
                  )
                } else {
                  alert("Geolocation is not supported by your browser.")
                }
              }}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Emergency Message */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
            Emergency Message
          </label>
          <Textarea
            value={emergencyMessage}
            onChange={(e) => setEmergencyMessage(e.target.value)}
            placeholder="Describe the emergency situation..."
            rows={4}
            className={darkMode ? "bg-gray-800 border-gray-600 text-white" : ""}
          />
          <div className="text-xs text-gray-500 mt-1">{emergencyMessage.length}/500 characters</div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-3`}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className={`${darkMode ? "border-gray-600 text-white hover:bg-gray-800" : ""} h-12`}
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setLocation(`${position.coords.latitude}, ${position.coords.longitude}`)
                    },
                    (error) => {
                      alert("Location access denied or unavailable.")
                    }
                  )
                } else {
                  alert("Geolocation is not supported by your browser.")
                }
              }}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Share Location
            </Button>
            <Button
              variant="outline"
              className={`${darkMode ? "border-gray-600 text-white hover:bg-gray-800" : ""} h-12`}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Emergency
            </Button>
          </div>
        </div>

        {/* Network Coverage */}
        <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
            Broadcast Coverage
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Direct nodes:</span>
              <span className="font-medium">{meshStatus.connectedNodes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total network:</span>
              <span className="font-medium">{meshStatus.nodeCount} nodes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Estimated reach:</span>
              <span className="font-medium">~{Math.floor(meshStatus.nodeCount * 1.5)} people</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Broadcast Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleEmergencyBroadcast}
          disabled={isBroadcasting || !emergencyMessage.trim()}
          className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-semibold"
        >
          {isBroadcasting ? (
            <>
              <Zap className="h-5 w-5 mr-2 animate-pulse" />
              Broadcasting Emergency...
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 mr-2" />
              Send Emergency Broadcast
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Encrypted and authenticated broadcast</span>
        </div>
      </div>
    </div>
  )
}
