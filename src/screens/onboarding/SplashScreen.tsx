import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";

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
});

export default SplashScreen;