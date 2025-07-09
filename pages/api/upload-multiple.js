const { initializeGoogleDrive } = require('../../lib/googleDrive');
const { uploadMultipleMiddleware, runMiddleware } = require('../../utils/multer');
const { checkAuth } = require('../../lib/auth');
const { Readable } = require('stream');

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

// Pre-configured folder IDs for each event
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

  try {
    // Run multer middleware for multiple files
    await runMiddleware(req, res, uploadMultipleMiddleware);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { event } = req.body;
    
    if (!event || !FOLDER_IDS[event]) {
      return res.status(400).json({ error: 'Invalid event specified' });
    }

    // Initialize Google Drive
    const drive = initializeGoogleDrive();

    const uploadResults = [];
    const errors = [];

    // Upload each file
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        // Create a readable stream from the buffer
        const bufferStream = Readable.from(file.buffer);

        // Generate filename with timestamp, uploader name and index
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedName = uploaderName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${event}_${timestamp}_${sanitizedName}_${i + 1}_${file.originalname}`;

        // Upload to Google Drive
        const response = await drive.files.create({
          requestBody: {
            name: filename,
            parents: [FOLDER_IDS[event]],
            description: `Uploaded by: ${uploaderName} on ${new Date().toLocaleString()} (File ${i + 1} of ${req.files.length})`,
          },
          media: {
            mimeType: file.mimetype,
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

        uploadResults.push({
          success: true,
          fileId: response.data.id,
          filename: filename,
          originalName: file.originalname,
          uploader: uploaderName,
          index: i + 1
        });

      } catch (error) {
        console.error(`Upload error for file ${i + 1}:`, error);
        errors.push({
          index: i + 1,
          filename: file.originalname,
          error: error.message
        });
      }
    }

    // Return results
    const successCount = uploadResults.length;
    const errorCount = errors.length;
    const totalFiles = req.files.length;

    res.status(200).json({
      success: errorCount === 0,
      totalFiles: totalFiles,
      successCount: successCount,
      errorCount: errorCount,
      uploadResults: uploadResults,
      errors: errors,
      message: errorCount === 0 
        ? `All ${successCount} photos uploaded successfully!`
        : `${successCount} out of ${totalFiles} photos uploaded successfully. ${errorCount} failed.`
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
}
