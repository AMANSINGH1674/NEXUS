const AsyncStorage = require('@react-native-async-storage/async-storage').default;

/**
 * This script immediately clears all data from AsyncStorage
 */
async function clearAllData() {
  try {
    console.log('Clearing all app data...');
    
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    console.log('Found keys:', keys);
    
    // Remove all keys
    await AsyncStorage.multiRemove(keys);
    
    console.log('All data cleared successfully!');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

// Run the function
clearAllData();