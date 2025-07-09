const { google } = require('googleapis');
const { checkAuth } = require('../../lib/auth');

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
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`,
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// Function to ensure wishes file exists
async function ensureWishesFile() {
  try {
    const fileName = 'Wedding_Wishes.txt';
    const folderId = process.env.WEDDING_FOLDER_ID;

    if (!folderId || folderId === 'your-wedding-folder-id') {
      throw new Error('WEDDING_FOLDER_ID not configured in environment variables');
    }

    // Check if file already exists
    const existingFiles = await drive.files.list({
      q: `name='${fileName}' and parents in '${folderId}' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (existingFiles.data.files.length > 0) {
      return existingFiles.data.files[0].id;
    }

    // Create new wishes file
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const initialContent = `Wedding Wishes for Akshay & Tripti
========================================
Date: ${new Date().toLocaleDateString()}

`;

    const media = {
      mimeType: 'text/plain',
      body: initialContent,
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    return file.data.id;
  } catch (error) {
    console.error('Error ensuring wishes file:', error);
    throw error;
  }
}

// Function to append wish to file
async function appendWishToFile(fileId, guestName, wish, timestamp) {
  try {
    // Get current file content
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    const currentContent = response.data || '';
    
    // Format the new wish
    const formattedWish = `
---
From: ${guestName}
Date: ${new Date(timestamp).toLocaleString()}
Wish: ${wish}

`;

    // Append the new wish
    const updatedContent = currentContent + formattedWish;

    // Update the file
    const media = {
      mimeType: 'text/plain',
      body: updatedContent,
    };

    await drive.files.update({
      fileId: fileId,
      media: media,
    });

    return true;
  } catch (error) {
    console.error('Error appending wish to file:', error);
    throw error;
  }
}

// Function to get all wishes
async function getAllWishes() {
  try {
    const fileName = 'Wedding_Wishes.txt';
    const folderId = process.env.WEDDING_FOLDER_ID;

    if (!folderId || folderId === 'your-wedding-folder-id') {
      throw new Error('WEDDING_FOLDER_ID not configured in environment variables');
    }

    // Find the wishes file
    const files = await drive.files.list({
      q: `name='${fileName}' and parents in '${folderId}' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (files.data.files.length === 0) {
      return [];
    }

    // Get file content
    const response = await drive.files.get({
      fileId: files.data.files[0].id,
      alt: 'media',
    });

    const content = response.data || '';
    
    // Parse wishes from content
    const wishes = [];
    const wishBlocks = content.split('---').slice(1); // Skip header

    wishBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const fromMatch = lines[0].match(/From: (.+)/);
        const dateMatch = lines[1].match(/Date: (.+)/);
        const wishMatch = lines[2].match(/Wish: (.+)/);

        if (fromMatch && dateMatch && wishMatch) {
          wishes.push({
            guestName: fromMatch[1],
            timestamp: dateMatch[1],
            wish: wishMatch[1],
          });
        }
      }
    });

    return wishes.reverse(); // Show newest first
  } catch (error) {
    console.error('Error getting wishes:', error);
    return [];
  }
}

async function handler(req, res) {
  // Check authentication first
  const { authenticated, user } = checkAuth(req);
  
  if (!authenticated) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  try {
    if (req.method === 'POST') {
      // Submit a new wish
      const { guestName, wish, timestamp } = req.body;

      if (!guestName || !wish) {
        return res.status(400).json({ 
          success: false, 
          error: 'Guest name and wish are required' 
        });
      }

      // Ensure wishes file exists
      const fileId = await ensureWishesFile();
      
      // Append wish to file
      await appendWishToFile(fileId, guestName, wish, timestamp);

      return res.status(200).json({ 
        success: true, 
        message: 'Wish submitted successfully' 
      });

    } else if (req.method === 'GET') {
      // Get all wishes
      const wishes = await getAllWishes();
      
      return res.status(200).json({ 
        success: true, 
        wishes 
      });

    } else {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

  } catch (error) {
    console.error('Wishes API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default handler;
