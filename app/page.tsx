"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Users, Radar, Zap, Network, AlertTriangle } from "lucide-react"
import SplashScreen from "@/components/onboarding/splash-screen"
import OnboardingFlow from "@/components/onboarding/onboarding-flow"
import PermissionsScreen from "@/components/onboarding/permissions-screen"
import ProfileSetup from "@/components/onboarding/profile-setup"
import NetworkInitialization from "@/components/onboarding/network-initialization"
import ChatsScreen from "@/components/screens/chats-screen"
import GroupsScreen from "@/components/screens/groups-screen"
import NetworkScreen from "@/components/screens/network-screen"
import SettingsScreen from "@/components/screens/settings-screen"
import EmergencyScreen from "@/components/screens/emergency-screen"
import ChatInterface from "@/components/chat/chat-interface"
import NetworkTopology from "@/components/network/network-topology"
import type { Chat, User, MeshStatus } from "@/types/mesh-types"

const mockMeshStatus: MeshStatus = {
  isActive: true,
  nodeCount: 47,
  connectedNodes: 12,
  networkHealth: 87,
  batteryOptimized: true,
  emergencyMode: false,
  encryptionEnabled: true,
  meshDensity: "optimal",
}

type AppState = "splash" | "onboarding" | "permissions" | "profile" | "network-init" | "main"
type ScreenType = "chats" | "groups" | "network" | "settings" | "emergency"

export default function BluetoothMeshApp() {
  const [appState, setAppState] = useState<AppState>("splash")
  const [activeScreen, setActiveScreen] = useState<ScreenType>("chats")
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [showTopology, setShowTopology] = useState(false)
  const [meshStatus, setMeshStatus] = useState<MeshStatus>(mockMeshStatus)
  const [darkMode, setDarkMode] = useState(false)
  const [users] = useState<User[]>([])
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string } | null>(null)

  // Simulate mesh network updates
  useEffect(() => {
    if (appState === "main") {
      const interval = setInterval(() => {
        setMeshStatus((prev) => ({
          ...prev,
          nodeCount: prev.nodeCount + Math.floor(Math.random() * 3) - 1,
          networkHealth: Math.max(60, Math.min(100, prev.networkHealth + Math.floor(Math.random() * 10) - 5)),
        }))
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [appState])

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
  }

  const handleBackToMain = () => {
    setSelectedChat(null)
    setShowTopology(false)
  }

  const toggleTopology = () => {
    setShowTopology(!showTopology)
  }

  const getUnreadCount = () => {
    // Mock unread count
    return 3
  }

  // Splash Screen
  if (appState === "splash") {
    return <SplashScreen onComplete={() => setAppState("onboarding")} darkMode={darkMode} />
  }

  // Onboarding Flow
  if (appState === "onboarding") {
    return <OnboardingFlow onComplete={() => setAppState("permissions")} darkMode={darkMode} />
  }

  // Permissions Screen
  if (appState === "permissions") {
    return <PermissionsScreen onComplete={() => setAppState("profile")} darkMode={darkMode} />
  }

  // Profile Setup
  if (appState === "profile") {
    return (
      <ProfileSetup
        onComplete={(profile) => {
          setUserProfile(profile)
          setAppState("network-init")
        }}
        darkMode={darkMode}
      />
    )
  }

  // Network Initialization
  if (appState === "network-init") {
    return <NetworkInitialization onComplete={() => setAppState("main")} darkMode={darkMode} />
  }

  // Main App - Chat Interface
  if (selectedChat) {
    return (
      <div className={`h-screen max-w-md mx-auto border-x border-gray-200 ${darkMode ? "dark" : ""}`}>
        <ChatInterface chat={selectedChat} onBack={handleBackToMain} meshStatus={meshStatus} darkMode={darkMode} />
      </div>
    )
  }

  // Main App - Network Topology
  if (showTopology) {
    return (
      <div className={`h-screen max-w-md mx-auto border-x border-gray-200 ${darkMode ? "dark" : ""}`}>
        <NetworkTopology onBack={handleBackToMain} meshStatus={meshStatus} users={users} darkMode={darkMode} />
      </div>
    )
  }

  // Main App Interface
  return (
    <div className={`h-screen max-w-md mx-auto border-x border-gray-200 flex flex-col ${darkMode ? "dark" : ""}`}>
      {/* Mesh Status Bar */}
      <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-green-600 text-white"} p-2`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${meshStatus.isActive ? "bg-green-400" : "bg-red-400"} animate-pulse`}
            />
            <span>Mesh: {meshStatus.nodeCount} nodes</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Health: {meshStatus.networkHealth}%</span>
            {meshStatus.emergencyMode && (
              <div className="flex items-center gap-1 text-red-300">
                <AlertTriangle className="h-3 w-3" />
                <span>EMERGENCY</span>
              </div>
            )}
            <button onClick={toggleTopology} className="hover:bg-green-700 p-1 rounded">
              <Network className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeScreen === "chats" && (
          <ChatsScreen onChatSelect={handleChatSelect} meshStatus={meshStatus} darkMode={darkMode} users={users} />
        )}
        {activeScreen === "groups" && (
          <GroupsScreen onChatSelect={handleChatSelect} meshStatus={meshStatus} darkMode={darkMode} users={users} />
        )}
        {activeScreen === "network" && (
          <NetworkScreen meshStatus={meshStatus} users={users} darkMode={darkMode} onShowTopology={toggleTopology} />
        )}
        {activeScreen === "settings" && (
          <SettingsScreen meshStatus={meshStatus} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
        )}
        {activeScreen === "emergency" && <EmergencyScreen meshStatus={meshStatus} darkMode={darkMode} users={users} />}
      </div>

      {/* Bottom Navigation */}
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-t`}>
        <div className="flex">
          <button
            onClick={() => setActiveScreen("chats")}
            className={`flex-1 py-3 px-2 text-center ${
              activeScreen === "chats"
                ? darkMode
                  ? "text-blue-400 bg-gray-700"
                  : "text-blue-600 bg-blue-50"
                : darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
            }`}
          >
            <div className="relative">
              <MessageCircle className="h-5 w-5 mx-auto mb-1" />
            </div>
            <span className="text-xs">Chats</span>
          </button>

          <button
            onClick={() => setActiveScreen("groups")}
            className={`flex-1 py-3 px-2 text-center ${
              activeScreen === "groups"
                ? darkMode
                  ? "text-green-400 bg-gray-700"
                  : "text-green-600 bg-green-50"
                : darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
            }`}
          >
            <Users className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">Groups</span>
          </button>

          <button
            onClick={() => setActiveScreen("network")}
            className={`flex-1 py-3 px-2 text-center ${
              activeScreen === "network"
                ? darkMode
                  ? "text-green-400 bg-gray-700"
                  : "text-green-600 bg-green-50"
                : darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
            }`}
          >
            <div className="relative">
              <Radar className="h-5 w-5 mx-auto mb-1" />
            </div>
            <span className="text-xs">Network</span>
          </button>

          <button
            onClick={() => setActiveScreen("emergency")}
            className={`flex-1 py-3 px-2 text-center ${
              activeScreen === "emergency"
                ? darkMode
                  ? "text-red-400 bg-gray-700"
                  : "text-red-600 bg-red-50"
                : darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
            } ${meshStatus.emergencyMode ? "animate-pulse" : ""}`}
          >
            <div className="relative">
              <Zap className="h-5 w-5 mx-auto mb-1" />
              {meshStatus.emergencyMode && (
                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full h-2 w-2 animate-ping" />
              )}
            </div>
            <span className="text-xs">Emergency</span>
          </button>
        </div>
      </div>
    </div>
  )
}
