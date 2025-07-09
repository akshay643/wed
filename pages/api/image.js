const { initializeGoogleDrive } = require('../../lib/googleDrive');
const { checkAuth } = require('../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const { authenticated } = checkAuth(req);
  if (!authenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { fileId } = req.query;

  if (!fileId) {
    return res.status(400).json({ error: 'File ID is required' });
  }

  try {
    const drive = initializeGoogleDrive();

    // Get the file metadata first
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size'
    });

    // Get the file content
    const fileResponse = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });

    // Set appropriate headers for images and videos
    res.setHeader('Content-Type', fileMetadata.data.mimeType);
    if (fileMetadata.data.size) {
      res.setHeader('Content-Length', fileMetadata.data.size);
    }
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Accept-Ranges', 'bytes'); // Enable range requests for videos
    res.setHeader('Content-Disposition', `inline; filename="${fileMetadata.data.name}"`);

    // Pipe the file stream to the response
    fileResponse.data.pipe(res);

  } catch (error) {
    console.error('Media proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch media file',
      details: error.message 
    });
  }
}
