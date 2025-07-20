import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-proceed after delay
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onComplete]);
  
  const clearAllData = async () => {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();
      console.log('Found keys to delete:', keys);
      
      // Remove all keys
      await AsyncStorage.multiRemove(keys);
      
      Alert.alert(
        "Success",
        "All data has been cleared. The app will now restart.",
        [{ text: "OK", onPress: () => onComplete() }]
      );
    } catch (error) {
      console.error('Error clearing data:', error);
      Alert.alert("Error", "Failed to clear data. Please try again.");
    }
  };
  
  const confirmClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will remove ALL data including mock users, conversations, and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear Everything", onPress: clearAllData, style: "destructive" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../../public/placeholder-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>MeshConnect</Text>
        <Text style={styles.subtitle}>Decentralized Communication</Text>
        
        <View style={styles.meshIndicator}>
          <View style={styles.meshNode} />
          <View style={[styles.meshNode, styles.meshNodeActive]} />
          <View style={styles.meshNode} />
          <View style={[styles.meshNode, styles.meshNodeActive]} />
          <View style={styles.meshNode} />
        </View>
        
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={confirmClearData}
        >
          <Text style={styles.clearButtonText}>CLEAR ALL DATA</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
  },
  meshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  meshNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ddd",
    margin: 5,
  },
  meshNodeActive: {
    backgroundColor: "#4CAF50",
    transform: [{ scale: 1.2 }],
  },
  clearButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  clearButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SplashScreen;