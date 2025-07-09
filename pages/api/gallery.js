const { initializeGoogleDrive } = require('../../lib/googleDrive');
const { checkAuth } = require('../../lib/auth');

const FOLDER_IDS = {
  mehndi: process.env.MEHNDI_FOLDER_ID,
  haldi: process.env.HALDI_FOLDER_ID,
  'dj-night': process.env.DJ_NIGHT_FOLDER_ID,
  wedding: process.env.WEDDING_FOLDER_ID,
};

// API route to fetch gallery images by event
export default async function handler(req, res) {
  try {
    // Check authentication
    const { authenticated } = checkAuth(req);
    if (!authenticated) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { event } = req.query;
    if (!event) {
      return res.status(400).json({ images: [] });
    }

    // Check if Google Drive environment variables are set
    if (!process.env.GOOGLE_PROJECT_ID || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL) {
      console.error('Missing Google Drive environment variables');
      return res.status(500).json({ 
        error: 'Google Drive configuration not found. Please set up environment variables.',
        images: []
      });
    }

    // Check if any folder IDs are configured
    const configuredFolders = Object.values(FOLDER_IDS).filter(id => id && id !== 'your-mehndi-folder-id' && id !== 'your-haldi-folder-id' && id !== 'your-dj-night-folder-id' && id !== 'your-wedding-folder-id');
    if (configuredFolders.length === 0) {
      console.warn('No Google Drive folder IDs configured');
      return res.status(200).json({ 
        images: [],
        message: 'No folders configured yet. Please set up Google Drive folder IDs.'
      });
    }

    const drive = initializeGoogleDrive();
    
    // Build query to search for images and videos
    let q = `(mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`;
    
    if (event && event !== 'all' && FOLDER_IDS[event] && FOLDER_IDS[event].startsWith('your-') === false) {
      // Search in specific event folder
      q += ` and '${FOLDER_IDS[event]}' in parents`;
    } else if (event === 'all') {
      // Search in all configured event folders
      const folderIds = Object.values(FOLDER_IDS).filter(id => id && !id.startsWith('your-'));
      if (folderIds.length > 0) {
        q += ` and (${folderIds.map(id => `'${id}' in parents`).join(' or ')})`;
      }
    } else {
      // No valid folder for this event
      return res.status(200).json({ images: [] });
    }

    const response = await drive.files.list({
      q,
      fields: 'files(id, name, webViewLink, webContentLink, thumbnailLink, parents, description, createdTime, mimeType)',
      orderBy: 'createdTime desc',
      pageSize: 50,
    });

    // Function to extract uploader name from filename
    const extractUploaderFromFilename = (filename) => {
      // Expected format: event_timestamp_uploadername_originalfile.ext
      const parts = filename.split('_');
      if (parts.length >= 4) {
        return parts[2].replace(/[_]/g, ' '); // Convert underscores back to spaces
      }
      return null;
    };

    // Function to extract uploader name from description
    const extractUploaderFromDescription = (description) => {
      if (description && description.includes('Uploaded by:')) {
        const match = description.match(/Uploaded by: (.+?) on/);
        return match ? match[1] : null;
      }
      return null;
    };

    const images = (response.data.files || []).map(file => {
      const uploaderFromFilename = extractUploaderFromFilename(file.name);
      const uploaderFromDescription = extractUploaderFromDescription(file.description);
      const uploader = uploaderFromDescription || uploaderFromFilename || 'Unknown';
      
      const isVideo = file.mimeType.startsWith('video/');

      // Better thumbnail handling for videos
      let thumbnailUrl;
      if (isVideo) {
        // For videos, try multiple thumbnail approaches
        thumbnailUrl = file.thumbnailLink || 
                      `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h400` ||
                      `https://drive.google.com/file/d/${file.id}/view`;
      } else {
        // For images, use standard thumbnail
        thumbnailUrl = file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h400`;
      }

      return {
        id: file.id,
        url: thumbnailUrl, // For grid display (thumbnail)
        fullUrl: `/api/image?fileId=${file.id}`, // For full-screen viewing via our proxy
        downloadUrl: file.webContentLink || `https://drive.google.com/uc?export=download&id=${file.id}`, // For downloads
        name: file.name,
        uploader: uploader,
        uploadedAt: file.createdTime,
        isVideo: isVideo,
        mimeType: file.mimeType,
        event: Object.keys(FOLDER_IDS).find(key => file.parents?.includes(FOLDER_IDS[key])) || '',
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        thumbnailLink: file.thumbnailLink,
      };
    });

    res.status(200).json({ images });

  } catch (error) {
    console.error('Gallery API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch images from Google Drive',
      images: [],
      details: error.message 
    });
  }
}
