/**
 * This file overrides the mock data in the app
 * It's imported by key components to ensure no mock data is displayed
 */

// Empty mock data
export const EMPTY_USERS = [];
export const EMPTY_CHATS = [];
export const EMPTY_GROUPS = [];

// Function to clear AsyncStorage data
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearAllMockData() {
  try {
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Remove all keys
    if (keys.length > 0) {
      await AsyncStorage.multiRemove(keys);
      console.log('Cleared all AsyncStorage data:', keys);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear AsyncStorage data:', error);
    return false;
  }
}