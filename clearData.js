// This is a standalone script to clear all AsyncStorage data
// Run this with: node clearData.js

const fs = require('fs');
const path = require('path');

// Path to AsyncStorage files
const asyncStoragePath = path.join(process.env.HOME || process.env.USERPROFILE, 'Library/Application Support/ReactNativeAsyncStorage');

console.log('Attempting to clear AsyncStorage data...');

try {
  if (fs.existsSync(asyncStoragePath)) {
    // Read all files in the directory
    const files = fs.readdirSync(asyncStoragePath);
    
    console.log(`Found ${files.length} files in AsyncStorage directory`);
    
    // Delete each file
    files.forEach(file => {
      const filePath = path.join(asyncStoragePath, file);
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file}`);
    });
    
    console.log('All AsyncStorage data has been cleared successfully!');
  } else {
    console.log('AsyncStorage directory not found. No data to clear.');
  }
} catch (error) {
  console.error('Error clearing AsyncStorage data:', error);
}