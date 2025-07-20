"use client"

import { useState } from "react"
import { Radar, Wifi, Battery, Signal, Users, Zap, RefreshCw, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { User, MeshStatus } from "@/types/mesh-types"

interface NetworkScreenProps {
  meshStatus: MeshStatus
  users: User[]
  darkMode: boolean
  onShowTopology: () => void
}

export default function NetworkScreen({ meshStatus, users, darkMode, onShowTopology }: NetworkScreenProps) {
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 3000)
  }

  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-green-500"
    if (health >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "coordinator":
        return <Network className="h-4 w-4 text-purple-500" />
      case "relay":
        return <Radar className="h-4 w-4 text-blue-500" />
      case "node":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "edge":
        return <Signal className="h-4 w-4 text-orange-500" />
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className={`h-full flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-green-600"} text-white p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Mesh Network</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleScan}
            disabled={isScanning}
            className="text-white hover:bg-green-700"
          >
            <RefreshCw className={`h-5 w-5 ${isScanning ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Users className="h-4 w-4" />
              <span>Network Size</span>
            </div>
            <div className="text-2xl font-bold">{meshStatus.nodeCount}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Signal className="h-4 w-4" />
              <span>Health</span>
            </div>
            <div className={`text-2xl font-bold ${getHealthColor(meshStatus.networkHealth)}`}>
              {meshStatus.networkHealth}%
            </div>
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Network Health</span>
              <span className={getHealthColor(meshStatus.networkHealth)}>{meshStatus.networkHealth}%</span>
            </div>
            <Progress value={meshStatus.networkHealth} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Wifi className="h-4 w-4 text-green-500" />
                <span>Connected</span>
              </div>
              <div className="text-lg font-semibold">{meshStatus.connectedNodes}</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Radar className="h-4 w-4 text-blue-500" />
                <span>Density</span>
              </div>
              <div className="text-lg font-semibold capitalize">{meshStatus.meshDensity}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Topology Visualization */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button onClick={onShowTopology} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Network className="h-4 w-4 mr-2" />
          View Network Topology
        </Button>
      </div>

      {/* Connected Nodes */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} mb-3`}>
            CONNECTED NODES ({users.filter((u) => u.isOnline).length})
          </h3>
        </div>

        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
          >
            <div className="relative">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {user.isOnline ? (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              ) : (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{user.name}</h3>
                <div className="flex items-center gap-2">
                  {getRoleIcon(user.meshRole)}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-full ${
                          i < user.signalStrength ? "bg-green-500" : darkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <span>{user.hops} hops</span>
                  <div className="flex items-center gap-1">
                    <Battery className="h-3 w-3" />
                    <span>{user.batteryLevel}%</span>
                  </div>
                </div>
                <span className="text-xs capitalize">{user.meshRole}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Network Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleScan}
            disabled={isScanning}
            variant="outline"
            className={darkMode ? "border-gray-600 text-white hover:bg-gray-800" : ""}
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Radar className="h-4 w-4 mr-2" />
                Scan Network
              </>
            )}
          </Button>
          <Button variant="outline" className={darkMode ? "border-gray-600 text-white hover:bg-gray-800" : ""}>
            <Zap className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>
      </div>
    </div>
  )
}
