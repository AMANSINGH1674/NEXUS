"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Network, Shield, Zap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingFlowProps {
  onComplete: () => void
  darkMode: boolean
}

const onboardingSlides = [
  {
    icon: Network,
    title: "Welcome to MeshChat",
    description: "Connect and communicate without internet or cellular networks using Bluetooth mesh technology.",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Zap,
    title: "Mesh Networking",
    description:
      "Messages automatically route through nearby devices, creating a resilient communication network that works anywhere.",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "All messages are end-to-end encrypted with military-grade security. Your conversations stay private.",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Users,
    title: "Emergency Ready",
    description:
      "Perfect for emergencies, remote areas, or anywhere traditional networks fail. Stay connected when it matters most.",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
]

export default function OnboardingFlow({ onComplete, darkMode }: OnboardingFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const slide = onboardingSlides[currentSlide]
  const IconComponent = slide.icon

  return (
    <div
      className={`h-screen max-w-md mx-auto border-x border-gray-200 flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}
    >
      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          onClick={onComplete}
          className={darkMode ? "text-gray-400 hover:text-white" : "text-gray-600"}
        >
          Skip
        </Button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Icon */}
        <div className={`w-32 h-32 rounded-full ${slide.bgColor} flex items-center justify-center mb-8`}>
          <IconComponent className={`h-16 w-16 ${slide.color}`} />
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold text-center mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          {slide.title}
        </h1>

        {/* Description */}
        <p className={`text-center text-lg leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          {slide.description}
        </p>

        {/* Slide Indicators */}
        <div className="flex gap-2 mt-12">
          {onboardingSlides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? "bg-green-500" : darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center p-6">
        <Button
          variant="ghost"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600"} ${currentSlide === 0 ? "invisible" : ""}`}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button onClick={nextSlide} className="bg-green-600 hover:bg-green-700 text-white px-8">
          {currentSlide === onboardingSlides.length - 1 ? "Get Started" : "Next"}
          {currentSlide < onboardingSlides.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}
