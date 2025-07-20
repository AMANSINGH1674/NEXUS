import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Completely resets all app data, removing mock users, chats, and messages
 */
export async function resetAllAppData(): Promise<void> {
  try {
    // List of keys to remove
    const keysToRemove = [
      'cachedUsers',
      'cachedChats',
      'cachedGroups',
      'cachedMessages',
      'cachedRoutes',
      'localUser',
      'meshKeyPair'
    ];
    
    // Remove all keys
    await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
    
    console.log('All app data has been reset successfully');
    return;
  } catch (error) {
    console.error('Failed to reset app data:', error);
    throw error;
  }
}

/**
 * Removes only mock users and their conversations, preserving the local user
 */
export async function removeMockUsersOnly(): Promise<void> {
  try {
    // Get local user data to preserve it
    const localUserData = await AsyncStorage.getItem('localUser');
    
    // Clear all user-related data
    await AsyncStorage.removeItem('cachedUsers');
    await AsyncStorage.removeItem('cachedChats');
    await AsyncStorage.removeItem('cachedGroups');
    await AsyncStorage.removeItem('cachedMessages');
    await AsyncStorage.removeItem('cachedRoutes');
    
    // Restore local user if it existed
    if (localUserData) {
      await AsyncStorage.setItem('localUser', localUserData);
    }
    
    console.log('Mock users and conversations removed successfully');
    return;
  } catch (error) {
    console.error('Failed to remove mock users:', error);
    throw error;
  }
}