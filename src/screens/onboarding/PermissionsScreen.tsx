import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform, ScrollView } from "react-native";
import { Button } from "../../components/ui/button";
import { PermissionsAndroid } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

interface PermissionsScreenProps {
  onComplete: () => void;
}

interface PermissionStatus {
  bluetooth: boolean;
  location: boolean;
  notifications: boolean;
  background: boolean;
}

const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onComplete }) => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    bluetooth: false,
    location: false,
    notifications: false,
    background: false,
  });

  const [allGranted, setAllGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    const { bluetooth, location, notifications, background } = permissionStatus;
    setAllGranted(bluetooth && location && notifications && background);
  }, [permissionStatus]);

  const checkPermissions = async () => {
    // Check Bluetooth permissions
    let bluetoothGranted = false;
    if (Platform.OS === "android") {
      if (parseInt(Platform.Version.toString(), 10) >= 31) {
        // Android 12+ (API 31+)
        const bluetoothScan = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
        const bluetoothConnect = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
        const bluetoothAdvertise = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
        );
        bluetoothGranted = bluetoothScan && bluetoothConnect && bluetoothAdvertise;
      } else {
        // Older Android versions
        bluetoothGranted = true; // No runtime permissions needed
      }
    } else {
      // iOS doesn't have runtime Bluetooth permissions
      bluetoothGranted = true;
    }

    // Check Location permissions
    const locationStatus = await Location.getForegroundPermissionsAsync();
    const backgroundLocationStatus = await Location.getBackgroundPermissionsAsync();

    // Check Notification permissions
    const notificationStatus = await Notifications.getPermissionsAsync();

    setPermissionStatus({
      bluetooth: bluetoothGranted,
      location: locationStatus.granted,
      notifications: notificationStatus.granted,
      background: backgroundLocationStatus.granted,
    });
  };

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === "android") {
      if (parseInt(Platform.Version.toString(), 10) >= 31) {
        // Android 12+ (API 31+)
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        const allGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );
        
        setPermissionStatus((prev) => ({ ...prev, bluetooth: allGranted }));
      } else {
        // Older Android versions
        setPermissionStatus((prev) => ({ ...prev, bluetooth: true }));
      }
    } else {
      // iOS doesn't have runtime Bluetooth permissions
      setPermissionStatus((prev) => ({ ...prev, bluetooth: true }));
    }
  };

  const requestLocationPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus((prev) => ({ ...prev, location: status === "granted" }));
  };

  const requestBackgroundLocationPermissions = async () => {
    // Request foreground location first if not granted
    if (!permissionStatus.location) {
      await requestLocationPermissions();
    }
    
    const { status } = await Location.requestBackgroundPermissionsAsync();
    setPermissionStatus((prev) => ({ ...prev, background: status === "granted" }));
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus((prev) => ({ ...prev, notifications: status === "granted" }));
  };

  const requestAllPermissions = async () => {
    await requestBluetoothPermissions();
    await requestLocationPermissions();
    await requestBackgroundLocationPermissions();
    await requestNotificationPermissions();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Required Permissions</Text>
      <Text style={styles.subtitle}>
        The mesh network requires the following permissions to function properly:
      </Text>

      <View style={styles.permissionItem}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionTitle}>Bluetooth</Text>
          <PermissionStatus granted={permissionStatus.bluetooth} />
        </View>
        <Text style={styles.permissionDescription}>
          Required to discover and connect to nearby devices in the mesh network.
        </Text>
        <Button
          onPress={requestBluetoothPermissions}
          disabled={permissionStatus.bluetooth}
          style={[styles.button, permissionStatus.bluetooth && styles.buttonDisabled]}
        >
          {permissionStatus.bluetooth ? "Granted" : "Grant Permission"}
        </Button>
      </View>

      <View style={styles.permissionItem}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionTitle}>Location</Text>
          <PermissionStatus granted={permissionStatus.location} />
        </View>
        <Text style={styles.permissionDescription}>
          Required for Bluetooth scanning and to share your location in emergency situations.
        </Text>
        <Button
          onPress={requestLocationPermissions}
          disabled={permissionStatus.location}
          style={[styles.button, permissionStatus.location && styles.buttonDisabled]}
        >
          {permissionStatus.location ? "Granted" : "Grant Permission"}
        </Button>
      </View>

      <View style={styles.permissionItem}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionTitle}>Background Location</Text>
          <PermissionStatus granted={permissionStatus.background} />
        </View>
        <Text style={styles.permissionDescription}>
          Allows the mesh network to operate when the app is in the background.
        </Text>
        <Button
          onPress={requestBackgroundLocationPermissions}
          disabled={permissionStatus.background}
          style={[styles.button, permissionStatus.background && styles.buttonDisabled]}
        >
          {permissionStatus.background ? "Granted" : "Grant Permission"}
        </Button>
      </View>

      <View style={styles.permissionItem}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionTitle}>Notifications</Text>
          <PermissionStatus granted={permissionStatus.notifications} />
        </View>
        <Text style={styles.permissionDescription}>
          Allows the app to notify you about incoming messages and emergency alerts.
        </Text>
        <Button
          onPress={requestNotificationPermissions}
          disabled={permissionStatus.notifications}
          style={[styles.button, permissionStatus.notifications && styles.buttonDisabled]}
        >
          {permissionStatus.notifications ? "Granted" : "Grant Permission"}
        </Button>
      </View>

      <View style={styles.actionButtons}>
        <Button
          onPress={requestAllPermissions}
          style={styles.grantAllButton}
        >
          Grant All Permissions
        </Button>
        
        <Button
          onPress={onComplete}
          disabled={!allGranted}
          style={[styles.continueButton, !allGranted && styles.buttonDisabled]}
        >
          Continue
        </Button>
      </View>
    </ScrollView>
  );
};

interface PermissionStatusProps {
  granted: boolean;
}

const PermissionStatus: React.FC<PermissionStatusProps> = ({ granted }) => (
  <View style={[styles.statusBadge, granted ? styles.statusGranted : styles.statusDenied]}>
    <Text style={styles.statusText}>{granted ? "Granted" : "Required"}</Text>
  </View>
);

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
    marginBottom: 30,
  },
  permissionItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  permissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  permissionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusGranted: {
    backgroundColor: "#4CAF50",
  },
  statusDenied: {
    backgroundColor: "#FF9800",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtons: {
    marginTop: 20,
    marginBottom: 40,
  },
  grantAllButton: {
    marginBottom: 15,
    backgroundColor: "#2196F3",
  },
  continueButton: {
    paddingVertical: 12,
  },
});

export default PermissionsScreen;