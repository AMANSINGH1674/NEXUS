"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import { useColorScheme } from "react-native"

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  colors: {
    primary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    warning: string
    error: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(systemColorScheme === "dark")

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const colors = {
    primary: "#10b981",
    background: isDark ? "#111827" : "#ffffff",
    surface: isDark ? "#1f2937" : "#f9fafb",
    text: isDark ? "#ffffff" : "#111827",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#374151" : "#e5e7eb",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  }

  return <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}
