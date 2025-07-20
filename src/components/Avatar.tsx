"use client"
import { Image, View, StyleSheet, type ImageSourcePropType } from "react-native"
import { useTheme } from "../context/ThemeContext"

interface AvatarProps {
  source: ImageSourcePropType
  size?: number
  style?: any
}

export default function Avatar({ source, size = 40, style }: AvatarProps) {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surface,
        },
        style,
      ]}
    >
      <Image
        source={source}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        defaultSource={{ uri: "https://via.placeholder.com/40" }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
})
