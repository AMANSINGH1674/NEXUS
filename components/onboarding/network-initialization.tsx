"use client"

import { useState, useEffect } from "react"
import { Radar, Bluetooth, Network, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface NetworkInitializationProps {
  onComplete: () => void
  darkMode: boolean
}

interface InitStep {
  id: string
  title: string
  description: string
  status: "pending" | "active" | "completed" | "error"
}

export default function NetworkInitialization({ onComplete, darkMode }: NetworkInitializationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [discoveredDevices, setDiscoveredDevices] = useState(0)

  const [steps, setSteps] = useState<InitStep[]>([
    {
      id: "bluetooth",
      title: "Initializing Bluetooth",
      description: "Starting Bluetooth Low Energy adapter",
      status: "pending",
    },
    {
      id: "mesh",
      title: "Creating Mesh Network",
      description: "Setting up mesh networking protocols",
      status: "pending",
    },
    {
      id: "discovery",
      title: "Scanning for Devices",
      description: "Looking for nearby mesh-enabled devices",
      status: "pending",
    },
    {
      id: "encryption",
      title: "Generating Keys",
      description: "Creating encryption keys for secure communication",
      status: "pending",
    },
    {
      id: "ready",
      title: "Network Ready",
      description: "Mesh network is active and ready to use",
      status: "pending",
    },
  ])

  useEffect(() => {
    const initializeNetwork = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Update current step to active
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status: index === i ? "active" : index < i ? "completed" : "pending",
          })),
        )
        setCurrentStep(i)

        // Simulate initialization time
        const duration = i === 2 ? 3000 : 1500 // Discovery takes longer
        const startTime = Date.now()

        while (Date.now() - startTime < duration) {
          const elapsed = Date.now() - startTime
          const stepProgress = (elapsed / duration) * 100
          setProgress((i / steps.length) * 100 + stepProgress / steps.length)

          // Simulate device discovery
          if (i === 2) {
            const devicesFound = Math.floor((elapsed / duration) * 5)
            setDiscoveredDevices(devicesFound)
          }

          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Mark step as completed
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status: index <= i ? "completed" : "pending",
          })),
        )
        setProgress(((i + 1) / steps.length) * 100)
      }

      // Wait a moment then complete
      setTimeout(onComplete, 1000)
    }

    initializeNetwork()
  }, [onComplete, steps.length])

  const getStepIcon = (step: InitStep) => {
    switch (step.status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />
      case "active":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <div className={`w-5 h-5 rounded-full border-2 ${darkMode ? "border-gray-600" : "border-gray-300"}`} />
    }
  }

  return (
    <div
      className={`h-screen max-w-md mx-auto border-x border-gray-200 flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}
    >
      {/* Header */}
      <div className="p-6 text-center">
        <div
          className={`w-16 h-16 rounded-full ${darkMode ? "bg-gray-800" : "bg-blue-100"} flex items-center justify-center mx-auto mb-4`}
        >
          <Network className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Initializing Mesh Network
        </h1>
        <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Setting up your secure mesh communication network
        </p>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps */}
      <div className="flex-1 px-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                step.status === "active"
                  ? darkMode
                    ? "bg-blue-900/20 border border-blue-800"
                    : "bg-blue-50 border border-blue-200"
                  : step.status === "completed"
                    ? darkMode
                      ? "bg-green-900/20 border border-green-800"
                      : "bg-green-50 border border-green-200"
                    : darkMode
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex-shrink-0 mt-1">{getStepIcon(step)}</div>

              <div className="flex-1">
                <h3
                  className={`font-medium ${
                    step.status === "completed"
                      ? "text-green-600"
                      : step.status === "active"
                        ? "text-blue-600"
                        : darkMode
                          ? "text-gray-300"
                          : "text-gray-700"
                  }`}
                >
                  {step.title}
                </h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{step.description}</p>

                {/* Special content for discovery step */}
                {step.id === "discovery" && step.status === "active" && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Radar className="h-4 w-4 text-blue-500 animate-pulse" />
                    <span className="text-blue-600">{discoveredDevices} devices found</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Network Status */}
        <div className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
          <h3 className={`font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Network Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bluetooth className="h-4 w-4 text-blue-500" />
                <span className="text-gray-500">Bluetooth</span>
              </div>
              <span className={`font-medium ${steps[0].status === "completed" ? "text-green-500" : "text-gray-500"}`}>
                {steps[0].status === "completed" ? "Active" : "Initializing"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Network className="h-4 w-4 text-green-500" />
                <span className="text-gray-500">Mesh Network</span>
              </div>
              <span className={`font-medium ${steps[1].status === "completed" ? "text-green-500" : "text-gray-500"}`}>
                {steps[1].status === "completed" ? "Ready" : "Setting up"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Button (only show after some progress) */}
      {progress > 60 && (
        <div className="p-6">
          <Button
            onClick={onComplete}
            variant="outline"
            className={`w-full ${darkMode ? "border-gray-600 text-white hover:bg-gray-800" : ""}`}
          >
            Continue to App
          </Button>
        </div>
      )}
    </div>
  )
}
