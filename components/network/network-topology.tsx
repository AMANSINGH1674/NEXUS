"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Zap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User, MeshStatus } from "@/types/mesh-types"

interface NetworkTopologyProps {
  onBack: () => void
  meshStatus: MeshStatus
  users: User[]
  darkMode: boolean
}

interface NodePosition {
  id: string
  x: number
  y: number
  connections: string[]
}

export default function NetworkTopology({ onBack, meshStatus, users, darkMode }: NetworkTopologyProps) {
  const [nodes, setNodes] = useState<NodePosition[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  useEffect(() => {
    // Generate network topology visualization
    const centerX = 150
    const centerY = 200
    const radius = 100

    const nodePositions: NodePosition[] = users.map((user, index) => {
      const angle = (index / users.length) * 2 * Math.PI
      const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 40
      const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 40

      return {
        id: user.id,
        x,
        y,
        connections: users
          .filter((u) => u.id !== user.id && Math.random() > 0.6)
          .slice(0, 2)
          .map((u) => u.id),
      }
    })

    // Add center node (current device)
    nodePositions.unshift({
      id: "me",
      x: centerX,
      y: centerY,
      connections: users.slice(0, 3).map((u) => u.id),
    })

    setNodes(nodePositions)
  }, [users])

  const getNodeColor = (userId: string) => {
    if (userId === "me") return "#10b981" // green-500
    const user = users.find((u) => u.id === userId)
    if (!user) return "#6b7280" // gray-500

    if (!user.isOnline) return "#6b7280" // gray-500

    switch (user.meshRole) {
      case "coordinator":
        return "#8b5cf6" // purple-500
      case "relay":
        return "#3b82f6" // blue-500
      case "node":
        return "#10b981" // green-500
      case "edge":
        return "#f59e0b" // amber-500
      default:
        return "#6b7280" // gray-500
    }
  }

  const getNodeSize = (userId: string) => {
    if (userId === "me") return 12
    const user = users.find((u) => u.id === userId)
    if (!user) return 8

    switch (user.meshRole) {
      case "coordinator":
        return 10
      case "relay":
        return 9
      case "node":
        return 8
      case "edge":
        return 7
      default:
        return 8
    }
  }

  const selectedUser = selectedNode ? users.find((u) => u.id === selectedNode) : null

  return (
    <div className={`h-full flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-green-600"} text-white p-4`}>
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-green-700 p-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Network Topology</h1>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{nodes.length} nodes</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>{meshStatus.networkHealth}% health</span>
          </div>
        </div>
      </div>

      {/* Topology Visualization */}
      <div className="flex-1 relative overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 300 400" className={`${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          {/* Connection Lines */}
          {nodes.map((node) =>
            node.connections.map((connId) => {
              const connNode = nodes.find((n) => n.id === connId)
              if (!connNode) return null

              return (
                <line
                  key={`${node.id}-${connId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={connNode.x}
                  y2={connNode.y}
                  stroke={darkMode ? "#374151" : "#d1d5db"}
                  strokeWidth="1"
                  opacity="0.6"
                />
              )
            }),
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const user = node.id === "me" ? null : users.find((u) => u.id === node.id)
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={getNodeSize(node.id)}
                  fill={getNodeColor(node.id)}
                  stroke={selectedNode === node.id ? "#ffffff" : "transparent"}
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                />
                {/* Signal strength indicator */}
                {user && (
                  <circle
                    cx={node.x + 8}
                    cy={node.y - 8}
                    r="3"
                    fill={user.isOnline ? "#10b981" : "#6b7280"}
                    opacity="0.8"
                  />
                )}
                {/* Battery indicator for low battery */}
                {user && user.batteryLevel < 30 && (
                  <circle cx={node.x - 8} cy={node.y - 8} r="3" fill="#ef4444" opacity="0.8" />
                )}
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className={`absolute top-4 right-4 p-3 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
          <h4 className="font-medium mb-2 text-sm">Node Types</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>You / Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Coordinator</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Relay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Edge</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className={`p-4 border-t ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
          {selectedNode === "me" ? (
            <div>
              <h3 className="font-medium mb-2">Your Device</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-2 font-medium">Coordinator</span>
                </div>
                <div>
                  <span className="text-gray-500">Connections:</span>
                  <span className="ml-2 font-medium">{nodes.find((n) => n.id === "me")?.connections.length || 0}</span>
                </div>
              </div>
            </div>
          ) : selectedUser ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={selectedUser.avatar || "/placeholder.svg"}
                  alt={selectedUser.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{selectedUser.meshRole}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Hops:</span>
                  <span className="ml-2 font-medium">{selectedUser.hops}</span>
                </div>
                <div>
                  <span className="text-gray-500">Battery:</span>
                  <span className="ml-2 font-medium">{selectedUser.batteryLevel}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Signal:</span>
                  <div className="ml-2 flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-full ${
                          i < selectedUser.signalStrength ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium ${selectedUser.isOnline ? "text-green-500" : "text-gray-500"}`}>
                    {selectedUser.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
