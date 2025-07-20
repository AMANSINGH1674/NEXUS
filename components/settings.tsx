"use client"

import { useState } from "react"
import { ArrowLeft, Bluetooth, Shield, Bell, HardDrive, Info, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface SettingsProps {
  onBack: () => void
}

export default function Settings({ onBack }: SettingsProps) {
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)
  const [autoConnect, setAutoConnect] = useState(true)
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-green-700 p-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <img
            src="/placeholder.svg?height=60&width=60"
            alt="Profile"
            className="w-15 h-15 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">John Doe</h3>
            <p className="text-sm text-gray-500">Available via Bluetooth</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        {/* Bluetooth Settings */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-3">CONNECTIVITY</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bluetooth className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Bluetooth</p>
                  <p className="text-sm text-gray-500">Enable device discovery</p>
                </div>
              </div>
              <Switch checked={bluetoothEnabled} onCheckedChange={setBluetoothEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5" />
                <div>
                  <p className="font-medium">Auto-connect</p>
                  <p className="text-sm text-gray-500">Connect to known devices</p>
                </div>
              </div>
              <Switch checked={autoConnect} onCheckedChange={setAutoConnect} disabled={!bluetoothEnabled} />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-3">PRIVACY & SECURITY</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">End-to-end encryption</p>
                <p className="text-sm text-gray-500">Messages are encrypted</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>

            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="font-medium">Local storage</p>
                <p className="text-sm text-gray-500">Manage offline data</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-3">NOTIFICATIONS</h3>

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

        {/* About */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">ABOUT</h3>

          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium">OfflineChat</p>
              <p className="text-sm text-gray-500">Version 1.0.0</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
