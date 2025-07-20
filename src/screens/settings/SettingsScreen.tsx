import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button } from '../../components/ui/button';
import { useMesh } from '../../context/MeshContext';
import { removeMockUsersOnly, resetAllAppData } from '../../utils/resetAppData';

const SettingsScreen = () => {
  const { initializeMesh } = useMesh();

  const clearAllMockData = async () => {
    try {
      // Remove only mock users, preserving local user
      await removeMockUsersOnly();
      
      // Re-initialize mesh with existing user data
      await initializeMesh({});
      
      Alert.alert(
        "Success",
        "All mock users and conversations have been removed",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Failed to clear data:', error);
      Alert.alert(
        "Error",
        "Failed to clear mock data. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const resetEntireApp = async () => {
    try {
      // Reset all app data completely
      await resetAllAppData();
      
      // Re-initialize mesh with default user
      await initializeMesh({ name: "Me", avatar: "" });
      
      Alert.alert(
        "Success",
        "App has been completely reset",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Failed to reset app:', error);
      Alert.alert(
        "Error",
        "Failed to reset app. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const confirmRemoveMockData = () => {
    Alert.alert(
      "Remove Mock Users",
      "This will remove all mock users like Alice, Bob, Carol and their conversations. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: clearAllMockData, style: "destructive" }
      ]
    );
  };

  const confirmFullReset = () => {
    Alert.alert(
      "Reset Entire App",
      "This will completely reset the app, removing ALL data including your profile. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset Everything", onPress: resetEntireApp, style: "destructive" }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Remove Mock Users</Text>
          <Text style={styles.cardDescription}>
            Remove all mock users, groups, and conversations from the app.
            This will clear Alice, Bob, Carol, and all other demo data.
          </Text>
          <Button 
            onPress={confirmRemoveMockData}
            style={styles.dangerButton}
          >
            Remove Mock Users
          </Button>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reset Entire App</Text>
          <Text style={styles.cardDescription}>
            Completely reset the app to its initial state. This will remove ALL data
            including your profile and settings.
          </Text>
          <Button 
            onPress={confirmFullReset}
            style={[styles.dangerButton, styles.resetButton]}
          >
            Reset Everything
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  resetButton: {
    backgroundColor: '#6c757d',
  },
});

export default SettingsScreen;