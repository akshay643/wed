const { initializeGoogleDrive } = require('../../lib/googleDrive');
const { uploadMiddleware, runMiddleware } = require('../../utils/multer');
const { checkAuth } = require('../../lib/auth');
const { Readable } = require('stream');

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

// Pre-configured folder IDs for each event
// You'll need to update these with your actual Google Drive folder IDs
const FOLDER_IDS = {
  'mehndi': process.env.MEHNDI_FOLDER_ID || 'your-mehndi-folder-id',
  'haldi': process.env.HALDI_FOLDER_ID || 'your-haldi-folder-id',
  'dj-night': process.env.DJ_NIGHT_FOLDER_ID || 'your-dj-night-folder-id',
  'wedding': process.env.WEDDING_FOLDER_ID || 'your-wedding-folder-id',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication and get user info
  const { authenticated, user } = checkAuth(req);
  if (!authenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const uploaderName = user?.name || 'Anonymous';

  // Check if Google Drive is configured
  if (!process.env.GOOGLE_PROJECT_ID || 
      !process.env.GOOGLE_PRIVATE_KEY || 
      !process.env.GOOGLE_CLIENT_EMAIL ||
      process.env.GOOGLE_PROJECT_ID === 'your-project-id') {
    return res.status(500).json({ 
      error: 'Google Drive not configured', 
      message: 'Please set up Google Drive credentials in .env file' 
    });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, uploadMiddleware);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Log file info for debugging
    console.log('Upload API - File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      sizeMB: (req.file.size / (1024 * 1024)).toFixed(1) + 'MB'
    });

    const { event } = req.body;
    
    if (!event || !FOLDER_IDS[event]) {
      return res.status(400).json({ error: 'Invalid event specified' });
    }

    // Check if folder ID is configured
    const folderId = FOLDER_IDS[event];
    if (!folderId || folderId.startsWith('your-')) {
      return res.status(500).json({ 
        error: 'Folder not configured', 
        message: `Please set up ${event.toUpperCase()}_FOLDER_ID in .env file` 
      });
    }

    // Initialize Google Drive
    const drive = initializeGoogleDrive();

    // Create a readable stream from the buffer
    const bufferStream = Readable.from(req.file.buffer);

    // Generate filename with timestamp and uploader name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = uploaderName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${event}_${timestamp}_${sanitizedName}_${req.file.originalname}`;

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [FOLDER_IDS[event]],
        description: `Uploaded by: ${uploaderName} on ${new Date().toLocaleString()}`,
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
    });

    // Make the file publicly viewable (optional)
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const publicUrl = `https://drive.google.com/uc?id=${response.data.id}`;

    res.status(200).json({
      success: true,
      fileId: response.data.id,
      filename: filename,
      uploader: uploaderName,
      imageUrl: publicUrl,
      message: `Photo uploaded successfully by ${uploaderName}!`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
}
