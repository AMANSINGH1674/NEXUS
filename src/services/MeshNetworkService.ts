import { EventEmitter } from "events";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BluetoothMeshService from "./BluetoothMeshService";
import type { User, Message, Chat, Group, MeshStatus, NetworkNode, MeshPacket } from "../types/mesh-types";

class MeshNetworkService extends EventEmitter {
  private users: Map<string, User> = new Map();
  private chats: Map<string, Chat> = new Map();
  private groups: Map<string, Group> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private networkNodes: Map<string, NetworkNode> = new Map();
  private routes: Map<string, string[]> = new Map(); // Destination -> Route
  private localUser: User | null = null;
  private meshStatus: MeshStatus = {
    isActive: false,
    nodeCount: 0,
    connectedNodes: 0,
    networkHealth: 0,
    batteryOptimized: true,
    emergencyMode: false,
    encryptionEnabled: true,
    meshDensity: "sparse",
  };
  private messageQueue: Map<string, Message[]> = new Map(); // Destination -> Queued Messages
  private syncTimer?: NodeJS.Timeout;

  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Listen to Bluetooth service events
    BluetoothMeshService.on("initialized", this.handleBluetoothInitialized.bind(this));
    BluetoothMeshService.on("meshNodeDiscovered", this.handleNodeDiscovered.bind(this));
    BluetoothMeshService.on("nodeStatusUpdated", this.handleNodeStatusUpdated.bind(this));
    BluetoothMeshService.on("messageReceived", this.handleMessageReceived.bind(this));
    BluetoothMeshService.on("routeDiscovered", this.handleRouteDiscovered.bind(this));
    BluetoothMeshService.on("meshNetworkUpdated", this.handleMeshNetworkUpdated.bind(this));
    BluetoothMeshService.on("deviceConnected", this.handleDeviceConnected.bind(this));
    BluetoothMeshService.on("deviceDisconnected", this.handleDeviceDisconnected.bind(this));
  }

  async initialize(userData: Partial<User>): Promise<boolean> {
    try {
      console.log("Initializing Mesh Network Service...");

      // Load local user data
      await this.loadLocalUser(userData);

      // Initialize Bluetooth service
      const bluetoothInitialized = await BluetoothMeshService.initialize();
      if (!bluetoothInitialized) {
        throw new Error("Failed to initialize Bluetooth service");
      }

      // Load cached data
      await this.loadCachedData();

      // Start periodic sync
      this.startPeriodicSync();

      console.log("Mesh Network Service initialized successfully");
      this.emit("initialized");
      return true;
    } catch (error) {
      console.error("Failed to initialize Mesh Network Service:", error);
      this.emit("error", error);
      return false;
    }
  }

  private async loadLocalUser(userData: Partial<User>): Promise<void> {
    try {
      // Try to load existing user data
      const storedUserData = await AsyncStorage.getItem("localUser");
      let user: User;

      if (storedUserData) {
        user = { ...JSON.parse(storedUserData), ...userData };
      } else {
        // Create new user
        user = {
          id: `user_${Date.now()}`,
          name: userData.name || "Anonymous",
          avatar: userData.avatar || `https://via.placeholder.com/40?text=${userData.name?.charAt(0) || "A"}`,
          deviceId: `device_${Date.now()}`,
          isOnline: true,
          lastSeen: new Date(),
          batteryLevel: 100,
          signalStrength: 5,
          hops: 0,
          publicKey: userData.publicKey || "",
          meshRole: "node",
          ...userData,
        };

        // Store user data
        await AsyncStorage.setItem("localUser", JSON.stringify(user));
      }

      this.localUser = user;
      console.log("Local user initialized:", user.name);
    } catch (error) {
      console.error("Failed to load local user:", error);
      throw error;
    }
  }

  private async loadCachedData(): Promise<void> {
    try {
      // Load cached users
      const usersData = await AsyncStorage.getItem("cachedUsers");
      if (usersData) {
        const users = JSON.parse(usersData) as User[];
        users.forEach((user) => {
          this.users.set(user.id, {
            ...user,
            lastSeen: new Date(user.lastSeen),
            isOnline: false, // Assume offline until rediscovered
          });
        });
      }

      // Load cached chats
      const chatsData = await AsyncStorage.getItem("cachedChats");
      if (chatsData) {
        const chats = JSON.parse(chatsData) as Chat[];
        chats.forEach((chat) => {
          this.chats.set(chat.id, {
            ...chat,
            lastMessageTime: new Date(chat.lastMessageTime),
          });
        });
      }

      // Load cached groups
      const groupsData = await AsyncStorage.getItem("cachedGroups");
      if (groupsData) {
        const groups = JSON.parse(groupsData) as Group[];
        groups.forEach((group) => {
          this.groups.set(group.id, {
            ...group,
            createdAt: new Date(group.createdAt),
            lastMessageTime: new Date(group.lastMessageTime),
          });
        });
      }

      // Load cached messages (limited to recent ones)
      const messagesData = await AsyncStorage.getItem("cachedMessages");
      if (messagesData) {
        const messageMap = JSON.parse(messagesData) as Record<string, Message[]>;
        Object.entries(messageMap).forEach(([chatId, messages]) => {
          this.messages.set(
            chatId,
            messages.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );
        });
      }

      // Load cached routes
      const routesData = await AsyncStorage.getItem("cachedRoutes");
      if (routesData) {
        const routes = JSON.parse(routesData) as Record<string, string[]>;
        Object.entries(routes).forEach(([destination, route]) => {
          this.routes.set(destination, route);
        });
      }

      console.log("Cached data loaded");
    } catch (error) {
      console.error("Failed to load cached data:", error);
    }
  }

  private async saveCachedData(): Promise<void> {
    try {
      // Save users
      const users = Array.from(this.users.values());
      await AsyncStorage.setItem("cachedUsers", JSON.stringify(users));

      // Save chats
      const chats = Array.from(this.chats.values());
      await AsyncStorage.setItem("cachedChats", JSON.stringify(chats));

      // Save groups
      const groups = Array.from(this.groups.values());
      await AsyncStorage.setItem("cachedGroups", JSON.stringify(groups));

      // Save messages (only recent ones to save space)
      const recentMessages: Record<string, Message[]> = {};
      this.messages.forEach((msgs, chatId) => {
        // Keep only last 50 messages per chat
        recentMessages[chatId] = msgs.slice(-50);
      });
      await AsyncStorage.setItem("cachedMessages", JSON.stringify(recentMessages));

      // Save routes
      const routes: Record<string, string[]> = {};
      this.routes.forEach((route, destination) => {
        routes[destination] = route;
      });
      await AsyncStorage.setItem("cachedRoutes", JSON.stringify(routes));

      console.log("Cached data saved");
    } catch (error) {
      console.error("Failed to save cached data:", error);
    }
  }

  private startPeriodicSync(): void {
    // Periodically save cached data
    this.syncTimer = setInterval(() => {
      this.saveCachedData();
      this.processMessageQueue();
    }, 60000); // Every minute
  }

  private handleBluetoothInitialized(): void {
    console.log("Bluetooth service initialized");
    
    // Start scanning for devices
    BluetoothMeshService.startScanning().catch((error) => {
      console.error("Failed to start scanning:", error);
    });
    
    // Update mesh status
    this.updateMeshStatus(BluetoothMeshService.getMeshNetworkStatus());
  }

  private handleNodeDiscovered(node: User): void {
    console.log("Node discovered:", node.name);
    
    // Add or update user
    this.users.set(node.id, node);
    
    // Create network node
    const networkNode: NetworkNode = {
      id: node.id,
      deviceId: node.deviceId,
      name: node.name,
      position: this.calculateNodePosition(node),
      connections: [],
      batteryLevel: node.batteryLevel,
      signalStrength: node.signalStrength,
      role: node.meshRole,
      isOnline: true,
      lastSeen: node.lastSeen,
    };
    
    this.networkNodes.set(node.id, networkNode);
    
    // Update mesh status
    this.updateMeshStatus(BluetoothMeshService.getMeshNetworkStatus());
    
    // Emit events
    this.emit("userDiscovered", node);
    this.emit("networkUpdated", Array.from(this.networkNodes.values()));
  }

  private calculateNodePosition(node: User): { x: number; y: number } {
    // In a real implementation, this would use signal strength and triangulation
    // For demo, we'll just assign random positions
    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
    };
  }

  private handleNodeStatusUpdated(node: User): void {
    // Update user
    const existingUser = this.users.get(node.id);
    if (existingUser) {
      this.users.set(node.id, { ...existingUser, ...node });
    } else {
      this.users.set(node.id, node);
    }
    
    // Update network node
    const networkNode = this.networkNodes.get(node.id);
    if (networkNode) {
      this.networkNodes.set(node.id, {
        ...networkNode,
        batteryLevel: node.batteryLevel,
        signalStrength: node.signalStrength,
        isOnline: node.isOnline,
        lastSeen: node.lastSeen,
      });
    }
    
    // Update mesh status
    this.updateMeshStatus(BluetoothMeshService.getMeshNetworkStatus());
    
    // Emit events
    this.emit("userUpdated", node);
    this.emit("networkUpdated", Array.from(this.networkNodes.values()));
  }

  private handleMessageReceived(message: Message): void {
    console.log("Message received:", message.content);
    
    // Determine chat ID
    let chatId: string;
    
    if (message.type === "emergency") {
      // Use emergency broadcast chat
      chatId = "emergency";
    } else {
      // Use private chat with sender
      chatId = `chat_${message.senderId}`;
    }
    
    // Add message to chat
    this.addMessageToChat(chatId, message);
    
    // Create chat if it doesn't exist
    if (!this.chats.has(chatId)) {
      const sender = this.users.get(message.senderId);
      
      const chat: Chat = {
        id: chatId,
        type: message.type === "emergency" ? "emergency" : "private",
        name: sender?.name || "Unknown User",
        avatar: sender?.avatar || `https://via.placeholder.com/40?text=?`,
        lastMessage: message.content,
        lastMessageTime: message.timestamp,
        unreadCount: 1,
        participants: [message.senderId, this.localUser?.id || "self"],
        isEncrypted: message.encrypted,
        meshRoute: message.routePath,
      };
      
      this.chats.set(chatId, chat);
      this.emit("chatCreated", chat);
    } else {
      // Update existing chat
      const chat = this.chats.get(chatId)!;
      const updatedChat: Chat = {
        ...chat,
        lastMessage: message.content,
        lastMessageTime: message.timestamp,
        unreadCount: chat.unreadCount + 1,
      };
      
      this.chats.set(chatId, updatedChat);
      this.emit("chatUpdated", updatedChat);
    }
    
    // Emit message received event
    this.emit("messageReceived", { chatId, message });
  }

  private addMessageToChat(chatId: string, message: Message): void {
    // Get or create message array for this chat
    const chatMessages = this.messages.get(chatId) || [];
    
    // Add message
    chatMessages.push(message);
    
    // Sort by timestamp
    chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Update messages
    this.messages.set(chatId, chatMessages);
  }

  private handleRouteDiscovered(routeInfo: { destination: string; route: string[] }): void {
    console.log("Route discovered to", routeInfo.destination, ":", routeInfo.route);
    
    // Store route
    this.routes.set(routeInfo.destination, routeInfo.route);
    
    // Update network connections
    this.updateNetworkConnections();
    
    // Process any queued messages for this destination
    this.processQueuedMessages(routeInfo.destination);
  }

  private updateNetworkConnections(): void {
    // Reset all connections
    this.networkNodes.forEach((node) => {
      node.connections = [];
    });
    
    // Add connections based on routes
    this.routes.forEach((route) => {
      for (let i = 0; i < route.length - 1; i++) {
        const fromNodeId = route[i];
        const toNodeId = route[i + 1];
        
        const fromNode = this.networkNodes.get(fromNodeId);
        if (fromNode && !fromNode.connections.includes(toNodeId)) {
          fromNode.connections.push(toNodeId);
        }
        
        const toNode = this.networkNodes.get(toNodeId);
        if (toNode && !toNode.connections.includes(fromNodeId)) {
          toNode.connections.push(fromNodeId);
        }
      }
    });
    
    // Emit network updated event
    this.emit("networkUpdated", Array.from(this.networkNodes.values()));
  }

  private handleMeshNetworkUpdated(status: MeshStatus): void {
    this.updateMeshStatus(status);
  }

  private updateMeshStatus(status: MeshStatus): void {
    this.meshStatus = status;
    this.emit("meshStatusUpdated", status);
  }

  private handleDeviceConnected(device: any): void {
    // Update network connections
    this.updateNetworkConnections();
    
    // Update mesh status
    this.updateMeshStatus(BluetoothMeshService.getMeshNetworkStatus());
  }

  private handleDeviceDisconnected(device: any): void {
    // Update network connections
    this.updateNetworkConnections();
    
    // Update mesh status
    this.updateMeshStatus(BluetoothMeshService.getMeshNetworkStatus());
  }

  async sendMessage(chatId: string, content: string, type: "text" | "image" | "file" | "emergency" = "text"): Promise<boolean> {
    try {
      if (!this.localUser) {
        throw new Error("Local user not initialized");
      }
      
      const chat = this.chats.get(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }
      
      // Create message
      const message: Message = {
        id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        content,
        type,
        senderId: this.localUser.id,
        timestamp: new Date(),
        status: "sending",
        hops: 0,
        ttl: 10,
        routePath: [],
        encrypted: chat.isEncrypted,
        priority: type === "emergency" ? "emergency" : "normal",
      };
      
      // Add to local chat
      this.addMessageToChat(chatId, message);
      
      // Update chat
      const updatedChat: Chat = {
        ...chat,
        lastMessage: content,
        lastMessageTime: new Date(),
      };
      
      this.chats.set(chatId, updatedChat);
      
      // Emit events
      this.emit("messageSent", { chatId, message });
      this.emit("chatUpdated", updatedChat);
      
      // Send via Bluetooth
      let success = false;
      
      if (chat.type === "emergency") {
        // Emergency broadcast
        success = await BluetoothMeshService.sendEmergencyBroadcast(content);
      } else if (chat.type === "group") {
        // Group message
        const group = this.groups.get(chatId);
        if (group) {
          // Send to all participants
          const sendPromises = group.participants
            .filter((id) => id !== this.localUser?.id)
            .map((participantId) => BluetoothMeshService.sendMessage(
              content,
              participantId,
              type === "emergency" ? "emergency" : "normal"
            ));
          
          const results = await Promise.all(sendPromises);
          success = results.some((result) => result);
        }
      } else {
        // Private message
        const recipientId = chat.participants.find((id) => id !== this.localUser?.id);
        if (recipientId) {
          success = await BluetoothMeshService.sendMessage(
            content,
            recipientId,
            type === "emergency" ? "emergency" : "normal"
          );
          
          if (!success) {
            // Queue message for later delivery
            this.queueMessage(recipientId, message);
          }
        }
      }
      
      // Update message status
      message.status = success ? "sent" : "failed";
      this.emit("messageStatusUpdated", { chatId, message });
      
      return success;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  }

  private queueMessage(destinationId: string, message: Message): void {
    // Get or create queue for this destination
    const queue = this.messageQueue.get(destinationId) || [];
    
    // Add message to queue
    queue.push({ ...message, status: "queued" });
    
    // Update queue
    this.messageQueue.set(destinationId, queue);
    
    console.log(`Message queued for ${destinationId}`);
  }

  private processMessageQueue(): void {
    // Process all queued messages
    this.messageQueue.forEach((messages, destinationId) => {
      this.processQueuedMessages(destinationId);
    });
  }

  private async processQueuedMessages(destinationId: string): Promise<void> {
    const queue = this.messageQueue.get(destinationId);
    if (!queue || queue.length === 0) return;
    
    console.log(`Processing ${queue.length} queued messages for ${destinationId}`);
    
    // Try to send each message
    const remainingMessages: Message[] = [];
    
    for (const message of queue) {
      try {
        const success = await BluetoothMeshService.sendMessage(
          message.content,
          destinationId,
          message.priority
        );
        
        if (success) {
          // Message sent successfully
          message.status = "sent";
          
          // Find chat ID
          const chatId = Array.from(this.chats.values())
            .find((chat) => chat.participants.includes(destinationId))?.id;
          
          if (chatId) {
            // Update message in chat
            const chatMessages = this.messages.get(chatId) || [];
            const messageIndex = chatMessages.findIndex((m) => m.id === message.id);
            
            if (messageIndex >= 0) {
              chatMessages[messageIndex] = { ...message, status: "sent" };
              this.messages.set(chatId, chatMessages);
              
              // Emit event
              this.emit("messageStatusUpdated", { chatId, message: { ...message, status: "sent" } });
            }
          }
        } else {
          // Failed to send, keep in queue
          remainingMessages.push(message);
        }
      } catch (error) {
        console.error("Error sending queued message:", error);
        remainingMessages.push(message);
      }
    }
    
    // Update queue
    if (remainingMessages.length > 0) {
      this.messageQueue.set(destinationId, remainingMessages);
    } else {
      this.messageQueue.delete(destinationId);
    }
  }

  async createChat(userId: string): Promise<Chat> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const chatId = `chat_${userId}`;
    
    // Check if chat already exists
    const existingChat = this.chats.get(chatId);
    if (existingChat) {
      return existingChat;
    }
    
    // Create new chat
    const chat: Chat = {
      id: chatId,
      type: "private",
      name: user.name,
      avatar: user.avatar,
      lastMessage: "",
      lastMessageTime: new Date(),
      unreadCount: 0,
      participants: [userId, this.localUser?.id || "self"],
      isEncrypted: true,
      meshRoute: [],
    };
    
    // Add chat
    this.chats.set(chatId, chat);
    
    // Create empty message array
    this.messages.set(chatId, []);
    
    // Emit event
    this.emit("chatCreated", chat);
    
    return chat;
  }

  async createGroup(name: string, participants: string[]): Promise<Group> {
    if (!this.localUser) {
      throw new Error("Local user not initialized");
    }
    
    const groupId = `group_${Date.now()}`;
    
    // Create group
    const group: Group = {
      id: groupId,
      name,
      avatar: `https://via.placeholder.com/40?text=${name.charAt(0)}`,
      description: "",
      participants: [...participants, this.localUser.id],
      admins: [this.localUser.id],
      createdAt: new Date(),
      lastMessage: "",
      lastMessageTime: new Date(),
      unreadCount: 0,
      isActive: true,
      encryptionKey: Math.random().toString(36).substring(2, 15),
      meshBroadcast: true,
    };
    
    // Add group
    this.groups.set(groupId, group);
    
    // Create chat for group
    const chat: Chat = {
      id: groupId,
      type: "group",
      name,
      avatar: group.avatar,
      lastMessage: "",
      lastMessageTime: new Date(),
      unreadCount: 0,
      participants: group.participants,
      isEncrypted: true,
      meshRoute: [],
    };
    
    // Add chat
    this.chats.set(groupId, chat);
    
    // Create empty message array
    this.messages.set(groupId, []);
    
    // Emit events
    this.emit("groupCreated", group);
    this.emit("chatCreated", chat);
    
    return group;
  }

  async sendEmergencyBroadcast(message: string): Promise<boolean> {
    try {
      // Create emergency chat if it doesn't exist
      if (!this.chats.has("emergency")) {
        const chat: Chat = {
          id: "emergency",
          type: "emergency",
          name: "Emergency Broadcast",
          avatar: "https://via.placeholder.com/40?text=🚨",
          lastMessage: "",
          lastMessageTime: new Date(),
          unreadCount: 0,
          participants: ["broadcast"],
          isEncrypted: false,
          meshRoute: [],
        };
        
        this.chats.set("emergency", chat);
        this.messages.set("emergency", []);
        this.emit("chatCreated", chat);
      }
      
      // Send emergency message
      return await this.sendMessage("emergency", message, "emergency");
    } catch (error) {
      console.error("Failed to send emergency broadcast:", error);
      return false;
    }
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getChats(): Chat[] {
    return Array.from(this.chats.values());
  }

  getGroups(): Group[] {
    return Array.from(this.groups.values());
  }

  getMessages(chatId: string): Message[] {
    return this.messages.get(chatId) || [];
  }

  getNetworkNodes(): NetworkNode[] {
    return Array.from(this.networkNodes.values());
  }

  getMeshStatus(): MeshStatus {
    return this.meshStatus;
  }

  getLocalUser(): User | null {
    return this.localUser;
  }

  setPowerMode(mode: "performance" | "balanced" | "battery_saver" | "emergency"): void {
    BluetoothMeshService.setPowerMode(mode);
  }

  async shutdown(): Promise<void> {
    console.log("Shutting down Mesh Network Service...");
    
    // Save cached data
    await this.saveCachedData();
    
    // Clear timers
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
    
    // Shutdown Bluetooth service
    await BluetoothMeshService.shutdown();
    
    console.log("Mesh Network Service shutdown complete");
  }
}

export default new MeshNetworkService();