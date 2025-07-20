"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AppState, Platform } from "react-native"

import SplashScreen from "./src/screens/onboarding/SplashScreen"
import OnboardingFlow from "./src/screens/onboarding/OnboardingFlow"
import PermissionsScreen from "./src/screens/onboarding/PermissionsScreen"
import ProfileSetup from "./src/screens/onboarding/ProfileSetup"
import NetworkInitialization from "./src/screens/onboarding/NetworkInitialization"
import MainTabNavigator from "./src/navigation/MainTabNavigator"
import ChatScreen from "./src/screens/chat/ChatScreen"
import NetworkTopologyScreen from "./src/screens/network/NetworkTopologyScreen"

import { ThemeProvider } from "./src/context/ThemeContext"
import { MeshProvider, useMesh } from "./src/context/MeshContext"
import MeshNetworkService from "./src/services/MeshNetworkService"

const Stack = createStackNavigator()

type AppStateType = "splash" | "onboarding" | "permissions" | "profile" | "network-init" | "main"

function AppContent() {
  const [appState, setAppState] = useState<AppStateType>("splash")
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null)
  const { initializeMesh, isInitialized } = useMesh()

  useEffect(() => {
    checkFirstLaunch()

    // Handle app state changes for background/foreground transitions
    const subscription = AppState.addEventListener("change", handleAppStateChange)
    
    return () => {
      subscription.remove()
      // Clean up when component unmounts
      MeshNetworkService.shutdown().catch(console.error)
    }
  }, [])

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === "active") {
      // App came to foreground
      console.log("App is now active")
    } else if (nextAppState === "background") {
      // App went to background
      console.log("App is now in background")
    }
  }

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched")
      if (hasLaunched === null) {
        setIsFirstLaunch(true)
        await AsyncStorage.setItem("hasLaunched", "true")
      } else {
        setIsFirstLaunch(false)
        // Skip onboarding for returning users
        setTimeout(() => setAppState("main"), 2000)
      }
    } catch (error) {
      setIsFirstLaunch(true)
    }
  }

  const handleOnboardingComplete = () => {
    setAppState("main")
  }

  const handleProfileSetup = async (userData: { name: string, avatar: string }) => {
    // Initialize mesh with user data
    const success = await initializeMesh(userData)
    if (success) {
      setAppState("network-init")
    } else {
      // Handle initialization failure
      console.error("Failed to initialize mesh network")
      // Still proceed to next screen, but user will see error state
      setAppState("network-init")
    }
  }

  if (isFirstLaunch === null) {
    return null // Loading
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {appState === "splash" && (
          <Stack.Screen name="Splash">
            {() => <SplashScreen onComplete={() => setAppState(isFirstLaunch ? "onboarding" : "main")} />}
          </Stack.Screen>
        )}

        {appState === "onboarding" && (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingFlow onComplete={() => setAppState("permissions")} />}
          </Stack.Screen>
        )}

        {appState === "permissions" && (
          <Stack.Screen name="Permissions">
            {() => <PermissionsScreen onComplete={() => setAppState("profile")} />}
          </Stack.Screen>
        )}

        {appState === "profile" && (
          <Stack.Screen name="Profile">
            {() => <ProfileSetup onComplete={handleProfileSetup} />}
          </Stack.Screen>
        )}

        {appState === "network-init" && (
          <Stack.Screen name="NetworkInit">
            {() => (
              <NetworkInitialization 
                isInitialized={isInitialized} 
                onComplete={handleOnboardingComplete} 
              />
            )}
          </Stack.Screen>
        )}

        {appState === "main" && (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ presentation: "modal" }} />
            <Stack.Screen
              name="NetworkTopology"
              component={NetworkTopologyScreen}
              options={{ presentation: "modal" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  // Add required permissions to Info.plist for iOS
  // NSBluetoothAlwaysUsageDescription
  // NSBluetoothPeripheralUsageDescription
  // NSLocationWhenInUseUsageDescription
  // NSLocationAlwaysAndWhenInUseUsageDescription
  
  return (
    <ThemeProvider>
      <MeshProvider>
        <AppContent />
      </MeshProvider>
    </ThemeProvider>
  )
}
