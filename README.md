# MeshConnect - Bluetooth Mesh Networking App

A React Native mobile application with Bluetooth Mesh networking capabilities for off-grid communication.

## Features

- **Bluetooth Mesh Networking**: Decentralized communication without internet
- **End-to-End Encryption**: Secure messaging with AES-256 and ECDH key exchange
- **Multi-hop Routing**: Messages relay through multiple devices
- **Store-and-Forward**: Delayed message delivery when recipients are offline
- **Emergency Broadcast**: Priority messaging during emergencies
- **Power-Aware Operation**: Adaptive scanning and advertising based on battery level
- **Offline Operation**: 100% functional without internet connectivity

## Project Structure

The project follows Clean Architecture principles with separation of concerns:

```
src/
├── components/     # UI components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── navigation/     # Navigation configuration
├── screens/        # Screen components
├── services/       # Core services (Bluetooth, Mesh)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Core Technologies

- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type-safe JavaScript
- **react-native-ble-plx**: Bluetooth Low Energy library
- **react-native-mmkv**: High-performance key-value storage
- **react-native-keychain**: Secure storage for cryptographic keys

## Setup Instructions

### Prerequisites

- Node.js 16+
- Yarn or npm
- Xcode (for iOS)
- Android Studio (for Android)
- Physical devices for testing (Bluetooth functionality requires real devices)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd MeshConnect
   ```

2. Install dependencies:
   ```
   yarn install
   # or
   npm install
   ```

3. iOS specific setup:
   ```
   cd ios
   pod install
   cd ..
   ```

4. Add required permissions:

   **iOS (Info.plist):**
   - NSBluetoothAlwaysUsageDescription
   - NSBluetoothPeripheralUsageDescription
   - NSLocationWhenInUseUsageDescription
   - NSLocationAlwaysAndWhenInUseUsageDescription

   **Android (AndroidManifest.xml):**
   - BLUETOOTH
   - BLUETOOTH_ADMIN
   - BLUETOOTH_SCAN
   - BLUETOOTH_CONNECT
   - BLUETOOTH_ADVERTISE
   - ACCESS_FINE_LOCATION
   - ACCESS_COARSE_LOCATION

### Running the App

#### iOS:
```
npx react-native run-ios --device
```

#### Android:
```
npx react-native run-android
```

## Bluetooth Mesh Implementation

The Bluetooth Mesh implementation uses a custom protocol built on top of BLE GATT services:

1. **Device Discovery**: Scanning for nearby mesh nodes
2. **Connection Management**: Establishing and maintaining connections
3. **Message Routing**: Multi-hop message delivery with TTL
4. **Store-and-Forward**: Queuing messages for offline recipients
5. **Encryption**: End-to-end encryption for all messages

## Testing

For testing the mesh functionality, you'll need at least 3 physical devices to observe the multi-hop routing capabilities.

## Hackathon Demo Tips

1. **Prepare Devices**: Have at least 3-4 devices fully charged and pre-installed with the app
2. **Demonstrate Mesh Topology**: Show how messages route through multiple devices
3. **Emergency Mode**: Demonstrate the emergency broadcast functionality
4. **Offline Operation**: Show how the app works without internet connectivity
5. **Battery Optimization**: Explain the power-aware behavior

## License

[MIT License](LICENSE)