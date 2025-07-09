// API route to handle file downloads from Google Drive
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileId, fileName } = req.query;

  if (!fileId) {
    return res.status(400).json({ error: 'File ID is required' });
  }

  try {
    // Initialize Google Drive API
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
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Get file metadata first
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'name, mimeType, size'
    });

    // Get the file content
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });

    // Set proper headers for download
    const downloadFileName = fileName || fileMetadata.data.name || 'wedding-photo.jpg';
    const mimeType = fileMetadata.data.mimeType || 'image/jpeg';
    
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'no-cache');
    
    // If we have the file size, set the content length
    if (fileMetadata.data.size) {
      res.setHeader('Content-Length', fileMetadata.data.size);
    }

    // Pipe the file stream to the response
    response.data.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    
    if (error.code === 404) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (error.code === 403) {
      return res.status(403).json({ error: 'Access denied. File may be private.' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to download file',
      details: error.message 
    });
  }
}

// Increase the response size limit for large images
export const config = {
  api: {
    responseLimit: '50mb',
  },
};
