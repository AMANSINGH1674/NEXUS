import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { Button } from "../../components/ui/button";
import * as ImagePicker from "expo-image-picker";

interface ProfileSetupProps {
  onComplete: (userData: { name: string; avatar: string }) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Validate form
  React.useEffect(() => {
    setIsValid(name.trim().length >= 2);
  }, [name]);

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to select image. Please try again.");
    }
  };

  const handleSubmit = () => {
    if (isValid) {
      onComplete({
        name: name.trim(),
        avatar: avatar || `https://via.placeholder.com/150?text=${name.charAt(0).toUpperCase()}`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up Your Profile</Text>
      <Text style={styles.subtitle}>
        This information will be shared with other mesh network users
      </Text>

      <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {name ? name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
        )}
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarBadgeText}>+</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.label}>Your Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        autoCapitalize="words"
        autoCorrect={false}
      />

      <View style={styles.spacer} />

      <Button
        onPress={handleSubmit}
        disabled={!isValid}
        style={[styles.button, !isValid && styles.buttonDisabled]}
      >
        Continue
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 30,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 40,
    color: "#666",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#f5f5f5",
  },
  avatarBadgeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  button: {
    paddingVertical: 12,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ProfileSetup;