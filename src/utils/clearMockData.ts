import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Immediately clears all mock users and groups data
 */
export async function clearAllMockData(): Promise<void> {
  try {
    // Clear all mock data
    await AsyncStorage.removeItem('cachedUsers');
    await AsyncStorage.removeItem('cachedChats');
    await AsyncStorage.removeItem('cachedGroups');
    await AsyncStorage.removeItem('cachedMessages');
    await AsyncStorage.removeItem('cachedRoutes');
    
    console.log('All mock users and groups cleared successfully');
  } catch (error) {
    console.error('Failed to clear mock data:', error);
  }
}