"use client"

import { useState } from "react"
import { Bluetooth, MapPin, Bell, Shield, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PermissionsScreenProps {
  onComplete: () => void
  darkMode: boolean
}

interface Permission {
  id: string
  icon: any
  title: string
  description: string
  required: boolean
  granted: boolean
}

export default function PermissionsScreen({ onComplete, darkMode }: PermissionsScreenProps) {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "bluetooth",
      icon: Bluetooth,
      title: "Bluetooth Access",
      description: "Required for mesh networking and device discovery",
      required: true,
      granted: false,
    },
    {
      id: "location",
      icon: MapPin,
      title: "Location Access",
      description: "Needed for Bluetooth device scanning on Android",
      required: true,
      granted: false,
    },
    {
      id: "notifications",
      icon: Bell,
      title: "Notifications",
      description: "Get alerts for new messages and network status",
      required: false,
      granted: false,
    },
  ])

  const handlePermissionRequest = async (permissionId: string) => {
    // Simulate permission request
    setTimeout(() => {
      setPermissions((prev) => prev.map((p) => (p.id === permissionId ? { ...p, granted: true } : p)))
    }, 1000)
  }

  const allRequiredGranted = permissions.filter((p) => p.required).every((p) => p.granted)

  return (
    <div
      className={`h-screen max-w-md mx-auto border-x border-gray-200 flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}
    >
      {/* Header */}
      <div className="p-6 text-center">
        <div
          className={`w-16 h-16 rounded-full ${darkMode ? "bg-gray-800" : "bg-green-100"} flex items-center justify-center mx-auto mb-4`}
        >
          <Shield className="h-8 w-8 text-green-500" />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Permissions Required</h1>
        <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          MeshChat needs these permissions to create secure mesh networks
        </p>
      </div>

      {/* Permissions List */}
      <div className="flex-1 px-6">
        <div className="space-y-4">
          {permissions.map((permission) => {
            const IconComponent = permission.icon
            return (
              <div
                key={permission.id}
                className={`p-4 rounded-lg border ${
                  darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full ${permission.granted ? "bg-green-100" : darkMode ? "bg-gray-700" : "bg-gray-100"} flex items-center justify-center flex-shrink-0`}
                  >
                    {permission.granted ? (
                      <Check className="h-6 w-6 text-green-500" />
                    ) : (
                      <IconComponent className={`h-6 w-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{permission.title}</h3>
                      {permission.required && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Required</span>
                      )}
                    </div>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-3`}>
                      {permission.description}
                    </p>

                    {!permission.granted && (
                      <Button
                        onClick={() => handlePermissionRequest(permission.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Grant Permission
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Warning for required permissions */}
        {!allRequiredGranted && (
          <div
            className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-200"}`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className={`font-medium ${darkMode ? "text-yellow-200" : "text-yellow-800"}`}>
                  Required Permissions
                </h4>
                <p className={`text-sm ${darkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                  Bluetooth and Location permissions are required for mesh networking to function properly.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="p-6">
        <Button
          onClick={onComplete}
          disabled={!allRequiredGranted}
          className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
        >
          {allRequiredGranted ? "Continue Setup" : "Grant Required Permissions"}
        </Button>

        <p className="text-center text-xs text-gray-500 mt-3">
          You can change these permissions later in your device settings
        </p>
      </div>
    </div>
  )
}
