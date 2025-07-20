"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useMesh } from "../../context/MeshContext"
import MeshNetworkService from "../../services/MeshNetworkService"
import Button from "../../components/Button"

const emergencyTypes = [
  { id: "medical", label: "Medical Emergency", icon: "medical", color: "#ef4444" },
  { id: "fire", label: "Fire Emergency", icon: "flame", color: "#f97316" },
  { id: "security", label: "Security Alert", icon: "shield-checkmark", color: "#8b5cf6" },
  { id: "natural", label: "Natural Disaster", icon: "thunderstorm", color: "#eab308" },
  { id: "other", label: "Other Emergency", icon: "warning", color: "#6b7280" },
]

export default function EmergencyScreen() {
  const { colors, isDark } = useTheme()
  const { meshStatus } = useMesh()
  const [emergencyMessage, setEmergencyMessage] = useState("")
  const [emergencyType, setEmergencyType] = useState("medical")
  const [location, setLocation] = useState("")
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  const handleEmergencyBroadcast = async () => {
    if (!emergencyMessage.trim()) {
      Alert.alert("Error", "Please enter an emergency message")
      return
    }

    setIsBroadcasting(true)

    try {
      const fullMessage = `${emergencyTypes.find((t) => t.id === emergencyType)?.label}: ${emergencyMessage}${
        location ? ` Location: ${location}` : ""
      }`

      const success = await MeshNetworkService.broadcastEmergency(fullMessage)

      if (success) {
        Alert.alert("Emergency Broadcast Sent", "Your emergency message has been broadcast to all mesh nodes.", [
          {
            text: "OK",
            onPress: () => {
              setEmergencyMessage("")
              setLocation("")
            },
          },
        ])
      } else {
        Alert.alert("Broadcast Failed", "Failed to send emergency broadcast. Please try again.")
      }
    } catch (error) {
      console.error("Emergency broadcast failed:", error)
      Alert.alert("Error", "An error occurred while sending the emergency broadcast.")
    } finally {
      setIsBroadcasting(false)
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "location":
        setLocation("Current GPS coordinates")
        break
      case "call":
        Alert.alert("Emergency Call", "This would initiate an emergency call in a real implementation")
        break
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="flash" size={24} color="white" />
          <Text style={styles.headerTitle}>Emergency Broadcast</Text>
        </View>
      </View>

      {/* Emergency Status */}
      {meshStatus.emergencyMode && (
        <View style={styles.emergencyStatus}>
          <View style={styles.emergencyIndicator}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={[styles.emergencyText, { color: colors.error }]}>Emergency Mode Active</Text>
          </View>
          <Text style={[styles.emergencySubtext, { color: colors.textSecondary }]}>
            Network is prioritizing emergency communications
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Emergency Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Type</Text>
          <View style={styles.typeGrid}>
            {emergencyTypes.map((type) => (
              <Button
                key={type.id}
                title={type.label}
                onPress={() => setEmergencyType(type.id)}
                variant={emergencyType === type.id ? "primary" : "outline"}
                style={[styles.typeButton, emergencyType === type.id && { backgroundColor: type.color }]}
                textStyle={styles.typeButtonText}
              />
            ))}
          </View>
        </View>

        {/* Location Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Location (Optional)</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={[styles.locationInput, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="Enter location or coordinates"
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
            <Button
              title="GPS"
              onPress={() => handleQuickAction("location")}
              variant="outline"
              style={styles.gpsButton}
            />
          </View>
        </View>

        {/* Emergency Message */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Message</Text>
          <TextInput
            style={[styles.messageInput, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Describe the emergency situation..."
            placeholderTextColor={colors.textSecondary}
            value={emergencyMessage}
            onChangeText={setEmergencyMessage}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
            {emergencyMessage.length}/500 characters
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              title="Share Location"
              onPress={() => handleQuickAction("location")}
              variant="outline"
              style={styles.quickActionButton}
            />
            <Button
              title="Call Emergency"
              onPress={() => handleQuickAction("call")}
              variant="outline"
              style={styles.quickActionButton}
            />
          </View>
        </View>

        {/* Network Coverage */}
        <View style={[styles.coverageContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.coverageTitle, { color: colors.text }]}>Broadcast Coverage</Text>
          <View style={styles.coverageStats}>
            <View style={styles.coverageStat}>
              <Text style={[styles.coverageLabel, { color: colors.textSecondary }]}>Direct nodes:</Text>
              <Text style={[styles.coverageValue, { color: colors.text }]}>{meshStatus.connectedNodes}</Text>
            </View>
            <View style={styles.coverageStat}>
              <Text style={[styles.coverageLabel, { color: colors.textSecondary }]}>Total network:</Text>
              <Text style={[styles.coverageValue, { color: colors.text }]}>{meshStatus.nodeCount} nodes</Text>
            </View>
            <View style={styles.coverageStat}>
              <Text style={[styles.coverageLabel, { color: colors.textSecondary }]}>Estimated reach:</Text>
              <Text style={[styles.coverageValue, { color: colors.text }]}>
                ~{Math.floor(meshStatus.nodeCount * 1.5)} people
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Emergency Broadcast Button */}
      <View style={styles.broadcastContainer}>
        <Button
          title={isBroadcasting ? "Broadcasting Emergency..." : "Send Emergency Broadcast"}
          onPress={handleEmergencyBroadcast}
          disabled={isBroadcasting || !emergencyMessage.trim()}
          style={[styles.broadcastButton, { backgroundColor: colors.error }]}
          textStyle={styles.broadcastButtonText}
        />

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={16} color={colors.textSecondary} />
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Encrypted and authenticated broadcast
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  emergencyStatus: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    padding: 16,
  },
  emergencyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emergencySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  typeGrid: {
    gap: 8,
  },
  typeButton: {
    marginBottom: 8,
  },
  typeButtonText: {
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: "row",
    gap: 12,
  },
  locationInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  gpsButton: {
    paddingHorizontal: 16,
  },
  messageInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  coverageContainer: {
    padding: 16,
    borderRadius: 12,
  },
  coverageTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  coverageStats: {
    gap: 8,
  },
  coverageStat: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coverageLabel: {
    fontSize: 14,
  },
  coverageValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  broadcastContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  broadcastButton: {
    paddingVertical: 16,
    marginBottom: 12,
  },
  broadcastButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  securityNote: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  securityText: {
    fontSize: 12,
  },
})
