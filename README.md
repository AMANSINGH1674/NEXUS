# MeshConnect [https://mesh-bluetooth.netlify.app/]

MeshConnect is a modern Bluetooth Mesh networking app for secure, off-grid communication. Built with React Native, it enables seamless messaging, file sharing, and emergency broadcasts—no internet required.

## ✨ Features

- **Bluetooth Mesh Networking**: Decentralized, multi-hop communication
- **End-to-End Encryption**: Secure messaging with AES-256 and ECDH
- **File & Image Sharing**: Instantly share files and images with your mesh
- **Emergency Broadcasts**: Priority alerts for critical situations
- **Power-Aware Operation**: Optimized for battery life
- **Offline-First**: Works anywhere, even without internet
- **Modern UI**: Clean, intuitive, and mobile-friendly

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Yarn or npm
- Xcode (iOS) / Android Studio (Android)
- Physical devices for Bluetooth testing

### Installation
```sh
git clone <repository-url>
cd MeshConnect
yarn install # or npm install
```

### iOS Setup
```sh
cd ios
pod install
cd ..
```

### Permissions
Add the following to your project:
- **iOS (Info.plist):**
  - NSBluetoothAlwaysUsageDescription
  - NSBluetoothPeripheralUsageDescription
  - NSLocationWhenInUseUsageDescription
  - NSLocationAlwaysAndWhenInUseUsageDescription
- **Android (AndroidManifest.xml):**
  - BLUETOOTH, BLUETOOTH_ADMIN, BLUETOOTH_SCAN, BLUETOOTH_CONNECT, BLUETOOTH_ADVERTISE
  - ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION

### Running the App
- **iOS:**
  ```sh
  npx react-native run-ios --device
  ```
- **Android:**
  ```sh
  npx react-native run-android
  ```

## 🛠️ How It Works
- **Device Discovery:** Scan and connect to nearby mesh nodes
- **Messaging:** Send encrypted messages, files, and images
- **Emergency Mode:** Instantly broadcast urgent alerts
- **Mesh Routing:** Messages relay through multiple devices for extended range

## 🧪 Demo Tips
- Use 3+ devices for best mesh experience
- Try sending messages and files with and without internet
- Test emergency broadcasts and see instant delivery
- Explore the network topology visualization

## 📄 License
[MIT License](LICENSE)
