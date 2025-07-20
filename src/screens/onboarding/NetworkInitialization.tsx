import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useMesh } from "../../context/MeshContext";
import { Button } from "../../components/ui/button";

// Import BluetoothMeshService
import BluetoothMeshService from "../../services/BluetoothMeshService";

interface NetworkInitializationProps {
  isInitialized: boolean;
  onComplete: () => void;
}

const NetworkInitialization: React.FC<NetworkInitializationProps> = ({
  isInitialized,
  onComplete,
}) => {
  const { meshStatus } = useMesh();
  const [initSteps, setInitSteps] = useState({
    bluetoothReady: false,
    keysGenerated: false,
    meshStarted: false,
    peersDiscovered: false,
  });
  const [progress, setProgress] = useState(0);
  const [discoveredDevices, setDiscoveredDevices] = useState(0);

  useEffect(() => {
    // Set up event listeners for real Bluetooth events
    const onBluetoothInitialized = () => {
      setInitSteps((prev) => ({ ...prev, bluetoothReady: true }));
      setProgress((prev) => Math.max(prev, 25));
    };
    
    const onKeysGenerated = () => {
      setInitSteps((prev) => ({ ...prev, keysGenerated: true }));
      setProgress((prev) => Math.max(prev, 50));
    };
    
    const onMeshStarted = () => {
      setInitSteps((prev) => ({ ...prev, meshStarted: true }));
      setProgress((prev) => Math.max(prev, 75));
      
      // Start scanning for devices
      BluetoothMeshService.startScanning().catch(console.error);
    };
    
    const onDeviceDiscovered = () => {
      setInitSteps((prev) => ({ ...prev, peersDiscovered: true }));
      setDiscoveredDevices((prev) => prev + 1);
      setProgress((prev) => Math.max(prev, 90));
    };
    
    // Register event listeners
    BluetoothMeshService.on("initialized", onBluetoothInitialized);
    BluetoothMeshService.on("advertisingStarted", onKeysGenerated);
    BluetoothMeshService.on("meshNetworkUpdated", onMeshStarted);
    BluetoothMeshService.on("deviceDiscovered", onDeviceDiscovered);
    
    // Fallback timers for demonstration purposes
    const timer1 = setTimeout(() => {
      setInitSteps((prev) => ({ ...prev, bluetoothReady: true }));
      setProgress((prev) => Math.max(prev, 25));
    }, 1000);

    const timer2 = setTimeout(() => {
      setInitSteps((prev) => ({ ...prev, keysGenerated: true }));
      setProgress((prev) => Math.max(prev, 50));
    }, 2000);

    const timer3 = setTimeout(() => {
      setInitSteps((prev) => ({ ...prev, meshStarted: true }));
      setProgress((prev) => Math.max(prev, 75));
      
      // Start scanning if not already started
      BluetoothMeshService.startScanning().catch(console.error);
    }, 3000);

    const timer4 = setTimeout(() => {
      // Force progress to 100% after 10 seconds even if no devices found
      setProgress(100);
    }, 10000);

    return () => {
      // Clean up event listeners
      BluetoothMeshService.removeListener("initialized", onBluetoothInitialized);
      BluetoothMeshService.removeListener("advertisingStarted", onKeysGenerated);
      BluetoothMeshService.removeListener("meshNetworkUpdated", onMeshStarted);
      BluetoothMeshService.removeListener("deviceDiscovered", onDeviceDiscovered);
      
      // Clear timers
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Auto-proceed when initialization is complete
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);
  
  // Update progress when devices are discovered
  useEffect(() => {
    if (discoveredDevices > 0) {
      // Set progress to at least 90% when devices are found
      setProgress((prev) => Math.max(prev, 90));
      
      // Set to 100% if we've found multiple devices
      if (discoveredDevices >= 2) {
        setProgress(100);
      }
    }
  }, [discoveredDevices]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Initializing Mesh Network</Text>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      
      <View style={styles.stepsContainer}>
        <StepItem 
          label="Bluetooth Initialization" 
          complete={initSteps.bluetoothReady} 
        />
        <StepItem 
          label="Security Keys Generated" 
          complete={initSteps.keysGenerated} 
        />
        <StepItem 
          label="Mesh Network Started" 
          complete={initSteps.meshStarted} 
        />
        <StepItem 
          label={`Discovering Peers (${discoveredDevices} found)`}
          complete={initSteps.peersDiscovered} 
        />
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Network Status:</Text>
        <Text style={styles.statusValue}>
          {meshStatus.isActive ? "Active" : "Initializing..."}
        </Text>
        
        <Text style={styles.statusLabel}>Devices Found:</Text>
        <Text style={styles.statusValue}>{discoveredDevices}</Text>
        
        {meshStatus.isActive && (
          <>
            <Text style={styles.statusLabel}>Nodes Discovered:</Text>
            <Text style={styles.statusValue}>{meshStatus.nodeCount}</Text>
            
            <Text style={styles.statusLabel}>Connected Nodes:</Text>
            <Text style={styles.statusValue}>{meshStatus.connectedNodes}</Text>
            
            <Text style={styles.statusLabel}>Network Health:</Text>
            <Text style={styles.statusValue}>{meshStatus.networkHealth}%</Text>
          </>
        )}
      </View>
      
      <Button 
        onPress={onComplete}
        disabled={progress < 100}
        style={styles.button}
      >
        {progress < 100 ? "Scanning for Devices..." : "Continue"}
      </Button>
    </View>
  );
};

interface StepItemProps {
  label: string;
  complete: boolean;
}

const StepItem: React.FC<StepItemProps> = ({ label, complete }) => (
  <View style={styles.stepItem}>
    {complete ? (
      <Text style={styles.checkmark}>✓</Text>
    ) : (
      <ActivityIndicator size="small" color="#0000ff" />
    )}
    <Text style={[styles.stepLabel, complete && styles.completedStep]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  progressContainer: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 30,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  stepsContainer: {
    marginBottom: 30,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkmark: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
    width: 20,
    textAlign: "center",
  },
  stepLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
  completedStep: {
    color: "#4CAF50",
  },
  statusContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  button: {
    paddingVertical: 12,
  },
});

export default NetworkInitialization;