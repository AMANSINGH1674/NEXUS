import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Performs cleanup operations on app startup
 * - Removes all mock users and conversations
 * - Ensures a clean start for each user
 */
export async function performStartupCleanup(): Promise<void> {
  try {
    console.log('Performing startup cleanup...');
    
    // Keys to clear on startup
    const keysToRemove = [
      'cachedUsers',
      'cachedChats', 
      'cachedGroups',
      'cachedMessages',
      'cachedRoutes'
    ];
    
    // Remove all keys
    await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
    
    console.log('Startup cleanup completed successfully');
  } catch (error) {
    console.error('Error during startup cleanup:', error);
  }
}