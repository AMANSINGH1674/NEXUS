const fs = require('fs');
const path = require('path');

// Files to modify
const filesToModify = [
  path.join(__dirname, 'components/screens/chats-screen.tsx'),
  path.join(__dirname, 'app/page.tsx')
];

// Process each file
filesToModify.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Processing ${filePath}...`);
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace mock data arrays with empty arrays
    content = content.replace(/const mockChats\s*=\s*\[[\s\S]*?\];/g, 'const mockChats = [];');
    content = content.replace(/const mockUsers\s*=\s*\[[\s\S]*?\];/g, 'const mockUsers = [];');
    
    // Write the modified content back
    fs.writeFileSync(filePath, content);
    console.log(`Modified ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Done removing mock users!');