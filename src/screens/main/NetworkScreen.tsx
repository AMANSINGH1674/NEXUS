"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../context/ThemeContext"
import { useMesh } from "../../context/MeshContext"
import MeshNetworkService from "../../services/MeshNetworkService"
import BluetoothService from "../../services/BluetoothService"
import Button from "../../components/Button"
import Avatar from "../../components/Avatar"

export default function NetworkScreen() {
  const { colors, isDark } = useTheme()
  const { meshStatus } = useMesh()
  const navigation = useNavigation()
  const [isScanning, setIsScanning] = useState(false)
  const [connectedNodes, setConnectedNodes] = useState<any[]>([])
  const [networkHealth, setNetworkHealth] = useState(0) // Start with 0 for empty state
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Initialize mesh network service
    initializeMeshNetwork()

    // Setup event listeners
    const handleNodeJoined = (node: any) => {
      setConnectedNodes((prev) => [...prev.filter((n) => n.id !== node.id), node])
    }

    const handleNetworkUpdated = (status: any) => {
      setNetworkHealth(status.networkHealth)
    }

    MeshNetworkService.on("nodeJoined", handleNodeJoined)
    MeshNetworkService.on("networkUpdated", handleNetworkUpdated)

    return () => {
      MeshNetworkService.off("nodeJoined", handleNodeJoined)
      MeshNetworkService.off("networkUpdated", handleNetworkUpdated)
    }
  }, [])

  const initializeMeshNetwork = async () => {
    try {
      await MeshNetworkService.initialize()
      const nodes = MeshNetworkService.getConnectedNodes()
      setConnectedNodes(nodes)
    } catch (error) {
      console.error("Failed to initialize mesh network:", error)
    }
  }

  const handleScan = async () => {
    setIsScanning(true)
    try {
      await BluetoothService.startScanning()
      setTimeout(() => {
        setIsScanning(false)
        BluetoothService.stopScanning()
      }, 10000)
    } catch (error) {
      console.error("Scan failed:", error)
      setIsScanning(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const nodes = MeshNetworkService.getConnectedNodes()
      setConnectedNodes(nodes)
      const status = MeshNetworkService.getNetworkStatus()
      setNetworkHealth(status.networkHealth)
    } catch (error) {
      console.error("Refresh failed:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 80) return colors.success
    if (health >= 60) return colors.warning
    return colors.error
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "coordinator":
        return "radio"
      case "relay":
        return "repeat"
      case "node":
        return "ellipse"
      case "edge":
        return "triangle"
      default:
        return "help"
    }
  }

  const renderNodeItem = ({ item }: { item: any }) => (
    <View style={[styles.nodeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Avatar source={{ uri: item.avatar }} size={40} />

      <View style={styles.nodeContent}>
        <View style={styles.nodeHeader}>
          <Text style={[styles.nodeName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.nodeRole}>
            <Ionicons name={getRoleIcon(item.meshRole)} size={16} color={colors.primary} />
          </View>
        </View>

        <View style={styles.nodeStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hops:</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{item.hops}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Battery:</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{item.batteryLevel}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Signal:</Text>
            <View style={styles.signalBars}>
              {Array.from({ length: 5 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.signalBar,
                    {
                      backgroundColor: i < item.signalStrength ? colors.success : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <Text style={[styles.nodeStatus, { color: item.isOnline ? colors.success : colors.textSecondary }]}>
          {item.isOnline ? "Online" : `Last seen ${item.lastSeen.toLocaleTimeString()}`}
        </Text>
      </View>
    </View>
  )

  // Update the status display to handle empty state better
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Mesh Network</Text>
        <TouchableOpacity onPress={handleScan} disabled={isScanning} style={styles.scanButton}>
          <Ionicons
            name={isScanning ? "refresh" : "refresh-outline"}
            size={24}
            color="white"
            style={isScanning ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* Network Status */}
      <View style={[styles.statusContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Network Size</Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>{meshStatus.nodeCount || 0}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Health</Text>
            <Text style={[styles.statusValue, { color: getHealthColor(networkHealth) }]}>{networkHealth}%</Text>
          </View>
        </View>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Connected</Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>{meshStatus.connectedNodes || 0}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Status</Text>
            <Text style={[styles.statusValue, { color: meshStatus.isActive ? colors.success : colors.error }]}>
              {meshStatus.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
      </View>

      {/* Topology Button */}
      <View style={styles.actionContainer}>
        <Button
          title="View Network Topology"
          onPress={() => navigation.navigate("NetworkTopology" as never)}
          style={styles.topologyButton}
        />
      </View>

      {/* Connected Nodes */}
      <View style={styles.nodesHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Connected Nodes ({connectedNodes.filter((n) => n.isOnline).length})
        </Text>
      </View>

      <FlatList
        data={connectedNodes}
        renderItem={renderNodeItem}
        keyExtractor={(item) => item.id}
        style={styles.nodesList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="radio-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No nodes connected</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Start scanning to discover nearby devices
            </Text>
          </View>
        }
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title={isScanning ? "Scanning..." : "Scan for Devices"}
          onPress={handleScan}
          disabled={isScanning}
          style={styles.scanButton}
        />
        <Button title="Optimize Network" onPress={() => {}} variant="outline" style={styles.optimizeButton} />
      </View>
    </SafeAreaView>
  )
}

// Update styles for better positioning
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  spinning: {
    // Add rotation animation if needed
  },
  statusContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusItem: {
    alignItems: "center",
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  topologyButton: {
    backgroundColor: "#3b82f6",
  },
  nodesHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  nodesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  nodeItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  nodeContent: {
    flex: 1,
    marginLeft: 12,
  },
  nodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nodeName: {
    fontSize: 16,
    fontWeight: "600",
  },
  nodeRole: {
    padding: 4,
  },
  nodeStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  signalBars: {
    flexDirection: "row",
    gap: 2,
  },
  signalBar: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  nodeStatus: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  scanButton: {
    padding: 4,
    flex: 1,
  },
  optimizeButton: {
    flex: 1,
  },
})
