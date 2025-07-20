export interface User {
  id: string
  name: string
  avatar: string
  deviceId: string
  isOnline: boolean
  lastSeen: Date
  batteryLevel: number
  signalStrength: number
  hops: number
  publicKey: string
  meshRole: "relay" | "node" | "edge" | "coordinator"
}

export interface Message {
  id: string
  content: string
  type: "text" | "image" | "file" | "emergency"
  senderId: string
  timestamp: Date
  status: "sending" | "sent" | "relayed" | "delivered" | "failed"
  hops: number
  ttl: number
  routePath: string[]
  encrypted: boolean
  priority: "low" | "normal" | "high" | "emergency"
}

export interface Chat {
  id: string
  type: "private" | "group" | "emergency"
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  participants: string[]
  isEncrypted: boolean
  meshRoute: string[]
}

export interface Group {
  id: string
  name: string
  avatar: string
  description: string
  participants: string[]
  admins: string[]
  createdAt: Date
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isActive: boolean
  encryptionKey: string
  meshBroadcast: boolean
}

export interface NetworkNode {
  id: string
  deviceId: string
  name: string
  position: { x: number; y: number }
  connections: string[]
  batteryLevel: number
  signalStrength: number
  role: "relay" | "node" | "edge" | "coordinator"
  isOnline: boolean
  lastSeen: Date
}

export interface MeshStatus {
  isActive: boolean
  nodeCount: number
  connectedNodes: number
  networkHealth: number
  batteryOptimized: boolean
  emergencyMode: boolean
  encryptionEnabled: boolean
  meshDensity: "sparse" | "optimal" | "dense"
}

export interface SecuritySettings {
  encryptionEnabled: boolean
  keyRotationInterval: number
  forwardSecrecy: boolean
  quantumResistant: boolean
  deviceAuthentication: boolean
  messageAuthentication: boolean
  replayProtection: boolean
}

export interface PowerSettings {
  mode: "performance" | "balanced" | "battery_saver" | "emergency"
  scanInterval: number
  advertisingInterval: number
  connectionTimeout: number
  maxHops: number
  backgroundSync: boolean
}

export interface BluetoothDevice {
  id: string
  name: string
  address: string
  rssi: number
  isConnected: boolean
  services: string[]
  characteristics: BluetoothCharacteristic[]
}

export interface BluetoothCharacteristic {
  uuid: string
  properties: string[]
  value?: string
}

export interface MeshPacket {
  id: string
  type: "message" | "discovery" | "heartbeat" | "route_request" | "route_reply"
  source: string
  destination: string
  payload: any
  ttl: number
  hops: number
  timestamp: Date
  signature?: string
}
