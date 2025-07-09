const { checkAuth } = require('../../../lib/auth');
const fs = require('fs').promises;
const path = require('path');

// Store the background image URL in a simple JSON file
const CONFIG_FILE = path.join(process.cwd(), 'login-config.json');

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get current background image
      try {
        const configData = await fs.readFile(CONFIG_FILE, 'utf8');
        const config = JSON.parse(configData);
        
        // Return the thumbnail URL by default, which is more reliable for backgrounds
        const imageUrl = config.backgroundImage || '/wedding-couple.png';
        
        // Also include the original URL and file ID if available
        const responseData = { 
          imageUrl,
          originalUrl: config.originalUrl || imageUrl,
          fileId: config.fileId || null
        };
        
        console.log('API - Returning background image URL:', imageUrl);
        return res.status(200).json(responseData);
      } catch (error) {
        console.error('API - Error reading config file:', error);
        // If file doesn't exist, return default
        return res.status(200).json({ imageUrl: '/wedding-couple.png' });
      }
    }

    if (req.method === 'POST') {
      // Check authentication for admin operations
      const { authenticated } = checkAuth(req);
      if (!authenticated) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      // Always convert Google Drive file links to direct image links
      let finalImageUrl = imageUrl;
      let fileId = null;
      
      // Extract file ID from Google Drive URL
      const driveMatch = imageUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*?id=|thumbnail\?.*?id=)([\w-]+)/);
      
      if (driveMatch && driveMatch[1]) {
        fileId = driveMatch[1];
        
        // Use the direct download URL as the primary URL
        finalImageUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
      
      // Save both direct URL and file ID for flexibility
      const config = { 
        backgroundImage: finalImageUrl,
        originalUrl: imageUrl,
        fileId: fileId,
        updatedAt: new Date().toISOString() 
      };
      
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));

      return res.status(200).json({ 
        success: true, 
        message: 'Background image updated successfully',
        imageUrl: finalImageUrl 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Login background API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
