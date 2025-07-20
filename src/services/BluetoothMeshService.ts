import { Platform, PermissionsAndroid } from "react-native";
import { EventEmitter } from "events";
import { BleManager, Device, Characteristic, State } from "react-native-ble-plx";
import { Buffer } from "buffer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BluetoothDevice, MeshPacket, User, Message } from "../types/mesh-types";
import { encrypt, decrypt, generateKeyPair, deriveSharedSecret } from "../utils/encryption";

class BluetoothMeshService extends EventEmitter {
  private manager: BleManager;
  private isInitialized = false;
  private isScanning = false;
  private connectedDevices: Map<string, Device> = new Map();
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();
  private meshNodes: Map<string, User> = new Map();
  private messageCache: Map<string, Message> = new Map();
  private scanTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;
  private deviceKeyMap: Map<string, string> = new Map(); // Maps device IDs to their public keys
  private localKeyPair: { publicKey: string; privateKey: string } | null = null;

  // Bluetooth UUIDs for mesh networking
  private readonly MESH_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  private readonly MESH_TX_CHARACTERISTIC = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
  private readonly MESH_RX_CHARACTERISTIC = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
  
  // Power management settings
  private powerSettings = {
    mode: "balanced" as "performance" | "balanced" | "battery_saver" | "emergency",
    scanInterval: 10000, // 10 seconds in normal mode
    advertisingInterval: 1000, // 1 second in normal mode
    connectionTimeout: 5000, // 5 seconds
    maxHops: 5,
    backgroundSync: true
  };

  constructor() {
    super();
    this.manager = new BleManager();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle device discovery
    this.on("deviceDiscovered", this.handleDeviceDiscovered.bind(this));
    this.on("deviceConnected", this.handleDeviceConnected.bind(this));
    this.on("deviceDisconnected", this.handleDeviceDisconnected.bind(this));
    this.on("dataReceived", this.handleDataReceived.bind(this));
    
    // Handle state changes
    this.manager.onStateChange((state) => {
      if (state === State.PoweredOn) {
        this.emit("bluetoothEnabled");
      } else if (state === State.PoweredOff) {
        this.emit("bluetoothDisabled");
      }
    }, true);
  }

  async initialize(): Promise<boolean> {
    try {
      console.log("Initializing Bluetooth Mesh Service...");

      // Load or generate keypair
      await this.initializeKeyPair();

      // Request permissions
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error("Bluetooth permissions not granted");
      }

      // Wait for Bluetooth to be ready
      const state = await this.manager.state();
      if (state !== State.PoweredOn) {
        console.log("Bluetooth is not powered on, current state:", state);
        this.emit("bluetoothNotReady", state);
        return false;
      }

      // Start advertising as a mesh node
      await this.startAdvertising();

      // Start heartbeat
      this.startHeartbeat();

      // Start periodic scanning based on power settings
      this.startPeriodicScanning();

      this.isInitialized = true;
      this.emit("initialized");

      console.log("Bluetooth Mesh Service initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize Bluetooth Mesh Service:", error);
      this.emit("error", error);
      return false;
    }
  }

  private async initializeKeyPair(): Promise<void> {
    try {
      // Try to load existing keypair
      const storedKeyPair = await AsyncStorage.getItem("meshKeyPair");
      
      if (storedKeyPair) {
        this.localKeyPair = JSON.parse(storedKeyPair);
        console.log("Loaded existing keypair");
      } else {
        // Generate new keypair
        this.localKeyPair = await generateKeyPair();
        // Store keypair securely
        await AsyncStorage.setItem("meshKeyPair", JSON.stringify(this.localKeyPair));
        console.log("Generated and stored new keypair");
      }
    } catch (error) {
      console.error("Error initializing keypair:", error);
      // Generate a new keypair as fallback
      this.localKeyPair = await generateKeyPair();
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "android") {
      try {
        const apiLevel = parseInt(Platform.Version.toString(), 10);
        
        // For Android 12+ (API level 31+)
        if (apiLevel >= 31) {
          const permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];

          const granted = await PermissionsAndroid.requestMultiple(permissions);
          return Object.values(granted).every(
            (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
          );
        } 
        // For Android 10+ (API level 29+)
        else if (apiLevel >= 29) {
          const fineLocationGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "Bluetooth requires location permission",
              buttonPositive: "OK",
            }
          );
          return fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED;
        } 
        // For older Android versions
        else {
          const coarseLocationGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
              title: "Location Permission",
              message: "Bluetooth requires location permission",
              buttonPositive: "OK",
            }
          );
          return coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (error) {
        console.error("Permission request failed:", error);
        return false;
      }
    }

    // iOS permissions are handled through Info.plist
    return true;
  }

  private async startAdvertising(): Promise<void> {
    // Note: React Native BLE PLX doesn't directly support advertising
    // In a real implementation, you would use a native module bridge
    // For now, we'll simulate advertising
    console.log("Started BLE advertising with mesh service UUID:", this.MESH_SERVICE_UUID);
    this.emit("advertisingStarted");
  }

  async startScanning(): Promise<void> {
    if (this.isScanning) {
      console.log("Already scanning");
      return;
    }

    if (!this.isInitialized) {
      throw new Error("Bluetooth service not initialized");
    }

    console.log("Starting BLE scan for mesh devices...");
    this.isScanning = true;
    this.emit("scanStarted");

    try {
      // Scan for devices with our mesh service UUID
      this.manager.startDeviceScan(
        [this.MESH_SERVICE_UUID], 
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error("Scan error:", error);
            this.emit("scanError", error);
            return;
          }

          if (device && this.isValidMeshDevice(device)) {
            const bleDevice: BluetoothDevice = {
              id: device.id,
              name: device.name || "Unknown Device",
              address: device.id,
              rssi: device.rssi || -100,
              isConnected: false,
              services: [],
              characteristics: []
            };
            
            this.discoveredDevices.set(device.id, bleDevice);
            this.emit("deviceDiscovered", bleDevice);
          }
        }
      );

      // Auto-stop scanning after scan interval based on power mode
      const scanDuration = this.getScanDuration();
      this.scanTimer = setTimeout(() => {
        this.stopScanning();
      }, scanDuration);
    } catch (error) {
      console.error("Failed to start scanning:", error);
      this.isScanning = false;
      this.emit("error", error);
    }
  }

  private getScanDuration(): number {
    switch (this.powerSettings.mode) {
      case "performance": return 10000; // 10 seconds
      case "balanced": return 5000;     // 5 seconds
      case "battery_saver": return 3000; // 3 seconds
      case "emergency": return 30000;   // 30 seconds (extended in emergency)
      default: return 5000;
    }
  }

  private isValidMeshDevice(device: Device): boolean {
    // Check if the device has a name and reasonable signal strength
    if (!device.name) return false;
    if (device.rssi && device.rssi < -90) return false; // Very weak signal
    
    // Additional validation could check for specific manufacturer data
    // that identifies our mesh devices
    return true;
  }

  async stopScanning(): Promise<void> {
    if (!this.isScanning) {
      return;
    }

    console.log("Stopping BLE scan");
    this.manager.stopDeviceScan();
    this.isScanning = false;

    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = undefined;
    }

    this.emit("scanStopped");
  }

  private startPeriodicScanning(): void {
    // Start periodic scanning based on power settings
    setInterval(() => {
      if (!this.isScanning && this.isInitialized) {
        this.startScanning();
      }
    }, this.powerSettings.scanInterval);
  }

  private handleDeviceDiscovered(device: BluetoothDevice): void {
    console.log("Device discovered:", device.name, device.address);

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
      publicKey: `pk_${device.id}`, // Will be updated with actual key during connection
      meshRole: this.determineMeshRole(device.rssi),
    };

    this.meshNodes.set(device.id, meshNode);
    this.emit("meshNodeDiscovered", meshNode);

    // Auto-connect to strong signal devices
    if (device.rssi > -70) {
      setTimeout(() => {
        this.connectToDevice(device.id);
      }, 1000);
    }
  }

  private rssiToSignalStrength(rssi: number): number {
    // Convert RSSI to signal strength (1-5 bars)
    if (rssi > -50) return 5;
    if (rssi > -60) return 4;
    if (rssi > -70) return 3;
    if (rssi > -80) return 2;
    return 1;
  }

  private determineMeshRole(rssi: number): "relay" | "node" | "edge" | "coordinator" {
    if (rssi > -50) return "relay";
    if (rssi > -70) return "node";
    return "edge";
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    const bleDevice = this.discoveredDevices.get(deviceId);
    if (!bleDevice) {
      console.error("Device not found:", deviceId);
      return false;
    }

    try {
      console.log("Connecting to device:", bleDevice.name);

      // Find the actual BLE device from the manager
      const device = await this.manager.connectToDevice(deviceId, {
        timeout: this.powerSettings.connectionTimeout
      });
      
      console.log("Connected, discovering services...");
      await device.discoverAllServicesAndCharacteristics();
      
      // Get services and characteristics
      const services = await device.services();
      bleDevice.services = services.map(service => service.uuid);
      
      // Find our mesh service
      const meshService = services.find(service => service.uuid === this.MESH_SERVICE_UUID);
      if (!meshService) {
        console.error("Mesh service not found on device");
        await device.cancelConnection();
        return false;
      }
      
      // Get characteristics for our service
      const characteristics = await device.characteristicsForService(this.MESH_SERVICE_UUID);
      bleDevice.characteristics = characteristics.map(char => ({
        uuid: char.uuid,
        properties: this.getCharacteristicProperties(char)
      }));
      
      // Set up notification for receiving data
      const rxChar = characteristics.find(c => c.uuid === this.MESH_RX_CHARACTERISTIC);
      if (rxChar) {
        await device.monitorCharacteristicForService(
          this.MESH_SERVICE_UUID,
          this.MESH_RX_CHARACTERISTIC,
          (error, characteristic) => {
            if (error) {
              console.error("Notification error:", error);
              return;
            }
            
            if (characteristic?.value) {
              this.processReceivedData(deviceId, characteristic.value);
            }
          }
        );
      }

      // Exchange keys
      await this.exchangeKeys(device, deviceId);
      
      // Update device status
      bleDevice.isConnected = true;
      this.connectedDevices.set(deviceId, device);
      
      // Set up disconnect listener
      device.onDisconnected((error, disconnectedDevice) => {
        this.handleDisconnection(deviceId, error);
      });

      this.emit("deviceConnected", bleDevice);
      console.log("Connected to device:", bleDevice.name);

      // Send initial data
      await this.sendNodeInfo(deviceId);

      return true;
    } catch (error) {
      console.error("Failed to connect to device:", error);
      this.emit("connectionError", { deviceId, error });
      return false;
    }
  }

  private getCharacteristicProperties(characteristic: Characteristic): string[] {
    const properties = [];
    if (characteristic.isReadable) properties.push("read");
    if (characteristic.isWritableWithResponse) properties.push("write");
    if (characteristic.isWritableWithoutResponse) properties.push("write-no-response");
    if (characteristic.isNotifiable) properties.push("notify");
    if (characteristic.isIndicatable) properties.push("indicate");
    return properties;
  }

  private async exchangeKeys(device: Device, deviceId: string): Promise<void> {
    try {
      if (!this.localKeyPair) {
        throw new Error("Local keypair not initialized");
      }
      
      // Send our public key
      const keyPacket: MeshPacket = {
        id: `key_${Date.now()}`,
        type: "discovery",
        source: "self",
        destination: deviceId,
        payload: {
          publicKey: this.localKeyPair.publicKey,
          timestamp: new Date()
        },
        ttl: 1,
        hops: 0,
        timestamp: new Date()
      };
      
      await this.writePacketToDevice(device, keyPacket);
      
      console.log("Public key sent to device:", deviceId);
    } catch (error) {
      console.error("Failed to exchange keys:", error);
    }
  }

  private async sendNodeInfo(deviceId: string): Promise<void> {
    try {
      const device = this.connectedDevices.get(deviceId);
      if (!device) return;
      
      // Get local node info
      const nodeInfoPacket: MeshPacket = {
        id: `info_${Date.now()}`,
        type: "discovery",
        source: "self",
        destination: deviceId,
        payload: {
          nodeCount: this.meshNodes.size,
          connectedNodes: this.connectedDevices.size,
          batteryLevel: 85, // Would come from device battery API
          timestamp: new Date()
        },
        ttl: 1,
        hops: 0,
        timestamp: new Date()
      };
      
      await this.writePacketToDevice(device, nodeInfoPacket);
    } catch (error) {
      console.error("Failed to send node info:", error);
    }
  }

  private async writePacketToDevice(device: Device, packet: MeshPacket): Promise<void> {
    try {
      // Serialize packet to JSON
      const packetString = JSON.stringify(packet);
      
      // Convert to Base64 for BLE transmission
      const base64Data = Buffer.from(packetString).toString('base64');
      
      // Write to characteristic
      await device.writeCharacteristicWithResponseForService(
        this.MESH_SERVICE_UUID,
        this.MESH_TX_CHARACTERISTIC,
        base64Data
      );
    } catch (error) {
      console.error("Failed to write packet to device:", error);
      throw error;
    }
  }

  private processReceivedData(deviceId: string, base64Data: string): void {
    try {
      // Convert from Base64
      const jsonString = Buffer.from(base64Data, 'base64').toString('utf8');
      
      // Parse packet
      const packet: MeshPacket = JSON.parse(jsonString);
      
      // Process the packet
      this.handleDataReceived(packet);
      
      // Relay packet if needed (multi-hop)
      if (packet.ttl > 1 && packet.destination !== "self") {
        this.relayPacket(packet, deviceId);
      }
    } catch (error) {
      console.error("Error processing received data:", error);
    }
  }

  private async relayPacket(packet: MeshPacket, sourceDeviceId: string): Promise<void> {
    // Don't relay if TTL is exhausted
    if (packet.ttl <= 1) return;
    
    // Don't relay our own packets
    if (packet.source === "self") return;
    
    // Create a new packet with decremented TTL and incremented hops
    const relayPacket: MeshPacket = {
      ...packet,
      ttl: packet.ttl - 1,
      hops: packet.hops + 1
    };
    
    // Get all connected devices except the source
    const targetDevices = Array.from(this.connectedDevices.entries())
      .filter(([id, _]) => id !== sourceDeviceId);
    
    // Relay to all other connected devices
    for (const [id, device] of targetDevices) {
      try {
        await this.writePacketToDevice(device, relayPacket);
        console.log(`Relayed packet from ${packet.source} to ${id}`);
      } catch (error) {
        console.error(`Failed to relay packet to ${id}:`, error);
      }
    }
  }

  private handleDisconnection(deviceId: string, error?: any): void {
    const bleDevice = this.discoveredDevices.get(deviceId);
    if (bleDevice) {
      bleDevice.isConnected = false;
      this.connectedDevices.delete(deviceId);
      
      // Update mesh node status
      const meshNode = this.meshNodes.get(deviceId);
      if (meshNode) {
        meshNode.isOnline = false;
        meshNode.lastSeen = new Date();
      }
      
      this.emit("deviceDisconnected", bleDevice);
      console.log("Device disconnected:", bleDevice.name, error ? `Error: ${error.message}` : "");
      
      // Try to reconnect if appropriate
      this.scheduleReconnect(deviceId);
    }
  }

  private scheduleReconnect(deviceId: string): void {
    // Only try to reconnect to important nodes
    const node = this.meshNodes.get(deviceId);
    if (!node || node.meshRole === "edge") return;
    
    // Schedule reconnection attempt
    this.reconnectTimer = setTimeout(() => {
      console.log("Attempting to reconnect to device:", deviceId);
      this.connectToDevice(deviceId);
    }, 5000);
  }

  async disconnectFromDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      return;
    }

    try {
      console.log("Disconnecting from device:", deviceId);
      await device.cancelConnection();
      // The rest will be handled by the disconnect handler
    } catch (error) {
      console.error("Failed to disconnect from device:", error);
    }
  }

  private handleDeviceConnected(device: BluetoothDevice): void {
    console.log("Device connected:", device.name);
    this.emit("meshNetworkUpdated", this.getMeshNetworkStatus());
  }

  private handleDeviceDisconnected(device: BluetoothDevice): void {
    console.log("Device disconnected:", device.name);
    this.emit("meshNetworkUpdated", this.getMeshNetworkStatus());
  }

  private handleDataReceived(packet: MeshPacket): void {
    console.log("Data received:", packet.type, "from", packet.source);

    switch (packet.type) {
      case "message":
        this.handleMessagePacket(packet);
        break;
      case "heartbeat":
        this.updateNodeStatus(packet.source, packet.payload);
        break;
      case "discovery":
        this.handleDiscoveryPacket(packet);
        break;
      case "route_request":
        this.handleRouteRequest(packet);
        break;
      case "route_reply":
        this.handleRouteReply(packet);
        break;
      default:
        console.log("Unknown packet type:", packet.type);
    }
  }

  private handleMessagePacket(packet: MeshPacket): void {
    // Process message packet
    if (packet.payload.encrypted && packet.source !== "self") {
      // Decrypt message if we have the key
      const senderPublicKey = this.deviceKeyMap.get(packet.source);
      if (senderPublicKey && this.localKeyPair) {
        try {
          const sharedSecret = deriveSharedSecret(this.localKeyPair.privateKey, senderPublicKey);
          packet.payload.content = decrypt(packet.payload.content, sharedSecret);
        } catch (error) {
          console.error("Failed to decrypt message:", error);
        }
      }
    }
    
    // Create message object
    const message: Message = {
      id: packet.id,
      content: packet.payload.content,
      type: packet.payload.type || "text",
      senderId: packet.source,
      timestamp: new Date(packet.timestamp),
      status: "delivered",
      hops: packet.hops,
      ttl: packet.ttl,
      routePath: packet.payload.routePath || [],
      encrypted: packet.payload.encrypted || false,
      priority: packet.payload.priority || "normal"
    };
    
    // Cache message to prevent duplicates
    if (!this.messageCache.has(message.id)) {
      this.messageCache.set(message.id, message);
      this.emit("messageReceived", message);
    }
  }

  private updateNodeStatus(nodeId: string, status: any): void {
    const node = this.meshNodes.get(nodeId);
    if (node) {
      node.lastSeen = new Date();
      node.batteryLevel = status.batteryLevel || node.batteryLevel;
      node.isOnline = true;
      this.emit("nodeStatusUpdated", node);
    }
  }

  private handleDiscoveryPacket(packet: MeshPacket): void {
    // Handle mesh network discovery
    console.log("Discovery packet received from:", packet.source);
    
    // If this contains a public key, store it
    if (packet.payload.publicKey) {
      this.deviceKeyMap.set(packet.source, packet.payload.publicKey);
      console.log("Stored public key for device:", packet.source);
    }
    
    // Update node information if available
    if (packet.payload.nodeCount || packet.payload.batteryLevel) {
      this.updateNodeStatus(packet.source, packet.payload);
    }
  }

  private handleRouteRequest(packet: MeshPacket): void {
    // Handle route discovery request
    console.log("Route request received for destination:", packet.destination);
    
    // Check if we know the destination
    if (this.meshNodes.has(packet.destination) || packet.destination === "self") {
      // We know the destination, send route reply
      const replyPacket: MeshPacket = {
        id: `route_${Date.now()}`,
        type: "route_reply",
        source: "self",
        destination: packet.source,
        payload: {
          originalDestination: packet.destination,
          route: [...(packet.payload.route || []), "self"]
        },
        ttl: this.powerSettings.maxHops,
        hops: 0,
        timestamp: new Date()
      };
      
      // Send reply through the mesh
      this.broadcastPacket(replyPacket);
    } else {
      // We don't know the destination, relay the request
      // Add ourselves to the route
      const updatedRoute = [...(packet.payload.route || []), "self"];
      const relayPacket: MeshPacket = {
        ...packet,
        payload: {
          ...packet.payload,
          route: updatedRoute
        }
      };
      
      // Relay the request
      this.broadcastPacket(relayPacket);
    }
  }

  private handleRouteReply(packet: MeshPacket): void {
    // Handle route reply
    console.log("Route reply received for destination:", packet.payload.originalDestination);
    
    // Store the route for future use
    if (packet.payload.originalDestination && packet.payload.route) {
      // Emit route discovered event
      this.emit("routeDiscovered", {
        destination: packet.payload.originalDestination,
        route: packet.payload.route
      });
    }
  }

  private sendHeartbeat(deviceId: string): void {
    const device = this.connectedDevices.get(deviceId);
    if (!device) return;
    
    const packet: MeshPacket = {
      id: `heartbeat_${Date.now()}`,
      type: "heartbeat",
      source: "self",
      destination: deviceId,
      payload: {
        timestamp: new Date(),
        batteryLevel: 85, // Would come from device battery API
        nodeCount: this.meshNodes.size,
      },
      ttl: 1, // Heartbeats don't get relayed
      hops: 0,
      timestamp: new Date(),
    };

    this.writePacketToDevice(device, packet).catch(error => {
      console.error("Failed to send heartbeat:", error);
    });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.connectedDevices.forEach((device, deviceId) => {
        this.sendHeartbeat(deviceId);
      });
    }, 10000); // Send heartbeat every 10 seconds
  }

  async sendMessage(message: string, targetDeviceId?: string, priority: "low" | "normal" | "high" | "emergency" = "normal"): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Bluetooth service not initialized");
    }

    // Create message ID
    const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Determine TTL based on priority
    let ttl = this.powerSettings.maxHops;
    if (priority === "emergency") ttl = 10; // Higher TTL for emergency messages
    if (priority === "low") ttl = 3;        // Lower TTL for low priority
    
    // Encrypt message if we have the target's public key
    let encryptedContent = message;
    let isEncrypted = false;
    
    if (targetDeviceId && targetDeviceId !== "broadcast") {
      const targetPublicKey = this.deviceKeyMap.get(targetDeviceId);
      if (targetPublicKey && this.localKeyPair) {
        try {
          const sharedSecret = deriveSharedSecret(this.localKeyPair.privateKey, targetPublicKey);
          encryptedContent = encrypt(message, sharedSecret);
          isEncrypted = true;
        } catch (error) {
          console.error("Failed to encrypt message:", error);
        }
      }
    }

    const packet: MeshPacket = {
      id: messageId,
      type: "message",
      source: "self",
      destination: targetDeviceId || "broadcast",
      payload: {
        content: encryptedContent,
        type: "text",
        encrypted: isEncrypted,
        timestamp: new Date(),
        priority: priority
      },
      ttl: ttl,
      hops: 0,
      timestamp: new Date(),
    };

    // Create local message object for UI
    const message_obj: Message = {
      id: messageId,
      content: message, // Store unencrypted version locally
      type: "text",
      senderId: "self",
      timestamp: new Date(),
      status: "sending",
      hops: 0,
      ttl: ttl,
      routePath: [],
      encrypted: isEncrypted,
      priority: priority
    };
    
    // Emit message sent event before actual sending
    this.emit("messageSending", message_obj);

    if (targetDeviceId && targetDeviceId !== "broadcast") {
      const success = await this.sendPacket(targetDeviceId, packet);
      
      // Update message status
      message_obj.status = success ? "sent" : "failed";
      this.emit("messageStatusUpdated", message_obj);
      
      return success;
    } else {
      const success = await this.broadcastPacket(packet);
      
      // Update message status
      message_obj.status = success ? "sent" : "failed";
      this.emit("messageStatusUpdated", message_obj);
      
      return success;
    }
  }

  private async sendPacket(deviceId: string, packet: MeshPacket): Promise<boolean> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      console.error("Device not connected:", deviceId);
      return false;
    }

    try {
      await this.writePacketToDevice(device, packet);
      this.emit("packetSent", { deviceId, packet });
      return true;
    } catch (error) {
      console.error("Failed to send packet:", error);
      return false;
    }
  }

  private async broadcastPacket(packet: MeshPacket): Promise<boolean> {
    const connectedDeviceIds = Array.from(this.connectedDevices.keys());

    if (connectedDeviceIds.length === 0) {
      console.warn("No connected devices for broadcast");
      return false;
    }

    const results = await Promise.all(
      connectedDeviceIds.map((deviceId) => this.sendPacket(deviceId, packet))
    );

    return results.some((result) => result);
  }

  async sendEmergencyBroadcast(message: string): Promise<boolean> {
    // Temporarily boost advertising and scanning in emergency mode
    this.setPowerMode("emergency");
    
    // Create emergency message
    const success = await this.sendMessage(message, "broadcast", "emergency");
    
    // Reset power mode after 5 minutes
    setTimeout(() => {
      this.setPowerMode("balanced");
    }, 5 * 60 * 1000);
    
    return success;
  }

  setPowerMode(mode: "performance" | "balanced" | "battery_saver" | "emergency"): void {
    this.powerSettings.mode = mode;
    
    // Adjust scan and advertising intervals based on mode
    switch (mode) {
      case "performance":
        this.powerSettings.scanInterval = 5000;       // 5 seconds
        this.powerSettings.advertisingInterval = 500; // 0.5 seconds
        break;
      case "balanced":
        this.powerSettings.scanInterval = 10000;      // 10 seconds
        this.powerSettings.advertisingInterval = 1000; // 1 second
        break;
      case "battery_saver":
        this.powerSettings.scanInterval = 30000;      // 30 seconds
        this.powerSettings.advertisingInterval = 3000; // 3 seconds
        break;
      case "emergency":
        this.powerSettings.scanInterval = 3000;       // 3 seconds
        this.powerSettings.advertisingInterval = 300;  // 0.3 seconds
        break;
    }
    
    console.log(`Power mode set to ${mode}`);
    this.emit("powerModeChanged", mode);
  }

  getMeshNetworkStatus() {
    const connectedNodes = Array.from(this.meshNodes.values()).filter((node) => node.isOnline);

    return {
      isActive: this.isInitialized && this.meshNodes.size > 0,
      nodeCount: this.meshNodes.size,
      connectedNodes: connectedNodes.length,
      networkHealth: this.calculateNetworkHealth(),
      batteryOptimized: this.powerSettings.mode === "battery_saver",
      emergencyMode: this.powerSettings.mode === "emergency",
      encryptionEnabled: true,
      meshDensity: this.calculateMeshDensity(),
    };
  }

  private calculateNetworkHealth(): number {
    const totalNodes = this.meshNodes.size;
    if (totalNodes === 0) return 0;

    const onlineNodes = Array.from(this.meshNodes.values()).filter((node) => node.isOnline).length;
    return Math.round((onlineNodes / totalNodes) * 100);
  }

  private calculateMeshDensity(): "sparse" | "optimal" | "dense" {
    const nodeCount = this.meshNodes.size;
    if (nodeCount < 3) return "sparse";
    if (nodeCount < 10) return "optimal";
    return "dense";
  }

  getConnectedDevices(): BluetoothDevice[] {
    return Array.from(this.discoveredDevices.values()).filter(device => device.isConnected);
  }

  getDiscoveredDevices(): BluetoothDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  getMeshNodes(): User[] {
    return Array.from(this.meshNodes.values());
  }

  async shutdown(): Promise<void> {
    console.log("Shutting down Bluetooth Mesh Service...");

    // Stop scanning
    await this.stopScanning();

    // Disconnect all devices
    const disconnectPromises = Array.from(this.connectedDevices.keys()).map((deviceId) =>
      this.disconnectFromDevice(deviceId),
    );
    await Promise.all(disconnectPromises);

    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    // Clear data
    this.connectedDevices.clear();
    this.discoveredDevices.clear();
    this.meshNodes.clear();
    this.messageCache.clear();

    this.isInitialized = false;
    this.emit("shutdown");

    console.log("Bluetooth Mesh Service shutdown complete");
  }
}

export default new BluetoothMeshService();