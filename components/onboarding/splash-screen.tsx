"use client"

import { useEffect, useState } from "react"
import { Network, Zap } from "lucide-react"

interface SplashScreenProps {
  onComplete: () => void
  darkMode: boolean
}

export default function SplashScreen({ onComplete, darkMode }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div
      className={`h-screen max-w-md mx-auto border-x border-gray-200 flex flex-col items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-green-500 to-blue-600 text-white"
      }`}
    >
      {/* App Logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Network className="h-12 w-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <Zap className="h-4 w-4 text-yellow-900" />
        </div>
      </div>

      {/* App Name */}
      <h1 className="text-3xl font-bold mb-2">MeshChat</h1>
      <p className="text-lg opacity-90 mb-8">Offline Mesh Messaging</p>

      {/* Loading Animation */}
      <div className="w-64 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Initializing...</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Animated Network Nodes */}
      <div className="relative w-32 h-16 mt-8">
        <div className="absolute top-0 left-0 w-3 h-3 bg-white rounded-full animate-pulse" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-0 left-1/4 w-3 h-3 bg-white rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-0 right-1/4 w-3 h-3 bg-white rounded-full animate-pulse delay-500" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse delay-1000" />

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 64">
          <line x1="6" y1="6" x2="64" y2="32" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="122" y1="6" x2="64" y2="32" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="32" y1="58" x2="64" y2="32" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="96" y1="58" x2="64" y2="32" stroke="white" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-sm opacity-70">Version 1.0.0 • Bluetooth Mesh Protocol</div>
    </div>
  )
}
