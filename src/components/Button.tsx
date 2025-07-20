"use client"
import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native"
import { useTheme } from "../context/ThemeContext"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "ghost" | "outline"
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme()

  const getButtonStyle = () => {
    const baseStyle = [styles.button, style]

    if (disabled) {
      return [...baseStyle, { backgroundColor: colors.border, opacity: 0.6 }]
    }

    switch (variant) {
      case "primary":
        return [...baseStyle, { backgroundColor: colors.primary }]
      case "secondary":
        return [...baseStyle, { backgroundColor: colors.surface }]
      case "outline":
        return [
          ...baseStyle,
          {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]
      case "ghost":
        return [...baseStyle, { backgroundColor: "transparent" }]
      default:
        return [...baseStyle, { backgroundColor: colors.primary }]
    }
  }

  const getTextStyle = () => {
    const baseStyle = [styles.text, textStyle]

    if (disabled) {
      return [...baseStyle, { color: colors.textSecondary }]
    }

    switch (variant) {
      case "primary":
        return [...baseStyle, { color: "white" }]
      case "secondary":
        return [...baseStyle, { color: colors.text }]
      case "outline":
        return [...baseStyle, { color: colors.text }]
      case "ghost":
        return [...baseStyle, { color: colors.textSecondary }]
      default:
        return [...baseStyle, { color: "white" }]
    }
  }

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress} disabled={disabled} activeOpacity={0.7}>
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
})
