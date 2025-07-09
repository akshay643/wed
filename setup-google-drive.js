const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// This script helps you set up Google Drive folders and get the folder IDs
// Run this after you've set up your service account credentials

async function setupGoogleDrive() {
  console.log('Setting up Google Drive folders...');
  
  // Read your service account key file
  const keyFilePath = path.join(__dirname, 'service-account-key.json');
  
  if (!fs.existsSync(keyFilePath)) {
    console.error('❌ service-account-key.json not found!');
    console.log('Please download your service account key from Google Cloud Console and save it as service-account-key.json in this folder');
    return;
  }
  
  const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  
  const drive = google.drive({ version: 'v3', auth });
  
  try {
    // Create main wedding folder
    console.log('Creating main Wedding Photos folder...');
    const mainFolderResponse = await drive.files.create({
      requestBody: {
        name: 'Akshay & Tripti Wedding Photos',
        mimeType: 'application/vnd.google-apps.folder',
      },
    });
    
    const mainFolderId = mainFolderResponse.data.id;
    console.log(`✅ Main folder created: ${mainFolderId}`);
    
    // Make the main folder publicly viewable (optional)
    await drive.permissions.create({
      fileId: mainFolderId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    // Create event subfolders
    const events = [
      { key: 'mehndi', name: 'Mehndi' },
      { key: 'haldi', name: 'Haldi' },
      { key: 'dj-night', name: 'DJ Night' },
      { key: 'wedding', name: 'Wedding' }
    ];
    
    const folderIds = {};
    
    for (const event of events) {
      console.log(`Creating ${event.name} folder...`);
      const folderResponse = await drive.files.create({
        requestBody: {
          name: event.name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [mainFolderId],
        },
      });
      
      const folderId = folderResponse.data.id;
      folderIds[event.key] = folderId;
      
      // Make each subfolder publicly viewable
      await drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      
      console.log(`✅ ${event.name} folder created: ${folderId}`);
    }
    
    // Generate .env content
    console.log('\n📄 Add these to your .env file:');
    console.log('=====================================');
    console.log(`GOOGLE_PROJECT_ID=${serviceAccount.project_id}`);
    console.log(`GOOGLE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}`);
    console.log(`GOOGLE_PRIVATE_KEY="${serviceAccount.private_key}"`);
    console.log(`GOOGLE_CLIENT_EMAIL=${serviceAccount.client_email}`);
    console.log(`GOOGLE_CLIENT_ID=${serviceAccount.client_id}`);
    console.log(`MEHNDI_FOLDER_ID=${folderIds.mehndi}`);
    console.log(`HALDI_FOLDER_ID=${folderIds.haldi}`);
    console.log(`DJ_NIGHT_FOLDER_ID=${folderIds['dj-night']}`);
    console.log(`WEDDING_FOLDER_ID=${folderIds.wedding}`);
    console.log('=====================================');
    
    console.log('\n🎉 Google Drive setup complete!');
    console.log(`Main folder: https://drive.google.com/drive/folders/${mainFolderId}`);
    
  } catch (error) {
    console.error('❌ Error setting up Google Drive:', error.message);
  }
}

if (require.main === module) {
  setupGoogleDrive();
}

module.exports = { setupGoogleDrive };
