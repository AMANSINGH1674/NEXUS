import { Platform, PermissionsAndroid } from "react-native"
import { EventEmitter } from "events"
import type { BluetoothDevice, MeshPacket, User } from "../types/mesh-types"

class BluetoothService extends EventEmitter {
  private isInitialized = false
  private isScanning = false
  private connectedDevices: Map<string, BluetoothDevice> = new Map()
  private discoveredDevices: Map<string, BluetoothDevice> = new Map()
  private meshNodes: Map<string, User> = new Map()
  private scanTimer?: NodeJS.Timeout
  private heartbeatTimer?: NodeJS.Timeout

  // Bluetooth UUIDs for mesh networking
  private readonly MESH_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
  private readonly MESH_TX_CHARACTERISTIC = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
  private readonly MESH_RX_CHARACTERISTIC = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

  constructor() {
    super()
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    // Handle device discovery
    this.on("deviceDiscovered", this.handleDeviceDiscovered.bind(this))
    this.on("deviceConnected", this.handleDeviceConnected.bind(this))
    this.on("deviceDisconnected", this.handleDeviceDisconnected.bind(this))
    this.on("dataReceived", this.handleDataReceived.bind(this))
  }

  async initialize(): Promise<boolean> {
    try {
      console.log("Initializing Bluetooth Service...")

      // Request permissions
      const hasPermissions = await this.requestPermissions()
      if (!hasPermissions) {
        throw new Error("Bluetooth permissions not granted")
      }

      // Initialize Bluetooth adapter (simulated for Expo)
      await this.initializeAdapter()

      // Start advertising as a mesh node
      await this.startAdvertising()

      // Start heartbeat
      this.startHeartbeat()

      this.isInitialized = true
      this.emit("initialized")

      console.log("Bluetooth Service initialized successfully")
      return true
    } catch (error) {
      console.error("Failed to initialize Bluetooth Service:", error)
      this.emit("error", error)
      return false
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "android") {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]

        const granted = await PermissionsAndroid.requestMultiple(permissions)

        return Object.values(granted).every((permission) => permission === PermissionsAndroid.RESULTS.GRANTED)
      } catch (error) {
        console.error("Permission request failed:", error)
        return false
      }
    }

    // iOS permissions are handled through Info.plist
    return true
  }

  private async initializeAdapter(): Promise<void> {
    // Simulate Bluetooth adapter initialization
    // In a real implementation, this would initialize the native Bluetooth module
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Bluetooth adapter initialized")
        resolve()
      }, 1000)
    })
  }

  private async startAdvertising(): Promise<void> {
    // Simulate starting BLE advertising
    // In a real implementation, this would start advertising the mesh service
    console.log("Started BLE advertising with mesh service UUID:", this.MESH_SERVICE_UUID)
    this.emit("advertisingStarted")
  }

  async startScanning(): Promise<void> {
    if (this.isScanning) {
      console.log("Already scanning")
      return
    }

    if (!this.isInitialized) {
      throw new Error("Bluetooth service not initialized")
    }

    console.log("Starting BLE scan for mesh devices...")
    this.isScanning = true
    this.emit("scanStarted")

    // Simulate device discovery
    this.simulateDeviceDiscovery()

    // Auto-stop scanning after 30 seconds
    this.scanTimer = setTimeout(() => {
      this.stopScanning()
    }, 30000)
  }

  async stopScanning(): Promise<void> {
    if (!this.isScanning) {
      return
    }

    console.log("Stopping BLE scan")
    this.isScanning = false

    if (this.scanTimer) {
      clearTimeout(this.scanTimer)
      this.scanTimer = undefined
    }

    this.emit("scanStopped")
  }

  private simulateDeviceDiscovery(): void {
    // Start with empty discovery - devices will be added through actual scanning
    // Remove the automatic mock device generation
    console.log("Starting device discovery scan...")

    // In a real implementation, this would trigger actual BLE scanning
    // For now, we'll emit that scanning has started but no devices found initially
    this.emit("scanStarted")
  }

  private handleDeviceDiscovered(device: BluetoothDevice): void {
    console.log("Device discovered:", device.name, device.address)

    // Convert to mesh node
    const meshNode: User = {
      id: device.id,
      name: device.name,
      avatar: `https://via.placeholder.com/40?text=${device.name.charAt(0)}`,
      deviceId: device.address,
      isOnline: true,
      lastSeen: new Date(),
      batteryLevel: Math.floor(Math.random() * 100),
      signalStrength: this.rssiToSignalStrength(device.rssi),
      hops: 1,
      publicKey: `pk_${device.id}`,
      meshRole: this.determineMeshRole(device.rssi),
    }

    this.meshNodes.set(device.id, meshNode)
    this.emit("meshNodeDiscovered", meshNode)

    // Auto-connect to strong signal devices
    if (device.rssi > -60) {
      setTimeout(() => {
        this.connectToDevice(device.id)
      }, 1000)
    }
  }

  private rssiToSignalStrength(rssi: number): number {
    // Convert RSSI to signal strength (1-5 bars)
    if (rssi > -50) return 5
    if (rssi > -60) return 4
    if (rssi > -70) return 3
    if (rssi > -80) return 2
    return 1
  }

  private determineMeshRole(rssi: number): "relay" | "node" | "edge" | "coordinator" {
    if (rssi > -50) return "relay"
    if (rssi > -70) return "node"
    return "edge"
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    const device = this.discoveredDevices.get(deviceId)
    if (!device) {
      console.error("Device not found:", deviceId)
      return false
    }

    try {
      console.log("Connecting to device:", device.name)

      // Simulate connection process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      device.isConnected = true
      this.connectedDevices.set(deviceId, device)

      this.emit("deviceConnected", device)
      console.log("Connected to device:", device.name)

      // Start data exchange
      this.startDataExchange(deviceId)

      return true
    } catch (error) {
      console.error("Failed to connect to device:", error)
      this.emit("connectionError", { deviceId, error })
      return false
    }
  }

  async disconnectFromDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId)
    if (!device) {
      return
    }

    try {
      console.log("Disconnecting from device:", device.name)

      device.isConnected = false
      this.connectedDevices.delete(deviceId)

      // Update mesh node status
      const meshNode = this.meshNodes.get(deviceId)
      if (meshNode) {
        meshNode.isOnline = false
        meshNode.lastSeen = new Date()
      }

      this.emit("deviceDisconnected", device)
    } catch (error) {
      console.error("Failed to disconnect from device:", error)
    }
  }

  private startDataExchange(deviceId: string): void {
    // Simulate periodic data exchange
    const interval = setInterval(() => {
      if (!this.connectedDevices.has(deviceId)) {
        clearInterval(interval)
        return
      }

      // Send heartbeat
      this.sendHeartbeat(deviceId)

      // Simulate receiving data
      if (Math.random() > 0.7) {
        this.simulateDataReceived(deviceId)
      }
    }, 5000)
  }

  private sendHeartbeat(deviceId: string): void {
    const packet: MeshPacket = {
      id: `heartbeat_${Date.now()}`,
      type: "heartbeat",
      source: "self",
      destination: deviceId,
      payload: {
        timestamp: new Date(),
        batteryLevel: 85,
        nodeCount: this.meshNodes.size,
      },
      ttl: 3,
      hops: 0,
      timestamp: new Date(),
    }

    this.sendPacket(deviceId, packet)
  }

  private simulateDataReceived(deviceId: string): void {
    const mockMessages = [
      "Hello from the mesh network!",
      "Testing mesh connectivity",
      "Emergency broadcast test",
      "Location update received",
    ]

    const packet: MeshPacket = {
      id: `msg_${Date.now()}`,
      type: "message",
      source: deviceId,
      destination: "self",
      payload: {
        content: mockMessages[Math.floor(Math.random() * mockMessages.length)],
        type: "text",
        encrypted: true,
      },
      ttl: 5,
      hops: Math.floor(Math.random() * 3) + 1,
      timestamp: new Date(),
    }

    this.handleDataReceived(packet)
  }

  private handleDeviceConnected(device: BluetoothDevice): void {
    console.log("Device connected:", device.name)
    this.emit("meshNetworkUpdated", this.getMeshNetworkStatus())
  }

  private handleDeviceDisconnected(device: BluetoothDevice): void {
    console.log("Device disconnected:", device.name)
    this.emit("meshNetworkUpdated", this.getMeshNetworkStatus())
  }

  private handleDataReceived(packet: MeshPacket): void {
    console.log("Data received:", packet.type, "from", packet.source)

    switch (packet.type) {
      case "message":
        this.emit("messageReceived", packet)
        break
      case "heartbeat":
        this.updateNodeStatus(packet.source, packet.payload)
        break
      case "discovery":
        this.handleDiscoveryPacket(packet)
        break
      default:
        console.log("Unknown packet type:", packet.type)
    }
  }

  private updateNodeStatus(nodeId: string, status: any): void {
    const node = this.meshNodes.get(nodeId)
    if (node) {
      node.lastSeen = new Date()
      node.batteryLevel = status.batteryLevel || node.batteryLevel
      this.emit("nodeStatusUpdated", node)
    }
  }

  private handleDiscoveryPacket(packet: MeshPacket): void {
    // Handle mesh network discovery
    console.log("Discovery packet received from:", packet.source)
  }

  async sendMessage(message: string, targetDeviceId?: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Bluetooth service not initialized")
    }

    const packet: MeshPacket = {
      id: `msg_${Date.now()}`,
      type: "message",
      source: "self",
      destination: targetDeviceId || "broadcast",
      payload: {
        content: message,
        type: "text",
        encrypted: true,
        timestamp: new Date(),
      },
      ttl: 10,
      hops: 0,
      timestamp: new Date(),
    }

    if (targetDeviceId) {
      return this.sendPacket(targetDeviceId, packet)
    } else {
      return this.broadcastPacket(packet)
    }
  }

  private async sendPacket(deviceId: string, packet: MeshPacket): Promise<boolean> {
    const device = this.connectedDevices.get(deviceId)
    if (!device) {
      console.error("Device not connected:", deviceId)
      return false
    }

    try {
      // Simulate sending data via BLE characteristic
      console.log("Sending packet to", device.name, ":", packet.type)

      // In a real implementation, this would write to the BLE characteristic
      await new Promise((resolve) => setTimeout(resolve, 100))

      this.emit("packetSent", { deviceId, packet })
      return true
    } catch (error) {
      console.error("Failed to send packet:", error)
      return false
    }
  }

  private async broadcastPacket(packet: MeshPacket): Promise<boolean> {
    const connectedDeviceIds = Array.from(this.connectedDevices.keys())

    if (connectedDeviceIds.length === 0) {
      console.warn("No connected devices for broadcast")
      return false
    }

    const results = await Promise.all(connectedDeviceIds.map((deviceId) => this.sendPacket(deviceId, packet)))

    return results.some((result) => result)
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.connectedDevices.forEach((_, deviceId) => {
        this.sendHeartbeat(deviceId)
      })
    }, 10000) // Send heartbeat every 10 seconds
  }

  getMeshNetworkStatus() {
    const connectedNodes = Array.from(this.meshNodes.values()).filter((node) => node.isOnline)

    return {
      isActive: this.isInitialized && this.meshNodes.size > 0,
      nodeCount: this.meshNodes.size,
      connectedNodes: connectedNodes.length,
      networkHealth: this.calculateNetworkHealth(),
      batteryOptimized: true,
      emergencyMode: false,
      encryptionEnabled: true,
      meshDensity: this.calculateMeshDensity(),
    }
  }

  private calculateNetworkHealth(): number {
    const totalNodes = this.meshNodes.size
    if (totalNodes === 0) return 0

    const onlineNodes = Array.from(this.meshNodes.values()).filter((node) => node.isOnline).length
    return Math.round((onlineNodes / totalNodes) * 100)
  }

  private calculateMeshDensity(): "sparse" | "optimal" | "dense" {
    const nodeCount = this.meshNodes.size
    if (nodeCount < 3) return "sparse"
    if (nodeCount < 10) return "optimal"
    return "dense"
  }

  getConnectedDevices(): BluetoothDevice[] {
    return Array.from(this.connectedDevices.values())
  }

  getDiscoveredDevices(): BluetoothDevice[] {
    return Array.from(this.discoveredDevices.values())
  }

  getMeshNodes(): User[] {
    return Array.from(this.meshNodes.values())
  }

  async shutdown(): Promise<void> {
    console.log("Shutting down Bluetooth Service...")

    // Stop scanning
    await this.stopScanning()

    // Disconnect all devices
    const disconnectPromises = Array.from(this.connectedDevices.keys()).map((deviceId) =>
      this.disconnectFromDevice(deviceId),
    )
    await Promise.all(disconnectPromises)

    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }

    // Clear data
    this.connectedDevices.clear()
    this.discoveredDevices.clear()
    this.meshNodes.clear()

    this.isInitialized = false
    this.emit("shutdown")

    console.log("Bluetooth Service shutdown complete")
  }
}

export default new BluetoothService()
