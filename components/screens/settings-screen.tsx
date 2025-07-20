"use client"

import { useState } from "react"
import { Settings, Bluetooth, Battery, Zap, Moon, Sun, Bell, HardDrive } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { MeshStatus } from "@/types/mesh-types"

interface SettingsScreenProps {
  meshStatus: MeshStatus
  darkMode: boolean
  onToggleDarkMode: () => void
}

export default function SettingsScreen({ meshStatus, darkMode, onToggleDarkMode }: SettingsScreenProps) {
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)
  const [autoConnect, setAutoConnect] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [powerMode, setPowerMode] = useState<"performance" | "balanced" | "battery_saver" | "emergency">("balanced")
  const [scanInterval, setScanInterval] = useState([5])
  const [maxHops, setMaxHops] = useState([10])

  const powerModes = [
    {
      id: "performance",
      label: "Performance",
      description: "Maximum network performance",
      icon: Zap,
      color: "text-red-500",
    },
    {
      id: "balanced",
      label: "Balanced",
      description: "Balance performance and battery",
      icon: Battery,
      color: "text-blue-500",
    },
    {
      id: "battery_saver",
      label: "Battery Saver",
      description: "Optimize for battery life",
      icon: Battery,
      color: "text-green-500",
    },
    {
      id: "emergency",
      label: "Emergency",
      description: "Emergency mode with extended range",
      icon: Zap,
      color: "text-orange-500",
    },
  ]

  return (
    <div className={`h-full flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-green-600"} text-white p-4`}>
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Mesh Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Appearance */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} mb-4`}>APPEARANCE</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5 text-blue-500" /> : <Sun className="h-5 w-5 text-yellow-500" />}
              <div>
                <p className="font-medium">Dark mode</p>
                <p className="text-sm text-gray-500">Switch between light and dark themes</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={onToggleDarkMode} />
          </div>
        </div>

        {/* Connectivity */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} mb-4`}>CONNECTIVITY</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bluetooth className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Bluetooth mesh</p>
                  <p className="text-sm text-gray-500">Enable mesh networking</p>
                </div>
              </div>
              <Switch checked={bluetoothEnabled} onCheckedChange={setBluetoothEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5" />
                <div>
                  <p className="font-medium">Auto-connect</p>
                  <p className="text-sm text-gray-500">Automatically connect to known devices</p>
                </div>
              </div>
              <Switch checked={autoConnect} onCheckedChange={setAutoConnect} disabled={!bluetoothEnabled} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Scan interval</span>
                <span className="text-sm text-gray-500">{scanInterval[0]}s</span>
              </div>
              <Slider
                value={scanInterval}
                onValueChange={setScanInterval}
                max={30}
                min={1}
                step={1}
                className="w-full"
                disabled={!bluetoothEnabled}
              />
              <p className="text-xs text-gray-500 mt-1">How often to scan for nearby devices</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Max hops</span>
                <span className="text-sm text-gray-500">{maxHops[0]}</span>
              </div>
              <Slider value={maxHops} onValueChange={setMaxHops} max={20} min={1} step={1} className="w-full" />
              <p className="text-xs text-gray-500 mt-1">Maximum message routing hops</p>
            </div>
          </div>
        </div>

        {/* Power Management */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} mb-4`}>
            POWER MANAGEMENT
          </h3>

          <div className="space-y-3">
            {powerModes.map((mode) => {
              const IconComponent = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setPowerMode(mode.id as any)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    powerMode === mode.id
                      ? darkMode
                        ? "border-green-500 bg-gray-800"
                        : "border-green-500 bg-green-50"
                      : darkMode
                        ? "border-gray-600 hover:border-gray-500 bg-gray-800"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${mode.color}`} />
                  <div className="text-left">
                    <p className="font-medium">{mode.label}</p>
                    <p className="text-sm text-gray-500">{mode.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} mb-4`}>NOTIFICATIONS</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Message notifications</p>
                <p className="text-sm text-gray-500">Show alerts for new messages</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </div>

        {/* Storage */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} mb-4`}>STORAGE</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Local storage</p>
                  <p className="text-sm text-gray-500">2.3 GB used of 5 GB</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={darkMode ? "border-gray-600 text-white hover:bg-gray-800" : ""}
              >
                Manage
              </Button>
            </div>

            <Button
              variant="outline"
              className={`w-full ${darkMode ? "border-gray-600 text-white hover:bg-gray-800" : ""}`}
            >
              Clear Message Cache
            </Button>
          </div>
        </div>

        {/* Network Info */}
        <div className="p-4">
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} mb-4`}>NETWORK STATUS</h3>

          <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Network health:</span>
                <span className="font-medium text-green-500">{meshStatus.networkHealth}%</span>
              </div>
              <div className="flex justify-between">
                <span>Connected nodes:</span>
                <span className="font-medium">{meshStatus.connectedNodes}</span>
              </div>
              <div className="flex justify-between">
                <span>Total network size:</span>
                <span className="font-medium">{meshStatus.nodeCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Encryption:</span>
                <span className="font-medium text-green-500">
                  {meshStatus.encryptionEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
