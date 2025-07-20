import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from "react-native";
import { Button } from "../../components/ui/button";
import { Ionicons } from "@expo/vector-icons";

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const { width } = Dimensions.get("window");

const slides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Offline Mesh Network",
    description: "Connect directly with nearby devices without internet or cellular service.",
    icon: "wifi",
  },
  {
    id: "2",
    title: "Secure Communication",
    description: "End-to-end encrypted messages that only the intended recipients can read.",
    icon: "lock-closed",
  },
  {
    id: "3",
    title: "Multi-hop Messaging",
    description: "Messages relay through multiple devices to reach destinations beyond direct range.",
    icon: "git-network",
  },
  {
    id: "4",
    title: "Emergency Mode",
    description: "Priority communication channel during emergencies with extended range capabilities.",
    icon: "warning",
  },
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={80} color="#4CAF50" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.flatList}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <Button onPress={handleNext} style={styles.nextButton}>
          {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ddd",
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: "#4CAF50",
    transform: [{ scale: 1.2 }],
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    fontSize: 16,
    color: "#666",
  },
  nextButton: {
    paddingHorizontal: 30,
  },
});

export default OnboardingFlow;