import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useMesh } from "../../context/MeshContext";
import { Button } from "../../components/ui/button";

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

  useEffect(() => {
    // Simulate initialization steps
    const timer1 = setTimeout(() => {
      setInitSteps((prev) => ({ ...prev, bluetoothReady: true }));
      setProgress(25);
    }, 1000);

    const timer2 = setTimeout(() => {
      setInitSteps((prev) => ({ ...prev, keysGenerated: true }));
      setProgress(50);
    }, 2000);

    const timer3 = setTimeout(() => {
      setInitSteps((prev) => ({ ...prev, meshStarted: true }));
      setProgress(75);
    }, 3000);

    const timer4 = setTimeout(() => {
      setInitSteps((prev) => ({ ...prev, peersDiscovered: true }));
      setProgress(100);
    }, 4000);

    return () => {
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
          label="Discovering Peers" 
          complete={initSteps.peersDiscovered} 
        />
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Network Status:</Text>
        <Text style={styles.statusValue}>
          {meshStatus.isActive ? "Active" : "Initializing..."}
        </Text>
        
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
        {progress < 100 ? "Initializing..." : "Continue"}
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