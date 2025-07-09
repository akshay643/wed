const { checkAuth } = require('../../../lib/auth');
const { initializeGoogleDrive } = require('../../../lib/googleDrive');

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Significantly increased limit for high-quality background images
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const { authenticated } = checkAuth(req);
    if (!authenticated) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { imageData, fileName, mimeType } = req.body;
    
    if (!imageData || !fileName) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    // Initialize Google Drive
    const drive = initializeGoogleDrive();

    // Convert base64 to buffer
    const buffer = Buffer.from(imageData.split(',')[1], 'base64');

    // Upload to Google Drive in the wedding folder
    const weddingFolderId = process.env.MAIN_FOLDER_ID;
    if (!weddingFolderId) {
      return res.status(500).json({ error: 'Wedding folder not configured' });
    }
    const fileMetadata = {
      name: `login-bg-${Date.now()}-${fileName}`,
      description: 'Login page background image',
      parents: [weddingFolderId], // ensure file is uploaded to wedding folder
    };

    const media = {
      mimeType: mimeType || 'image/jpeg',
      body: require('stream').Readable.from(buffer),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,webViewLink,webContentLink',
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: file.data.id,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Generate public URL for full quality image - various formats
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.data.id}`;
    const viewUrl = `https://drive.google.com/uc?export=view&id=${file.data.id}`;
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${file.data.id}&sz=w2000`;
    const directUrl = `https://lh3.googleusercontent.com/d/${file.data.id}`;

    // Update the login-config.json file with the new image URL
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const CONFIG_FILE = path.join(process.cwd(), 'login-config.json');
      
      const config = { 
        backgroundImage: downloadUrl, // This format usually works best
        thumbnailUrl: thumbnailUrl,
        viewUrl: viewUrl,
        directUrl: directUrl,
        originalUrl: downloadUrl,
        fileId: file.data.id,
        updatedAt: new Date().toISOString() 
      };
      
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
      
      console.log('Updated login background config with new image');
    } catch (configErr) {
      console.error('Error updating config file:', configErr);
      // Continue even if config update fails
    }

    return res.status(200).json({
      success: true,
      imageUrl: downloadUrl,
      thumbnailUrl: thumbnailUrl,
      viewUrl: viewUrl,
      directUrl: directUrl, 
      fileId: file.data.id,
      message: 'Background image saved successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
}
