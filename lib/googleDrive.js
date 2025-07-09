const { google } = require('googleapis');

const initializeGoogleDrive = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
};

const createEventFolders = async () => {
  const drive = initializeGoogleDrive();
  
  const events = ['mehndi', 'haldi', 'dj-night', 'wedding'];
  const folderIds = {};
  
  try {
    // Create main wedding folder if it doesn't exist
    const mainFolderResponse = await drive.files.create({
      requestBody: {
        name: 'Wedding Photos',
        mimeType: 'application/vnd.google-apps.folder',
      },
    });
    
    const mainFolderId = mainFolderResponse.data.id;
    
    // Create subfolders for each event
    for (const event of events) {
      const folderResponse = await drive.files.create({
        requestBody: {
          name: event.charAt(0).toUpperCase() + event.slice(1).replace('-', ' '),
          mimeType: 'application/vnd.google-apps.folder',
          parents: [mainFolderId],
        },
      });
      folderIds[event] = folderResponse.data.id;
    }
    
    return folderIds;
  } catch (error) {
    console.error('Error creating folders:', error);
    throw error;
  }
};

const uploadToGoogleDrive = async (fileBuffer, fileName, folderId) => {
  const drive = initializeGoogleDrive();
  
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: 'image/jpeg',
        body: require('stream').Readable.from(fileBuffer),
      },
    });
    
    return response.data.id;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

module.exports = {
  initializeGoogleDrive,
  createEventFolders,
  uploadToGoogleDrive
};
