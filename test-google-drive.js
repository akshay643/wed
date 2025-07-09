const { initializeGoogleDrive } = require('./lib/googleDrive');

// Simple test script to verify Google Drive configuration
async function testGoogleDriveConfig() {
  console.log('Testing Google Drive configuration...');
  
  // Check environment variables
  const requiredVars = [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CLIENT_EMAIL',
    'MEHNDI_FOLDER_ID',
    'HALDI_FOLDER_ID',
    'DJ_NIGHT_FOLDER_ID',
    'WEDDING_FOLDER_ID'
  ];
  
  console.log('\n📋 Checking environment variables:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.startsWith('your-')) {
      console.log(`❌ ${varName}: Not configured`);
      return false;
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  }
  
  // Test Google Drive connection
  try {
    console.log('\n🔗 Testing Google Drive connection...');
    const drive = initializeGoogleDrive();
    
    // Try to list files in one of the folders
    const folderId = process.env.MEHNDI_FOLDER_ID;
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      pageSize: 1,
    });
    
    console.log('✅ Google Drive connection successful!');
    console.log(`📁 Mehndi folder accessible (contains ${response.data.files.length} files)`);
    return true;
    
  } catch (error) {
    console.log('❌ Google Drive connection failed:');
    console.log(error.message);
    return false;
  }
}

if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  testGoogleDriveConfig();
}

module.exports = { testGoogleDriveConfig };
